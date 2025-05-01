import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();

    const handleSelectOption = (type) => {
        if (type === 'repair') {
            navigate('/report');
        } else {
            navigate('/environment');
        }
    };

    return (
        <div className="container">
            <h1 className="title">🌿 ผู้ช่วยแจ้งปัญหา</h1>
            <div className="chat-box">
                <div className="button-group">
                    <button onClick={() => handleSelectOption('repair')}>🛠️ แจ้งซ่อม</button>
                    <button onClick={() => handleSelectOption('environment')}>🌿 ปัญหาสิ่งแวดล้อม</button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
