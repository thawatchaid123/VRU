import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // ตรวจสอบว่ามีข้อมูลผู้ใช้ใน localStorage หรือไม่
    const isAuthenticated = localStorage.getItem('user');
    
    if (!isAuthenticated) {
        // ถ้าไม่มีข้อมูลผู้ใช้ ให้ redirect ไปหน้า login
        return <Navigate to="/login" />;
    }
    
    // ถ้ามีข้อมูลผู้ใช้ ให้แสดงคอมโพเนนต์ที่ต้องการ
    return children;
};

export default PrivateRoute;