import React, { useState } from "react";
import { BrowserRouter, Route, Routes, useNavigate, Navigate } from 'react-router-dom';
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

// import ResultPage from './components/ResultPage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/login" replace />;
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

  const handleReportSubmit = (newReport) => {
    axios.post('/PO/uploadd.php', newReport)
      .then(response => {
        console.log("Server response:", response.data);
        if (response.data.message) {
          console.log("Message:", response.data.message);
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
      });
  };

  return (
    <div className="app">
      <AppHeader />
      <section className="app-section">
        <div className="container">
          <h1>ยินดีต้อนรับสู่เว็บไซต์ </h1>
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
            <Route path="/employee-dashboard" element={<PrivateRoute allowedRoles={['employee']}> <EmployeeDashboard /></PrivateRoute>} />
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
                <PrivateRoute allowedRoles={['admin', 'technician']}>
                  <MachineManagement />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default App;