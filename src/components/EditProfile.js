import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

function EditProfile() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      phoneNumber: '',
      nationalId: '',
      employeeId: '',
      firstName: '',
      lastName: ''
    });


    useEffect(() => {
        // ตรวจสอบการล็อกอิน
        const userData = localStorage.getItem('user');
        if (!userData) {
          navigate('/login');
          return;
        }
    
        // ถ้ามีการล็อกอิน ให้โหลดข้อมูลผู้ใช้
        const parsedUserData = JSON.parse(userData);
        setFormData({
          phoneNumber: parsedUserData.phone_number || '',
          nationalId: parsedUserData.national_id || '',
          employeeId: parsedUserData.employee_id || '',
          firstName: parsedUserData.first_name || '',
          lastName: parsedUserData.last_name || ''
        });
      }, [navigate]);

      
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ดึง email จาก localStorage เพื่อใช้ระบุผู้ใช้ที่ต้องการอัพเดต
    const userData = JSON.parse(localStorage.getItem('user'));
    
    try {
      const response = await fetch('http://localhost/PO/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          ...formData,
          email: userData.email // ส่ง email ไปด้วยเพื่อใช้ระบุผู้ใช้
        }),
      });

      const data = await response.text();
      
      if (response.ok) {
        alert('อัพเดตข้อมูลสำเร็จ!');
        // อัพเดตข้อมูลใน localStorage
        const updatedUser = {
          ...userData,
          phone_number: formData.phoneNumber,
          national_id: formData.nationalId,
          employee_id: formData.employeeId,
          first_name: formData.firstName,
          last_name: formData.lastName
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        alert('การอัพเดตล้มเหลว: ' + data);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-form">
        <h2>แก้ไขข้อมูลส่วนตัว</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="phoneNumber">เบอร์โทรศัพท์:</label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nationalId">เลขบัตรประชาชน:</label>
            <input
              type="text"
              id="nationalId"
              value={formData.nationalId}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="employeeId">รหัสพนักงาน:</label>
            <input
              type="text"
              id="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="firstName">ชื่อ:</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">นามสกุล:</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <button type="submit">บันทึกการเปลี่ยนแปลง</button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;