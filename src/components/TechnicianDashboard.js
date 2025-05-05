// import React, { useState, useEffect, useCallback } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import styles from './CSS/TechnicianDashboard.module.css';
// import axios from 'axios';

// const TechnicianDashboard = () => {
//     const [pendingReports, setPendingReports] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();
//     const [expandedReportId, setExpandedReportId] = useState(null);
//     const [user, setUser] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [hasNewReports, setHasNewReports] = useState(false);
//     const [selectedImage, setSelectedImage] = useState(null);

//     const isTechnician = user?.user_type === 'technician';
//     const decodedFirstName = user ? decodeURIComponent(user.first_name) : '';
//     const decodedLastName = user ? decodeURIComponent(user.last_name) : '';

//     const statusMap = {
//         in_progress: 2,
//         completed: 3,
//         rejected: 4
//     };

//     const calculateRemainingTime = useCallback((createdAt) => {
//         const created = new Date(createdAt);
//         const now = new Date();
//         const slaHours = 24;
//         const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
//         const remaining = deadline - now;

//         if (remaining <= 0) return 'เกินเวลา SLA';
//         const hours = Math.floor(remaining / (60 * 60 * 1000));
//         const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
//         return `${hours} ชั่วโมง ${minutes} นาที`;
//     }, []);

//     const getUrgencyLevel = useCallback((createdAt) => {
//         const created = new Date(createdAt);
//         const now = new Date();
//         const hoursElapsed = (now - created) / (60 * 60 * 1000);

//         if (hoursElapsed >= 20) return { color: '#ff4444', level: 'สูง' };
//         if (hoursElapsed >= 12) return { color: '#ffbb33', level: 'ปานกลาง' };
//         return { color: '#00C851', level: 'ปกติ' };
//     }, []);

//     const fetchPendingReports = useCallback(async () => {
//         try {
//             const response = await axios.get('/VRU-main/uploadd.php');
//             if (response.data.success) {
//                 const newReports = response.data.reports;
//                 if (pendingReports.length > 0 && newReports.length > pendingReports.length) {
//                     setHasNewReports(true);
//                     if (Notification.permission === "granted") {
//                         new Notification('มีงานใหม่เข้ามา', {
//                             body: 'มีรายการแจ้งซ่อมใหม่ที่รอดำเนินการ'
//                         });
//                     } else if (Notification.permission !== "denied") {
//                         Notification.requestPermission().then(permission => {
//                             if (permission === "granted") {
//                                 new Notification('มีงานใหม่เข้ามา', {
//                                     body: 'มีรายการแจ้งซ่อมใหม่ที่รอดำเนินการ'
//                                 });
//                             }
//                         });
//                     }
//                 }
//                 setPendingReports(newReports);
//             } else {
//                 setError(response.data.error || 'ไม่สามารถโหลดข้อมูลได้');
//             }
//         } catch (err) {
//             console.error('Error fetching reports:', err);
//             setError('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
//         } finally {
//             setLoading(false);
//         }
//     }, [pendingReports]);

//     const handleUpdateStatus = useCallback(async (reportId, newStatus) => {
//         if (!user || !user.employee_id) {
//             alert('กรุณาเข้าสู่ระบบก่อน');
//             return;
//         }

//         let confirmMessage = '';
//         switch (newStatus) {
//             case 'in_progress':
//                 confirmMessage = 'คุณต้องการเข้ารับการซ่อมงานนี้ใช่หรือไม่?';
//                 break;
//             case 'completed':
//                 confirmMessage = 'คุณต้องการยืนยันว่าดำเนินการเสร็จสิ้นแล้วใช่หรือไม่?';
//                 break;
//             // case 'rejected':
//             //     confirmMessage = 'คุณต้องการปฏิเสธการซ่อมงานนี้ใช่หรือไม่?';
//             //     break;
//             default:
//                 confirmMessage = 'คุณต้องการอัปเดตสถานะงานนี้ใช่หรือไม่?';
//         }

//         if (window.confirm(confirmMessage)) {
//             try {
//                 const data = {
//                     report_id: reportId,
//                     status: statusMap[newStatus]
//                 };

//                 const response = await axios({
//                     method: 'post',
//                     url: 'http://localhost:3000/VRU-main/update_status.php',
//                     data: data,
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     withCredentials: true
//                 });

