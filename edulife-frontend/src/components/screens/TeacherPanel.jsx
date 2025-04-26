// src/components/screens/TeacherPanel.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/apiService';
import './admin/AdminPanel.css';
import './teacher/TeacherStyles.css';
import Sidebar from './teacher/Sidebar';
import Header from './teacher/Header';
import ScheduleTab from './teacher/ScheduleTab';
import QRCodeTab from './teacher/QRCodeTab';

const TeacherPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedule, setSchedule] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [teacherId, setTeacherId] = useState(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem('userId');
        
        // Сначала получаем информацию о преподавателе (ID преподавателя может отличаться от ID пользователя)
        const teacherInfo = await apiService.auth.getTeacherByUser(userId);
        console.log('Информация о преподавателе:', teacherInfo);
        
        // Если удалось получить информацию о преподавателе, используем его ID
        if (teacherInfo && teacherInfo.id) {
          setTeacherId(teacherInfo.id);
          
          // Получение расписания преподавателя по ID преподавателя
          const scheduleData = await apiService.schedule.getTeacherSchedule(teacherInfo.id);
          console.log('Расписание преподавателя:', scheduleData);
          setSchedule(scheduleData || []);
        } else {
          // Если не удалось получить ID преподавателя, пробуем использовать ID пользователя как запасной вариант
          console.warn('Не удалось получить ID преподавателя, используем ID пользователя');
          setTeacherId(userId);
          
          const scheduleData = await apiService.schedule.getTeacherSchedule(userId);
          setSchedule(scheduleData || []);
        }
        
        // Получение списка предметов
        const subjectsResponse = await apiService.qr.getSubjects();
        setSubjects(subjectsResponse || []);
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleBack = () => {
    navigate('/');
  };

  // Обработчик для выбора предмета при генерации QR-кода
  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setActiveTab('qrcode');
  };

  return (
    <div className="admin-panel">
      <Header />
      
      <div className="admin-content">
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleBack={handleBack} 
        />
        
        <div className="admin-main">
          {loading ? (
            <div className="loading-indicator">Загрузка данных...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <>
              {activeTab === 'schedule' && (
                <ScheduleTab 
                  schedule={schedule} 
                  onSubjectSelect={handleSubjectSelect} 
                />
              )}
              
              {activeTab === 'qrcode' && (
                <QRCodeTab 
                  selectedSubject={selectedSubject} 
                  userId={teacherId || localStorage.getItem('userId')}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherPanel;