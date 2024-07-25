import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AnomalyDetection.css';

function AnomalyDetection() {
  const navigate = useNavigate();

  return (
    <div className="Dashboard">
      <div className="header">
        <h2>Anomaly Detection</h2>
      </div>
      <div className="rectangle">
        <button className="btn login" onClick={() => navigate('/login')}>Login</button>
        <button className="btn signup" onClick={() => navigate('/signup')}>Signup</button>
      </div>
    </div>
  );
}

export default AnomalyDetection;