//                 if (response.data.success) {
//                     alert('อัปเดตสถานะสำเร็จ');
//                     fetchPendingReports();
//                 } else {
//                     throw new Error(response.data.error || 'ไม่สามารถอัปเดตสถานะได้');
//                 }
//             } catch (err) {
//                 console.error('Error updating status:', err);
//                 alert('เกิดข้อผิดพลาด: ' + (err.response?.data?.error || err.message));
//             }
//         }
//     }, [user, fetchPendingReports, statusMap]);

//     const toggleReportDetails = useCallback((reportId) => {
//         setExpandedReportId(prevId => prevId === reportId ? null : reportId);
//     }, []);

//     const handleImageClick = (imageUrl) => {
//         setSelectedImage(imageUrl);
//     };

//     const closeModal = () => {
//         setSelectedImage(null);
//     };

//     useEffect(() => {
//         try {
//             const userData = localStorage.getItem('user');
//             if (userData) {
//                 const parsedUser = JSON.parse(userData);
//                 setUser(parsedUser);
//             } else {
//                 navigate('/login');
//             }
//         } catch (error) {
//             console.error('Error parsing user data:', error);
//             setError('เกิดข้อผิดพลาดในการโหลดข้อมูลผู้ใช้');
//             navigate('/login');
//         }
//     }, [navigate]);

//     useEffect(() => {
//         if (user?.user_type === 'technician') {
//             fetchPendingReports();
//             const checkNewReports = setInterval(fetchPendingReports, 30000);
//             return () => clearInterval(checkNewReports);
//         }
//     }, [user, fetchPendingReports]);

//     if (loading) {
//         return (
//             <div className={styles.loadingContainer}>
//                 <div className={styles.spinner}></div>
//                 <p>กำลังโหลดข้อมูล...</p>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className={styles.errorContainer}>
//                 <p className={styles.errorMessage}>{error}</p>
//                 <button
//                     className={styles.retryButton}
//                     onClick={() => {
//                         setError(null);
//                         fetchPendingReports();
//                     }}
//                 >
//                     ลองใหม่อีกครั้ง
//                 </button>
//             </div>
//         );
//     }

//     const filteredReports = pendingReports.filter(report => {
//         const matchesSearch = report.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             report.issue.toLowerCase().includes(searchTerm.toLowerCase());
//         return matchesSearch && report.status !== statusMap.completed;
//     });

//     return (
//         <div className={styles.dashboardContainer}>
//             {hasNewReports && (
//                 <div className={styles.notification}>
//                     <span>มีงานใหม่เข้ามา!</span>
//                     <button
//                         className={styles.acknowledgeButton}
//                         onClick={() => setHasNewReports(false)}
//                     >
//                         รับทราบ
//                     </button>
//                 </div>
//             )}
//             <div className={styles.header}>
//                 <h2>{isTechnician ? 'พื้นที่สำหรับช่างเทคนิค' : 'พื้นที่สำหรับพนักงาน'}</h2>
//             </div>

//             <div className={styles.welcomeMessage}>
//                 <p>ยินดีต้อนรับ, คุณ{decodedFirstName} {decodedLastName}</p>
//                 <div className={styles.userInfo}>
//                     <p>รหัสพนักงาน: {user?.employee_id}</p>
//                     <p>เบอร์โทรศัพท์: {user?.phone_number}</p>
//                 </div>
//             </div>

//             {isTechnician && (
//                 <div className={styles.workQueue}>
//                     <h3>งานที่ต้องดำเนินการ</h3>
//                     <div className={styles.searchFilter}>
//                         <input
//                             type="text"
//                             placeholder="ค้นหาจากชื่อผู้แจ้งหรือปัญหา..."
//                             value={searchTerm}
//                             onChange={(e) => setSearchTerm(e.target.value)}
//                             className={styles.searchInput}
//                         />
//                     </div>
//                     <div className={styles.queueList}>
//                         {filteredReports.length === 0 ? (
//                             <div className={styles.queueItem}>
//                                 <p>ยังไม่มีงานที่ต้องดำเนินการ</p>
//                             </div>
//                         ) : (
//                             filteredReports.map(report => {
//                                 const urgency = getUrgencyLevel(report.created_at);
//                                 return (
//                                     <div
//                                         key={report.id}
//                                         className={styles.queueItem}
//                                         style={{ borderLeft: `4px solid ${urgency.color}` }}
//                                     >
//                                         <div
//                                             className={styles.reportHeader}
//                                             onClick={() => toggleReportDetails(report.id)}
//                                         >
//                                             <h4>รายการแจ้งซ่อม #{report.id}</h4>
//                                             <div className={styles.urgencyBadge} style={{ backgroundColor: urgency.color }}>
//                                                 {urgency.level}
//                                             </div>
//                                             <span className={styles.expandIcon}>
//                                                 {expandedReportId === report.id ? '▼' : '▶'}
//                                             </span>
//                                         </div>

