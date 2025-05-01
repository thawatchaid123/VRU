import React, { useState } from "react";
import { Route, Routes, useNavigate, Navigate, useLocation } from 'react-router-dom';
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
import RepairStats from './components/RepairStats';
import MachineManagement from "./components/MachineManagement";
import Dashboard from './components/Dashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import TechnicianDashboard from './components/TechnicianDashboard';
import EditProfile from './components/EditProfile';
import ChartPage from './components/ChartPage';
import HomePage from "./components/HomePage";

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
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
  return children;
};

function App() {
  const [report, setReport] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  const handleReportSubmit = (newReportData) => {
    axios.post('/PO/uploadd.php', newReportData)
      .then(response => {
        console.log("Server response:", response.data);
        if (response.data.message) {
          console.log("Message:", response.data.message);
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
      });
  };

  return (
    <div className="app">
      <AppHeader />
      <section className="app-section">
        <div className="container">
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
    </div>
  );
}

export default App;