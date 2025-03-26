import React, { useState } from 'react';
import './Machinery.css';

function Machinery() {
  const [machineType, setMachineType] = useState('');
  const [machineNumber, setMachineNumber] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const machineTypes = [
    'เครื่องจักรกลึง',
    ' เครื่องจักรฝน',
    ' เครื่องจักรกัด',
    'เครื่องจักรเจาะ',
    'เครื่องจักรปั๊ม',
    'เครื่องจักรรอย',
    'เครื่องจักรประกอบอัตโนมัติ',
    'เครื่องจักรบรรจุภัณฑ์',
    // เพิ่มประเภทเครื่องจักรอื่นๆ ได้ที่นี่
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // ที่นี่คือที่คุณจะส่งข้อมูลไปยัง backend ของคุณ
    console.log('Machine Type:', machineType);
    console.log('Machine Number:', machineNumber);
    console.log('Additional Notes:', additionalNotes);
    // เพิ่มโค้ดสำหรับการส่งข้อมูลไปยัง backend ที่นี่
  };

  return (
    <div className="machinery-container">
      <h1>เพิ่มข้อมูลเครื่องจักร</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="machineType">ประเภทเครื่องจักร:</label>
          <select
            id="machineType"
            value={machineType}
            onChange={(e) => setMachineType(e.target.value)}
            required
          >
            <option value="">เลือกประเภท</option>
            {machineTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="machineNumber">หมายเลขเครื่องจักร:</label>
          <input
            type="text"
            id="machineNumber"
            value={machineNumber}
            onChange={(e) => setMachineNumber(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="additionalNotes">ข้อความเพิ่มเติม:</label>
          <textarea
            id="additionalNotes"
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
          />
        </div>
        <button type="submit">บันทึก</button>
      </form>
    </div>
  );
}

export default Machinery;