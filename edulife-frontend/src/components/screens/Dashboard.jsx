// src/components/screens/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../common/Navbar';
import CourseCard from '../common/CourseCard';

// Импорт изображений
import avatarImage from '../../assets/images/avatar.png';
import notificationIcon from '../../assets/images/notification.png';
import course1Image from '../../assets/images/course1.png';
import course2Image from '../../assets/images/course2.png';
import course3Image from '../../assets/images/course3.png';
import course4Image from '../../assets/images/course4.png';
import course5Image from '../../assets/images/course5.png';
import course6Image from '../../assets/images/course6.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  
  // Пример данных для карточек курсов с использованием импортированных изображений
  const scheduleData = [
    {
      id: 1,
      title: 'UX/UI designer',
      backgroundColor: '#D2FF1F', // Яркий зеленый
      hours: 147,
      people: '10k',
      image: course1Image
    },
    {
      id: 2,
      title: 'SMM & Marketing',
      backgroundColor: '#FF8A65', // Оранжевый/коралловый
      hours: 147,
      people: '10k',
      image: course2Image
    }
  ];
  
  const internshipData = [
    {
      id: 3,
      title: 'Figma components',
      backgroundColor: '#E1BEE7', // Светло-фиолетовый
      hours: 26,
      people: '9k',
      rating: 4.9,
      image: course3Image
    },
    {
      id: 4,
      title: 'Design portfolio + 2 case',
      backgroundColor: '#FFD54F', // Желтый
      hours: 10,
      people: '10k',
      rating: 5.0,
      image: course4Image
    }
  ];
  
  const popularData = [
    {
      id: 5,
      title: 'Adobe Full course',
      backgroundColor: '#FF8A65', // Оранжевый/коралловый
      hours: 147,
      people: '12k',
      price: 800,
      rating: 5.0,
      image: course5Image
    },
    {
      id: 6,
      title: 'JAVA Developer',
      backgroundColor: '#D2FF1F', // Яркий зеленый
      hours: 250,
      people: '10k',
      price: 800,
      rating: 5.0,
      image: course6Image
    }
  ];
  
  const handleNotifications = () => {
    // Навигация на страницу уведомлений
    navigate('/notifications');
  };
  
  return (
    <div className="dashboard-screen">
      {/* Верхняя часть с аватаром и приветствием */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={avatarImage} alt="User avatar" className="avatar-image" />
            <div className="online-indicator"></div>
          </div>
          <p className="greeting">Hello, Jane</p>
        </div>
        <div className="notification-icon" onClick={handleNotifications}>
          <img src={notificationIcon} alt="Notifications" />
          <div className="notification-badge">2</div>
        </div>
      </div>
      
      {/* Секция расписания */}
      <div className="section">
        <h2 className="section-title">Расписание</h2>
        <div className="course-cards-container">
          {scheduleData.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
      
      {/* Секция стажировки */}
      <div className="section">
        <h2 className="section-title">Стажировка</h2>
        <div className="course-cards-container">
          {internshipData.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
      
      {/* Секция популярных курсов */}
      <div className="section">
        <h2 className="section-title">Популярно</h2>
        <div className="course-cards-container">
          {popularData.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
      
      {/* Нижняя навигационная панель */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;
