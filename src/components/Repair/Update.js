import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../CSS/Update.css';

const API_GET_ENDPOINT = '/VRU-main/get_repair_report.php';
const API_UPDATE_STATUS_ENDPOINT = '/VRU-main/update_repair_status.php';
const IMAGE_BASE_URL = '/VRU-main/';

const fetchRepairReports = async () => {
    console.log("API: กำลังดึงข้อมูลรายงานการซ่อมจาก:", API_GET_ENDPOINT);
    const response = await fetch(API_GET_ENDPOINT);

    if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorData.error || JSON.stringify(errorData);
        } catch (e) {
            errorMsg = `ดึงข้อมูลรายงานไม่สำเร็จ Server ตอบกลับด้วยสถานะ: ${response.status}`;
        }
        console.error("Fetch error response:", response);
        throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log("API Response (Raw):", result);

    if (result && typeof result === 'object') {
        if (result.success === true && Array.isArray(result.data)) {
            return result.data.map((item, index) => ({
                ...item,
                _key: item.id !== undefined && item.id !== null ? item.id : `report-${index}-${Date.now()}`,
                id: item.id
            }));
        } else if (result.success === false) {
            throw new Error(result.message || "API แจ้งว่าการดำเนินการไม่สำเร็จ (success=false)");
        } else {
            console.error("โครงสร้างข้อมูล API ไม่ตรงตามที่คาดหวัง:", result);
            throw new Error("ข้อมูลที่ได้รับจาก Server มีรูปแบบไม่ถูกต้อง (โครงสร้างไม่ตรงตามที่คาดหวัง)");
        }
    } else {
        console.error("รูปแบบข้อมูล API ไม่ถูกต้อง (ไม่ใช่ Object):", result);
        throw new Error("ข้อมูลที่ได้รับจาก Server มีรูปแบบไม่ถูกต้อง (ไม่ใช่ Object)");
    }
};

