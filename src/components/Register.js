import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    nationalId: '',
    employeeId: '',
    firstName: '',
    lastName: '',
    userType: 'employee'
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      phoneNumber: '',
      nationalId: '',
      employeeId: '',
      firstName: '',
      lastName: '',
      userType: 'employee'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost/PO/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(formData),
      });

      const data = await response.text();
      
      if (response.ok) {
        alert('ลงทะเบียนสำเร็จ!');
        resetForm();
        // Redirect to login page after successful registration
        navigate('/login');
      } else {
        alert('การลงทะเบียนล้มเหลว: ' + data);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาด:', error);
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h2>สมัครสมาชิก</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">อีเมล:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่าน:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
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
            <label htmlFor="userType">ประเภทผู้ใช้:</label>
            <select
              id="userType"
              value={formData.userType}
              onChange={handleInputChange}
              required
            >
              <option value="employee">พนักงาน</option>
              <option value="technician">ช่างเทคนิค</option>
              <option value="admin">ผู้ดูแลระบบ</option>
            </select>
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
          <button type="submit">สมัครสมาชิก</button>
        </form>
      </div>
    </div>
  );
}

export default Register;