import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

const Header = () => {
  const [userData, setUserData] = useState({
    name: 'Преподаватель',
    role: 'Преподаватель'
  });

  // Получение данных пользователя при загрузке
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (userId) {
          const userInfo = await apiService.auth.getUserById(userId);
          if (userInfo) {
            setUserData({
              name: userInfo.full_name || userInfo.username || 'Преподаватель',
              role: 'Преподаватель'
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при получении данных пользователя:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="admin-header">
      <div className="admin-logo">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
        <h1 className="admin-title">EduLife</h1>
      </div>
      
      <div className="admin-user">
        <div className="user-info1">
          <span className="user-name">{userData.name}</span>
          <span className="user-role">{userData.role}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;