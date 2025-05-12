import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/RepairStats.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const API_GET_REPAIR_ENDPOINT = '/VRU-main/get_repair_status.php';
const API_GET_ENVIRONMENT_ENDPOINT = '/VRU-main/get_environment_status.php';
const KANIT_FONT_PATH = '/assets/fonts/Kanit-Regular.ttf';

const RepairStats = () => {
    const navigate = useNavigate();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // --- State สำหรับ Repair Reports ---
    const [repairReports, setRepairReports] = useState([]);
    const [filteredRepairReports, setFilteredRepairReports] = useState([]);
    const [isLoadingRepairs, setIsLoadingRepairs] = useState(false);
    const [errorRepairs, setErrorRepairs] = useState(null);
    const [repairFilter, setRepairFilter] = useState('all');

    // --- State สำหรับ Environment Reports ---
    const [environmentReports, setEnvironmentReports] = useState([]);
    const [filteredEnvironmentReports, setFilteredEnvironmentReports] = useState([]);
    const [isLoadingEnvironments, setIsLoadingEnvironments] = useState(false);
    const [errorEnvironments, setErrorEnvironments] = useState(null);
    const [environmentFilter, setEnvironmentFilter] = useState('all');

    // --- State ที่ใช้ร่วมกัน ---
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const initialLoadRef = useRef(true);
    const kanitFontBase64Ref = useRef(null);
    const [isFontLoading, setIsFontLoading] = useState(true);

    useEffect(() => {
        const loadKanitFont = async () => {
            if (kanitFontBase64Ref.current) {
                setIsFontLoading(false);
                return;
            }
            try {
                const response = await fetch(KANIT_FONT_PATH);
                if (!response.ok) throw new Error(`Failed to fetch font: ${response.status}`);
                const fontBuffer = await response.arrayBuffer();
                let binary = '';
                const bytes = new Uint8Array(fontBuffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                kanitFontBase64Ref.current = window.btoa(binary);
            } catch (fontError) {
                console.error('Error loading Kanit font:', fontError);
                const fontErrorMessage = 'ไม่สามารถโหลดฟอนต์ Kanit ได้';
                setErrorRepairs(prev => prev ? `${prev}\n${fontErrorMessage}` : fontErrorMessage);
                setErrorEnvironments(prev => prev ? `${prev}\n${fontErrorMessage}` : fontErrorMessage);
            } finally {
                setIsFontLoading(false);
            }
        };
        loadKanitFont();
    }, []);

    useEffect(() => {
        let user = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                user = JSON.parse(userDataString);
                if (user && user.email && user.user_type === 'admin') {
                    setLoggedInUser(user);
                } else {
                    localStorage.removeItem('user');
                    navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        } catch (parseError) {
            console.error('Auth Check: Error parsing user data:', parseError);
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        }
        setIsAuthChecked(true);
    }, [navigate]);

    const fetchRepairReports = useCallback(async (isInitial = false) => {
        if (!loggedInUser) return;
        if (isInitial) setIsLoadingRepairs(true);
        setErrorRepairs(null);
        try {
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', parseInt(selectedYear) - 543);
            const url = `${API_GET_REPAIR_ENDPOINT}?${params.toString()}`;
            const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
            const data = await response.json();
            if (!response.ok) throw new Error(`Repair data: HTTP error ${response.status}: ${data.message || 'Unknown error'}`);
            if (data.success && Array.isArray(data.reports)) {
                const processed = data.reports.map((item, index) => ({
                    ...item,
                    _key: item.id ?? `repair-${index}-${Date.now()}`,
                    id: parseInt(item.id) || 0,
                    status: item.status ?? 'pending',
                    created_at: item.created_at || new Date().toISOString(),
                    employee_name: item.employee_name || `${item.name || ''} ${item.lastname || ''}`.trim() || 'N/A',
                    issue: item.repair_name || item.issue || 'N/A',
                    category: item.location_name || item.category || 'N/A',
                    details: item.details || 'N/A',
                })).sort((a, b) => (b.id || 0) - (a.id || 0));
                setRepairReports(processed);
            } else {
                setErrorRepairs(`ไม่สามารถโหลดข้อมูลการซ่อม: ${data.message || data.error || 'ข้อมูลไม่ถูกต้อง'}`);
                setRepairReports([]);
            }
        } catch (err) {
            console.error('Fetch repair reports error:', err);
            setErrorRepairs(err.message);
            setRepairReports([]);
        } finally {
            setIsLoadingRepairs(false);
        }
    }, [loggedInUser, selectedMonth, selectedYear]);

    const fetchEnvironmentReports = useCallback(async (isInitial = false) => {
        if (!loggedInUser) return;
        if (isInitial) setIsLoadingEnvironments(true);
        setErrorEnvironments(null);
        try {
            const params = new URLSearchParams();
            if (selectedMonth) params.append('month', selectedMonth);
            if (selectedYear) params.append('year', parseInt(selectedYear) - 543);
            const url = `${API_GET_ENVIRONMENT_ENDPOINT}?${params.toString()}`;
            const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, credentials: 'include' });
            const data = await response.json();
            if (!response.ok) throw new Error(`Environment data: HTTP error ${response.status}: ${data.message || 'Unknown error'}`);
            if (data.success && Array.isArray(data.reports)) {
                const processed = data.reports.map((item, index) => ({
                    ...item,
                    _key: item.id ?? `env-${index}-${Date.now()}`,
                    id: parseInt(item.id) || 0,
                    status: item.status ?? 'pending',
                    reported_at: item.reported_at || item.created_at || new Date().toISOString(),
                    reporter_name: item.reporter_name || `${item.name || ''} ${item.lastname || ''}`.trim() || 'N/A',
                    issue: item.problem || item.issue_description || item.issue || 'N/A',
                    location: item.location || item.building_name || item.category || 'N/A',
                    details: item.details || item.additional_info || 'N/A',
                })).sort((a, b) => (b.id || 0) - (a.id || 0));
                setEnvironmentReports(processed);
            } else {
                setErrorEnvironments(`ไม่สามารถโหลดข้อมูลสภาพแวดล้อม: ${data.message || data.error || 'ข้อมูลไม่ถูกต้อง'}`);
                setEnvironmentReports([]);
            }
        } catch (err) {
            console.error('Fetch environment reports error:', err);
            setErrorEnvironments(err.message);
            setEnvironmentReports([]);
        } finally {
            setIsLoadingEnvironments(false);
        }
    }, [loggedInUser, selectedMonth, selectedYear]);

    useEffect(() => {
        if (isAuthChecked && loggedInUser) {
            const initial = initialLoadRef.current;
            fetchRepairReports(initial);
            fetchEnvironmentReports(initial);
            if (initial) initialLoadRef.current = false;
        }
    }, [isAuthChecked, loggedInUser, selectedMonth, selectedYear, fetchRepairReports, fetchEnvironmentReports]);

    const getStatusDisplay = (status) => {
        const statusMap = {
            'pending': 'รอดำเนินการ', 'in_progress': 'กำลังดำเนินการ', 'completed': 'ดำเนินการเสร็จสิ้น',
            'rejected': 'ไม่สามารถดำเนินการได้', '1': 'รอดำเนินการ', '2': 'กำลังดำเนินการ', '3': 'ดำเนินการเสร็จสิ้น',
        };
        return statusMap[String(status)] || `ไม่ทราบ `;
    };
    const getStatusColor = (status) => {
        const statusColors = {
            'pending': '#f39c12', 'in_progress': '#3498db', 'completed': '#2ecc71',
            'rejected': '#e74c3c', '1': '#f39c12', '2': '#3498db', '3': '#2ecc71',
        };
        return statusColors[String(status)] || '#666';
    };
    const getStatusClass = (status) => {
        const statusClasses = {
            'pending': 'status-pending', 'in_progress': 'status-in-progress',
            'completed': 'status-completed', 'rejected': 'status-rejected',
            '1': 'status-pending', '2': 'status-in-progress', '3': 'status-completed',
        };
        return statusClasses[String(status)] || '';
    };

    const applyRepairFilters = useCallback(() => {
        if (!loggedInUser) return;
        let filtered = repairReports;
        if (repairFilter !== 'all') {
            filtered = filtered.filter(report => String(report.status) === repairFilter);
        }
        setFilteredRepairReports(filtered);
    }, [repairReports, repairFilter, loggedInUser]);

    useEffect(() => {
        applyRepairFilters();
    }, [repairReports, repairFilter, applyRepairFilters]);

    const handleRepairFilterChange = (statusType) => setRepairFilter(statusType);

    const applyEnvironmentFilters = useCallback(() => {
        if (!loggedInUser) return;
        let filtered = environmentReports;
        if (environmentFilter !== 'all') {
            filtered = filtered.filter(report => String(report.status) === environmentFilter);
        }
        setFilteredEnvironmentReports(filtered);
    }, [environmentReports, environmentFilter, loggedInUser]);

    useEffect(() => {
        applyEnvironmentFilters();
    }, [environmentReports, environmentFilter, applyEnvironmentFilters]);

    const handleEnvironmentFilterChange = (statusType) => setEnvironmentFilter(statusType);

    const handleMonthChange = (e) => setSelectedMonth(e.target.value);
    const handleYearChange = (e) => setSelectedYear(e.target.value);

    // --- PDF Generation (MODIFIED for centering) ---
    const generateAndOpenPDF = async (reportData, titlePrefix, columnsConfig, dataMappingFunc) => {
        if (!loggedInUser) { navigate('/login'); return; }
        if (isFontLoading) {
            alert('ฟอนต์กำลังโหลด กรุณารอสักครู่แล้วลองอีกครั้ง');
            return;
        }
        if (!kanitFontBase64Ref.current) {
            alert('ไม่สามารถโหลดฟอนต์ Kanit สำหรับสร้าง PDF ได้');
            return;
        }
        if (!reportData || reportData.length === 0) {
            alert('ไม่มีข้อมูลสำหรับสร้าง PDF');
            return;
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        doc.addFileToVFS('Kanit-Regular.ttf', kanitFontBase64Ref.current);
        doc.addFont('Kanit-Regular.ttf', 'Kanit', 'normal');
        doc.setFont('Kanit', 'normal');

        doc.setFontSize(16);
        const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        const monthName = selectedMonth ? ` เดือน ${thaiMonths[parseInt(selectedMonth) - 1]}` : '';
        const yearBE = selectedYear ? ` ปี พ.ศ. ${selectedYear}` : '';
        const dateTitlePart = `${monthName}${yearBE}`;
        const fullTitle = `${titlePrefix}${dateTitlePart}`;
        doc.text(fullTitle, 14, 20); // Title remains at x=14 for now

        // Calculate total table width from columnsConfig
        const totalTableWidth = columnsConfig.reduce((sum, col) => sum + col.width, 0);
        const pageWidth = doc.internal.pageSize.getWidth();

        // Calculate horizontal margin for centering
        let horizontalPageMargin = (pageWidth - totalTableWidth) / 2;
        horizontalPageMargin = Math.max(horizontalPageMargin, 0); // Ensure margin is not negative

        autoTable(doc, {
            startY: 30,
            head: [columnsConfig.map(col => col.header)],
            body: reportData.map(dataMappingFunc),
            theme: 'grid',
            styles: {
                font: 'Kanit',
                fontStyle: 'normal',
                fontSize: 10,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left'
            },
            headStyles: {
                fillColor: [66, 139, 202],
                textColor: [255, 255, 255],
                fontSize: 12,
                font: 'Kanit',
                fontStyle: 'normal',
                halign: 'center'
            },
            columnStyles: columnsConfig.reduce((acc, col, index) => {
                acc[index] = { cellWidth: col.width };
                return acc;
            }, {}),
            didParseCell: function (data) {
                data.cell.styles.font = 'Kanit';
                data.cell.styles.fontStyle = 'normal';
            },
            margin: {
                left: horizontalPageMargin,
                right: horizontalPageMargin
                // top and bottom margins are implicitly handled or defaulted by autoTable
                // when startY is used, horizontal margins are still respected.
            }
        });

        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(pdfUrl), 10000);
    };

    const handleViewRepairPDF = (type) => {
        let dataToProcess = [];
        let title = 'รายงานสถิติการซ่อม: ';
        const baseData = repairReports;
        switch (type) {
            case 'all': dataToProcess = baseData; title += 'ทั้งหมด'; break;
            case 'pending': dataToProcess = baseData.filter(r => String(r.status) === 'pending' || String(r.status) === '1'); title += 'รอดำเนินการ'; break;
            case 'in_progress': dataToProcess = baseData.filter(r => String(r.status) === 'in_progress' || String(r.status) === '2'); title += 'กำลังดำเนินการ'; break;
            case 'completed': dataToProcess = baseData.filter(r => String(r.status) === 'completed' || String(r.status) === '3'); title += 'ดำเนินการเสร็จสิ้น'; break;
            case 'rejected': dataToProcess = baseData.filter(r => String(r.status) === 'rejected'); title += 'ไม่สามารถดำเนินการได้'; break;
            default: setErrorRepairs('ประเภท PDF การซ่อมไม่ถูกต้อง'); return;
        }
        const columns = [
            { header: 'ชื่อผู้แจ้ง', width: 35 }, { header: 'ปัญหา', width: 35 }, { header: 'สถานที่/อาคาร', width: 40 },
            { header: 'รายละเอียด', width: 30 }, { header: 'สถานะ', width: 30 }, { header: 'วันที่', width: 25 },
        ];
        const dataMapper = report => [
            report.employee_name || 'N/A', report.issue || 'N/A', report.category || 'N/A',
            report.details || 'N/A', getStatusDisplay(report.status),
            report.created_at ? new Date(report.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
        ];
        generateAndOpenPDF(dataToProcess, title, columns, dataMapper);
    };

    const handleViewEnvironmentPDF = (type) => {
        let dataToProcess = [];
        let title = 'รายงานสถิติสภาพแวดล้อม: ';
        const baseData = environmentReports;
        switch (type) {
            case 'all': dataToProcess = baseData; title += 'ทั้งหมด'; break;
            case 'pending': dataToProcess = baseData.filter(r => String(r.status) === 'pending' || String(r.status) === '1'); title += 'รอดำเนินการ'; break;
            case 'in_progress': dataToProcess = baseData.filter(r => String(r.status) === 'in_progress' || String(r.status) === '2'); title += 'กำลังดำเนินการ'; break;
            case 'completed': dataToProcess = baseData.filter(r => String(r.status) === 'completed' || String(r.status) === '3'); title += 'ดำเนินการเสร็จสิ้น'; break;
            case 'rejected': dataToProcess = baseData.filter(r => String(r.status) === 'rejected'); title += 'ไม่สามารถดำเนินการได้'; break;
            default: setErrorEnvironments('ประเภท PDF สภาพแวดล้อมไม่ถูกต้อง'); return;
        }
        const columns = [
            { header: 'ชื่อผู้แจ้ง', width: 35 }, { header: 'ลักษณะปัญหา', width: 40 }, { header: 'สถานที่/อาคาร', width: 40 },
            { header: 'รายละเอียดเพิ่มเติม', width: 30 }, { header: 'สถานะ', width: 30 }, { header: 'วันที่แจ้ง', width: 25 },
        ];
        const dataMapper = report => [
            report.reporter_name || 'N/A', report.issue || 'N/A', report.location || 'N/A',
            report.details || 'N/A', getStatusDisplay(report.status),
            report.reported_at ? new Date(report.reported_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A',
        ];
        generateAndOpenPDF(dataToProcess, title, columns, dataMapper);
    };

    if (!isAuthChecked || isFontLoading) return <p>กำลังโหลดข้อมูลและทรัพยากร...</p>;
    if (!loggedInUser) return <p>กรุณาเข้าสู่ระบบ (กำลังนำทาง)...</p>;

    const countRepairAll = repairReports.length;
    const countRepairPending = repairReports.filter(r => String(r.status) === 'pending' || String(r.status) === '1').length;
    const countRepairInProgress = repairReports.filter(r => String(r.status) === 'in_progress' || String(r.status) === '2').length;
    const countRepairCompleted = repairReports.filter(r => String(r.status) === 'completed' || String(r.status) === '3').length;
    const countRepairRejected = repairReports.filter(r => String(r.status) === 'rejected').length;

    const countEnvAll = environmentReports.length;
    const countEnvPending = environmentReports.filter(r => String(r.status) === 'pending' || String(r.status) === '1').length;
    const countEnvInProgress = environmentReports.filter(r => String(r.status) === 'in_progress' || String(r.status) === '2').length;
    const countEnvCompleted = environmentReports.filter(r => String(r.status) === 'completed' || String(r.status) === '3').length;
    const countEnvRejected = environmentReports.filter(r => String(r.status) === 'rejected').length;

    return (
        <div className="repair-stats">
            <div className="date-filter">
                <h3>ตัวกรองข้อมูล </h3>
                <div className="date-filter">
                    <div className="month-filter">
                        <label htmlFor="month-select">เลือกเดือน: </label>
                        <select id="month-select" value={selectedMonth} onChange={handleMonthChange}>
                            <option value="">ทั้งหมด</option>
                            <option value="1">มกราคม</option><option value="2">กุมภาพันธ์</option><option value="3">มีนาคม</option>
                            <option value="4">เมษายน</option><option value="5">พฤษภาคม</option><option value="6">มิถุนายน</option>
                            <option value="7">กรกฎาคม</option><option value="8">สิงหาคม</option><option value="9">กันยายน</option>
                            <option value="10">ตุลาคม</option><option value="11">พฤศจิกายน</option><option value="12">ธันวาคม</option>
                        </select>
                    </div>
                    <div className="year-filter">
                        <label htmlFor="year-select">เลือกปี (พ.ศ.): </label>
                        <select id="year-select" value={selectedYear} onChange={handleYearChange}>
                            <option value="">ทั้งหมด</option>
                            {Array.from({ length: 15 }, (_, i) => {
                                const year = new Date().getFullYear() + 543 - 5 + i;
                                return <option key={year} value={year}>{year}</option>;
                            })}
                        </select>
                    </div>
                </div>
            </div>
            <hr style={{ margin: "30px 0" }} />

            <div className="stats-section repair-section">
                <h2>สถิติการซ่อม</h2>
                <div className="filter-buttons">
                    <button onClick={() => handleRepairFilterChange('all')} className={repairFilter === 'all' ? 'active' : ''}>ทั้งหมด ({countRepairAll})</button>
                    <button onClick={() => handleRepairFilterChange('pending')} className={repairFilter === 'pending' ? 'active' : ''}>รอดำเนินการ ({countRepairPending})</button>
                    <button onClick={() => handleRepairFilterChange('in_progress')} className={repairFilter === 'in_progress' ? 'active' : ''}>กำลังดำเนินการ ({countRepairInProgress})</button>
                    <button onClick={() => handleRepairFilterChange('completed')} className={repairFilter === 'completed' ? 'active' : ''}>ดำเนินการเสร็จสิ้น ({countRepairCompleted})</button>
                    <button onClick={() => handleRepairFilterChange('rejected')} className={repairFilter === 'rejected' ? 'active' : ''}>ไม่สามารถดำเนินการได้ ({countRepairRejected})</button>
                </div>
                <div className="view-pdf-buttons" style={{ marginTop: '10px' }}>
                    <button onClick={() => handleViewRepairPDF('all')} className="pdf-btn">PDF <br /> ทั้งหมด</button>
                    <button onClick={() => handleViewRepairPDF('pending')} className="pdf-btn">PDF <br /> รอดำเนินการ</button>
                    <button onClick={() => handleViewRepairPDF('in_progress')} className="pdf-btn">PDF <br /> กำลังดำเนินการ</button>
                    <button onClick={() => handleViewRepairPDF('completed')} className="pdf-btn">PDF <br /> ดำเนินการเสร็จสิ้น</button>
                    <button onClick={() => handleViewRepairPDF('rejected')} className="pdf-btn">PDF <br /> ไม่สามารถดำเนินการได้</button>
                </div>
                {isLoadingRepairs && !initialLoadRef.current && <p>กำลังโหลดข้อมูลการซ่อม...</p>}
                {errorRepairs && <div className="error" style={{ whiteSpace: "pre-line" }}>{errorRepairs}</div>}
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ชื่อผู้แจ้ง</th><th>ปัญหา</th><th>สถานที่/อาคาร</th>
                                <th>รายละเอียด</th><th>สถานะ</th><th>วันที่แจ้ง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredRepairReports.length > 0 ? filteredRepairReports : []).map((report) => (
                                <tr key={report._key}>
                                    <td>{report.employee_name}</td><td>{report.issue}</td><td>{report.category}</td>
                                    <td>{report.details}</td>
                                    <td><span className={getStatusClass(report.status)} style={{ color: getStatusColor(report.status), fontWeight: 'bold' }}>{getStatusDisplay(report.status)}</span></td>
                                    <td>{report.created_at ? new Date(report.created_at).toLocaleDateString('th-TH') : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRepairReports.length === 0 && !isLoadingRepairs && <p>ไม่พบข้อมูลการซ่อมที่ตรงตามเงื่อนไข</p>}
                </div>
            </div>
            <hr style={{ margin: "30px 0" }} />

            <div className="stats-section environment-section">
                <h2>สถิติสภาพแวดล้อม</h2>
                <div className="filter-buttons">
                    <button onClick={() => handleEnvironmentFilterChange('all')} className={environmentFilter === 'all' ? 'active' : ''}>ทั้งหมด ({countEnvAll})</button>
                    <button onClick={() => handleEnvironmentFilterChange('pending')} className={environmentFilter === 'pending' ? 'active' : ''}>รอดำเนินการ ({countEnvPending})</button>
                    <button onClick={() => handleEnvironmentFilterChange('in_progress')} className={environmentFilter === 'in_progress' ? 'active' : ''}>กำลังดำเนินการ ({countEnvInProgress})</button>
                    <button onClick={() => handleEnvironmentFilterChange('completed')} className={environmentFilter === 'completed' ? 'active' : ''}>ดำเนินการเสร็จสิ้น ({countEnvCompleted})</button>
                    <button onClick={() => handleEnvironmentFilterChange('rejected')} className={environmentFilter === 'rejected' ? 'active' : ''}>ไม่สามารถดำเนินการได้ ({countEnvRejected})</button>
                </div>
                <div className="view-pdf-buttons" style={{ marginTop: '10px' }}>
                    <button onClick={() => handleViewEnvironmentPDF('all')} className="pdf-btn">PDF <br /> ทั้งหมด</button>
                    <button onClick={() => handleViewEnvironmentPDF('pending')} className="pdf-btn">PDF <br /> รอดำเนินการ</button>
                    <button onClick={() => handleViewEnvironmentPDF('in_progress')} className="pdf-btn">PDF <br /> กำลังดำเนินการ</button>
                    <button onClick={() => handleViewEnvironmentPDF('completed')} className="pdf-btn">PDF <br /> ดำเนินการเสร็จสิ้น</button>
                    <button onClick={() => handleViewEnvironmentPDF('rejected')} className="pdf-btn">PDF <br /> ไม่สามารถดำเนินการได้</button>
                </div>
                {isLoadingEnvironments && !initialLoadRef.current && <p>กำลังโหลดข้อมูลสภาพแวดล้อม...</p>}
                {errorEnvironments && <div className="error" style={{ whiteSpace: "pre-line" }}>{errorEnvironments}</div>}
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ชื่อผู้แจ้ง</th><th>ปัญหา</th><th>สถานที่/อาคาร</th>
                                <th>รายละเอียด</th><th>สถานะ</th><th>วันที่แจ้ง</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredEnvironmentReports.length > 0 ? filteredEnvironmentReports : []).map((report) => (
                                <tr key={report._key}>
                                    <td>{report.reporter_name}</td><td>{report.issue}</td><td>{report.location}</td>
                                    <td>{report.details}</td>
                                    <td><span className={getStatusClass(report.status)} style={{ color: getStatusColor(report.status), fontWeight: 'bold' }}>{getStatusDisplay(report.status)}</span></td>
                                    <td>{report.reported_at ? new Date(report.reported_at).toLocaleDateString('th-TH') : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredEnvironmentReports.length === 0 && !isLoadingEnvironments && <p>ไม่พบข้อมูลสภาพแวดล้อมที่ตรงตามเงื่อนไข</p>}
                </div>
            </div>
        </div>
    );
};

export default RepairStats;