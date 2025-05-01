import React, { useState } from 'react';
import './CSS/Employee.css';
import { useNavigate } from "react-router-dom"; // นำเข้า useNavigate


function Employee() {
  const [selectedOption, setSelectedOption] = useState('');
  const [showLogout, setShowLogout] = useState(true);
  const navigate = useNavigate(); // ประกาศ useNavigate

 

  const handleOptionChange = (option) => {
    setSelectedOption(option);
    if (option === 'report') {
      navigate('/reportform'); // นำทางไปยัง /reportform เมื่อคลิกแจ้งซ่อม
    }
  };

  const handleLogout = () => {
    console.log('ออกจากระบบ');
    setShowLogout(false);
  };

  return (
    <div className="Employee">
      <header className="employee-header">
        {showLogout && (
          <button className="logout-button" onClick={handleLogout}>
            ออกจากระบบ
          </button>
        )}
      </header>

      <main className="employee-main">
        <div className="option-container">
          <div className="option-box" onClick={() => handleOptionChange('report')}>
            <h2>แจ้งซ่อม</h2>
          </div>
          <div className="option-box" onClick={() => handleOptionChange('profile')}>
            <h2>แก้ไขข้อมูลส่วนตัว</h2>
          </div>
        </div>
        {selectedOption === 'report' && (
          <div className="content-section">
            <h3>แจ้งซ่อม</h3>
            <p>ฟอร์มแจ้งซ่อมจะอยู่ที่นี่</p>
          </div>
        )}

        {selectedOption === 'profile' && (
          <div className="content-section">
            <h3>แก้ไขข้อมูลส่วนตัว</h3>
            <p>ฟอร์มแก้ไขข้อมูลส่วนตัวจะอยู่ที่นี่</p>
          </div>
        )}
      </main> 
    </div>
  );
}

export default Employee;