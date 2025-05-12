import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const trimmedUsername = username.trim();

        // Client-side validation for email format
        if (!trimmedUsername || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedUsername)) {
            setError('กรุณากรอกอีเมลที่ถูกต้อง');
            setIsLoading(false);
            return;
        }
        // Client-side validation for password (e.g., not empty)
        if (!password) {
            setError('กรุณากรอกรหัสผ่าน');
            setIsLoading(false);
            return;
        }

        const requestData = {
            username: trimmedUsername,
            password: password // password ไม่จำเป็นต้อง trim
        };

        console.log('Sending data:', requestData);

        try {
            const response = await fetch('/VRU-main/login.php', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                // ถ้า server ไม่ได้ตอบกลับเป็น JSON ตามที่คาดหวัง
                const errorText = await response.text(); // อ่าน response ที่ไม่ใช่ JSON
                console.error('Server Error (Non-JSON Response):', response.status, errorText);
                throw new Error(`การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง (สถานะ: ${response.status})`);
            }

            const text = await response.text(); // อ่าน response เป็น text ก่อน
            console.log('Raw response:', text);

            let data;
            try {
                data = JSON.parse(text); // พยายาม parse text เป็น JSON
            } catch (parseError) {
                console.error('JSON parse error:', parseError, 'Raw text:', text);
                throw new Error('การตอบกลับ JSON จากเซิร์ฟเวอร์ไม่ถูกต้อง');
            }

            console.log('Parsed response:', data);

            if (data.status === 'success' && data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));

                switch (data.user.user_type) {
                    case 'employee':
                        navigate('/employee-dashboard');
                        break;
                    case 'technician':
                        navigate('/technician-dashboard');
                        break;
                    case 'admin':
                        navigate('/dashboard');
                        break;
                    default:
                        // ถ้า user_type ไม่ตรงกับ case ไหนเลย
                        console.error('Invalid user type received:', data.user.user_type);
                        throw new Error('ประเภทผู้ใช้ไม่ถูกต้องจากเซิร์ฟเวอร์');
                }
            } else {
                // ถ้า data.status ไม่ใช่ 'success' หรือไม่มี data.user
                throw new Error(data.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (err) {
            console.error('Login process error:', err);
            let errorMessage = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'; // Default message

            if (err.message) {
                if (err.message.toLowerCase().includes('failed to fetch')) {
                    errorMessage = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
                } else if (
                    err.message === 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' ||
                    err.message === 'การตอบกลับ JSON จากเซิร์ฟเวอร์ไม่ถูกต้อง' ||
                    err.message.startsWith('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง') ||
                    err.message === 'ประเภทผู้ใช้ไม่ถูกต้องจากเซิร์ฟเวอร์'
                ) {
                    errorMessage = err.message;
                }
                // คุณสามารถเพิ่มเงื่อนไขอื่นๆ สำหรับ error message ที่เฉพาะเจาะจงได้
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="loginContainer">
            <form onSubmit={handleSubmit} className="loginForm">
                <h2>เข้าสู่ระบบ</h2>

                {error && (
                    <div className="error">{error}</div>
                )}

                <div className="formGroup">
                    <label htmlFor="username">อีเมล:</label>
                    <input
                        type="email"
                        id="username"
                        name="username" // เพิ่ม name attribute
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="example@domain.com"
                    />
                </div>

                <div className="formGroup">
                    <label htmlFor="password">รหัสผ่าน:</label>
                    <input
                        type="password"
                        id="password"
                        name="password" // เพิ่ม name attribute
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="กรอกรหัสผ่าน"
                    />
                </div>

                <button
                    type="submit"
                    className="loginButton"
                    disabled={isLoading}
                >
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </form>
        </div>
    );
};

export default Login;