import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import Home from './Home.jsx';
import './App.css';
import ReportView from './components/ReportView.jsx'
function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reports" element={< ReportView/>} />
      </Routes>
  );
}

export default App;
