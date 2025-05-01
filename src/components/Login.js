import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import styles from './CSS/Login.module.css';
=======
import styles from './Login.module.css';
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff

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

        const requestData = {
            username: username.trim(),
            password: password
        };
<<<<<<< HEAD

        console.log('Sending data:', requestData);

        try {
            // const response = await fetch('/PO/login.php', {
            // const response = await fetch('http://localhost/PO/login.php', {
                const response = await fetch('/VRU-main/login.php', {

=======
        
        console.log('Sending data:', requestData);

        try {
            const response = await fetch('/PO/login.php', {
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            // Check content-type
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error('Invalid response format: Expected JSON');
            }

            const text = await response.text();
            console.log('Raw response:', text);
<<<<<<< HEAD

=======
            
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
            let data;
            try {
                data = JSON.parse(text);
            } catch (error) {
                console.error('JSON parse error:', error);
                throw new Error('Invalid JSON response');
            }

            if (data.status === 'success' && data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
<<<<<<< HEAD

=======
                
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
                // Redirect based on user type
                switch (data.user.user_type) {
                    case 'employee':
                        navigate('/employee-dashboard');
                        break;
                    case 'technician':
                        navigate('/technician-dashboard');
                        break;
                    case 'admin':
                        navigate('/app');
                        break;
                    default:
                        throw new Error('Invalid user type');
                }
            } else {
                throw new Error(data.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
            }
        } catch (err) {
            console.error('Error:', err);
            setError(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <form onSubmit={handleSubmit} className={styles.loginForm}>
                <h2>เข้าสู่ระบบ</h2>
<<<<<<< HEAD

=======
                
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
                {error && (
                    <div className={styles.error}>{error}</div>
                )}

                <div className={styles.formGroup}>
                    <label htmlFor="username">อีเมล:</label>
                    <input
                        type="email"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">รหัสผ่าน:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

<<<<<<< HEAD
                <button
                    type="submit"
=======
                <button 
                    type="submit" 
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
                    className={styles.loginButton}
                    disabled={isLoading}
                >
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </form>
        </div>
    );
};

export default Login;