import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '../CSS/Repair.css';

const API_URL = '/VRU-main/environment.php';
const SUBMIT_API_URL = '/VRU-main/submit_environment_request_api.php';

const apiFetchEnvironments = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(await response.json().catch(() => `HTTP error! status: ${response.status}`));
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("ข้อมูลปัญหาสิ่งแวดล้อมไม่ใช่ Array");
    return data.filter(item => item && item.id && item.problem && item.location);
};

const EnvironmentReport = () => {
    const [environments, setEnvironments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEnvironment, setSelectedEnvironment] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', details: '' });
    const [imageFile, setImageFile] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const fileInputRef = useRef(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedEnvironment(null);
        setFormData({ firstName: '', lastName: '', phone: '', details: '' });
        setImageFile(null);
        setPhoneError('');
        setSubmitMessage('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        try {
            setEnvironments(await apiFetchEnvironments());
        } catch (err) {
            setError(`ไม่สามารถโหลดข้อมูลปัญหาสิ่งแวดล้อมได้: ${err.message}`);
            setEnvironments([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const validatePhone = (phone) => /^0[689]\d{8}$/.test(phone);

    const handleSelectEnvironment = (environment) => {
        setSelectedEnvironment(environment);
        setFormData({ firstName: '', lastName: '', phone: '', details: '' });
        setImageFile(null);
        setPhoneError('');
        setSubmitMessage('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        setTimeout(() => document.getElementById('environment-request-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '').slice(0, 10);
            if (!/^\d*$/.test(value) || (numericValue && numericValue[0] !== '0') || (numericValue.length > 1 && !['6', '8', '9'].includes(numericValue[1]))) {
                setPhoneError('เบอร์โทรต้องเป็นตัวเลข เริ่ม 0 และตัวที่สอง 6/8/9');
            } else {
                setFormData({ ...formData, [name]: numericValue });
                setPhoneError(numericValue ? '' : phoneError);
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePhoneBlur = (e) => setPhoneError(e.target.value && !validatePhone(e.target.value) ? 'กรุณากรอกเบอร์ 10 หลัก เริ่ม 06/08/09' : '');

    const handleImageChange = (e) => setImageFile(e.target.files?.[0] || null);

    const handleCancelSelection = () => setSelectedEnvironment(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedEnvironment || isSubmitting || !formData.firstName || !formData.lastName || !formData.phone || !formData.details || phoneError || !validatePhone(formData.phone)) return;

        setIsSubmitting(true);
        setSubmitMessage('');
        const data = new FormData();
        data.append('reporterFirstName', formData.firstName);
        data.append('reporterLastName', formData.lastName);
        data.append('reporterPhone', formData.phone);
        data.append('problem', selectedEnvironment.problem);
        data.append('locationDetails', selectedEnvironment.location);
        data.append('environmentDetails', formData.details);
        if (imageFile) data.append('environmentImage', imageFile, imageFile.name);

        try {
            const response = await fetch(SUBMIT_API_URL, { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Status: ${response.status}`);
            toast.success(`ข้อมูลการแจ้งปัญหาสิ่งแวดล้อมสำหรับ "${selectedEnvironment.problem} ${selectedEnvironment.location}" ถูกส่งแล้ว`, { position: "top-right", autoClose: 3000 });
            setSubmitMessage(`แจ้งปัญหาสิ่งแวดล้อมสำหรับ "${selectedEnvironment.problem}" เรียบร้อย`);
            setSelectedEnvironment(null);
        } catch (err) {
            toast.error(`เกิดข้อผิดพลาด: ${err.message}`, { position: "top-right", autoClose: 3000 });
            setSubmitMessage(`เกิดข้อผิดพลาด: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="managementContainer">
            <ToastContainer />
            <h2>ข้อมูลปัญหาสิ่งแวดล้อม</h2>
            <div className="dataTableSection">
                <h3>เลือกปัญหาสิ่งแวดล้อมที่ต้องการแจ้ง</h3>
                {isLoading && <p>กำลังโหลดข้อมูลปัญหาสิ่งแวดล้อม...</p>}
                {error && <p className="errorText">{error}</p>}
                {!isLoading && !error && !environments.length && <p>ไม่พบข้อมูลปัญหาสิ่งแวดล้อม</p>}
                {environments.length > 0 && (
                    <div className="environmentGrid">
                        {environments.map((item) => (
                            <div
                                key={item.id}
                                className="environmentCard"
                                onClick={() => handleSelectEnvironment(item)}
                                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectEnvironment(item)}
                                tabIndex={0}
                                role="button"
                                aria-label={`เลือกปัญหาสิ่งแวดล้อม ${item.problem}`}
                            >
                                <p>
                                    <span><strong>ปัญหา:</strong> {item.problem ?? 'N/A'}</span>
                                    <span><strong>สถานที่:</strong> {item.location ?? 'N/A'}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedEnvironment && (
                <div id="environment-request-form" className="crudForm environmentRequestForm">
                    <h3>แจ้งปัญหาสิ่งแวดล้อมสำหรับ: {selectedEnvironment.problem} {selectedEnvironment.location}</h3>
                    <hr style={{ margin: '20px 0', borderTop: '1px solid #e2e8f0' }} />
                    <form onSubmit={handleSubmit}>
                        <div className="formGroup">
                            <label>ชื่อผู้แจ้ง <span className="required">*</span></label>
                            <input name="firstName" value={formData.firstName} onChange={handleInputChange} required disabled={isSubmitting} maxLength={100} />
                        </div>
                        <div className="formGroup">
                            <label>นามสกุลผู้แจ้ง <span className="required">*</span></label>
                            <input name="lastName" value={formData.lastName} onChange={handleInputChange} required disabled={isSubmitting} maxLength={100} />
                        </div>
                        <div className="formGroup">
                            <label>เบอร์โทรศัพท์ <span className="required">*</span></label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handlePhoneBlur}
                                required
                                disabled={isSubmitting}
                                maxLength={10}
                                inputMode="numeric"
                                aria-describedby={phoneError ? "phone-error" : undefined}
                                aria-invalid={!!phoneError}
                                className={phoneError ? 'input-error' : ''}
                            />
                            {phoneError && <p id="phone-error" className="inlineErrorText">{phoneError}</p>}
                        </div>
                        <div className="formGroup">
                            <label>รายละเอียดการแจ้งปัญหาสิ่งแวดล้อม <span className="required">*</span></label>
                            <textarea
                                name="details"
                                value={formData.details}
                                onChange={handleInputChange}
                                required
                                disabled={isSubmitting}
                                maxLength={500}
                                style={{ width: '100%', padding: '12px', fontSize: '1rem', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical' }}
                            />
                        </div>
                        <div className="formGroup">
                            <label>รูปภาพประกอบ (ถ้ามี):</label>
                            <input
                                type="file"
                                name="imageUpload"
                                accept="image/png, image/jpeg, image/gif, image/webp"
                                onChange={handleImageChange}
                                ref={fileInputRef}
                                disabled={isSubmitting}
                                style={{ marginTop: '8px' }}
                            />
                            {imageFile && <p style={{ fontSize: '0.9em', marginTop: '5px', color: '#4a5568' }}>ไฟล์: {imageFile.name}</p>}
                        </div>
                        {submitMessage && <p className={submitMessage.includes('ผิดพลาด') ? 'errorText' : 'successText'} style={{ textAlign: 'center', marginBottom: '15px' }}>{submitMessage}</p>}
                        <div className="formActions">
                            <button
                                type="submit"
                                className="submitButton"
                                disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.phone || !formData.details || phoneError || !validatePhone(formData.phone)}
                            >
                                {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการแจ้งปัญหาสิ่งแวดล้อม'}
                            </button>
                            <button type="button" className="cancelButton" onClick={handleCancelSelection} disabled={isSubmitting}>ยกเลิก</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default EnvironmentReport;