import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./App.css";
import AppHeader from "./components/AppHeader";
import Footer from "./components/Footer";
import HomePage from "./components/HomePage";
import ReportForm from './components/ReportForm';
import ComplaintForm from './components/Repair/ComplaintForm';
import Result from "./components/Result";
import Register from "./components/Register";
import Login from "./components/Login";
import EmployeeDashboard from './components/EmployeeDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import ChartPage from './components/ChartPage';
import RepairStats from './components/RepairStats';
import Admin from "./components/Admin";
import Edit from "./components/Edit";
import MachineManagement from "./components/Repair/MachineManagement";

const PrivateRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    } catch (error) {
      console.error("Error parsing user for PrivateRoute:", error);
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.user_type)) {
    console.warn(`User type "${user.user_type}" tried to access restricted route.`);
    switch (user.user_type) {
      case 'employee': return <Navigate to="/employee-dashboard" replace />;
      case 'technician': return <Navigate to="/technician-dashboard" replace />;
      case 'admin': return <Navigate to="/app" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }

  return children;
};

function App() {
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  const handleReportSubmit = (newReportData) => {
    const apiUrl = 'http://localhost/VRU-main/uploadd.php';
    console.log("Submitting report to:", apiUrl);
    axios.post(apiUrl, newReportData)
      .then(response => {
        console.log("Report Submit Response:", response.data);
        setSearchResults(response.data);
        navigate('/complaintform');
      })
      .catch(error => {
        console.error('Error submitting report:', error.response ? error.response.data : error.message);
        alert(`เกิดข้อผิดพลาดในการส่งข้อมูล: ${error.message}`);
      });
  };

  return (
    <div className="app">
      <AppHeader />
      <main className="app-section">
        <div className="container">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportForm onSubmit={handleReportSubmit} />} />
            <Route path="/complaintform" element={<ComplaintForm searchResults={searchResults} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Shared */}
            <Route path="/edit-profile" element={<PrivateRoute allowedRoles={['employee', 'technician', 'admin']}><EditProfile /></PrivateRoute>} />
            <Route path="/charts" element={<PrivateRoute allowedRoles={['employee', 'technician', 'admin']}><ChartPage /></PrivateRoute>} />

            {/* Employee */}
            <Route path="/employee-dashboard" element={<PrivateRoute allowedRoles={['employee']}><EmployeeDashboard /></PrivateRoute>} />

            {/* Technician / Admin */}
            <Route path="/technician-dashboard" element={<PrivateRoute allowedRoles={['technician', 'admin']}><TechnicianDashboard /></PrivateRoute>} />
            <Route path="/machine-management" element={<PrivateRoute allowedRoles={['admin', 'technician']}><MachineManagement /></PrivateRoute>} />
            <Route path="/repair-stats" element={<PrivateRoute allowedRoles={['admin', 'technician']}><RepairStats /></PrivateRoute>} />

            {/* Admin */}
            <Route path="/app" element={<PrivateRoute allowedRoles={['admin']}><Dashboard /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute allowedRoles={['admin']}><Admin /></PrivateRoute>} />
            <Route path="/edit" element={<PrivateRoute allowedRoles={['admin']}><Edit /></PrivateRoute>} />
          </Routes>
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}

export default App;