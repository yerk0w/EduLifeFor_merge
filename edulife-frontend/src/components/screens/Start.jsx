// src/components/screens/Home.jsx
import React from 'react';
import startImage from '../../assets/images/start.png';
import './Start.css';

const Start = () => {
  return (
    <div className="start-screen">
      <div className="start-content">
        <h1>Добро пожаловать в EduLife!</h1>
        <img src={startImage}alt="" className="start-image" />
      </div>
      <div>
      <button className="next-button" onClick={() => window.location.href = '/logreg'}>Следующий</button>
      </div>
    </div>
  );
};

export default Start;
