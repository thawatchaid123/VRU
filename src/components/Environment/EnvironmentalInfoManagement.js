import React, { useState, useEffect, useCallback } from 'react';
import styles from '../CSS/CrudFormTable.module.css'; // Reuse the same CSS file

// --- Placeholder API Functions (Replace with actual API calls) ---
const apiFetchEnvironmental = async () => {
    console.log("API: Fetching environmental data...");
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = localStorage.getItem('environmentalData');
    return data ? JSON.parse(data) : [
        // { id: 'e1', recordDate: '2023-10-26', location: 'Area 1', temperature: 25.5, humidity: 60, notes: 'Normal conditions' },
        // { id: 'e2', recordDate: '2023-10-25', location: 'Area 2', temperature: 28.0, humidity: 75, notes: 'High humidity' },
    ];
};

const apiAddEnvironmental = async (envData) => {
    console.log("API: Adding environmental data", envData);
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem = { ...envData, id: `e${Date.now()}` };
    // --- Persist to localStorage (Example) ---
    const existingData = await apiFetchEnvironmental();
    const newData = [...existingData, newItem];
    localStorage.setItem('environmentalData', JSON.stringify(newData));
    // --- End Persistence ---
    return newItem;
};

const apiUpdateEnvironmental = async (id, envData) => {
    console.log("API: Updating environmental data", id, envData);
    await new Promise(resolve => setTimeout(resolve, 300));
    const updatedItem = { ...envData, id: id };
    // --- Persist to localStorage (Example) ---
    const existingData = await apiFetchEnvironmental();
    const newData = existingData.map(item => item.id === id ? updatedItem : item);
    localStorage.setItem('environmentalData', JSON.stringify(newData));
    // --- End Persistence ---
    return updatedItem;
};

const apiDeleteEnvironmental = async (id) => {
    console.log("API: Deleting environmental data", id);
    await new Promise(resolve => setTimeout(resolve, 300));
    // --- Persist to localStorage (Example) ---
    const existingData = await apiFetchEnvironmental();
    const newData = existingData.filter(item => item.id !== id);
    localStorage.setItem('environmentalData', JSON.stringify(newData));
    // --- End Persistence ---
    return { success: true };
};
// --- End Placeholder API Functions ---


