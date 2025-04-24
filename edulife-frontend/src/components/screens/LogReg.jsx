// src/components/screens/Home.jsx
import React from 'react';
import logregImage from '../../assets/images/logreg.webp';
import './Logreg.css';

const Logreg = () => {
  return (
    <div className="logreg-screen">
      <div className="logreg-content">
        <h1>Давайте начнем</h1>
        <img src={logregImage}alt="" className="logreg-image" />
      </div>
      <div>
      <button className="log-button" onClick={() => window.location.href = '/log'}>Войти</button>
      <button className="reg-button" onClick={() => window.location.href = '/reg'}>Зарегестрироватья</button>
      </div>
    </div>
  );
};

export default Logreg;