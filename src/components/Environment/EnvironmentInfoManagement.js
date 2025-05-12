import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/RepairInfoManagement.css';

const API_URL = '/VRU-main/environment.php';

const apiFetchEnvironments = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        return data;
    } else {
        const textResponse = await response.text();
        console.error("Received non-JSON response:", textResponse);
        throw new Error(`Received non-JSON response from server. Status: ${response.status}`);
    }
};

const apiAddEnvironment = async ({ problem, location }) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem, location }),
    });
    const data = await response.json();
    if (!response.ok) {
        if (response.status === 409) {
            throw new Error('ปัญหานี้มีอยู่แล้ว');
        }
        throw new Error(data.error || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    return data;
};

const apiUpdateEnvironment = async (id, { problem, location }) => {
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, problem, location }),
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    if (!data.success) {
        throw new Error(data.message || 'Update failed according to API response');
    }
    return data;
};

const apiDeleteEnvironment = async (id) => {
    const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    if (!data.success) {
        throw new Error(data.message || 'Delete failed according to API response');
    }
    return data;
};

const EnvironmentInfoManagement = () => {
    const navigate = useNavigate();
    const [isAuthChecked, setIsAuthChecked] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [environments, setEnvironments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [problem, setProblem] = useState('');
    const [location, setLocation] = useState('');
    const formRef = useRef(null);

    useEffect(() => {
        let user = null;
        try {
            const userDataString = localStorage.getItem('user');
            if (userDataString) {
                user = JSON.parse(userDataString);
                if (user) {
                    setLoggedInUser(user);
                } else {
                    localStorage.removeItem('user');
                    navigate('/login', { replace: true });
                }
            } else {
                navigate('/login', { replace: true });
            }
        } catch (parseError) {
            console.error('Auth Check: Error parsing user data from localStorage. Redirecting.', parseError);
            localStorage.removeItem('user');
            navigate('/login', { replace: true });
        }
        setIsAuthChecked(true);
    }, [navigate]);

    const fetchData = useCallback(async () => {
        if (!loggedInUser) {
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiFetchEnvironments();
            if (Array.isArray(data)) {
                setEnvironments(data);
            } else {
                throw new Error("ข้อมูลที่ได้รับจาก Server ไม่ถูกต้อง (ไม่ใช่ Array)");
            }
        } catch (err) {
            setError(`ไม่สามารถโหลดข้อมูลสิ่งแวดล้อมได้: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }, [loggedInUser]);

    useEffect(() => {
        if (isAuthChecked && loggedInUser) {
            fetchData();
        }
    }, [isAuthChecked, loggedInUser, fetchData]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === 'problem') setProblem(value);
        if (name === 'location') setLocation(value);
        if (error) setError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!loggedInUser) {
            navigate('/login', { replace: true }); return;
        }
        if (!problem.trim() || !location.trim()) {
            setError('กรุณากรอกปัญหาและสถานที่');
            return;
        }
        setError(null);
        setIsSubmitting(true);

        try {
            if (isEditing) {
                await apiUpdateEnvironment(isEditing, { problem: problem.trim(), location: location.trim() });
                alert('อัปเดตข้อมูลสิ่งแวดล้อมเรียบร้อยแล้ว');
            } else {
                await apiAddEnvironment({ problem: problem.trim(), location: location.trim() });
                alert('เพิ่มข้อมูลสิ่งแวดล้อมเรียบร้อยแล้ว');
            }
            setProblem('');
            setLocation('');
            setIsEditing(null);
            if (loggedInUser) fetchData();
        } catch (err) {
            setError(err.message || (isEditing ? 'ไม่สามารถอัปเดตข้อมูลสิ่งแวดล้อมได้' : 'ไม่สามารถเพิ่มข้อมูลสิ่งแวดล้อมได้'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        if (!loggedInUser) {
            navigate('/login', { replace: true }); return;
        }
        if (item && item.id && typeof item.problem !== 'undefined' && typeof item.location !== 'undefined') {
            setIsEditing(item.id);
            setProblem(item.problem);
            setLocation(item.location);
            setError(null);
            if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            setError("ข้อมูลสำหรับแก้ไขไม่ถูกต้อง");
        }
    };

    const handleDelete = async (id) => {
        if (!loggedInUser) {
            navigate('/login', { replace: true }); return;
        }
        if (id === null || id === undefined || isNaN(parseInt(id))) {
            setError("ID สำหรับลบไม่ถูกต้อง");
            return;
        }

        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบปัญหาสิ่งแวดล้อม ID: ${id}?`)) {
            setIsSubmitting(true);
            setError(null);
            try {
                await apiDeleteEnvironment(id);
                alert('ลบข้อมูลสิ่งแวดล้อมเรียบร้อยแล้ว');
                if (isEditing === id) {
                    handleCancelEdit();
                }
                if (loggedInUser) fetchData();
            } catch (err) {
                setError(`ไม่สามารถลบข้อมูลสิ่งแวดล้อมได้: ${err.message}`);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(null);
        setProblem('');
        setLocation('');
        setError(null);
    };

    if (!isAuthChecked) {
        return <p>กำลังตรวจสอบการยืนยันตัวตน...</p>;
    }

    if (!loggedInUser) {
        return <p>กรุณาเข้าสู่ระบบ (กำลังนำทาง)...</p>;
    }

    return (
        <div className="managementContainer">
            <h2>จัดการข้อมูลสิ่งแวดล้อม</h2>
            <form onSubmit={handleSubmit} className="crudForm" ref={formRef}>
                <h3>{isEditing ? 'แก้ไขข้อมูลสิ่งแวดล้อม' : 'เพิ่มข้อมูลใหม่'}</h3>
                {error && <p className="errorText">{error}</p>}
                <div className="formGroup">
                    <label htmlFor="problem">
                        ปัญหาสิ่งแวดล้อม <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="problem"
                        name="problem"
                        value={problem}
                        onChange={handleInputChange}
                        placeholder="เช่น มลพิษทางอากาศ"
                        required
                        aria-required="true"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="formGroup">
                    <label htmlFor="location">
                        สถานที่ <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        id="location"
                        name="location"
                        value={location}
                        onChange={handleInputChange}
                        placeholder="เช่น อาคาร A ชั้น 2"
                        required
                        aria-required="true"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="formActions">
                    <button type="submit" disabled={isSubmitting} className="submitButton">
                        {isSubmitting ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} disabled={isSubmitting} className="cancelButton">
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>
            <div className="dataTableSection">
                <h3>รายการข้อมูลที่มีอยู่</h3>
                {isLoading && <p>กำลังโหลดข้อมูล...</p>}
                {!isLoading && error && <p className="errorText">{error}</p>}
                {!isLoading && !error && environments.length === 0 && <p>ยังไม่มีข้อมูล</p>}
                {!isLoading && !error && environments.length > 0 && (
                    <div className="tableWrapper">
                        <table className="dataTable simpleTable">
                            <thead>
                                <tr>
                                    <th>ปัญหาสิ่งแวดล้อม</th>
                                    <th>สถานที่</th>
                                    <th>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {environments.map((item) => (
                                    item && item.id ? (
                                        <tr key={item.id}>
                                            <td>{item.problem ?? 'N/A'}</td>
                                            <td>{item.location ?? 'N/A'}</td>
                                            <td>
                                                <button onClick={() => handleEdit(item)} className="editButton" disabled={isSubmitting}>
                                                    แก้ไข
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="deleteButton" disabled={isSubmitting}>
                                                    ลบ
                                                </button>
                                            </td>
                                        </tr>
                                    ) : null
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnvironmentInfoManagement;