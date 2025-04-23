import React, { useState } from 'react';
import Navbar from '../common/Navbar';
import ScheduleItem from '../common/ScheduleItem';
import './Schedule.css';

const Schedule = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Индекс выбранного дня в неделе
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(0);

  // Функция для генерации недель
  function generateWeeks(startDate, numberOfWeeks) {
    const weeks = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const week = [];
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + weekIndex * 7);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        week.push({
          day: daysOfWeek[dayIndex],
          date: currentDate.getDate(),
          month: currentDate.getMonth() + 1, // Месяцы начинаются с 0
          year: currentDate.getFullYear()
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  }

  // Начальная дата и количество недель
  const startDate = new Date(2025, 3, 21); // Начальная дата: 20 октября 2023 года (месяцы начинаются с 0)
  const numberOfWeeks = 4; // Количество недель
  const weeks = generateWeeks(startDate, numberOfWeeks);

  // Получаем текущую неделю и день
  const currentWeek = weeks[0]; // Предполагаем, что мы показываем первую неделю

  // Фильтрация расписания
  const scheduleItems = [
    {
      id: 1,
      title: 'Проектирование программного обеспечения',
      time: '09:00-12:30',
      location: 'C 1.3 L 228',
      tasks: 1,
      color: '#E1BEE7', // Светло-фиолетовый
      bgShape: 'flower'
    },
    {
      id: 2,
      title: 'Portfolio Design',
      time: '14:00-15:00',
      location: 'Online',
      tasks: 3,
      color: '#FF8A65', // Оранжевый
      bgShape: 'leaf'
    },
    {
      id: 3,
      title: 'Figures in Figma',
      time: '15:30-17:30',
      location: 'Online',
      tasks: 2,
      color: '#D2FF1F', // Ярко-зеленый
      bgShape: 'blob'
    }
  ];

  const filteredItems = filter === 'all' 
    ? scheduleItems 
    : scheduleItems.filter(item => item.tasks > 0);

  // Обработчики навигации по дням
  const handlePrevDay = () => {
    setSelectedDayIndex(prev => (prev > 0 ? prev - 1 : 6));
  };

  const handleNextDay = () => {
    setSelectedDayIndex(prev => (prev < 6 ? prev + 1 : 0));
  };

  return (
    <div className="schedule-screen">
      <div className="schedule-header">
        <h1>Расписание</h1>
      </div>

      <div className="week-selector">
        <button className="arrow-button prev" onClick={handlePrevDay}>
          <span className="arrow-icon">←</span>
        </button>

        <div className="week-days">
          {currentWeek.map((day, index) => (
            <div 
              key={`${day.day}-${day.date}`} 
              className={`day-item ${selectedDayIndex === index ? 'selected' : ''}`}
              onClick={() => setSelectedDayIndex(index)}
            >
              <span className="day-name">{day.day}</span>
              <span className="day-date">{day.date}.0{day.month}</span>
            </div>
          ))}
        </div>

        <button className="arrow-button next" onClick={handleNextDay}>
          <span className="arrow-icon">→</span>
        </button>
      </div>

      <div className="schedule-content">
        <div className="schedule-content-header">
          <h2>Предметы</h2>
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>
        </div>

        <div className="schedule-items">
          {filteredItems.map(item => (
            <ScheduleItem key={item.id} item={item} />
          ))}
        </div>
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Schedule;