import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/EditProfile.css';

function EditProfile() {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phoneNumber: '',
    nationalId: '',
    password: '',
    confirmPassword: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  // ตรวจสอบการล็อกอินและดึงข้อมูลผู้ใช้จาก localStorage
  useEffect(() => {
    let user = null;
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        user = JSON.parse(userDataString);
        if (user && user.email) {
          setLoggedInUser(user);
        } else {
          localStorage.removeItem('user');
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    } catch (parseError) {
      console.error('Auth Check: Error parsing user data from localStorage. Redirecting.', parseError);
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
    setIsAuthChecked(true);
  }, [navigate]);

  // เติมข้อมูลผู้ใช้ลงในฟอร์มเมื่อ loggedInUser เปลี่ยน
  useEffect(() => {
    if (loggedInUser) {
      setFormData({
        firstName: loggedInUser.first_name || '',
        lastName: loggedInUser.last_name || '',
        employeeId: loggedInUser.employee_id || '',
        email: loggedInUser.email || '',
        phoneNumber: loggedInUser.phone_number || '',
        nationalId: loggedInUser.national_id || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [loggedInUser]);

  // จัดการการเปลี่ยนแปลงของ input
  const handleInputChange = (e) => {
    const { id, value } = e.target;

    if (id === 'phoneNumber') {
      // กรองเฉพาะตัวเลขและจำกัดความยาว 10 หลัก
      const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
      
      // ตรวจสอบเงื่อนไขเบอร์โทรศัพท์
      if (numericValue.length > 0 && numericValue[0] !== '0') {
        setPhoneError('เบอร์โทรศัพท์ต้องเริ่มต้นด้วยเลข 0');
        return;
      }
      if (numericValue.length > 1 && !['6', '8', '9'].includes(numericValue[1])) {
        setPhoneError('ตัวเลขที่สองของเบอร์โทรศัพท์ต้องเป็น 6, 8, หรือ 9');
        return;
      }
      if (numericValue.length > 10) {
        setPhoneError('เบอร์โทรศัพท์ต้องไม่เกิน 10 หลัก');
        return;
      }

      // ถ้าผ่านทุกเงื่อนไข เคลียร์ error และอัปเดต state
      setPhoneError('');
      setFormData(prevState => ({ ...prevState, [id]: numericValue }));
    } else if (id === 'email') {
      setFormData(prevState => ({ ...prevState, [id]: value }));
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setEmailError('รูปแบบอีเมลไม่ถูกต้อง');
      } else {
        setEmailError('');
      }
    } else {
      setFormData(prevState => ({ ...prevState, [id]: value }));
    }
  };

  // จัดการการ submit ฟอร์ม
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบ error ก่อน submit
    if (phoneError) {
      alert(`แก้ไขเบอร์โทรศัพท์ให้ถูกต้อง: ${phoneError}`);
      return;
    }
    if (emailError) {
      alert(`แก้ไขอีเมลให้ถูกต้อง: ${emailError}`);
      return;
    }
    if (formData.phoneNumber.length !== 10 && formData.phoneNumber.length > 0) {
      alert('เบอร์โทรศัพท์ต้องมี 10 หลัก');
      return;
    }

    setIsUpdating(true);

    // ตรวจสอบรหัสผ่าน
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        alert('รหัสผ่านใหม่ และการยืนยันรหัสผ่านไม่ตรงกัน!');
        setIsUpdating(false);
        return;
      }
    }

    if (!loggedInUser || !loggedInUser.email) {
      alert('เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้ที่ล็อกอินอยู่ กรุณาล็อกอินใหม่');
      setIsUpdating(false);
      navigate('/login', { replace: true });
      return;
    }

    // สร้าง payload สำหรับส่งไปยัง backend
    const payload = {
      original_email: loggedInUser.email,
      new_email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phoneNumber: formData.phoneNumber,
    };

    if (formData.password && formData.password === formData.confirmPassword) {
      payload.password = formData.password;
    }

    try {
      const response = await fetch('/VRU-main/update_profile.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload),
      });

      const data = await response.json();

      if (response.ok && data.message === "อัพเดตข้อมูลสำเร็จ") {
        alert('อัพเดตข้อมูลสำเร็จ!');

        // อัปเดตข้อมูลผู้ใช้ใน localStorage และ state
        const updatedUserForStorage = {
          ...loggedInUser,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
        };
        localStorage.setItem('user', JSON.stringify(updatedUserForStorage));
        setLoggedInUser(updatedUserForStorage);

        navigate('/dashboard');
      } else {
        const errorMessage = data.message || "การอัพเดตล้มเหลว กรุณาลองใหม่";
        console.error("Update Failed Response:", data);
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isAuthChecked) {
    return <p>กำลังตรวจสอบการยืนยันตัวตน...</p>;
  }

  if (!loggedInUser) {
    return <p>กรุณาเข้าสู่ระบบ (กำลังนำทาง)...</p>;
  }

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-form">
        <h2>แก้ไขข้อมูลส่วนตัว</h2>
        <form onSubmit={handleSubmit}>
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
          <div className="form-group">
            <label htmlFor="employeeId">รหัสพนักงาน :</label>
            <input
              type="text"
              id="employeeId"
              value={formData.employeeId}
              readOnly
              className="readonly-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">อีเมล:</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="phoneNumber">เบอร์โทรศัพท์:</label>
            <input
              type="text"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="0XXXXXXXXX"
              maxLength="10"
              required
            />
            {phoneError && <p className="error-message">{phoneError}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="nationalId">เลขบัตรประชาชน :</label>
            <input
              type="text"
              id="nationalId"
              value={formData.nationalId}
              readOnly
              className="readonly-input"
            />
          </div>
          <hr />
          <p className="password-note">
            กรอกเฉพาะในกรณีที่ต้องการเปลี่ยนรหัสผ่านใหม่เท่านั้น
          </p>
          <div className="form-group">
            <label htmlFor="password">รหัสผ่านใหม่:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">ยืนยันรหัสผ่านใหม่:</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" disabled={isUpdating || !!phoneError || !!emailError}>
            {isUpdating ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;