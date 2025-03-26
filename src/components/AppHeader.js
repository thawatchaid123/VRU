// src/components/AppHeader.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import "./AppHeader.css";
import "./Style.css";

function AppHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // ประกาศ state isMenuOpen

    const toggleMenu = () => { // ประกาศ function toggleMenu
      setIsMenuOpen(!isMenuOpen);
    };
    return (
        <header className="app-header">
            <div className="header-left">
                <img className="app-header-logo" src="/images/T3.png" alt="โลโก้ " />
            </div>
            {/* <div className="header-left">
                <img className="app-header-logo" src="/project/ronren/build/images/ronren.png" alt="โลโก้ RONREN1" />
            </div> */}

            <nav className={`header-nav ${isMenuOpen ? 'show' : ''}`}> 
              
            <div className="header-center">
                <Link to="/">เเจ้งซ่อม</Link>
            </div>
            
        <ul>
          <li   className="header-right">
          <Link style={{color:'white'}} to="/complaintform">ตรวจสอบ</Link>
          </li>
          <li  className="header-rights">
            <Link style={{color:'white'}} to="/login">เข้าสู่ระบบ</Link>
          </li>

        </ul>
      </nav>
      <button className="hamburger-button" onClick={toggleMenu}>
       
       
        <i className="fa-solid fa-bars"></i>
      </button>
        </header>
    );
}

export default AppHeader;