//                                         {expandedReportId === report.id && user && (
//                                             <div className={styles.reportDetails}>
//                                                 <p>ผู้แจ้ง: {report.employee_name}</p>
//                                                 <p>รหัสพนักงาน: {report.employee_id}</p>
//                                                 <p>ปัญหา: {report.issue}</p>
//                                                 <p>หมวดหมู่: {report.category}</p>
//                                                 <p>เวลาแจ้ง: {new Date(report.created_at).toLocaleString('th-TH')}</p>
//                                                 <p className={styles.slaTime}>
//                                                     เวลาที่เหลือก่อน SLA: {calculateRemainingTime(report.created_at)}
//                                                 </p>
//                                                 {report.image_path && (
//                                                     <div className={styles.imagePreview}>
//                                                         <img
//                                                             src={`data:image/jpeg;base64,${report.image_path}`}
//                                                             alt="รายละเอียดปัญหา"
//                                                             className={styles.thumbnail}
//                                                             onClick={() => handleImageClick(`data:image/jpeg;base64,${report.image_path}`)}
//                                                         />
//                                                     </div>
//                                                 )}
//                                                 <div className={styles.statusControl}>
//                                                     <label htmlFor={`status-${report.id}`} className={styles.statusLabel}>สถานะ:</label>
//                                                     <select
//                                                         id={`status-${report.id}`}
//                                                         className={styles.statusSelect}
//                                                         onChange={(e) => handleUpdateStatus(report.id, e.target.value)}
//                                                         defaultValue=""
//                                                     >
//                                                         <option value="" disabled>--- เลือกสถานะ ---</option>
//                                                         <option value="in_progress">เข้ารับการซ่อมแล้ว</option>
//                                                         <option value="completed">ดำเนินการเสร็จสิ้น</option>
//                                                         {/* <option value="rejected">ปฏิเสธการซ่อม</option> */}
//                                                     </select>
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 );
//                             })
//                         )}
//                     </div>
//                 </div>
//             )}

//             {selectedImage && (
//                 <div className={styles.imageModal} onClick={closeModal}>
//                     <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
//                         <img src={selectedImage} alt="ภาพขยาย" className={styles.fullImage} />
//                         <button className={styles.closeButton} onClick={closeModal}>ปิด</button>
//                     </div>
//                 </div>
//             )}

//             <div className={styles.blockContainer}>
//                 {isTechnician ? (
//                     <>
//                         <div className={styles.block}>
//                             <h2>เพิ่มข้อมูลเครื่องจักร</h2>
//                             <p>รายละเอียดเกี่ยวกับการเพิ่มข้อมูลเครื่องจักร</p>
//                             <Link to="/machine-management">
//                                 <button className={styles.actionButton}>ไปยังหน้าเพิ่มข้อมูล</button>
//                             </Link>
//                         </div>
//                         <div className={styles.block}>
//                             <h2>เพิ่ม/ลบ/แก้ไขข้อมูลส่วนตัว</h2>
//                             <p>รายละเอียดเกี่ยวกับการเพิ่ม ลบ และแก้ไขข้อมูลส่วนตัว</p>
//                             <Link to="/edit-profile">
//                                 <button className={styles.actionButton}>แก้ไขข้อมูลส่วนตัว</button>
//                             </Link>
//                         </div>
//                         <div className={styles.block}>
//                             <h2>เช็คประวัติการแจ้งซ่อม</h2>
//                             <p>รายละเอียดเกี่ยวกับการตรวจสอบประวัติการแจ้งซ่อม</p>
//                             <Link to="/repair-stats">
//                                 <button className={styles.actionButton}>ไปยังหน้าตรวจสอบประวัติ</button>
//                             </Link>
//                         </div>
//                     </>
//                 ) : (
//                     <div className={styles.quickActions}>
//                         <h3>เมนูด่วน</h3>
//                         <div className={styles.actionButtons}>
//                             <Link to="/repair-request">
//                                 <button className={styles.actionButton}>แจ้งซ่อม</button>
//                             </Link>
//                             <Link to="/repair-history">
//                                 <button className={styles.actionButton}>ประวัติการแจ้งซ่อม</button>
//                             </Link>
//                             <Link to="/repair-status">
//                                 <button className={styles.actionButton}>ติดตามสถานะ</button>
//                             </Link>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default TechnicianDashboard;

