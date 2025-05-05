import React from 'react';
import './CSS/Dashboard.css';

const Dashboard = () => {
    let user = null;
    try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
            user = JSON.parse(userDataString);
            console.log('User data:', user);
        } else {
            console.log('No user data found in localStorage.');
        }
    } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
    }

    if (!user) {
        return <div>กรุณาเข้าสู่ระบบ</div>;
    }

    const decodedFirstName = user.first_name ? decodeURIComponent(JSON.parse('"' + user.first_name.replace(/"/g, '\\"') + '"')) : '';
    const decodedLastName = user.last_name ? decodeURIComponent(JSON.parse('"' + user.last_name.replace(/"/g, '\\"') + '"')) : '';

    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <div className="dashboardContainer">
            <div className="welcomeMessage">
                <p>ยินดีต้อนรับ {decodedFirstName} {decodedLastName}</p>
                <div className="userInfo">
                    <p>ประเภทผู้ใช้: {user.user_type ?? 'N/A'}</p>
                    <p>รหัสพนักงาน: {user.employee_id ?? 'N/A'}</p>
                    <p>เบอร์โทรศัพท์: {user.phone_number ?? 'N/A'}</p>
                </div>
            </div>
            <div className="buttonContainer">
                <button className="navButton" onClick={() => navigateTo('/edit-profile')}>
                    แก้ไขข้อมูลส่วนตัว
                </button>
                <button className="navButton" onClick={() => navigateTo('/repair-stats')}>
                    ดูสถิติการซ่อม
                </button>
                {/* {user.user_type === 'admin' && (
                    <button className="navButton" onClick={() => navigateTo('/register')}>
                        สมัครผู้ใช้ใหม่
                    </button>
                )} */}
                <button className="navButton" onClick={() => navigateTo('/add-repair')}>
                    เพิ่มข้อมูลซ่อม
                </button>
                <button className="navButton" onClick={() => navigateTo('/add-environmental')}>
                    เพิ่มข้อมูลสิ่งแวดล้อม
                </button>
                <button className="navButton" onClick={() => navigateTo('/update-status')}>
                    อัปเดตสถานะ
                </button>
            </div>
        </div>
    );
};

export default Dashboard;