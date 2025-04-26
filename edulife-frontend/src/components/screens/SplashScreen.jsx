import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук
import flowerImage from '../../assets/images/flower.png';
import './SplashScreen.css';

const SplashScreen = () => {
  const { t } = useTranslation('screens'); // Указываем пространство имён
  const navigate = useNavigate();
  const [animationStarted, setAnimationStarted] = useState(false);

  useEffect(() => {
    const animationTimer = setTimeout(() => {
      setAnimationStarted(true);
    }, 1000);

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
      <h1 className="logo">{t('splashScreen.logo')}</h1>
      <div className={`flower-container bottom-right ${animationStarted ? 'animate' : ''}`}>
        <img src={flowerImage} alt="" className="flower-image" />
      </div>
    </div>
  );
};

export default SplashScreen;