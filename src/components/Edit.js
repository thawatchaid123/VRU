import React, { useState } from 'react';
<<<<<<< HEAD
import './CSS/Edit.css';
=======
import './Edit.css';
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff

function Edit() {
  const [profilePicture, setProfilePicture] = useState(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // ที่นี่คือที่คุณจะส่งข้อมูลไปยัง backend ของคุณ
    console.log('Profile Picture:', profilePicture);
    console.log('First Name:', firstName);
    console.log('Last Name:', lastName);
    console.log('Phone Number:', phoneNumber);
    console.log('Address:', address);
    //  เพิ่มโค้ดสำหรับการส่งข้อมูลไปยัง backend ที่นี่
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <div className="edit-container">
      <h1>แก้ไขข้อมูลส่วนตัว</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="profilePicture">รูปโปรไฟล์:</label>
          <input
            type="file"
            id="profilePicture"
            onChange={handleProfilePictureChange}
            accept="image/*"
          />
        </div>
        <div className="form-group">
          <label htmlFor="firstName">ชื่อ:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">นามสกุล:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phoneNumber">เบอร์โทรศัพท์:</label>
          <input
            type="tel"
            id="phoneNumber"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        {/* <div className="form-group">
          <label htmlFor="address">ที่อยู่:</label>
          <textarea
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div> */}
        <button type="submit">บันทึก</button>
      </form>
    </div>
  );
}

export default Edit;