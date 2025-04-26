import React from 'react';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate для навигации
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import logregImage from '../../assets/images/logreg.png';
import './Logreg.css';

const Logreg = () => {
  const { t } = useTranslation(['screens']); // Используем пространство имен 'screens' из kz.json
  const navigate = useNavigate(); // Хук для навигации

  // Обработчик для перехода на страницу входа
  const handleLogin = () => {
    navigate('/log');
  };

  // Обработчик для перехода на страницу регистрации
  const handleRegister = () => {
    navigate('/reg');
  };

  return (
    <div className="logreg-screen">
      <div className="logreg-content">
        <h1>{t('screens:logreg.letsStart')}</h1> {/* Используем перевод */}
        <img src={logregImage} alt="" className="logreg-image" />
      </div>
      <div>
        <button className="log-button" onClick={handleLogin}>
          {t('screens:logreg.login')} {/* Используем перевод */}
        </button>
        <button className="reg-button" onClick={handleRegister}>
          {t('screens:logreg.register')} {/* Используем перевод */}
        </button>
      </div>
    </div>
  );
};

export default Logreg;