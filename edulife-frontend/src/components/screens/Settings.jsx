// src/components/screens/Settings.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleLogout = () => {
    // Логика выхода из аккаунта
    navigate('/logreg');
  };
  
  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="back1-button" onClick={handleBack}>
          &lt;
        </button>
        <h1>Настройки</h1>
      </div>
      
      <div className="settings-content">
        <div className="settings-section">
          <h2>Аккаунт</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Изменить профиль</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Изменить пароль</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Приватность</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Уведомления</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Push-уведомления</div>
              <div className="settings-item-toggle">
                <input type="checkbox" id="push-toggle" className="toggle-input" defaultChecked />
                <label htmlFor="push-toggle" className="toggle-label"></label>
              </div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Email-уведомления</div>
              <div className="settings-item-toggle">
                <input type="checkbox" id="email-toggle" className="toggle-input" defaultChecked />
                <label htmlFor="email-toggle" className="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>Внешний вид</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Темная тема</div>
              <div className="settings-item-toggle">
                <input type="checkbox" id="theme-toggle" className="toggle-input" defaultChecked />
                <label htmlFor="theme-toggle" className="toggle-label"></label>
              </div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Язык</div>
              <div className="settings-item-value">Русский</div>
            </div>
          </div>
        </div>
        
        <div className="settings-section">
          <h2>О приложении</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Версия</div>
              <div className="settings-item-value">1.0.0</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Условия использования</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Политика конфиденциальности</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
          </div>
        </div>
        
        <button className="logout-button" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default Settings;
