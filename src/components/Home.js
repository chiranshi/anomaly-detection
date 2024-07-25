import React from 'react';
import { useNavigate } from 'react-router-dom';
import './auth.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-button anomaly" onClick={() => navigate('/anomaly-detection')}>
        Anomaly Detection
      </div>
      <div className="home-button one" onClick={() => navigate('/')}>
        one
      </div>
      <div className="home-button two" onClick={() => navigate('/')}>
        two
      </div>
    </div>
  );
}

export default Home;
