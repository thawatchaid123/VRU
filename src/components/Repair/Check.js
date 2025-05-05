import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../CSS/Check.css';

const API_SEARCH_ENDPOINT = '/VRU-main/search.php';
const API_RATING_ENDPOINT = '/VRU-main/submit_rating.php';
const IMAGE_BASE_URL = '/VRU-main/';

const Check = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [lastTouchDistance, setLastTouchDistance] = useState(null);
    const [lastTap, setLastTap] = useState(0);
    const [ratingState, setRatingState] = useState({});
    const [ratingError, setRatingError] = useState({});
    const imageRef = useRef(null);

    const getStatusDisplay = (status) => {
        switch (String(status).toLowerCase()) {
            case '1':
            case 'pending':
            case 'received':
                return 'รับเรื่องแล้ว';
            case '2':
            case 'in_progress':
                return 'กำลังดำเนินการ';
            case '3':
            case 'completed':
                return 'ดำเนินการเสร็จสิ้น';
            case '4':
            case 'rejected':
                return 'ไม่สามารถดำเนินการได้';
            default:
                return status || '-';
        }
    };

    const getStatusClass = (status) => {
        switch (String(status).toLowerCase()) {
            case '1':
            case 'pending':
            case 'received':
                return 'status-pending';
            case '2':
            case 'in_progress':
                return 'status-in-progress';
            case '3':
            case 'completed':
                return 'status-completed';
            case '4':
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const handleInputChange = (e) => {
        const rawValue = e.target.value;
        let errorMsg = '';
        let finalValue = '';

        const numericValue = rawValue.replace(/[^0-9]/g, '');

        if (rawValue !== numericValue) {
            errorMsg = 'กรุณากรอกเฉพาะตัวเลข';
        }

        const limitedValue = numericValue.slice(0, 10);

        if (limitedValue.length > 0) {
            if (limitedValue[0] !== '0') {
                errorMsg = 'เบอร์โทรต้องขึ้นต้นด้วย 0';
                finalValue = '';
            } else {
                finalValue = '0';
                if (limitedValue.length > 1) {
                    if (!['6', '8', '9'].includes(limitedValue[1])) {
                        errorMsg = 'ตัวที่สองต้องเป็น 6, 8, หรือ 9';
                    } else {
                        finalValue = limitedValue;
                    }
                }
            }
        } else {
            finalValue = '';
            if (!errorMsg) {
                errorMsg = '';
            }
        }

        setEmployeeId(finalValue);
        setPhoneError(errorMsg);
        setError(null);
        setResult(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (phoneError || employeeId.length !== 10) {
            if (!phoneError && employeeId.length !== 10) {
                setPhoneError('กรุณากรอกเบอร์โทรให้ครบ 10 หลัก');
            }
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch(API_SEARCH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employee_id: employeeId }),
            });

            const data = await response.json();
            console.log('API Response:', data);

            if (!response.ok) {
                throw new Error(data.error || `Error ${response.status}`);
            }

            if (data.success === true && data.reports && data.reports.length > 0) {
                const initialRatingState = {};
                data.reports.forEach(report => {
                    console.log(`Report ID: ${report.id}, Status: ${report.status}`);
                    initialRatingState[report.id] = {
                        rating: report.rating || 0,
                        comment: report.comment || '',
                        isSubmitting: false,
                        saved: !!report.rating
                    };
                });
                setRatingState(initialRatingState);
                setResult(data.reports);
                setError(null);
            } else {
                setError(data.error || 'ไม่พบข้อมูลการแจ้งซ่อมสำหรับเบอร์โทรนี้');
                setResult(null);
            }

        } catch (error) {
            console.error('Error fetching search results:', error);
            setError(`เกิดข้อผิดพลาดในการค้นหา: ${error.message}`);
            setResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRatingChange = (reportId, rating) => {
        setRatingState(prev => ({
            ...prev,
            [reportId]: { ...prev[reportId], rating, saved: false }
        }));
        setRatingError(prev => ({ ...prev, [reportId]: '' }));
    };

    const handleCommentChange = (reportId, comment) => {
        setRatingState(prev => ({
            ...prev,
            [reportId]: { ...prev[reportId], comment, saved: false }
        }));
        setRatingError(prev => ({ ...prev, [reportId]: '' }));
    };

    const handleRatingSubmit = async (reportId) => {
        const { rating, comment } = ratingState[reportId] || {};
        if (!rating) {
            setRatingError(prev => ({ ...prev, [reportId]: 'กรุณาเลือกคะแนนดาว' }));
            return;
        }

        setRatingState(prev => ({
            ...prev,
            [reportId]: { ...prev[reportId], isSubmitting: true }
        }));

        try {
            const response = await fetch(API_RATING_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_id: reportId,
                    rating,
                    comment: comment || ''
                }),
            });

            const data = await response.json();
            console.log('Rating Submission Response:', data);

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'ไม่สามารถบันทึกคะแนนได้');
            }

            setRatingState(prev => ({
                ...prev,
                [reportId]: { ...prev[reportId], isSubmitting: false, saved: true }
            }));
            setRatingError(prev => ({ ...prev, [reportId]: '' }));

        } catch (error) {
            console.error('Error submitting rating:', error);
            setRatingError(prev => ({ ...prev, [reportId]: `เกิดข้อผิดพลาด: ${error.message}` }));
            setRatingState(prev => ({
                ...prev,
                [reportId]: { ...prev[reportId], isSubmitting: false }
            }));
        }
    };

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

    return (
        <div className="complaints-form">
            <div className="complaints-card">
                <h2 className="header">ตรวจสอบสถานะการแจ้งซ่อม</h2>
                <form onSubmit={handleSubmit} className="search-form">
                    <div className="input-wrapper">
                        <input
                            type="tel"
                            value={employeeId}
                            onChange={handleInputChange}
                            placeholder="กรอกเบอร์โทรศัพท์ (10 หลัก)"
                            maxLength="10"
                            inputMode="numeric"
                            required
                            className={`search-input ${phoneError ? 'input-error' : ''}`}
                            aria-describedby={phoneError ? "phone-error-message" : undefined}
                            aria-invalid={!!phoneError}
                        />
                        {phoneError && (
                            <div id="phone-error-message" className="error-message inline-error">
                                {phoneError}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !!phoneError || employeeId.length !== 10}
                        className="search-button"
                    >
                        {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
                    </button>
                </form>
                {error && !isLoading && !result && <div className="error-message api-error">{error}</div>}
            </div>

            {!isLoading && result && result.length > 0 && (
                <div className="results-section">
                    <h3 className="result-section-header">ผลการค้นหา ({result.length} รายการ)</h3>
                    <div className="search-result-owner">
                        <p> {result[0]?.name ?? 'N/A'} {result[0]?.lastname ?? ''} </p>
                    </div>
                    {result.map((item, index) => {
                        const isCompleted = String(item.status).toLowerCase() === '3' || 
                                          String(item.status).toLowerCase() === 'completed' || 
                                          String(item.status).toLowerCase() === 'ดำเนินการเสร็จสิ้น';
                        console.log(`Rendering Report ID: ${item.id}, Is Completed: ${isCompleted}`);
                        return (
                            <div key={item.id || `report-${index}`} className="complaints-card result-card">
                                <h4 className="result-header">รายการแจ้งซ่อม #{index + 1} </h4>
                                <div className="info-grid">
                                    <div className="info-group">
                                        <strong>เบอร์โทร :</strong> {item.phone ?? 'N/A'}
                                    </div>
                                    <div className="info-group">
                                        <strong>สิ่งชำรุด :</strong> {item.repair_name ?? 'N/A'} {item.location_name ?? 'N/A'}
                                    </div>
                                    <div className="info-group">
                                        <strong>วันที่แจ้ง :</strong>
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString('th-TH', {
                                                  year: 'numeric', month: 'long', day: 'numeric',
                                                  hour: '2-digit', minute: '2-digit'
                                              })
                                            : 'N/A'}
                                    </div>
                                    <div className={`info-group status-group ${getStatusClass(item.status)}`}>
                                        <strong>สถานะ :</strong>
                                        <span className="status-text">{getStatusDisplay(item.status)}</span>
                                    </div>
                                    <div className="info-group detail-group">
                                        <strong>รายละเอียดเพิ่มเติม:</strong>
                                        <p className="text-gray">{item.details ?? 'ไม่มี'}</p>
                                    </div>
                                    {item.image && (
                                        <div className="info-group image-group">
                                            <strong>รูปภาพประกอบ:</strong>
                                            <img
                                                src={`${IMAGE_BASE_URL}${item.image}`}
                                                alt={`รูปภาพ ${item.repair_name || 'แจ้งซ่อม'}`}
                                                className="result-image"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/path/to/placeholder_image.png';
                                                    console.error(`ไม่สามารถโหลดรูปภาพ: ${e.target.src}`);
                                                }}
                                                loading="lazy"
                                                onClick={() => openImageModal(`${IMAGE_BASE_URL}${item.image}`)}
                                            />
                                        </div>
                                    )}
                                    {isCompleted ? (
                                        <div className="rating-comment-section">
                                            <h5>ให้คะแนนและความคิดเห็น</h5>
                                            {ratingState[item.id]?.saved ? (
                                                <>
                                                    <div className="rating-display-group">
                                                        <strong>คะแนนที่ให้:</strong>
                                                        <span className="rating-display">
                                                            {[...Array(5)].map((_, i) => (
                                                                <span key={i} className={i < ratingState[item.id].rating ? 'star-button selected' : 'star-button'}>
                                                                    ★
                                                                </span>
                                                            ))}
                                                            <span className="rating-value">({ratingState[item.id].rating}/5)</span>
                                                        </span>
                                                    </div>
                                                    {ratingState[item.id].comment && (
                                                        <div className="comment-display-group">
                                                            <strong>ความคิดเห็น:</strong>
                                                            <p className="saved-comment">{ratingState[item.id].comment}</p>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="rating-input-area">
                                                        <strong>ให้คะแนน:</strong>
                                                        <div className="star-rating-input">
                                                            {[...Array(5)].map((_, i) => (
                                                                <button
                                                                    key={i}
                                                                    type="button"
                                                                    className={`star-button ${i < (ratingState[item.id]?.rating || 0) ? 'selected' : ''}`}
                                                                    onClick={() => handleRatingChange(item.id, i + 1)}
                                                                    disabled={ratingState[item.id]?.isSubmitting}
                                                                >
                                                                    ★
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="comment-input-area">
                                                        <label htmlFor={`comment-${item.id}`}>ความคิดเห็น:</label>
                                                        <textarea
                                                            id={`comment-${item.id}`}
                                                            className="comment-textarea"
                                                            value={ratingState[item.id]?.comment || ''}
                                                            onChange={(e) => handleCommentChange(item.id, e.target.value)}
                                                            placeholder="กรุณาใส่ความคิดเห็น (ไม่บังคับ)"
                                                            maxLength={500}
                                                            disabled={ratingState[item.id]?.isSubmitting}
                                                        />
                                                    </div>
                                                    {ratingError[item.id] && (
                                                        <div className="error-message rating-error">
                                                            {ratingError[item.id]}
                                                        </div>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="rating-submit-button"
                                                        onClick={() => handleRatingSubmit(item.id)}
                                                        disabled={ratingState[item.id]?.isSubmitting || !ratingState[item.id]?.rating}
                                                    >
                                                        {ratingState[item.id]?.isSubmitting ? 'กำลังบันทึก...' : 'บันทึกคะแนน'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rating-comment-section">
                                            <p>การให้คะแนนและความคิดเห็นจะเปิดใช้งานเมื่อสถานะเป็น "ดำเนินการเสร็จสิ้น" เท่านั้น</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {!isLoading && !result && error && (error === 'ไม่พบข้อมูลการแจ้งซ่อมสำหรับเบอร์โทรนี้' || error.toLowerCase().includes("ไม่พบข้อมูล")) && (
                <div className="complaints-card">
                    <p className="no-results-message">{error}</p>
                </div>
            )}
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

export default Check;