import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './CSS/AppHeader.css'; // ตรวจสอบ Path ให้ถูกต้อง

function AppHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        setCurrentUser(storedUser ? JSON.parse(storedUser) : null);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem('user');
        setCurrentUser(null);
      }
    };

    checkUser();

    window.addEventListener('storage', checkUser);

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, [location.pathname]);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  const handleLinkClick = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      fetch('http://localhost/VRU-main/logout.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      }).catch(err => console.error('Logout API call error:', err.message)); // Log error ถ้ามี
    } finally {
      localStorage.removeItem('user');
      setCurrentUser(null);
      navigate('/', { replace: true });
    }
  };

  const renderMenuItems = () => {
    if (currentUser) {

      return (
        <>
          <li className="nav-item welcome-message">
            <span className="nav-links">
              ยินดีต้อนรับคุณ {currentUser.first_name || 'ผู้ใช้'}
            </span>
          </li>
          <li className="nav-item">
            <Link to="/complaintform" className="nav-links" onClick={handleLinkClick}>ตรวจสอบ</Link>
          </li>
          <li className="nav-item">
            <button onClick={handleLogout} className="nav-links logout">
              ออกจากระบบ
            </button>
          </li>
        </>
      );
    } else {
      return (
        <>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={handleLinkClick}>หน้าหลัก</Link>
          </li>
          <li className="nav-item">
            <Link to="/complaintform" className="nav-links" onClick={handleLinkClick}>ตรวจสอบ</Link>
          </li>
          <li className="nav-item">
            <Link to="/login" className="nav-links" onClick={handleLinkClick}>
              เข้าสู่ระบบ
            </Link>
          </li>
        </>
      );
    }
  };

  return (
    <nav className="nav">
      <div className="app-header-container">
        <Link to="/" className="app-header-logo" onClick={handleLinkClick}>
          <img src="/images/T3.png" alt="โลโก้" className="logo-image" />
          <span className="logo-text">ระบบแจ้งปัญหา</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>

        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          {renderMenuItems()}
        </ul>
      </div>
    </nav>
  );
}

export default AppHeader;