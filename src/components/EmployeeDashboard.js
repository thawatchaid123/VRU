import React from 'react';
import { useNavigate } from "react-router-dom";
import styles from './EmployeeDashboard.module.css';
import { Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    const navigate = useNavigate();
    
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (error) {
        console.error('Error parsing user data:', error);
        return <div>เกิดข้อผิดพลาดในการโหลดข้อมูล</div>;
    }

    if (!user) {
        return <div>กรุณาเข้าสู่ระบบ</div>;
    }

    const decodedFirstName = decodeURIComponent(JSON.parse('"' + user.first_name + '"'));
    const decodedLastName = decodeURIComponent(JSON.parse('"' + user.last_name + '"'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h2>พื้นที่สำหรับพนักงาน</h2>
            </div>

            <div className={styles.welcomeMessage}>
                <p>ยินดีต้อนรับ, คุณ{decodedFirstName} {decodedLastName}</p>
                <div className={styles.userInfo}>
                    <p>รหัสพนักงาน: {user.employee_id}</p>
                    <p>เบอร์โทรศัพท์: {user.phone_number}</p>
                </div>
            </div>

            <div className={styles.quickActions}>
                <h3>เมนูด่วน</h3>
                <div className={styles.actionButtons}>
                    <Link to="/" className={styles.actionButton}>
                        แจ้งซ่อม
                    </Link>
                    {/* <Link to="/" className={styles.actionButton}>
                        ประวัติการแจ้งซ่อม
                    </Link> */}
                    <Link to="/complaintform" className={styles.actionButton}>
                        ติดตามสถานะ
                    </Link>
                    <Link to="/edit-profile" className={styles.actionButton}>
                        แก้ไขข้อมูลส่วนตัว
                    </Link>
                </div>
                <div className={styles.logoutContainer}>
                    <button 
                        onClick={handleLogout}
                        className={styles.logoutButton}
                    >
                        ออกจากระบบ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDashboard;