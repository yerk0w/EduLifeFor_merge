import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import './Settings.css';

const Settings = () => {
  const { t, i18n } = useTranslation(['screens']); // Указываем пространство имен 'screens'
  const navigate = useNavigate();

  // Состояние для темы (темная/светлая)
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return savedTheme === 'dark';
  });

  // Состояние для отображения редактирования профиля и смены пароля
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

  // Состояние для меню выбора языка
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Синхронизируем тему с localStorage
  useEffect(() => {
    const theme = isDarkTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDarkTheme]);

  // Сохраняем настройки уведомлений в localStorage
  useEffect(() => {
    localStorage.setItem('pushNotifications', pushNotifications);
  }, [pushNotifications]);

  useEffect(() => {
    localStorage.setItem('emailNotifications', emailNotifications);
  }, [emailNotifications]);

  // При загрузке компонента устанавливаем язык из localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'kz';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  // Обработчик переключения темы
  const handleThemeToggle = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  // Обработчик перехода к условиям использования
  const handleTerms = () => {
    navigate('/terms');
  };

  // Обработчик перехода к политике конфиденциальности
  const handlePrivacyPolicy = () => {
    navigate('/privacy-policy');
  };

  // Обработчик изменения языка
  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang); // Меняем язык через i18next
    localStorage.setItem('language', lang); // Сохраняем выбранный язык
    setIsLanguageMenuOpen(false); // Закрываем меню
  };

  // Обработчик возврата на предыдущую страницу
  const handleBack = () => {
    navigate(-1);
  };

  // Обработчик выхода из аккаунта
  const handleLogout = () => {
    navigate('/logreg');
  };

  return (
    <div className="settings-screen">
      <div className="settings-header">
        <button className="back1-button" onClick={handleBack}>
          &lt;
        </button>
        <h1>{t('screens:settings.settings')}</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2>{t('screens:settings.account')}</h2>
          <div className="settings-list">
            <div
              className="settings-item"
              onClick={() => setShowProfileEdit(!showProfileEdit)}
            >
              <div className="settings-item-label">{t('screens:settings.editProfile')}</div>
              <div className="settings-item-arrow">
                {showProfileEdit ? '−' : '>'}
              </div>
            </div>
            {showProfileEdit && (
              <div className="settings-subsection">
                <div className="settings-subitem">
                  <label htmlFor="email">{t('screens:settings.email')}</label>
                  <input type="email" id="email" placeholder={t('screens:settings.enterNewEmail')} />
                </div>
                <div className="settings-subitem">
                  <label htmlFor="username">{t('screens:settings.username')}</label>
                  <input type="text" id="username" placeholder={t('screens:settings.enterNewName')} />
                </div>
                <button className="save-button">{t('screens:settings.save')}</button>
              </div>
            )}

            <div
              className="settings-item"
              onClick={() => setShowPasswordChange(!showPasswordChange)}
            >
              <div className="settings-item-label">{t('screens:settings.changePassword')}</div>
              <div className="settings-item-arrow">
                {showPasswordChange ? '−' : '>'}
              </div>
            </div>
            {showPasswordChange && (
              <div className="settings-subsection">
                <div className="settings-subitem">
                  <label htmlFor="current-password">{t('screens:settings.currentPassword')}</label>
                  <input
                    type="password"
                    id="current-password"
                    placeholder={t('screens:settings.enterCurrentPassword')}
                  />
                </div>
                <div className="settings-subitem">
                  <label htmlFor="new-password">{t('screens:settings.newPassword')}</label>
                  <input
                    type="password"
                    id="new-password"
                    placeholder={t('screens:settings.enterNewPassword')}
                  />
                </div>
                <button className="save-button">{t('screens:settings.save')}</button>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h2>{t('screens:settings.notifications')}</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">{t('screens:settings.pushNotifications')}</div>
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
              <div className="settings-item-label">{t('screens:settings.emailNotifications')}</div>
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
          <h2>{t('screens:settings.appearance')}</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">
                {isDarkTheme ? t('screens:settings.darkTheme') : t('screens:settings.lightTheme')}
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
              <div className="settings-item-label">{t('screens:settings.language')}</div>
              <div className="settings-item-value">
                {i18n.language === 'kz' ? t('screens:settings.kazakh') : t('screens:settings.russian')}
              </div>
            </div>
            {isLanguageMenuOpen && (
              <div className="language-dropdown">
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange('ru')}
                >
                  {t('screens:settings.russian')}
                </div>
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange('kz')}
                >
                  {t('screens:settings.kazakh')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-section">
          <h2>{t('screens:settings.aboutApp')}</h2>
          <div className="settings-list">
            <div className="settings-item">
              <div className="settings-item-label">{t('screens:settings.version')}</div>
              <div className="settings-item-value">{t('screens:settings.versionNumber')}</div>
            </div>
            <div className="settings-item" onClick={handleTerms}>
              <div className="settings-item-label">{t('screens:settings.termsOfUse')}</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
            <div className="settings-item" onClick={handlePrivacyPolicy}>
              <div className="settings-item-label">{t('screens:settings.privacyPolicy')}</div>
              <div className="settings-item-arrow">&gt;</div>
            </div>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          {t('screens:settings.logout')}
        </button>
      </div>
    </div>
  );
};

export default Settings;