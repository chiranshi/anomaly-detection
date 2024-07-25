import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
// import fileupload1 from './components/fileupload';
import AnomalyDetection from './components/AnomalyDetection';
import FileUpload1 from './components/upload';
// import ValidationPage from './components/validate';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* <Route path="/fileupload" element={<FileUpload />} /> */}
        <Route path="/anomaly-detection" element={<AnomalyDetection />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<FileUpload1 upload={true}/>}/>
        <Route path="/create" element={<create />} />
        {/* <Route path="/validate" element={<ValidationPage />}/> */}
      </Routes>
    </Router>
  );
}

export default App;
