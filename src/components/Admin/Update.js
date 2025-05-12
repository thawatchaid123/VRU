import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Update.css';

const API_REPAIR_GET_ENDPOINT = '/VRU-main/get_repair_report.php';
const API_ENVIRONMENT_GET_ENDPOINT = '/VRU-main/get_environment_report.php';
const API_UPDATE_STATUS_ENDPOINT = '/VRU-main/update_status.php';
const IMAGE_BASE_URL = '/VRU-main/';

const Update = () => {
    const navigate = useNavigate();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [repairReports, setRepairReports] = useState([]);
    const [environmentReports, setEnvironmentReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState({ repair: null, environment: null });
    const [repairUpdatingStatus, setRepairUpdatingStatus] = useState({});
    const [environmentUpdatingStatus, setEnvironmentUpdatingStatus] = useState({});
    const [repairImageLoadErrors, setRepairImageLoadErrors] = useState({});
    const [environmentImageLoadErrors, setEnvironmentImageLoadErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [lastTap, setLastTap] = useState(0);
    const [notificationError, setNotificationError] = useState(null);
    const [hasNewRepairReports, setHasNewRepairReports] = useState(false);
    const [hasNewEnvironmentReports, setHasNewEnvironmentReports] = useState(false);
    const imageRef = useRef(null);
    const initialLoadRef = useRef(true);
    const isUpdatingRef = useRef(false);
    const repairLastMaxIdRef = useRef(parseInt(localStorage.getItem('repairLastMaxId')) || 0);
    const environmentLastMaxIdRef = useRef(parseInt(localStorage.getItem('environmentLastMaxId')) || 0);

    const statusOptions = {
        '': '-- เลือกสถานะ --',
        'pending': 'รอดำเนินการ',
        'in_progress': 'กำลังดำเนินการ',
        'completed': 'ดำเนินการเสร็จสิ้น',
        'rejected': 'ไม่สามารถดำเนินการได้',
    };

    useEffect(() => {
        let user = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                user = JSON.parse(userDataString);
                if (user && typeof user === 'object') {
                    setLoggedInUser(user);
                } else {
                    localStorage.removeItem('user');
                    navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        } catch (parseError) {
            console.error('Auth Check: Error parsing user data from localStorage:', parseError);
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        }
        setIsAuthChecked(true);
    }, [navigate]);

    const fetchReports = async (type) => {
        const endpoint = type === 'repair' ? API_REPAIR_GET_ENDPOINT : API_ENVIRONMENT_GET_ENDPOINT;
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            // console.log(`Raw ${type} reports data:`, result);
            if (!result || !result.success || !Array.isArray(result.data)) {
                throw new Error(result.message || 'Invalid API response');
            }
            return result.data.map((item, index) => {
                const mappedItem = type === 'environment' ? {
                    ...item,
                    repair_name: item.problem || item.repair_name || 'N/A',
                    location_name: item.location || item.location_name || 'N/A',
                } : item;
                return {
                    ...mappedItem,
                    _key: item.id ?? `${type}-report-${index}-${Date.now()}`,
                    id: parseInt(item.id) || 0,
                    status: item.status ?? '',
                    last_updated: item.last_updated || new Date().toISOString(),
                    created_at: item.created_at || new Date().toISOString(),
                };
            });
        } catch (err) {
            console.error(`Error fetching ${type} reports:`, err);
            throw new Error(`ไม่สามารถโหลดข้อมูล${type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม'}ได้: ${err.message}`);
        }
    };

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            setNotificationError('เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน');
            return false;
        }
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'denied') {
                setNotificationError('การแจ้งเตือนถูกปิดใช้งาน กรุณาเปิดในตั้งค่าเบราว์เซอร์');
            } else if (permission === 'granted') {
                setNotificationError(null);
            }
            return permission === 'granted';
        } catch (err) {
            setNotificationError('เกิดข้อผิดพลาดในการขออนุญาตแจ้งเตือน');
            return false;
        }
    };

    const showNotification = async (title, options) => {
        if (Notification.permission === 'granted') {
            new Notification(title, options);
        } else if (Notification.permission !== 'denied') {
            const granted = await requestNotificationPermission();
            if (granted) {
                new Notification(title, options);
            } else {
                setNotificationError('มีรายการใหม่แต่การแจ้งเตือนถูกปิดใช้งาน');
            }
        } else {
            setNotificationError('มีรายการใหม่แต่การแจ้งเตือนถูกปิดใช้งาน');
        }
    };

    const fetchData = useCallback(async (isInitialCall = false) => {
        if (!loggedInUser) {
            console.log('No logged-in user, skipping fetch');
            return;
        }
        if (isUpdatingRef.current && !isInitialCall) {
            console.log('Update in progress, skipping fetch');
            return;
        }

        if (!isInitialCall) setIsLoading(true);
        setError({ repair: null, environment: null });

        try {
            let repairData = [];
            try {
                repairData = await fetchReports('repair');
                repairData.sort((a, b) => (b.id || 0) - (a.id || 0));
                let newRepairReports = [];
                const repairMaxId = repairData.length > 0 ? Math.max(...repairData.map(r => r.id || 0)) : 0;
                if (!isInitialCall && repairMaxId > repairLastMaxIdRef.current) {
                    newRepairReports = repairData.filter(report => report.id > repairLastMaxIdRef.current);
                }
                if (repairMaxId > repairLastMaxIdRef.current) {
                    repairLastMaxIdRef.current = repairMaxId;
                    localStorage.setItem('repairLastMaxId', repairMaxId.toString());
                }
                if (newRepairReports.length > 0) {
                    setHasNewRepairReports(true);
                    showNotification(
                        'มีรายการแจ้งซ่อมใหม่',
                        { body: `ตรวจพบ ${newRepairReports.length} รายการแจ้งซ่อมใหม่ที่ด้านบนของตาราง` }
                    );
                }
                setRepairReports(repairData);
            } catch (err) {
                console.error('Repair fetch error:', err);
                setError(prev => ({ ...prev, repair: err.message }));
                if (isInitialCall) setRepairReports([]);
            }

            let environmentData = [];
            try {
                environmentData = await fetchReports('environment');
                environmentData.sort((a, b) => (b.id || 0) - (a.id || 0));
                let newEnvironmentReports = [];
                const environmentMaxId = environmentData.length > 0 ? Math.max(...environmentData.map(r => r.id || 0)) : 0;
                if (!isInitialCall && environmentMaxId > environmentLastMaxIdRef.current) {
                    newEnvironmentReports = environmentData.filter(report => report.id > environmentLastMaxIdRef.current);
                }
                if (environmentMaxId > environmentLastMaxIdRef.current) {
                    environmentLastMaxIdRef.current = environmentMaxId;
                    localStorage.setItem('environmentLastMaxId', environmentMaxId.toString());
                }
                if (newEnvironmentReports.length > 0) {
                    setHasNewEnvironmentReports(true);
                    showNotification(
                        'มีรายการแจ้งปัญหาสิ่งแวดล้อมใหม่',
                        { body: `ตรวจพบ ${newEnvironmentReports.length} รายการแจ้งปัญหาสิ่งแวดล้อมใหม่ที่ด้านบนของตาราง` }
                    );
                }
                setEnvironmentReports(environmentData);
            } catch (err) {
                console.error('Environment fetch error:', err);
                setError(prev => ({ ...prev, environment: err.message }));
                if (isInitialCall) setEnvironmentReports([]);
            }
        } finally {
            setIsLoading(false);
            if (isInitialCall) initialLoadRef.current = false;
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (isAuthChecked && loggedInUser) {
            fetchData(true);
        }
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            requestNotificationPermission();
        }
    }, [isAuthChecked, loggedInUser, fetchData]);

    useEffect(() => {
        let intervalId = null;
        if (isAuthChecked && loggedInUser && !isUpdatingRef.current) {
            intervalId = setInterval(() => {
                if (!initialLoadRef.current) {
                    fetchData(false);
                }
            }, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isAuthChecked, loggedInUser, fetchData]);

    const handleRefresh = () => {
        fetchData(false);
    };

    const handleStatusChange = async (reportKey, reportId, newStatus, type) => {
        if (!loggedInUser) {
            navigate('/login', { replace: true });
            return;
        }
        if (!newStatus) return;

        const updatingStatus = type === 'repair' ? repairUpdatingStatus : environmentUpdatingStatus;
        const setUpdatingStatus = type === 'repair' ? setRepairUpdatingStatus : setEnvironmentUpdatingStatus;
        const reports = type === 'repair' ? repairReports : environmentReports;
        const setReports = type === 'repair' ? setRepairReports : setEnvironmentReports;

        setUpdatingStatus(prev => ({ ...prev, [reportKey]: true }));
        setError(prev => ({ ...prev, [type]: null }));
        isUpdatingRef.current = true;

        try {
            const report = reports.find(r => r._key === reportKey);
            if (!report) {
                throw new Error('ไม่พบรายการที่ต้องการอัปเดต');
            }
            console.log(`Updating ${type} status for report #${reportId} to ${newStatus}`);
            const response = await fetch(API_UPDATE_STATUS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: reportId,
                    status: newStatus,
                    type: type
                }),
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || `อัปเดตสถานะ${type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม'}ไม่สำเร็จ`);
            }

            setReports(prevReports =>
                prevReports.map(r =>
                    r._key === reportKey
                        ? { ...r, status: newStatus, last_updated: new Date().toISOString() }
                        : r
                )
            );

            showNotification(`อัปเดตสถานะ${type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม'}สำเร็จ`, {
                body: `สถานะของรายการ #${reportId} ถูกเปลี่ยนเป็น "${statusOptions[newStatus]}"`
            });
        } catch (err) {
            console.error(`Error updating ${type} status:`, err);
            setError(prev => ({ ...prev, [type]: `อัปเดตสถานะ${type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม'}ผิดพลาด: ${err.message}` }));
            showNotification(`อัปเดตสถานะ${type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม'}ล้มเหลว`, {
                body: `ไม่สามารถอัปเดตสถานะของรายการ #${reportId} ได้: ${err.message}`
            });
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [reportKey]: false }));
            isUpdatingRef.current = false;
            if (loggedInUser) fetchData(false);
        }
    };

    const handleImageError = useCallback((reportKey, type) => {
        const setImageLoadErrors = type === 'repair' ? setRepairImageLoadErrors : setEnvironmentImageLoadErrors;
        setImageLoadErrors(prev => ({ ...prev, [reportKey]: true }));
    }, []);

    const openImageModal = (imageUrl) => {
        setSelectedImage(imageUrl);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    const closeImageModal = () => {
        setSelectedImage(null);
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
        setIsDragging(false);
        setLastTouchDistance(null);
        setLastTap(0);
    };

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setZoomLevel(prev => Math.min(Math.max(0.5, prev + delta), 10));
    }, []);

    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y,
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e) => {
        const touches = e.touches;
        if (touches.length === 1) {
            if (zoomLevel > 1) {
                setIsDragging(true);
                setDragStart({ x: touches[0].clientX - position.x, y: touches[0].clientY - position.y });
            }
            const currentTime = new Date().getTime();
            const tapGap = currentTime - lastTap;
            if (tapGap < 300 && tapGap > 0) {
                setZoomLevel(prev => (prev === 1 ? 3 : 1));
                setPosition({ x: 0, y: 0 });
            }
            setLastTap(currentTime);
        } else if (touches.length === 2) {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            setLastTouchDistance(Math.sqrt(dx * dx + dy * dy));
            setIsDragging(false);
        }
    };

    const handleTouchMove = (e) => {
        const touches = e.touches;
        if (touches.length === 1 && isDragging && zoomLevel > 1) {
            setPosition({
                x: touches[0].clientX - dragStart.x,
                y: touches[0].clientY - dragStart.y,
            });
        } else if (touches.length === 2) {
            e.preventDefault();
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (lastTouchDistance) {
                const scaleChange = distance / lastTouchDistance;
                setZoomLevel(prev => Math.min(Math.max(0.5, prev * scaleChange), 10));
            }
            setLastTouchDistance(distance);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setLastTouchDistance(null);
    };

    useEffect(() => {
        if (imageRef.current && selectedImage) {
            const element = imageRef.current;
            const options = { passive: false };
            element.addEventListener('wheel', handleWheel, options);
            element.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            element.addEventListener('touchstart', handleTouchStart, options);
            element.addEventListener('touchmove', handleTouchMove, options);
            element.addEventListener('touchend', handleTouchEnd);
            element.addEventListener('touchcancel', handleTouchEnd);

            return () => {
                element.removeEventListener('wheel', handleWheel);
                element.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
                element.removeEventListener('touchstart', handleTouchStart);
                element.removeEventListener('touchmove', handleTouchMove);
                element.removeEventListener('touchend', handleTouchEnd);
                element.removeEventListener('touchcancel', handleTouchEnd);
            };
        }
    }, [selectedImage, isDragging, zoomLevel, position.x, position.y, handleWheel, dragStart]);

    if (!isAuthChecked) {
        return <p>กำลังตรวจสอบการยืนยันตัวตน...</p>;
    }

    if (!loggedInUser) {
        return <p>กรุณาเข้าสู่ระบบ (กำลังนำทาง)...</p>;
    }

    const renderTable = (reports, type, updatingStatus, imageLoadErrors) => {
        const label = type === 'repair' ? 'การซ่อม' : 'ปัญหาสิ่งแวดล้อม';
        if (isLoading && initialLoadRef.current) {
            return <p>กำลังโหลดข้อมูล{label}...</p>;
        }
        if (error[type] && reports.length === 0) {
            return <p className="errorText" style={{ marginBottom: '15px', textAlign: 'center', padding: '20px' }}>{error[type]}</p>;
        }
        if (reports.length === 0 && !isLoading) {
            return <p>ยังไม่มีรายการแจ้ง{label}</p>;
        }

        return (
            <div className="tableWrapper">
                {error[type] && !isLoading && reports.length > 0 && (
                    <p className="errorText" style={{ marginBottom: '15px' }}>{error[type]}</p>
                )}
                {notificationError && (
                    <div className="notificationError" style={{ marginBottom: '15px', textAlign: 'center', color: '#ff4444' }}>
                        <p>{notificationError}</p>
                        <button
                            onClick={requestNotificationPermission}
                            style={{ padding: '5px 10px', marginTop: '5px' }}
                        >
                            ขออนุญาตแจ้งเตือนอีกครั้ง
                        </button>
                    </div>
                )}
                
                <table className="datatbl">
                    <thead>
                        <tr>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>เบอร์โทร</th>
                            <th>{type === 'repair' ? 'สิ่งชำรุด' : 'ปัญหา'}</th>
                            <th>สถานที่</th>
                            <th>รายละเอียด</th>
                            <th>รูปภาพ</th>
                            <th>สถานะ</th>
                            <th>คะแนน</th>
                            <th>ความคิดเห็น</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map((report) => {
                            const reportKey = report._key;
                            const isRowUpdating = updatingStatus[reportKey] === true;
                            const currentStatusValue = report.status ?? '';
                            const hasImageLoadError = imageLoadErrors[reportKey] === true;
                            const imageUrl = report.image ? `${IMAGE_BASE_URL}${report.image}` : null;

                            return (
                                <tr key={reportKey} style={{ opacity: isRowUpdating ? 0.6 : 1 }}>
                                    <td data-label="ชื่อ">{report.name ?? 'N/A'}</td>
                                    <td data-label="นามสกุล">{report.lastname ?? 'N/A'}</td>
                                    <td data-label="เบอร์โทร">{report.phone ?? 'N/A'}</td>
                                    <td data-label={type === 'repair' ? 'สิ่งชำรุด' : 'ปัญหา'}>{report.repair_name ?? 'N/A'}</td>
                                    <td data-label="สถานที่">{report.location_name ?? 'N/A'}</td>
                                    <td data-label="รายละเอียด">{report.details ?? 'N/A'}</td>
                                    <td data-label="รูปภาพ">
                                        {imageUrl && !hasImageLoadError ? (
                                            <img
                                                src={imageUrl}
                                                alt={`รูป ${report.repair_name || (type === 'repair' ? 'แจ้งซ่อม' : 'แจ้งปัญหาสิ่งแวดล้อม')}`}
                                                className="repairImage"
                                                loading="lazy"
                                                onError={() => handleImageError(reportKey, type)}
                                                onClick={() => openImageModal(imageUrl)}
                                            />
                                        ) : (
                                            <span className="imagePlaceholder">
                                                {hasImageLoadError ? 'รูปเสีย' : 'ไม่มีรูปภาพ'}
                                            </span>
                                        )}
                                    </td>
                                    <td data-label="สถานะ">
                                        <div className="statusControl">
                                            <select
                                                id={`status-select-${reportKey}`}
                                                value={currentStatusValue}
                                                onChange={(e) => handleStatusChange(reportKey, report.id, e.target.value, type)}
                                                disabled={isRowUpdating}
                                                className="statusSelect"
                                                aria-label={`อัปเดตสถานะสำหรับ ${report.repair_name || 'รายการนี้'}`}
                                            >
                                                <option value="" disabled={currentStatusValue !== ''}>
                                                    {statusOptions['']}
                                                </option>
                                                {Object.entries(statusOptions).map(([value, label]) => {
                                                    if (value === '') return null;
                                                    return (
                                                        <option key={value} value={value}>
                                                            {label}
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                            {isRowUpdating && <span className="statusUpdatingText"> กำลังบันทึก...</span>}
                                        </div>
                                    </td>
                                    <td data-label="คะแนน">
                                        {report.rating > 0 ? `${report.rating}/5` : (report.status === 'completed' ? 'รอให้คะแนน' : '-')}
                                    </td>
                                    <td data-label="ความคิดเห็น">
                                        {report.comment ? report.comment : (report.status === 'completed' && !report.rating ? 'รอความคิดเห็น' : '-')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="managementContainer">
            <h2>รายการแจ้งทั้งหมด</h2>
            <div className="dataTableSection">
                <h3>ข้อมูลการแจ้งซ่อม</h3>
                {renderTable(repairReports, 'repair', repairUpdatingStatus, repairImageLoadErrors)}
                <h3 style={{ marginTop: '40px' }}>ข้อมูลการแจ้งปัญหาสิ่งแวดล้อม</h3>
                {renderTable(environmentReports, 'environment', environmentUpdatingStatus, environmentImageLoadErrors)}
            </div>
            {selectedImage && (
                <div className="imageModal" onClick={closeImageModal}>
                    <div className="imageModalContent" onClick={(e) => e.stopPropagation()}>
                        <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="รูปภาพขนาดเต็ม"
                            className="imageModalImage"
                            style={{
                                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                cursor: isDragging ? 'grabbing' : (zoomLevel > 1 ? 'grab' : 'default'),
                                touchAction: 'none',
                            }}
                        />
                        <button
                            className="imageModalClose"
                            onClick={closeImageModal}
                            aria-label="ปิดหน้าต่างรูปภาพ"
                        >
                            ปิด
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Update;