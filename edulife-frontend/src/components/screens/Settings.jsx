import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const Settings = () => {
  const navigate = useNavigate();

  // Состояние для темы
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return savedTheme === 'dark';
  });
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  // Состояние для уведомлений
  const [pushNotifications, setPushNotifications] = useState(() => {
    const savedPush = localStorage.getItem('pushNotifications') === 'true';
    return savedPush || false;
  });

  const [emailNotifications, setEmailNotifications] = useState(() => {
    const savedEmail = localStorage.getItem('emailNotifications') === 'true';
    return savedEmail || false;
  });

  // Состояние для языка
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language') || 'Русский';
    return savedLanguage;
  });
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  // Применяем тему при изменении состояния
  useEffect(() => {
    const theme = isDarkTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkTheme]);

  // Сохраняем уведомления в localStorage
  useEffect(() => {
    localStorage.setItem('pushNotifications', pushNotifications);
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('emailNotifications', emailNotifications);
  }, [emailNotifications]);

  // Сохраняем язык в localStorage
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleTerms = () => {
    navigate('/terms');
  };

  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setIsLanguageMenuOpen(false); // Закрыть меню после выбора языка
  };
  const handleBack = () => {
    navigate(-1);
  };

  const handleLogout = () => {
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
            {/* Изменить профиль */}
            <div
              className="settings-item"
              onClick={() => setShowProfileEdit(!showProfileEdit)}
            >
              <div className="settings-item-label">Изменить профиль</div>
              <div className="settings-item-arrow">
                {showProfileEdit ? '−' : '>'}
              </div>
            </div>
            {showProfileEdit && (
              <div className="settings-subsection">
                <div className="settings-subitem">
                  <label htmlFor="email">Электронная почта</label>
                  <input type="email" id="email" placeholder="Введите новую почту" />
                </div>
                <div className="settings-subitem">
                  <label htmlFor="username">Имя пользователя</label>
                  <input type="text" id="username" placeholder="Введите новое имя" />
                </div>
                <button className="save-button">Сохранить</button>
              </div>
            )}

            {/* Изменить пароль */}
            <div
              className="settings-item"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <div className="settings-item-label">Изменить пароль</div>
              <div className="settings-item-arrow">
                {showPasswordChange ? '−' : '>'}
              </div>
            </div>
            {showPasswordChange && (
              <div className="settings-subsection">
                <div className="settings-subitem">
                  <label htmlFor="current-password">Текущий пароль</label>
                  <input
                    type="password"
                    id="current-password"
                    placeholder="Введите текущий пароль"
                  />
                </div>
                <div className="settings-subitem">
                  <label htmlFor="new-password">Новый пароль</label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder="Введите новый пароль"
                  />
                </div>
                <button className="save-button">Сохранить</button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h2>Уведомления</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Push-уведомления</div>
              <div className="settings-item-toggle">
                <input
                  type="checkbox"
                  id="push-toggle"
                  className="toggle-input"
                  checked={pushNotifications}
                  onChange={() => setPushNotifications(!pushNotifications)}
                />
                <label htmlFor="push-toggle" className="toggle-label"></label>
              </div>
            </div>
            <div className="settings-item">
              <div className="settings-item-label">Email-уведомления</div>
              <div className="settings-item-toggle">
                <input
                  type="checkbox"
                  id="email-toggle"
                  className="toggle-input"
                  checked={emailNotifications}
                  onChange={() => setEmailNotifications(!emailNotifications)}
                />
                <label htmlFor="email-toggle" className="toggle-label"></label>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>Внешний вид</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">
                {isDarkTheme ? 'Темная тема' : 'Светлая тема'}
              </div>
              <div className="settings-item-toggle">
                <input
                  type="checkbox"
                  id="theme-toggle"
                  className="toggle-input"
                  checked={isDarkTheme}
                  onChange={handleThemeToggle}
                />
                <label htmlFor="theme-toggle" className="toggle-label"></label>
              </div>
            </div>
            <div
              className="settings-item"
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
            >
              <div className="settings-item-label">Язык</div>
              <div className="settings-item-value">{language}</div>
            </div>
            {isLanguageMenuOpen && (
              <div className="language-dropdown">
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange('Русский')}
                >
                  Русский
                </div>
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange('English')}
                >
                  English
                </div>
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange('Қазақша')}
                >
                  Қазақша
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h2>О приложении</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">Версия</div>
              <div className="settings-item-value">1.0.0</div>
            </div>
            <div className="settings-item" onClick={handleTerms}>
              <div className="settings-item-label">Условия использования</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
            <div className="settings-item" onClick={handlePrivacyPolicy}>
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
