// src/components/screens/Schedule.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import ScheduleItem from '../common/ScheduleItem';
import './Schedule.css';
import apiService from '../../services/apiService';

const Schedule = () => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // Index of selected day in week
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(1); // Schedule tab is index 1 in navbar
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user ID and role from local storage
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Fetch schedule from API
  useEffect(() => {
    const fetchSchedule = async () => {
      if (!userId) {
        setError('Пользователь не авторизован');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Напрямую обращаемся к API расписания
        // Используем любые доступные параметры фильтрации, не зависящие от роли пользователя
        const response = await apiService.schedule.getSchedule({});
        
        if (response && Array.isArray(response)) {
          // Transform API response to our schedule item format
          const transformedSchedule = response.map(item => ({
            id: item.id,
            title: item.subject_name,
            time: `${item.time_start}-${item.time_end}`,
            location: item.classroom_name || 'Не указано',
            tasks: Math.floor(Math.random() * 3) + 1, // Random number of tasks 1-3 for demo
            color: getRandomColor(item.subject_id), // Generate consistent color based on subject_id
            bgShape: getBgShape(item.lesson_type), // Background shape based on lesson type
            teacher: item.teacher_name,
            dayOfWeek: new Date(item.date).getDay(),
            date: formatDateString(item.date), // Форматируем дату правильно
            lessonType: item.lesson_type
          }));
          
          setScheduleData(transformedSchedule);
          console.log("Successfully loaded schedule data:", transformedSchedule);
        } else {
          console.log("Empty or invalid response from API:", response);
          setScheduleData([]);
        }
      } catch (err) {
        console.error('Error fetching schedule:', err);
        setError(`Ошибка при загрузке расписания: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [userId]);
  
  // Функция для правильного форматирования даты из API в формат dd.mm.yyyy
  const formatDateString = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Если не удалось распарсить дату
        return dateString;
      }
      
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}.${month}.${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString; // Возвращаем исходную строку, если произошла ошибка
    }
  };
  
  // Helper function to get consistent color based on subject ID
  const getRandomColor = (subjectId = 0) => {
    const colors = [
      '#E1BEE7', // Light purple
      '#FF8A65', // Orange
      '#D2FF1F', // Bright green
      '#5AC8FA', // Light blue
      '#FFCC00', // Yellow
      '#FF6B8B', // Pink
    ];
    // Use the subject ID to choose a color deterministically
    return colors[Math.abs(subjectId) % colors.length];
  };
  
  // Helper function to get background shape based on lesson type
  const getBgShape = (lessonType) => {
    const shapes = ['flower', 'leaf', 'blob'];

    if (lessonType && typeof lessonType === 'string') {
      if (lessonType.includes('лекция')) return 'flower';
      if (lessonType.includes('практика')) return 'leaf';
    }
    return 'blob'; // Default
  };

  // Function to generate weeks
  function generateWeeks(startDate, numberOfWeeks) {
    const weeks = [];
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let weekIndex = 0; weekIndex < numberOfWeeks; weekIndex++) {
      const week = [];
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + weekIndex * 7);

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(currentDate);
        week.push({
          day: daysOfWeek[dayIndex],
          date: date.getDate(),
          month: date.getMonth() + 1, // Months start from 0
          year: date.getFullYear(),
          fullDate: date
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push(week);
    }

    return weeks;
  }

  // Initial date and number of weeks
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Start from Monday
  const numberOfWeeks = 4; // Number of weeks
  const weeks = generateWeeks(startOfWeek, numberOfWeeks);

  // Get current week and day
  const currentWeek = weeks[0];

  // Filter schedule items based on selected day and filter option
  const getFilteredItems = () => {
    if (loading || !scheduleData.length) return [];

    // Get the selected date
    const selectedDay = currentWeek[selectedDayIndex];
    const selectedDate = `${selectedDay.date}.${selectedDay.month < 10 ? '0' + selectedDay.month : selectedDay.month}.${selectedDay.year}`;
    
    console.log("Looking for items with date:", selectedDate);
    
    // Filter by day first
    let filtered = scheduleData.filter(item => {
      if (!item.date) {
        console.log("Item has no date:", item);
        return false;
      }
      
      console.log(`Comparing dates: Item date ${item.date} vs Selected date ${selectedDate}`);
      
      try {
        // Проверяем, что item.date соответствует формату дд.мм.гггг
        const itemDateParts = item.date.split('.');
        if (itemDateParts.length !== 3) {
          console.log("Item date format is invalid:", item.date);
          return false;
        }
        
        const itemDate = `${itemDateParts[0]}.${itemDateParts[1]}.${itemDateParts[2]}`;
        return itemDate === selectedDate;
      } catch (error) {
        console.error("Error comparing dates:", error);
        return false;
      }
    });
    
    console.log("Filtered items for the selected date:", filtered);
    
    // Apply additional filter if needed
    if (filter === 'unread') {
      filtered = filtered.filter(item => item.tasks > 0);
      console.log("After unread filter:", filtered);
    }
    
    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Handlers for day navigation
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

      {loading ? (
        <div className="loading-container">
          <p>Загрузка расписания...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
        </div>
      ) : (
        <>
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
                  <span className="day-date">{day.date}.{day.month < 10 ? '0' + day.month : day.month}</span>
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
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <ScheduleItem key={item.id} item={item} />
                ))
              ) : (
                <div className="empty-schedule">
                  <p>Нет занятий на выбранный день</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Schedule;