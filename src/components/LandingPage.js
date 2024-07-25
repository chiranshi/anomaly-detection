import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

function LandingPage() {
  const navigate = useNavigate();

  const navigateToAnomalyDetection = () => {
    navigate('/anomaly-detection');
  };

  return (
    <div className="landing-page">
      <h1>Welcome to Anomaly Detection</h1>
      <button className="btn" onClick={navigateToAnomalyDetection}>Anomaly Detection</button>
    </div>
  );
}

export default LandingPage;
