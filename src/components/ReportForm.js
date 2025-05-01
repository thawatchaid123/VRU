<<<<<<< HEAD
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Fuse from "fuse.js";
import PropTypes from 'prop-types';
import '@fortawesome/fontawesome-free/css/all.min.css'; 
import './CSS/ReportForm.css'; 


const Block = ({ onClick, text }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { 
      onClick();
    }
  };

  return (
    <div
      className="block"
      onClick={onClick}
      role="button" // Semantic role
      tabIndex={0} // Make it focusable
      onKeyPress={handleKeyPress} // Keyboard accessibility
      aria-pressed="false" // Indicate it's not a toggle button (optional)
=======
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
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
    >
      {text}
    </div>
  );
};

Block.propTypes = {
  onClick: PropTypes.func.isRequired,
<<<<<<< HEAD
  text: PropTypes.string.isRequired,
};

// --- Main ReportForm Component ---
const ReportForm = ({ onSubmit }) => {
  // --- State Variables ---
  const [phone, setPhone] = useState(""); // Employee ID
  const [report, setReport] = useState(""); // Issue description
  const [categorySearchText, setCategorySearchText] = useState(""); // Text in category search input
  const [selectedFullCategory, setSelectedFullCategory] = useState(""); // Final selected category (e.g., "Category - SubOption")
  const [photos, setPhotos] = useState([]); // Array of selected file objects
  const [showSubOptions, setShowSubOptions] = useState(false); // Whether to show sub-options view
  const [currentCategoryForSubOptions, setCurrentCategoryForSubOptions] = useState(null); // Which category's sub-options to show
  const [phoneError, setPhoneError] = useState(null); // Validation error for phone
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission status flag
  const navigate = useNavigate();

  // --- Static Data & Fuse.js Setup ---
  const categories = useMemo(() => [
    // ... (Keep the same categories array as before)
    {
      name: "เครื่องผสมและเครื่องกวน (Mixing Machines)",
      subOptions: [
        "IDC0101 Binder Mixer ", "IDC0102 Ceramic Stock ", "IDC0103 Nickel Stock ",
        "IDC0104 Dual Shaft ", "IDC0117 Mixer ", "IDC0118 Mixer - Ross ",
        "IDC0119 Mixer - Kady ", "IDC0120 Homogenizer ",
=======
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
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องบดและกระจายอนุภาค (Milling Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC0105 Three Roll Mill ", "IDC0116 Netzsch Mill ", "IDC0106 Planetary Mill ",
        "IDC0115 DAM APEX Mill ",
=======
        "IDC0105 Three Roll Mill ",
        "IDC0116 Netzsch Mill ",
        "IDC0106 Planetary Mill ",
        "IDC0115 DAM APEX Mill ",
       
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรงานพิมพ์และตัด (Printing & Cutting Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC0401 PRINTER MACHINE ", "IDC0102 PAD CUTTING MACHINE ", "IDC0102 TTP Disco Dicer ",
        "IDC0103 Guillotine Cutter ",
=======
        "IDC0401 PRINTER MACHINE ",
        "IDC0102 PAD CUTTING MACHINE ",
        "IDC0102 TTP Disco Dicer ",
        "IDC0103 Guillotine Cutter ",
        
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรงานบรรจุและขนส่ง (Packaging & Stacking Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC0501 HIGH SPEED STACKERS MACHINE ", " IDC1106 TAPE & REEL MACHINE ",
=======
        "IDC0501 HIGH SPEED STACKERS MACHINE ",
        " IDC1106 TAPE & REEL MACHINE ",
       
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรให้ความร้อนและเตาเผา (Heating & Sintering Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC0107 Stripping Hotplate ", "IDC0803 TUNNEL-TYPE SINTERING FURNACE ",
        "IDC0804 INDUSTRIAL OVEN MACHINE : N2 BO OVEN ", "IDC0805 INDUSTRIAL OVEN MACHINE : GRUENBERG  ",
        "IDC0901 INDUSTRIAL OVEN MACHINE : KOYO OVEN ", "IDC0903 INDUSTRIAL OVEN MACHINE : EPOXY CURING OVEN ",
        "IDC1003 INDUSTRIAL OVEN MACHINE : POLISHING DRYING OVEN   ", "IDC1007 INDUSTRIAL OVEN MACHINE : BM Drying Oven   ",
        "IDC0109 OVEN MACHINE : LOI Oven   ", "IDC0111 Oven - 130degC   ",
        "IDC0112 Oven - 195degC   ", "IDC0113 Oven - 400degC   ",
        "IDC0114 Oven - 1000degC   ",
=======
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
       
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องขัดเงาและทำความสะอาด (Polishing & Cleaning Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC1001 SAND POLISHER MACHINE ", "IDC1002 ULTRA SONIC TANK ",
=======
        "IDC1001 SAND POLISHER MACHINE ",
        "IDC1002 ULTRA SONIC TANK ",
       
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรสำหรับงานทดสอบและตรวจสอบ (Testing & Inspection Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC1102 MICRO CHIP VISUAL INSPECTION MACHINE ", "IDC1108 ELECTRICAL TESTING MACHINE : ALLEGRO ",
        "IDC0108 Particle Size Analyzer Horiba Q3  ", "IDC0110 Spectrometer - Perkins Elmer ",
=======
        "IDC1102 MICRO CHIP VISUAL INSPECTION MACHINE ",
        "IDC1108 ELECTRICAL TESTING MACHINE : ALLEGRO ",
        "IDC0108 Particle Size Analyzer Horiba Q3  ",
        "IDC0110 Spectrometer - Perkins Elmer ",
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรสำหรับการแพ็คกิ้งและจัดเรียงชิ้นส่วน (Packaging & Handling Machines)",
      subOptions: [
        "IDC1106 TAPE & REEL MACHINE ",
<<<<<<< HEAD
=======
       
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      ],
    },
    {
      name: "เครื่องจักรในสายการผลิตอัตโนมัติ (Automation & Assembly Machines)",
      subOptions: [
<<<<<<< HEAD
        "IDC1006 AUTOMATIC CHIPSTAR BARREL LINE   ", "IDC0902 FITO TERM   ",
      ],
    },
  ], []); // useMemo to prevent recreation on every render

  // Flatten categories for easier searching of sub-options
  const flatCategories = useMemo(() => {
    return categories.flatMap(cat =>
      cat.subOptions.map(sub => ({
        categoryName: cat.name,
        subOption: sub.trim(), // Trim whitespace
        fullText: `${cat.name} - ${sub.trim()}` // For matching
      }))
    );
  }, [categories]);

  const fuseOptions = {
    keys: ["fullText", "subOption", "categoryName"], // Search across these fields
    threshold: 0.4, // Adjust sensitivity as needed
    includeScore: true, // Good for debugging relevance
  };
  const fuse = useMemo(() => new Fuse(flatCategories, fuseOptions), [flatCategories]); // Memoize Fuse instance

  // --- Event Handlers ---

  // Handle file selection
  const handlePhotoChange = (e) => {
    setPhotos([...e.target.files]); // Store selected files
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default browser form submission
    if (isSubmitting || phoneError) return; // Prevent submission if already submitting or phone error exists

    setIsSubmitting(true); // Set submitting flag

    const formData = new FormData();
    formData.append("phone", phone);
    formData.append("issue", report);
    formData.append("category", selectedFullCategory); // Use the final combined category string

    if (photos.length > 0) {
      photos.forEach((photo, index) => {
       
        formData.append(`photos[${index}]`, photo);
        
      });
    }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost/VRU-main/uploadd.php';

    try {
      const response = await axios.post(apiUrl, formData, {
        headers: {
          // Content-Type is automatically set by browser/axios for FormData
          // 'Content-Type': 'multipart/form-data'
        },
      });

      // --- Handle Response ---
      if (response.data && response.data.success) {
        if (onSubmit) {
          onSubmit(response.data); // Callback for parent component
        }
        // Reset form state
        setPhone("");
        setReport("");
        setCategorySearchText("");
        setSelectedFullCategory("");
        setPhotos([]);
        setShowSubOptions(false);
        setCurrentCategoryForSubOptions(null);
        setPhoneError(null);

        alert("บันทึกข้อมูลสำเร็จ"); // Success message
        navigate("/complaintform"); // Navigate on success (ensure this route exists)
      } else {
        // Handle server-side errors reported in the response
        alert(response.data?.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล (Server)");
      }
    } catch (error) {
      // Handle network errors or exceptions during the request
      console.error("Error submitting form:", error);
      // Check for specific axios error response details
      const errorMessage = error.response?.data?.error || error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล กรุณาลองใหม่อีกครั้ง (Client)";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false); // Reset submitting flag regardless of success/failure
    }
  };

  // Handle Employee ID input change and validation
  const handlePhoneChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, ""); // Allow only digits
    setPhone(inputValue); // Update state

    // Validate length
    if (inputValue.length > 10) {
      setPhoneError("กรุณากรอกรหัสพนักงานเป็นตัวเลข ไม่เกิน 10 หลัก");
    } else {
      setPhoneError(null); // Clear error if valid
    }
  };

  // Handle issue description change
  const handleReportChange = (e) => {
    setReport(e.target.value);
  };

  // Handle typing in the category search input
  const handleCategorySearchChange = (e) => {
    const searchText = e.target.value;
    setCategorySearchText(searchText);
    setSelectedFullCategory(""); // Clear final selection when typing
    setShowSubOptions(false); // Hide sub-options view when searching
    setCurrentCategoryForSubOptions(null);
  };

  // Handle clicking a main category block
  const handleCategoryClick = (category) => {
    setCategorySearchText(category.name); // Show category name in input (optional)
    setCurrentCategoryForSubOptions(category); // Set which category's sub-options to show
    setShowSubOptions(true); // Show the sub-options view
    setSelectedFullCategory(""); // Clear previous final selection
  };

  // Handle clicking a sub-option block (either from direct view or search results)
  const handleSubOptionClick = (categoryName, subOption) => {
    const fullCategory = `${categoryName} - ${subOption}`;
    setSelectedFullCategory(fullCategory); // Set the final combined category string
    setCategorySearchText(fullCategory); // Update input field to show selection
    setShowSubOptions(false); // Hide sub-options/search results
    setCurrentCategoryForSubOptions(null);
  };

  // --- Search Logic ---
  const searchResults = useMemo(() => {
    if (categorySearchText.length < 2 || showSubOptions) {
      return []; // Don't search if input is too short or showing direct sub-options
    }
    // Perform fuzzy search
    return fuse.search(categorySearchText).map(result => result.item); // Get the matching items
  }, [categorySearchText, fuse, showSubOptions]);

  // --- Render Logic ---
  return (
    <form onSubmit={handleSubmit}>
      {/* --- Category Selection --- */}
      <div className="tom">
        <label htmlFor="category-search">หมวดหมู่เครื่องจักร</label>
        <input
          id="category-search"
          type="text"
          value={categorySearchText} // Controlled input for search/display
          onChange={handleCategorySearchChange}
          placeholder="ค้นหาหรือเลือกหมวดหมู่"
          className="large-input"
          autoComplete="off" // Prevent browser autocomplete interference
        />

        {/* Show Main Categories OR Sub-Options OR Search Results */}
        <div className="blocks-container">
          {!showSubOptions && searchResults.length === 0 && (
            // Show main category blocks if not showing sub-options and no search results
            categories.map((cat) => (
              <Block
                key={cat.name}
                onClick={() => handleCategoryClick(cat)}
                text={cat.name}
              />
            ))
          )}

          {showSubOptions && currentCategoryForSubOptions && (
            // Show sub-options for the selected category
            currentCategoryForSubOptions.subOptions.map((subOption) => (
              <Block
                key={subOption}
                onClick={() => handleSubOptionClick(currentCategoryForSubOptions.name, subOption.trim())}
                text={subOption.trim()} // Display trimmed sub-option
              />
            ))
          )}

          {!showSubOptions && searchResults.length > 0 && (
            // Show search results if not showing sub-options and there are results
            <div className="search-results-container">
              <h4>ผลลัพธ์การค้นหา:</h4>
              <div className="search-results-list">
                {searchResults.map((result) => (
                  <Block
                    key={result.fullText} // Use a unique key
                    onClick={() => handleSubOptionClick(result.categoryName, result.subOption)}
                    text={`${result.categoryName} - ${result.subOption}`} // Show full context
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div> {/* End of category section */}

      {/* --- Issue Details & Photo Attachment --- */}
      <div className="tom">
        <label htmlFor="report-details">รายละเอียดปัญหา</label>
        <div className="input-with-attachment">
          <textarea
            id="report-details"
            value={report}
            onChange={handleReportChange}
            required
            aria-required="true"
            className="large-input"
            rows="4" // Slightly more rows might be better
            placeholder="กรุณากรอกรายละเอียดปัญหา..."
          />
          <label htmlFor="photo-upload" className="file-attachment-label" title="แนบรูปภาพ">
            <i className="fas fa-upload"></i> {/* Upload Icon */}
            {/* Display checkmark if photos are selected */}
            {photos.length > 0 && (
              <i className="fas fa-check photo-attached-icon" aria-label={`${photos.length} รูปที่แนบ`}></i>
            )}
          </label>
          <input
            id="photo-upload"
            type="file"
            onChange={handlePhotoChange}
            accept="image/*" // Accept only image files
            className="file-input"
            multiple // Allow multiple file selection
            aria-hidden="true" // Hide from screen readers as label handles it
          />
        </div>
        {/* Optional: Display names of selected files */}
        {photos.length > 0 && (
          <div style={{ fontSize: '0.8em', marginTop: '5px', color: '#555' }}>
            ไฟล์ที่เลือก: {Array.from(photos).map(p => p.name).join(', ')}
          </div>
        )}
      </div> {/* End of details section */}


      {/* --- Employee ID & Submit Button --- */}
      <div className="button-container">
        <div className="tom1">
          <label htmlFor="employee-id">รหัสพนักงาน</label>
          <input
            id="employee-id"
            type="text" // Use text even for numbers for easier handling, pattern enforces digits
=======
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
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
            name="employee_id"
            value={phone}
            onChange={handlePhoneChange}
            required
<<<<<<< HEAD
            aria-required="true"
            className="large-input" // Use the correct class
            maxLength="10" // HTML5 attribute for max length
            pattern="\d*" // HTML5 attribute to suggest numeric input (for mobile keyboards)
            inputMode="numeric" // Hint for mobile keyboards
            placeholder="กรอกรหัสพนักงาน (ตัวเลข)"
          />
          {phoneError && <div className="error" role="alert">{phoneError}</div>} {/* Role alert for screen readers */}
        </div>
        <button
          type="submit"
          className="submit-button"
          disabled={isSubmitting || !!phoneError || !selectedFullCategory || !report || !phone} // More robust disable condition
        >
          {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยัน'}
        </button>
      </div> {/* End of button container */}

=======
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
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
    </form>
  );
};

ReportForm.propTypes = {
<<<<<<< HEAD
  onSubmit: PropTypes.func, // Keep onSubmit optional unless required by parent
=======
  onSubmit: PropTypes.func
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
};

export default ReportForm;