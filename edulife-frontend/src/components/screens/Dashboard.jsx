import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import './Dashboard.css';
import Navbar from '../common/Navbar';
import CourseCard from '../common/CourseCard';
import apiService from '../../services/apiService';

// Импортируем изображения
import avatarImage from '../../assets/images/avatar.png';
import notificationIcon from '../../assets/images/notification.png';

const Dashboard = () => {
  const { t } = useTranslation(['screens']); // Используем пространство имен 'screens' из kz.json
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // Состояние активной вкладки
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [error, setError] = useState(null); // Состояние ошибки
  const [userData, setUserData] = useState(null); // Данные пользователя
  const [scheduleData, setScheduleData] = useState([]); // Данные расписания
  const [coursesData, setCoursesData] = useState([]); // Данные курсов
  
  // Получаем ID пользователя и роль из локального хранилища
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Загружаем данные пользователя и расписание при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      // Проверяем, авторизован ли пользователь
      if (!userId) {
        setError(t('screens:dashboard.userNotAuthenticated')); // Используем перевод
        setLoading(false);
        navigate('/logreg'); // Перенаправляем на страницу входа/регистрации
        return;
      }
      
      try {
        setLoading(true);
        
        // Запрашиваем данные пользователя
        const userResponse = await apiService.auth.getUserById(userId);
        setUserData(userResponse);
        
        console.log("Данные пользователя:", userResponse);
        
        // Запрашиваем расписание
        const scheduleResponse = await apiService.schedule.getScheduleForUser(userId, userRole);
        console.log("Данные расписания:", scheduleResponse);
        
        // Проверяем, есть ли данные расписания
        if (scheduleResponse && scheduleResponse.schedule && Array.isArray(scheduleResponse.schedule)) {
          const subjectMap = new Map();
          
          // Группируем данные по предметам для создания карточек курсов
          scheduleResponse.schedule.forEach(item => {
            const subjectId = item.subject_id || 0;
            if (!subjectMap.has(subjectId)) {
              const color = getRandomColor(subjectId);
              
              subjectMap.set(subjectId, {
                id: subjectId,
                title: item.subject_name || 'Предмет',
                backgroundColor: color,
                hours: `${Math.floor(Math.random() * 30) + 10}h`, // Примерное количество часов
                people: `${Math.floor(Math.random() * 50) + 50}`, // Примерное количество людей
                image: null
              });
            }
          });
          
          const courses = Array.from(subjectMap.values());
          console.log("Сгенерированные курсы:", courses);
          
          setCoursesData(courses);
          setScheduleData(scheduleResponse.schedule);
        } else {
          console.log("Данные расписания отсутствуют или пусты");
          setCoursesData([]);
          setScheduleData([]);
        }
      } catch (err) {
        console.error('Ошибка при загрузке данных:', err);
        setError(`${t('screens:dashboard.failedToLoadData')} ${err.message || 'Неизвестная ошибка'}`); // Используем перевод
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, userRole, navigate, t]); // Добавляем t в зависимости
  
  // Функция для получения цвета на основе ID предмета
  const getRandomColor = (subjectId) => {
    const colors = [
      '#D2FF1F', // Ярко-зеленый
      '#FF8A65', // Оранжевый/коралловый
      '#E1BEE7', // Светло-фиолетовый
      '#FFD54F', // Желтый
      '#9C7AE2', // Фиолетовый
      '#5AC8FA', // Светло-голубой
    ];
    const id = parseInt(subjectId) || 0;
    return colors[id % colors.length];
  };
  
  // Обработчик перехода на страницу уведомлений
  const handleNotifications = () => {
    navigate('/notifications');
  };
  
  // Отображаем состояние загрузки
  if (loading) {
    return (
      <div className="dashboard-screen">
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
      </div>
    );
  }
  
  // Отображаем состояние ошибки
  if (error) {
    return (
      <div className="dashboard-screen">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/logreg')}>
          {t('screens:dashboard.backToLogin')} {/* Используем перевод */}
        </button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-screen">
      {/* Заголовок с аватаром и приветствием */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={avatarImage} alt="Аватар пользователя" className="avatar-image" />
            <div className="online-indicator"></div>
          </div>
          <p className="greeting">
            {t('dashboard.greeting')}{userData?.full_name?.split(' ')[0] || 'User'}
          </p>
        </div>
        <div className="notification-icon" onClick={handleNotifications}>
          <img src={notificationIcon} alt="Уведомления" />
        </div>
      </div>
      
      {/* Секция расписания */}
      {coursesData.length > 0 ? (
        <div className="section">
          <h2 className="section-title">{t('screens:dashboard.schedule')}</h2>
          <div className="course-cards-container">
            {coursesData.slice(0, 2).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div className="section">
          <h2 className="section-title">{t('screens:dashboard.schedule')}</h2>
          <p className="no-data-message">{t('screens:dashboard.scheduleNotAvailable')}</p>
        </div>
      )}
      
      {/* Секция стажировки (показываем, если есть больше 2 курсов) */}
      {coursesData.length > 2 && (
        <div className="section">
          <h2 className="section-title">{t('screens:dashboard.internship')}</h2>
          <div className="course-cards-container">
            {coursesData.slice(2, 4).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
      
      {/* Секция популярных курсов */}
      <div className="section">
        <h2 className="section-title">{t('screens:dashboard.popular')}</h2>
        <div className="course-cards-container">
          {coursesData.length > 0 ? (
            <div>
              {coursesData.slice(0, 2).map((course, idx) => (
                <CourseCard 
                  key={`popular-${course.id}-${idx}`} 
                  course={{
                    ...course,
                    backgroundColor: getRandomColor(course.id + 10)
                  }} 
                />
              ))}
            </div>
          ) : (
            <p className="no-data-message">{t('screens:dashboard.coursesNotFound')}</p>
          )}
        </div>
      </div>
      
      {/* Нижняя панель навигации */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;