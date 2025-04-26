import React from 'react';
import { useTranslation } from 'react-i18next'; // Импортируем хук
import startImage from '../../assets/images/start.png';
import './Start.css';

const Start = () => {
  const { t } = useTranslation('screens'); // Указываем пространство имён

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1>{t('start.welcome')}</h1>
        <img src={startImage} alt="" className="start-image" />
      </div>
      <div>
        <button
          className="next-button"
          onClick={() => (window.location.href = '/logreg')}
        >
          {t('start.next')}
        </button>
      </div>
    </div>
  );
};

export default Start;