// src/components/screens/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import { formatDate } from '../../utils/dateUtils';
import './Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Получаем уведомления о расписании
      const response = await apiService.schedule.getNotifications();
      setNotifications(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Не удалось загрузить уведомления');
      setLoading(false);
    }
  };
  
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return 'только что';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${getMinuteDeclension(diffInMinutes)} назад`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${getHourDeclension(hours)} назад`;
    } else {
      return formatDate(notificationTime);
    }
  };
  
  const getMinuteDeclension = (minutes) => {
    if (minutes % 10 === 1 && minutes % 100 !== 11) {
      return 'минуту';
    } else if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) {
      return 'минуты';
    } else {
      return 'минут';
    }
  };
  
  const getHourDeclension = (hours) => {
    if (hours % 10 === 1 && hours % 100 !== 11) {
      return 'час';
    } else if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) {
      return 'часа';
    } else {
      return 'часов';
    }
  };
  
  const getNotificationTitle = (notification) => {
    switch(notification.change_type) {
      case 'create':
        return 'Новое занятие в расписании';
      case 'update':
        return 'Изменение в расписании';
      case 'delete':
        return 'Отмена занятия';
      default:
        return 'Уведомление о расписании';
    }
  };
  
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
      
      return details;
    } catch (e) {
      console.error('Error parsing notification details:', e);
      return 'Детали недоступны';
    }
  };
  
  const handleBack = () => {
    navigate(-1);
  };
  
  const handleNotificationClick = (notification) => {
    // По клику на уведомление можно перейти к соответствующему расписанию
    const scheduleId = notification.schedule_id;
    if (scheduleId) {
      navigate(`/schedule/${scheduleId}`);
    }
  };
  
  return (
    <div className="notifications-screen">
      <div className="notifications-header">
        <button className="back-button" onClick={handleBack}>
          &lt;
        </button>
        <h1>Уведомления</h1>
      </div>
      
      {loading ? (
        <div className="loading-indicator">
          <div class="loader">
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__bar"></div>
            <div class="loader__ball"></div>
          </div>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="empty-notifications">
          <p>У вас пока нет уведомлений</p>
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