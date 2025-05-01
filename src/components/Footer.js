import React from 'react';
<<<<<<< HEAD
import './CSS/Footer.css';
=======
import '../components/Footer.css';
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff

const Footer = () => {
  return (
    <div className="copy">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="copyright-section">
              <img src="/images/T3.png" alt="Copyright Icon" />
              <p className="copyright-text">เเจ้งซ่อม| สงวนลิขสิทธิ์</p>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12 text-center p-4">
            <p>ธวัชชัย ฮวบขุนทด</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;