import React, { useState, useEffect } from 'react'; // เพิ่ม useState, useEffect
import { useNavigate } from 'react-router-dom';    // เพิ่ม useNavigate
import '../CSS/Dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate(); // เรียกใช้ useNavigate
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // useEffect สำหรับตรวจสอบการล็อกอินจาก localStorage
    useEffect(() => {
        let user = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                user = JSON.parse(userDataString);
                // ตรวจสอบว่า user object มีข้อมูลที่จำเป็นหรือไม่ (เช่น user.email หรือ user.id)
                if (user && (user.email || user.id)) { // ปรับเงื่อนไขตามโครงสร้าง user object ของคุณ
                    setLoggedInUser(user);
                } else {
                    // ถ้า user object ไม่สมบูรณ์ ให้ถือว่าไม่ได้ล็อกอิน
                    console.warn('Dashboard Auth Check: Parsed user data is invalid or incomplete.');
                    localStorage.removeItem('user'); // อาจจะเคลียร์ข้อมูลที่ไม่ถูกต้อง
                    navigate('/login', { replace: true });
                }
            } else {
                // ไม่มีข้อมูล user ใน localStorage
                navigate('/login', { replace: true });
            }
        } catch (parseError) {
            console.error('Dashboard Auth Check: Error parsing user data from localStorage. Redirecting.', parseError);
            localStorage.removeItem('user'); // เคลียร์ข้อมูลที่ parse ไม่ได้
            navigate('/login', { replace: true });
        }
        setIsAuthChecked(true); // ทำเครื่องหมายว่าการตรวจสอบสิทธิ์เสร็จสิ้น
    }, [navigate]);

    // Conditional Rendering: แสดง UI ตามสถานะ
    if (!isAuthChecked) {
        return <p>กำลังตรวจสอบการยืนยันตัวตน...</p>; // หรือ Loading Spinner
    }

    if (!loggedInUser) {
        // ถ้า isAuthChecked เป็น true แต่ loggedInUser เป็น null
        // navigate ควรจะทำงานไปแล้ว
        return <p>กรุณาเข้าสู่ระบบ (กำลังนำทาง)...</p>; // หรือ return null;
    }

    // ถ้าล็อกอินแล้ว ให้ decode ชื่อและแสดง Dashboard
    // การ decode ชื่อ อาจจะต้องระวังถ้าข้อมูลไม่ได้ถูก encode มาในรูปแบบที่คาดหวัง
    // วิธีการ decode เดิมของคุณอาจจะซับซ้อนเกินไปถ้า first_name/last_name เป็น UTF-8 string ธรรมดา
    // ลองใช้โดยตรงก่อน ถ้ามีปัญหาเรื่อง encoding ค่อยปรับ
    const decodedFirstName = loggedInUser.first_name || '';
    const decodedLastName = loggedInUser.last_name || '';

    // เปลี่ยนการนำทางไปใช้ navigate hook
    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="dashboardContainer">
            <div className="welcomeMessage">
                <p>ยินดีต้อนรับ {decodedFirstName} {decodedLastName}</p>
                <div className="userInfo">
                    <p>ประเภทผู้ใช้: {loggedInUser.user_type ?? 'N/A'}</p>
                    <p>รหัสพนักงาน: {loggedInUser.employee_id ?? 'N/A'}</p>
                    <p>เบอร์โทรศัพท์: {loggedInUser.phone_number ?? 'N/A'}</p>
                </div>
            </div>
            <div className="buttonContainer">
                <button className="navButton" onClick={() => navigateTo('/edit-profile')}>
                    แก้ไขข้อมูลส่วนตัว
                </button>
                <button className="navButton" onClick={() => navigateTo('/repair-stats')}>
                    ดูสถิติการซ่อม
                </button>
                
                {/* {loggedInUser.user_type === 'admin' && (
                    <button className="navButton" onClick={() => navigateTo('/register-user')}> 
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