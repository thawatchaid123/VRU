import { useNavigate } from "react-router-dom";
import axios from "axios";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Fuse from "fuse.js";
import React, { useState, useRef } from "react";
import PropTypes from 'prop-types';

// Block Component
const Block = ({ onClick, text }) => {
  return (
    <div 
      className="block" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter') {
          onClick();
        }
      }}
    >
      {text}
    </div>
  );
};

Block.propTypes = {
  onClick: PropTypes.func.isRequired,
  text: PropTypes.string.isRequired
};

const ReportForm = ({ onSubmit }) => {
  const [phone, setPhone] = useState("");
  const [report, setReport] = useState("");
  const [category, setCategory] = useState(""); 
  const [photos, setPhotos] = useState([]);
  const [hasPhoto, setHasPhoto] = useState(false);
  const [showSubOptions, setShowSubOptions] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [phoneError, setPhoneError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reportRef = useRef(null);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    if (e.target.files.length > 0) {
      setPhotos([...e.target.files]);
      setHasPhoto(true);
    } else {
      setPhotos([]);
      setHasPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("issue", report);
    // ใช้ category ที่รวม name และ subOption แล้ว
    formData.append("category", category);
    
    if (photos.length > 0) {
      photos.forEach((photo) => {
        formData.append('photos[]', photo);
      });
    }

    try {
      const response = await axios.post('http://localhost/PO/uploadd.php', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        if (onSubmit) {
          onSubmit(response.data);
        }
        setPhone("");
        setReport("");
        setCategory("");
        setPhotos([]);
        setHasPhoto(false);
        setSelectedCategory(null);
        setShowSubOptions(false);
        
        alert("บันทึกข้อมูลสำเร็จ");
        navigate("/complaintform");
      } else {
        alert(response.data.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error.response?.data?.error || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value.replace(/[^A-Za-z0-9]/g, "");
    if (inputValue.length > 10) {
      setPhoneError("กรุณากรอกหมายเลขพนักงานไม่เกิน 10 ตัว");
    } else {
      setPhoneError(null);
    }
    setPhone(inputValue);
  };

  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  const categories = [
    {
      name: "เครื่องผสมและเครื่องกวน (Mixing Machines)",
      subOptions: [
        "IDC0101 Binder Mixer ",
        "IDC0102 Ceramic Stock ",
        "IDC0103 Nickel Stock ",
        "IDC0104 Dual Shaft ",
        "IDC0117 Mixer ",
        "IDC0118 Mixer - Ross ",
        "IDC0119 Mixer - Kady ",
        "IDC0120 Homogenizer ",
      ],
    },
    {
      name: "เครื่องบดและกระจายอนุภาค (Milling Machines)",
      subOptions: [
        "IDC0105 Three Roll Mill ",
        "IDC0116 Netzsch Mill ",
        "IDC0106 Planetary Mill ",
        "IDC0115 DAM APEX Mill ",
       
      ],
    },
    {
      name: "เครื่องจักรงานพิมพ์และตัด (Printing & Cutting Machines)",
      subOptions: [
        "IDC0401 PRINTER MACHINE ",
        "IDC0102 PAD CUTTING MACHINE ",
        "IDC0102 TTP Disco Dicer ",
        "IDC0103 Guillotine Cutter ",
        
      ],
    },
    {
      name: "เครื่องจักรงานบรรจุและขนส่ง (Packaging & Stacking Machines)",
      subOptions: [
        "IDC0501 HIGH SPEED STACKERS MACHINE ",
        " IDC1106 TAPE & REEL MACHINE ",
       
      ],
    },
    {
      name: "เครื่องจักรให้ความร้อนและเตาเผา (Heating & Sintering Machines)",
      subOptions: [
        "IDC0107 Stripping Hotplate ",
        "IDC0803 TUNNEL-TYPE SINTERING FURNACE ",
        "IDC0804 INDUSTRIAL OVEN MACHINE : N2 BO OVEN ",
        "IDC0805 INDUSTRIAL OVEN MACHINE : GRUENBERG  ",
        "IDC0901 INDUSTRIAL OVEN MACHINE : KOYO OVEN ",
        "IDC0903 INDUSTRIAL OVEN MACHINE : EPOXY CURING OVEN ",
        "IDC1003 INDUSTRIAL OVEN MACHINE : POLISHING DRYING OVEN   ",
        "IDC1007 INDUSTRIAL OVEN MACHINE : BM Drying Oven   ",
        "IDC0109 OVEN MACHINE : LOI Oven   ",
        "IDC0111 Oven - 130degC   ",
        "IDC0112 Oven - 195degC   ",
        "IDC0113 Oven - 400degC   ",
        "IDC0114 Oven - 1000degC   ",
       
      ],
    },
    {
      name: "เครื่องขัดเงาและทำความสะอาด (Polishing & Cleaning Machines)",
      subOptions: [
        "IDC1001 SAND POLISHER MACHINE ",
        "IDC1002 ULTRA SONIC TANK ",
       
      ],
    },
    {
      name: "เครื่องจักรสำหรับงานทดสอบและตรวจสอบ (Testing & Inspection Machines)",
      subOptions: [
        "IDC1102 MICRO CHIP VISUAL INSPECTION MACHINE ",
        "IDC1108 ELECTRICAL TESTING MACHINE : ALLEGRO ",
        "IDC0108 Particle Size Analyzer Horiba Q3  ",
        "IDC0110 Spectrometer - Perkins Elmer ",
      ],
    },
    {
      name: "เครื่องจักรสำหรับการแพ็คกิ้งและจัดเรียงชิ้นส่วน (Packaging & Handling Machines)",
      subOptions: [
        "IDC1106 TAPE & REEL MACHINE ",
       
      ],
    },
    {
      name: "เครื่องจักรในสายการผลิตอัตโนมัติ (Automation & Assembly Machines)",
      subOptions: [
        "IDC1006 AUTOMATIC CHIPSTAR BARREL LINE   ",
        "IDC0902 FITO TERM   ",
       
      ],
    },
  ];

  const fuseOptions = {
    keys: ["name", "subOptions"],
    threshold: 0.4,
  };
  const fuseIndex = Fuse.createIndex(fuseOptions.keys, categories);
  const fuse = new Fuse(categories, fuseOptions, fuseIndex);

  const handleCategorySearch = (e) => {
    const inputText = e.target.value;
    setCategory(inputText);

    if (inputText.length >= 2) {
      const searchResults = fuse.search(inputText);
      if (searchResults.length > 0) {
        setShowSubOptions(true);
        setSelectedCategory({
          name: "ผลลัพธ์การค้นหา",
          subOptions: searchResults.map((result) => `${result.item.name} - ${result.item.subOptions[0]}`),
        });
      } else {
        setShowSubOptions(false);
        setSelectedCategory(null);
      }
    } else if (inputText.length === 0) {
      setShowSubOptions(false);
      setSelectedCategory(null);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowSubOptions(true);
  };

  const handleSubOptionClick = (subOption) => {
    // รวม name และ subOption เข้าด้วยกัน
    const fullCategory = `${selectedCategory.name} - ${subOption}`;
    setCategory(fullCategory);
    setShowSubOptions(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="tom">
        <label>หมวดหมู่เครื่องจักร</label>
        <input
          type="text"
          value={category}
          onChange={handleCategorySearch}
          placeholder="ค้นหาหรือเลือกหมวดหมู่"
          className="large-input"
        />
        <div className="blocks-container">
          {!showSubOptions && categories.map((cat) => (
            <Block
              key={cat.name}
              onClick={() => handleCategoryClick(cat)}
              text={cat.name}
            />
          ))}
          {showSubOptions && selectedCategory && (
            <div>
              {selectedCategory.subOptions.map((subOption) => (
                <Block
                  key={subOption}
                  onClick={() => handleSubOptionClick(subOption)}
                  text={subOption}
                />
              ))}
            </div>
          )}
        </div>

        <label>รายละเอียดปัญหา</label>
        <div className="input-with-attachment">
          <textarea
            ref={reportRef}
            value={report}
            onChange={handleReportChange}
            required
            className="large-input"
            rows="3"
            placeholder="กรุณากรอกรายละเอียดปัญหาและแนบรูปภาพ (ถ้ามี)"
          />
          <label
            className="file-attachment-label"
            style={{ position: "absolute", top: "10px", right: "10px" }}
          >
            <i className="fas fa-upload"></i>
            <input
              type="file"
              onChange={handlePhotoChange}
              accept="image/*"
              className="file-input"
              multiple
              style={{ display: "none" }}
            />
            {hasPhoto && <i className="fas fa-check photo-attached-icon"></i>}
          </label>
        </div>
      </div>

      <div className="button-container">
        <div className="tom1">
          <label>รหัสพนักงาน</label>
          <input
            type="text"
            name="employee_id"
            value={phone}
            onChange={handlePhoneChange}
            required
            className="large-inputs"
          />
          {phoneError && <div className="error">{phoneError}</div>}
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting || phoneError}
          >
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยัน'}
          </button>
        </div>
      </div>
    </form>
  );
};

ReportForm.propTypes = {
  onSubmit: PropTypes.func
};

export default ReportForm;