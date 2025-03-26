
import React, { useState } from 'react';
import './ComplaintForm.css';

const ComplaintForm = () => {
    const [employeeId, setEmployeeId] = useState('');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const getStatusDisplay = (status) => {
        // Convert status to number if it's a string
        const statusCode = typeof status === 'string' ? parseInt(status, 10) : status;
        
        switch (statusCode) {
            case 1:
                return 'รอดำเนินการ';
            case 2:
                return 'เข้ารับการซ่อมแล้ว';
            case 3:
                return 'ดำเนินการเสร็จสิ้น';
                case 4:
                return 'ปฏิเสธการซ่อม';
            case 'pending': // Keeping the original text values for backward compatibility
                return 'รอดำเนินการ';
            case 'in_progress':
                return 'เข้ารับการซ่อมแล้ว';
            case 'completed':
                return 'ดำเนินการเสร็จสิ้น';
            case 'rejected':
                return 'ปฏิเสธการซ่อม';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        // แปลงสถานะเป็นตัวเลขถ้ามันเป็นสตริง
        const statusCode = typeof status === 'string' ? parseInt(status, 10) : status;
        
        switch (statusCode) {
            case 1:
                return 'status-pending';
            case 2:
                return 'status-in-progress';
            case 3:
                return 'status-completed';
                case 4:
                    return 'status-rejected';
                    
            case 'pending': // รักษาความเข้ากันได้กับค่าข้อความเดิม
                return 'status-pending';
            case 'in_progress':
                return 'status-in-progress';
            case 'completed':
                return 'status-completed';
            case 'rejected':
                return 'status-rejected';
            default:
                return '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/PO/search.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ employee_id: employeeId }),
            });

            const data = await response.json();
            
            if (data.reports) {
                setResult(data.reports);
            } else {
                setError(data.error || 'ไม่พบข้อมูล');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('เกิดข้อผิดพลาดในการค้นหาข้อมูล กรุณาลองใหม่อีกครั้ง');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="complaints-form">
            <div className="complaints-card">
                <h2 className="header">ข้อมูลการร้องเรียน</h2>
                <form onSubmit={handleSubmit} className="search-form">
                    <input
                        type="text"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        placeholder="กรอกรหัสพนักงาน"
                        maxLength="10"
                        pattern="[A-Za-z0-9]{1,10}"
                        required
                        className="search-input"
                    />
                    <button type="submit" disabled={isLoading} className="search-button">
                        {isLoading ? 'กำลังค้นหา...' : 'ค้นหา'}
                    </button>
                </form>
                {error && <div className="error-message">{error}</div>}
            </div>

            {result && result.map((item, index) => (
               
                 <div key={index} className="complaints-card result-card">
                    <h3 className="result-header">ข้อมูลการร้องเรียน #{index + 1}</h3>
                    <div className="info-grid">
                        <div className="info-group"><strong>รหัสพนักงาน:</strong> {item.employee_id}</div>
                        <div className="info-group"><strong>ประเภท:</strong> {item.category}</div>
                       
                      
                        <div className="info-group">
    <strong>สถานะ:</strong> 
    <span style={{
        color: item.status === 1 || item.status === 'pending' ? '#2ecc71' : 
               item.status === 2 || item.status === 'in_progress' ? '#f39c12' :
               item.status === 3 || item.status === 'completed' ? '#3498db' :
               item.status === 4 || item.status === 'rejected' ? '#e74c3c' : // เปลี่ยนจาก ##e74c3c เป็น #e74c3c (ลบ # ตัวหน้า)
               'inherit',
        fontWeight: 'bold'
    }}>
        {getStatusDisplay(item.status)}
    </span>
</div>

                        <div className="info-group"><strong>วันที่สร้าง:</strong> {item.created_at}</div>
                        <div className="info-group detail-group">
                            <strong>รายละเอียด:</strong>
                            <p className="text-gray">{item.reports}</p>
                        </div>
                        {item.image_path && (
                            <div className="image-container">
                                <strong>รูปภาพ:</strong>
                                <img
                                    src={item.image_path}
                                    alt="ร้องเรียน"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        display: 'block',
                                        margin: '10px auto',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ComplaintForm;
