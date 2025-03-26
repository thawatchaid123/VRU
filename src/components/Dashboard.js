import React from 'react';
import styles from './Dashboard.module.css';

const Dashboard = () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
        console.log('User data:', user);
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    if (!user) {
        return <div>กรุณาเข้าสู่ระบบ</div>;
    }

    const decodedFirstName = decodeURIComponent(JSON.parse('"' + user.first_name + '"'));
    const decodedLastName = decodeURIComponent(JSON.parse('"' + user.last_name + '"'));

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.header}>
                <h2>หน้าADMINE</h2>
            </div>
            <div className={styles.welcomeMessage}>
                <p>ยินดีต้อนรับ, {decodedFirstName} {decodedLastName}</p>
                <div className={styles.userInfo}>
                    <p>ประเภทผู้ใช้: {user.user_type}</p>
                    <p>รหัสพนักงาน: {user.employee_id}</p>
                    <p>เบอร์โทรศัพท์: {user.phone_number}</p>
                </div>
            </div>
            <div className={styles.buttonContainer}>
                <button className={styles.navButton} onClick={() => window.location.href = '/edit-profile'}>
                    แก้ไขข้อมูลส่วนตัว
                </button>
                <button className={styles.navButton} onClick={() => window.location.href = '/repair-stats'}>
                    ดูสถิติการซ่อม
                </button>
                <button className={styles.navButton} onClick={() => window.location.href = '/register'}>
                    สมัครผู้ใช้
                </button>
                <button className={styles.navButton} onClick={() => window.location.href = '/machine-management'}>
                    ดูข้อมูลเครื่องจักร
                </button>
            </div>
        </div>
    );
};

export default Dashboard;