const Update = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState({});
    const [imageLoadErrors, setImageLoadErrors] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [lastTap, setLastTap] = useState(0);
    const imageRef = useRef(null);

    const fetchData = useCallback(async () => {
        console.log("กำลังเรียกใช้ fetchData...");
        setIsLoading(true);
        setError(null);
        setImageLoadErrors({});
        try {
            const data = await fetchRepairReports();
            console.log("ข้อมูลที่ได้รับในคอมโพเนนต์:", data);
            setReports(data);
            if (data.length > 0 && data.some(item => item.id === undefined || item.id === null)) {
                console.warn("ข้อมูลรายงานบางส่วนไม่มี 'id' ที่ไม่ซ้ำกัน กำลังใช้ key สำรอง");
            }
        } catch (err) {
            console.error("รายละเอียดข้อผิดพลาดในการดึงข้อมูล:", err);
            setError(`ไม่สามารถโหลดข้อมูลได้: ${err.message}`);
            setReports([]);
        } finally {
            setIsLoading(false);
            console.log("fetchData ทำงานเสร็จสิ้น");
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusChange = async (reportKey, reportId, newStatus) => {
        const idToUpdate = reportId !== undefined && reportId !== null ? reportId : reportKey;

        console.log(`กำลังพยายามอัปเดตสถานะรายงาน ${idToUpdate} (key: ${reportKey}) เป็น ${newStatus}`);

        if (!newStatus) {
            console.log("ไม่ได้เลือกสถานะ, ข้ามการอัปเดต");
            return;
        }

        setUpdatingStatus(prev => ({ ...prev, [reportKey]: true }));
        setError(null);

        try {
            const response = await fetch(API_UPDATE_STATUS_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: idToUpdate, status: newStatus }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || `อัปเดตสถานะไม่สำเร็จ (HTTP ${response.status})`);
            }

            console.log(`อัปเดตสถานะสำเร็จสำหรับรายงาน ${idToUpdate}:`, result.message);

            setReports(prevReports =>
                prevReports.map(report =>
                    report._key === reportKey ? { ...report, status: newStatus } : report
                )
            );

        } catch (err) {
            console.error(`เกิดข้อผิดพลาดในการอัปเดตสถานะรายงาน ${idToUpdate} (key: ${reportKey}):`, err);
            setError(`อัปเดตสถานะผิดพลาดสำหรับรายการ ${idToUpdate}: ${err.message}. กรุณาลองอีกครั้ง`);
        } finally {
            setUpdatingStatus(prev => ({ ...prev, [reportKey]: false }));
        }
    };

    const handleImageError = useCallback((reportKey) => {
        console.warn(`รูปภาพโหลดไม่สำเร็จสำหรับ report key: ${reportKey}`);
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

    const handleWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY * -0.01;
        setZoomLevel(prev => Math.min(Math.max(0.5, prev + delta), 10));
    };

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
            const distance = Math.sqrt(dx * dx + dy * dy);
            setLastTouchDistance(distance);
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
            element.addEventListener('wheel', handleWheel, { passive: false });
            return () => element.removeEventListener('wheel', handleWheel);
        }
    }, [selectedImage]);

    const statusOptions = {
        '': '-- เลือกสถานะ --',
        'received': 'รับเรื่องแล้ว',
        'in_progress': 'กำลังดำเนินการ',
        'completed': 'ดำเนินการเสร็จสิ้น',
        'rejected': 'ไม่สามารถดำเนินการได้',
    };

    const renderContent = () => {
        if (isLoading) {
            return <p>กำลังโหลดข้อมูล...</p>;
        }
        if (error && reports.length === 0) {
            return <p className="errorText" style={{ marginBottom: '15px', textAlign: 'center', padding: '20px' }}>{error}</p>;
        }
        if (reports.length === 0) {
            return <p>ยังไม่มีรายการแจ้งซ่อม</p>;
        }

        return (
            <div className="tableWrapper">
                {error && !isLoading && reports.length > 0 && (
                    <p className="errorText" style={{ marginBottom: '15px' }}>{error}</p>
                )}
                <table className="dataTable">
                    <thead>
                        <tr>
                            <th>ชื่อ</th>
                            <th>นามสกุล</th>
                            <th>เบอร์โทร</th>
                            <th>สิ่งชำรุด</th>
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
                                    <td data-label="สิ่งชำรุด">{report.repair_name ?? 'N/A'}</td>
                                    <td data-label="สถานที่">{report.location_name ?? 'N/A'}</td>
                                    <td data-label="รายละเอียด">{report.details ?? 'N/A'}</td>
                                    <td data-label="รูปภาพ">
                                        {imageUrl && !hasImageLoadError ? (
                                            <img
                                                src={imageUrl}
                                                alt={`รูป ${report.repair_name || 'แจ้งซ่อม'}`}
                                                className="repairImage"
                                                loading="lazy"
                                                onError={() => handleImageError(reportKey)}
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
                                                onChange={(e) => handleStatusChange(reportKey, report.id, e.target.value)}
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
                                        {report.rating > 0 ? `${report.rating}/5` : '-'}
                                    </td>
                                    <td data-label="คอมเม้น">
                                        {report.comment ? report.comment : '-'}
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
            <h2>รายการแจ้งซ่อมทั้งหมด</h2>
            <div className="dataTableSection">
                <h3>ข้อมูลการแจ้งซ่อม</h3>
                {renderContent()}
            </div>
            {selectedImage && (
                <div className="imageModal">
                    <div className="imageModalContent">
                        <img
                            ref={imageRef}
                            src={selectedImage}
                            alt="รูปภาพขนาดเต็ม"
                            className="imageModalImage"
                            style={{
                                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                                transition: isDragging ? 'none' : 'transform 0.1s ease',
                            }}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        />
                        <button className="imageModalClose" onClick={closeImageModal}>ปิด</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Update;