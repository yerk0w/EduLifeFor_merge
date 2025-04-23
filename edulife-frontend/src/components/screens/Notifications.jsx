// src/components/screens/Notifications.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="notifications-screen">
      <div className="notifications-header">
        <button className="back-button" onClick={handleBack}>
          &lt;
        </button>
        <h1>Уведомления</h1>
      </div>
      
      <div className="notifications-list">
        <div className="notification-item">
          <h3>Новый курс доступен</h3>
          <p>Проверьте новый курс по React разработке</p>
          <span className="notification-time">2 часа назад</span>
        </div>
        
        <div className="notification-item">
          <h3>Обновление расписания</h3>
          <p>Ваше расписание на следующую неделю обновлено</p>
          <span className="notification-time">Вчера</span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
