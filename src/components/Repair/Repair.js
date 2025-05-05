import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import '../CSS/Repair.css';

const API_URL = '/VRU-main/location_api.php';
const SUBMIT_API_URL = '/VRU-main/submit_repair_request_api.php';

const apiFetchRepairs = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(await response.json().catch(() => `HTTP error! status: ${response.status}`));
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("ข้อมูลสถานที่ไม่ใช่ Array");
    return data.filter(item => item && item.id && item.name && item.location);
};

const Repair = () => {
    const [repairs, setRepairs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRepair, setSelectedRepair] = useState(null);
    const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', details: '' });
    const [imageFile, setImageFile] = useState(null);
    const [phoneError, setPhoneError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const fileInputRef = useRef(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSelectedRepair(null);
        setFormData({ firstName: '', lastName: '', phone: '', details: '' });
        setImageFile(null);
        setPhoneError('');
        setSubmitMessage('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        try {
            setRepairs(await apiFetchRepairs());
        } catch (err) {
            setError(`ไม่สามารถโหลดข้อมูลสถานที่ได้: ${err.message}`);
            setRepairs([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const validatePhone = (phone) => /^0[689]\d{8}$/.test(phone);

    const handleSelectRepair = (repair) => {
        setSelectedRepair(repair);
        setFormData({ firstName: '', lastName: '', phone: '', details: '' });
        setImageFile(null);
        setPhoneError('');
        setSubmitMessage('');
        if (fileInputRef.current) fileInputRef.current.value = null;
        setTimeout(() => document.getElementById('repair-request-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
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

    const handleCancelSelection = () => setSelectedRepair(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedRepair || isSubmitting || !formData.firstName || !formData.lastName || !formData.phone || !formData.details || phoneError || !validatePhone(formData.phone)) return;

        setIsSubmitting(true);
        setSubmitMessage('');
        const data = new FormData();
        data.append('locationId', selectedRepair.id);
        data.append('locationName', selectedRepair.name);
        data.append('locationDetails', selectedRepair.location);
        data.append('reporterFirstName', formData.firstName);
        data.append('reporterLastName', formData.lastName);
        data.append('reporterPhone', formData.phone);
        data.append('repairDetails', formData.details);
        data.append('requestTimestamp', new Date().toISOString());
        if (imageFile) data.append('repairImage', imageFile, imageFile.name);

        try {
            const response = await fetch(SUBMIT_API_URL, { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || `Status: ${response.status}`);
            toast.success(`ข้อมูลการแจ้งซ่อมสำหรับ "${selectedRepair.name}" ถูกส่งแล้ว`, { position: "top-right", autoClose: 3000 });
            setSubmitMessage(`แจ้งซ่อมสำหรับ "${selectedRepair.name}" เรียบร้อย`);
            setSelectedRepair(null);
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
            <h2>ข้อมูลสถานที่/จุดซ่อม</h2>
            <div className="dataTableSection">
                <h3>เลือกสถานที่ที่ต้องการแจ้งซ่อม</h3>
                {isLoading && <p>กำลังโหลดข้อมูลสถานที่...</p>}
                {error && <p className="errorText">{error}</p>}
                {!isLoading && !error && !repairs.length && <p>ไม่พบข้อมูลสถานที่</p>}
                {repairs.length > 0 && (
                    <div className="repairGrid">
                        {repairs.map((item) => (
                            <div
                                key={item.id}
                                className={`repairCard ${selectedRepair?.id === item.id ? 'selected' : ''}`}
                                onClick={() => handleSelectRepair(item)}
                                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleSelectRepair(item)}
                                tabIndex={0}
                                role="button"
                                aria-pressed={selectedRepair?.id === item.id}
                                aria-label={`เลือกสถานที่ ${item.name}`}
                            >
                                <p><strong>ชื่อสถานที่:</strong> {item.name ?? 'N/A'}</p>
                                <p><strong>ตำแหน่ง:</strong> {item.location ?? 'N/A'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedRepair && (
                <div id="repair-request-form" className="crudForm repairRequestForm">
                    <h3>แจ้งซ่อมสำหรับ: {selectedRepair.name}</h3>
                    <p><strong>ตำแหน่ง:</strong> {selectedRepair.location}</p>
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
                            <label>รายละเอียดการแจ้งซ่อม <span className="required">*</span></label>
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
                                {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการแจ้งซ่อม'}
                            </button>
                            <button type="button" className="cancelButton" onClick={handleCancelSelection} disabled={isSubmitting}>ยกเลิก</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Repair;