// src/components/screens/SplashScreen.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import flowerImage from '../../assets/images/flower.png'; // Импортируем изображение
import './SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [animationStarted, setAnimationStarted] = useState(false);
  
  useEffect(() => {
    // Запускаем анимацию через небольшую задержку
    const animationTimer = setTimeout(() => {
      setAnimationStarted(true);
    }, 1000);
    
    // Переходим на главную страницу после завершения анимации
    const navigationTimer = setTimeout(() => {
      navigate('/start');
    }, 3500);
    
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(navigationTimer);
    };
  }, [navigate]);
  
  return (
    <div className="splash-screen">
      <div className={`flower-container top-left ${animationStarted ? 'animate' : ''}`}>
        <img src={flowerImage} alt="" className="flower-image" />
      </div>
      
      <h1 className="logo">EduLife</h1>
      
      <div className={`flower-container bottom-right ${animationStarted ? 'animate' : ''}`}>
        <img src={flowerImage} alt="" className="flower-image" />
      </div>
    </div>
  );
};

export default SplashScreen;
