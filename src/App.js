import React, { useState } from "react";
<<<<<<< HEAD
import { Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom';
=======
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
import "./App.css";
import AppHeader from "./components/AppHeader";
import Result from "./components/Result";
import ReportForm from './components/ReportForm';
import Login from "./components/Login";
import axios from 'axios';
import Footer from "./components/Footer";
import ComplaintForm from './components/ComplaintForm';
import Register from "./components/Register";
import Admin from "./components/Admin";
import Edit from "./components/Edit";
<<<<<<< HEAD
=======

>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
import RepairStats from './components/RepairStats';
import MachineManagement from "./components/MachineManagement";
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import EditProfile from './components/EditProfile';
import ChartPage from './components/ChartPage';
<<<<<<< HEAD
import HomePage from "./components/HomePage";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
=======

// import ResultPage from './components/ResultPage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!user) {
    return <Navigate to="/login" replace />;
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    switch (user.user_type) {
      case 'employee':
        return <Navigate to="/employee-dashboard" replace />;
      case 'technician':
        return <Navigate to="/technician-dashboard" replace />;
      case 'admin':
        return <Navigate to="/app" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
<<<<<<< HEAD
=======

>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
  return children;
};

function App() {
  const [report, setReport] = useState([]);
<<<<<<< HEAD
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleReportSubmit = (newReportData) => {
    axios.post('/PO/uploadd.php', newReportData)
=======
  const [searchResults, setSearchResults] = useState([]); 
  const navigate = useNavigate();

  const handleReportSubmit = (newReport) => {
    axios.post('/PO/uploadd.php', newReport)
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      .then(response => {
        console.log("Server response:", response.data);
        if (response.data.message) {
          console.log("Message:", response.data.message);
<<<<<<< HEAD
          setSearchResults(response.data);
          navigate('/complaintform');
        } else if (response.data.error) {
          console.error("Error from server:", response.data.error);
        } else {
          console.warn("Unexpected server response format:", response.data);
          setSearchResults(response.data);
          navigate('/complaintform');
        }
        // setReport(prevReports => [...prevReports, newReportData]);
      })
      .catch(error => {
        console.error('Error submitting report:', error.response ? error.response.data : error.message);
=======
        }
        if (response.data.error) {
          console.error("Error:", response.data.error);
        }
        setReport([...report, newReport]);
        setSearchResults(response.data);
        navigate('/complaintform');
      })
      .catch(error => {
        console.error('Error submitting report:', error);
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
      });
  };

  return (
    <div className="app">
      <AppHeader />
      <section className="app-section">
        <div className="container">
<<<<<<< HEAD
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportForm onSubmit={handleReportSubmit} />} />
            <Route path="/complaintform" element={<ComplaintForm searchResults={searchResults} />} />
            <Route path="/result" element={<Result searchResults={searchResults} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/employee-dashboard" element={<PrivateRoute allowedRoles={['employee']}><EmployeeDashboard /></PrivateRoute>} />
            <Route path="/technician-dashboard" element={<PrivateRoute allowedRoles={['technician']}><TechnicianDashboard /></PrivateRoute>} />
            <Route path="/app" element={<PrivateRoute allowedRoles={['admin']}><Dashboard /></PrivateRoute>} />
            <Route path="/repair-stats" element={<PrivateRoute allowedRoles={['admin', 'technician']}><RepairStats /></PrivateRoute>} />
            <Route path="/charts" element={<PrivateRoute allowedRoles={['employee', 'technician', 'admin']}><ChartPage /></PrivateRoute>} />
            <Route path="/edit-profile" element={<PrivateRoute allowedRoles={['employee', 'technician', 'admin']}><EditProfile /></PrivateRoute>} />

            <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><Admin /></PrivateRoute>} />
            <Route path="/edit" element={<PrivateRoute allowedRoles={['admin']}><Edit /></PrivateRoute>} />
            <Route path="/machine-management" element={<PrivateRoute allowedRoles={['admin', 'technician']}><MachineManagement /></PrivateRoute>} />

            {/* <Route path="*" element={<NotFoundComponent />} /> */}
          </Routes>
        </div>
      </section>
      {/* <Footer /> */}
=======
          <h1>ยินดีต้อนรับสู่เว็บไซต์ ระบบบริหารจัดการงานซ่อมบำรุง</h1>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<ReportForm onSubmit={handleReportSubmit} />} />
            <Route path="/complaintform" element={<ComplaintForm searchResults={searchResults} />} />
            <Route path="/result" element={<Result searchResults={searchResults} />} />
            {/* <Route path="/search" element={<ResultPage />} /> */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/charts" element={<ChartPage />} />
            <Route path="/repair-stats" element={<RepairStats />} />
            {/* Protected Routes */}
            <Route
              path="/employee-dashboard"
              element={
                <PrivateRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </PrivateRoute>
              }
            />
            <Route
    path="/repair-stats"
    element={
        <PrivateRoute allowedRoles={['admin', 'technician']}>
            <RepairStats />
        </PrivateRoute>
    }
/>
            <Route
              path="/technician-dashboard"
              element={
                <PrivateRoute allowedRoles={['technician']}>
                  <TechnicianDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/app"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            

            <Route 
              path="/edit-profile" 
              element={
                <PrivateRoute allowedRoles={['employee', 'technician', 'admin']}>
                  <EditProfile />
                </PrivateRoute>
              } 
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Admin />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/edit"
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <Edit />
                </PrivateRoute>
              }
            />
            
           
            <Route
              path="/machine-management"
              element={
                <PrivateRoute allowedRoles={['admin' , 'technician']}>
                  <MachineManagement />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </section>
      <Footer />
>>>>>>> 54c1c416158bb4f2a57e3598e350f7d95a651cff
    </div>
  );
}

export default App;