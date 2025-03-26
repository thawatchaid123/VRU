import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MachineManagement.css';

const API_URL = 'http://localhost/PO/machine_api.php';

const MACHINE_TYPES = [
  { value: 'เครื่องผสมและเครื่องกวน (Mixing Machines)', label: 'เครื่องผสมและเครื่องกวน (Mixing Machines)' },
  { value: 'เครื่องบดและกระจายอนุภาค (Milling Machines)', label: 'เครื่องบดและกระจายอนุภาค (Milling Machines)' },
  { value: 'เครื่องจักรงานพิมพ์และตัด (Printing & Cutting Machines)', label: 'เครื่องจักรงานพิมพ์และตัด (Printing & Cutting Machines)' },
  { value: 'เครื่องจักรงานบรรจุและขนส่ง (Packaging & Stacking Machines)', label: 'เครื่องจักรงานบรรจุและขนส่ง (Packaging & Stacking Machines)' },
  { value: 'เครื่องจักรให้ความร้อนและเตาเผา (Heating & Sintering Machines)', label: 'เครื่องจักรให้ความร้อนและเตาเผา (Heating & Sintering Machines)' },
  { value: 'เครื่องขัดเงาและทำความสะอาด (Polishing & Cleaning Machines)', label: 'เครื่องขัดเงาและทำความสะอาด (Polishing & Cleaning Machines)' },
  { value: 'เครื่องจักรสำหรับงานทดสอบและตรวจสอบ (Testing & Inspection Machines)', label: 'เครื่องจักรสำหรับงานทดสอบและตรวจสอบ (Testing & Inspection Machines)' },
  { value: 'เครื่องจักรสำหรับการแพ็คกิ้งและจัดเรียงชิ้นส่วน (Packaging & Handling Machines)', label: 'เครื่องจักรสำหรับการแพ็คกิ้งและจัดเรียงชิ้นส่วน (Packaging & Handling Machines)' },
  { value: 'เครื่องจักรในสายการผลิตอัตโนมัติ (Automation & Assembly Machines) (Packaging & Handling Machines)', label: 'เครื่องจักรในสายการผลิตอัตโนมัติ (Automation & Assembly Machines))' },
  

];

const getMachineImageUrl = (imageUrl) => {
  if (!imageUrl) return 'https://via.placeholder.com/400x300?text=No+Image';
  return imageUrl;
};

const MachineManagement = () => {
  const [formData, setFormData] = useState({
    machineId: '',
    machineType: '',
    usageDate: '',
    usageTime: '',
    operationDetails: '',
    machineImage: null
  });
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchMachines();
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    timeout: 10000
  });

  const fetchMachines = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('');
      if (response.data && Array.isArray(response.data)) {
        console.log('Received machines data:', response.data);
        setMachines(response.data);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
      setError('ไม่สามารถดึงข้อมูลเครื่องจักรได้');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ขนาดไฟล์ต้องไม่เกิน 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('กรุณาอัพโหลดไฟล์รูปภาพเท่านั้น');
        return;
      }
      
      setFormData(prevState => ({
        ...prevState,
        machineImage: file
      }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('id', formData.machineId);
      formDataToSubmit.append('type', formData.machineType);
      formDataToSubmit.append('startDate', `${formData.usageDate} ${formData.usageTime}`);
      formDataToSubmit.append('operationDetails', formData.operationDetails);
      
      if (formData.machineImage) {
        formDataToSubmit.append('image', formData.machineImage);
      }

      const response = await axiosInstance.post('', formDataToSubmit, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        handleReset();
        await fetchMachines();
        alert('บันทึกข้อมูลเครื่องจักรเรียบร้อยแล้ว');
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      machineId: '',
      machineType: '',
      usageDate: '',
      usageTime: '',
      operationDetails: '',
      machineImage: null
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="machine-management">
      <div className="machine-form-container">
        <h2 className="page-title">
          แบบฟอร์มจัดการข้อมูลเครื่องจักร
        </h2>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError('')} className="error-close">
              ✕
            </button>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รหัสเครื่องจักร
              </label>
              <input
                type="text"
                name="machineId"
                value={formData.machineId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="กรุณากรอกรหัสเครื่องจักร"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ประเภทเครื่องจักร
              </label>
              <select
                name="machineType"
                value={formData.machineType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">เลือกประเภทเครื่องจักร</option>
                {MACHINE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่ใช้งาน
                </label>
                <input
                  type="date"
                  name="usageDate"
                  value={formData.usageDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาใช้งาน
                </label>
                <input
                  type="time"
                  name="usageTime"
                  value={formData.usageTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดการทำงาน
              </label>
              <textarea
                name="operationDetails"
                value={formData.operationDetails}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32 resize-none"
                placeholder="กรุณากรอกรายละเอียดการทำงานของเครื่องจักร"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รูปภาพเครื่องจักร
              </label>
              <input
                type="file"
                name="machineImage"
                onChange={handleImageChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto rounded-md"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              ล้างข้อมูล
            </button>
            <button
              type="submit"
              className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={loading}
            >
              {loading ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </form>

        {/* Machine List */}
        <div className="machine-list-section">
          <h3 className="section-title">รายการเครื่องจักร</h3>
          {loading ? (
            <p className="loading-message">กำลังโหลดข้อมูล...</p>
          ) : machines.length === 0 ? (
            <p className="no-data-message">ไม่พบข้อมูลเครื่องจักร</p>
          ) : (
            <div className="machine-grid">
              {machines.map((machine) => (
                <div key={machine.machine_id} className="machine-card">
                  <div className="machine-image-container">
                    {machine.image_url ? (
                      <img
                        src={getMachineImageUrl(machine.image_url)}
                        alt={`เครื่องจักร ${machine.machine_id}`}
                        className="machine-image"
                        onError={(e) => {
                          console.log('Image load failed:', machine.image_url);
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="no-image-placeholder">
                        <span>ไม่มีรูปภาพ</span>
                      </div>
                    )}
                  </div>
                  <div className="machine-details">
                    <table className="details-table">
                      <tbody>
                        <tr>
                          <th>รหัส:</th>
                          <td>{machine.machine_id}</td>
                        </tr>
                        <tr>
                          <th>ประเภท:</th>
                          <td>{machine.machine_type}</td>
                        </tr>
                        <tr>
                          <th>วันที่ใช้งาน:</th>
                          <td>{machine.start_date}</td>
                        </tr>
                        {machine.operation_details && (
                          <tr>
                            <th>รายละเอียด:</th>
                            <td>{machine.operation_details}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MachineManagement;