const EnvironmentalInfoManagement = () => {
    const [envData, setEnvData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(null);
    const [formData, setFormData] = useState({
        recordDate: new Date().toISOString().split('T')[0],
        location: '',
        temperature: '',
        humidity: '',
        aqi: '', // Air Quality Index
        noiseLevel: '',
        notes: ''
    });

    const initialFormState = {
        recordDate: new Date().toISOString().split('T')[0], location: '', temperature: '',
        humidity: '', aqi: '', noiseLevel: '', notes: ''
    };

    // Fetch Data Function
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiFetchEnvironmental();
            setEnvData(data);
        } catch (err) {
            console.error("Fetch error:", err);
            setError('ไม่สามารถโหลดข้อมูลสิ่งแวดล้อมได้');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch data on mount
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Handle Input Changes
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Form Submission (Add or Update)
    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isEditing) {
                await apiUpdateEnvironmental(isEditing, formData);
                alert('อัปเดตข้อมูลสิ่งแวดล้อมเรียบร้อยแล้ว');
            } else {
                await apiAddEnvironmental(formData);
                alert('เพิ่มข้อมูลสิ่งแวดล้อมเรียบร้อยแล้ว');
            }
            setFormData(initialFormState);
            setIsEditing(null);
            fetchData();
        } catch (err) {
            console.error("Submit error:", err);
            setError(isEditing ? 'ไม่สามารถอัปเดตข้อมูลได้' : 'ไม่สามารถเพิ่มข้อมูลได้');
            setIsLoading(false);
        }
    };

    // Handle Edit Button Click
    const handleEdit = (item) => {
        setIsEditing(item.id);
        setFormData({
            recordDate: item.recordDate ? item.recordDate.split('T')[0] : '',
            location: item.location ?? '',
            temperature: item.temperature ?? '',
            humidity: item.humidity ?? '',
            aqi: item.aqi ?? '',
            noiseLevel: item.noiseLevel ?? '',
            notes: item.notes ?? ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle Delete Button Click
    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
            setIsLoading(true);
            setError(null);
            try {
                await apiDeleteEnvironmental(id);
                alert('ลบข้อมูลเรียบร้อยแล้ว');
                fetchData();
                if (isEditing === id) {
                    handleCancelEdit();
                }
            } catch (err) {
                console.error("Delete error:", err);
                setError('ไม่สามารถลบข้อมูลได้');
                setIsLoading(false);
            }
        }
    };

    // Handle Cancel Edit
    const handleCancelEdit = () => {
        setIsEditing(null);
        setFormData(initialFormState);
        setError(null);
    };

    return (
        <div className={styles.managementContainer}>
            <h2>จัดการข้อมูลสิ่งแวดล้อม</h2>

            {/* --- Add/Edit Form --- */}
            <form onSubmit={handleSubmit} className={styles.crudForm}>
                <h3>{isEditing ? 'แก้ไขข้อมูลสิ่งแวดล้อม' : 'เพิ่มข้อมูลสิ่งแวดล้อมใหม่'}</h3>
                {error && <p className={styles.errorText}>{error}</p>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label htmlFor="recordDate">วันที่บันทึก <span className={styles.required}>*</span></label>
                        <input type="date" id="recordDate" name="recordDate" value={formData.recordDate} onChange={handleInputChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="location">พื้นที่/ตำแหน่ง <span className={styles.required}>*</span></label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="temperature">อุณหภูมิ (°C)</label>
                        <input type="number" id="temperature" name="temperature" value={formData.temperature} onChange={handleInputChange} step="0.1" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="humidity">ความชื้น (%)</label>
                        <input type="number" id="humidity" name="humidity" value={formData.humidity} onChange={handleInputChange} min="0" max="100" step="0.1" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="aqi">ดัชนีคุณภาพอากาศ (AQI)</label>
                        <input type="number" id="aqi" name="aqi" value={formData.aqi} onChange={handleInputChange} min="0" />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="noiseLevel">ระดับเสียง (dB)</label>
                        <input type="number" id="noiseLevel" name="noiseLevel" value={formData.noiseLevel} onChange={handleInputChange} min="0" step="0.1" />
                    </div>
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label htmlFor="notes">หมายเหตุ</label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} rows="3"></textarea>
                    </div>
                </div>

                <div className={styles.formActions}>
                    <button type="submit" disabled={isLoading} className={styles.submitButton}>
                        {isLoading ? 'กำลังบันทึก...' : (isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มข้อมูล')}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={handleCancelEdit} disabled={isLoading} className={styles.cancelButton}>
                            ยกเลิก
                        </button>
                    )}
                </div>
            </form>

            {/* --- Data Table --- */}
            <div className={styles.dataTableSection}>
                <h3>รายการข้อมูลสิ่งแวดล้อม</h3>
                {isLoading && !envData.length && <p>กำลังโหลดข้อมูล...</p>}
                {!isLoading && error && envData.length === 0 && <p className={styles.errorText}>{error}</p>}
                {!isLoading && !error && envData.length === 0 && <p>ยังไม่มีข้อมูลสิ่งแวดล้อม</p>}

                {envData.length > 0 && (
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                <tr>
                                    <th>วันที่บันทึก</th>
                                    <th>พื้นที่</th>
                                    <th>อุณหภูมิ (°C)</th>
                                    <th>ความชื้น (%)</th>
                                    <th>AQI</th>
                                    <th>เสียง (dB)</th>
                                    <th>หมายเหตุ</th>
                                    <th>การดำเนินการ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {envData.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.recordDate ? new Date(item.recordDate).toLocaleDateString('th-TH') : '-'}</td>
                                        <td>{item.location}</td>
                                        <td>{item.temperature ?? '-'}</td>
                                        <td>{item.humidity ?? '-'}</td>
                                        <td>{item.aqi ?? '-'}</td>
                                        <td>{item.noiseLevel ?? '-'}</td>
                                        <td>{item.notes || '-'}</td>
                                        <td>
                                            <button onClick={() => handleEdit(item)} className={styles.editButton} disabled={isLoading}>แก้ไข</button>
                                            <button onClick={() => handleDelete(item.id)} className={styles.deleteButton} disabled={isLoading}>ลบ</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnvironmentalInfoManagement;