import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import apiService from '../../services/apiService';
import { formatDate } from '../../utils/dateUtils';
import './Notifications.css';

const Notifications = () => {
  const { t } = useTranslation(['screens']); // Используем пространство имен 'screens' из kz.json
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]); // Состояние для списка уведомлений
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки
  
  // Загружаем уведомления при монтировании компонента
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  // Функция для получения уведомлений
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.schedule.getNotifications();
      setNotifications(response);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка загрузки уведомлений:', err);
      setError(t('screens:notifications.failedToLoad')); // Используем перевод
      setLoading(false);
    }
  };
  
  // Функция для форматирования времени (например, "только что", "5 минут назад")
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return t('screens:notifications.justNow'); // "жаңа ғана"
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${getMinuteDeclension(diffInMinutes)}`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${getHourDeclension(hours)}`;
    } else {
      return formatDate(notificationTime);
    }
  };
  
  // Функция для склонения минут в казахском языке
  const getMinuteDeclension = (minutes) => {
    if (minutes % 10 === 1 && minutes % 100 !== 11) {
      return t('screens:notifications.minuteSingular'); // "минут"
    } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
      return t('screens:notifications.minutePlural2_4'); // "минут"
    } else {
      return t('screens:notifications.minutePlural'); // "минут"
    }
  };
  
  // Функция для склонения часов в казахском языке
  const getHourDeclension = (hours) => {
    if (hours % 10 === 1 && hours % 100 !== 11) {
      return t('screens:notifications.hourSingular'); // "сағат"
    } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
      return t('screens:notifications.hourPlural2_4'); // "сағат"
    } else {
      return t('screens:notifications.hourPlural'); // "сағат"
    }
  };
  
  // Функция для получения заголовка уведомления
  const getNotificationTitle = (notification) => {
    switch(notification.change_type) {
      case 'create':
        return t('screens:notifications.newLesson'); // "Кестедегі жаңа сабақ"
      case 'update':
        return t('screens:notifications.scheduleUpdate'); // "Кестедегі өзгеріс"
      case 'delete':
        return t('screens:notifications.lessonCancellation'); // "Сабақтың күшін жою"
      default:
        return t('screens:notifications.scheduleNotification'); // "Кесте туралы хабарлама"
    }
  };
  
  // Функция для получения деталей уведомления
  const getNotificationDetails = (notification) => {
    try {
      let details = '';
      const newData = notification.new_data ? 
        (typeof notification.new_data === 'string' ? JSON.parse(notification.new_data) : notification.new_data) 
        : null;
      
      const prevData = notification.previous_data ? 
        (typeof notification.previous_data === 'string' ? JSON.parse(notification.previous_data) : notification.previous_data) 
        : null;
      
      if (notification.change_type === 'create' && newData) {
        const date = newData.date ? formatDate(newData.date) : '';
        const subject = newData.subject_name || '';
        const timeStart = newData.time_start || '';
        details = `${subject}, ${date} ${timeStart.substring(0, 5)}`;
      } else if (notification.change_type === 'update' && prevData) {
        const date = prevData.date ? formatDate(prevData.date) : '';
        const subject = prevData.subject_name || '';
        const timeStart = prevData.time_start || '';
        details = `${subject}, ${date} ${timeStart.substring(0, 5)}`;
      } else if (notification.change_type === 'delete' && prevData) {
        const date = prevData.date ? formatDate(prevData.date) : '';
        const subject = prevData.subject_name || '';
        const timeStart = prevData.time_start || '';
        details = `${subject}, ${date} ${timeStart.substring(0, 5)}`;
      }
      
      return details || t('screens:notifications.detailsNotAvailable'); // Используем перевод, если деталей нет
    } catch (e) {
      console.error('Ошибка парсинга деталей уведомления:', e);
      return t('screens:notifications.detailsNotAvailable'); // "Мәліметтер қолжетімді емес"
    }
  };
  
  // Обработчик возврата на предыдущую страницу
  const handleBack = () => {
    navigate(-1);
  };
  
  // Обработчик клика по уведомлению
  const handleNotificationClick = (notification) => {
    const scheduleId = notification.schedule_id;
    if (scheduleId) {
      navigate(`/schedule/${scheduleId}`);
    }
  };
  
  return (
    <div className="notifications-screen">
      <div className="notifications-header">
        <button className="back-button5" onClick={handleBack}>
          &lt;
        </button>
        <h1>{t('screens:notifications.notifications')}</h1> {/* Используем перевод */}
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <div className="loader">
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__ball"></div>
          </div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-notifications">
          <p>{t('screens:notifications.noNotifications')}</p> {/* Используем перевод */}
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className="notification-item"
              onClick={() => handleNotificationClick(notification)}
            >
              <h3>{getNotificationTitle(notification)}</h3>
              <p>{getNotificationDetails(notification)}</p>
              <span className="notification-time">
                {formatTimeAgo(notification.created_at)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;