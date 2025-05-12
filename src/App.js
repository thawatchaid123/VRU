import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import "./App.css";
import AppHeader from "./components/All/AppHeader";
import Footer from "./components/All/Footer";
import HomePage from "./components/HomePage";
import Login from "./components/Login";
import Dashboard from './components/Admin/Dashboard';
import EditProfile from './components/Admin/EditProfile';
import RepairStats from './components/Admin/RepairStats';
import RepairInfoManagement from "./components/Repair/RepairInfoManagement";
import Repair from "./components/Repair/Repair";
import Update from "./components/Admin/Update";
import Check from "./components/Check";
import Environment from "./components/Environment/Environment";
import EnvironmentInfoManagement from "./components/Environment/EnvironmentInfoManagement";

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
            <Route path="/check" element={<Check searchResults={searchResults} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/repair-stats" element={<RepairStats />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-repair" element={<RepairInfoManagement /> }/>
            <Route path="/repair" element={<Repair /> }/>
            <Route path="/update-status" element={<Update /> }/>
            <Route path="/add-environmental" element={<EnvironmentInfoManagement /> }/>
            <Route path="/environment" element={<Environment /> }/>
          </Routes>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;