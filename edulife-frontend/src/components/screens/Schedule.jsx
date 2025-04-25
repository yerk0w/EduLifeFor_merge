// src/components/screens/Schedule.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../common/Navbar';
import ScheduleItem from '../common/ScheduleItem';
import './Schedule.css';
import apiService from '../../services/apiService';
import { generateWeeks, formatDate, normalizeDate, compareDates, getCurrentDayOfWeek } from '../../utils/dateUtils';

const Schedule = () => {
  // Устанавливаем выбранный день недели на текущий
  const initializeSelectedDay = () => {
    const currentDayIdx = getCurrentDayOfWeek();
    // Если сегодня рабочий день (пн-пт), выбираем текущий день
    if (currentDayIdx >= 0 && currentDayIdx <= 4) {
      return currentDayIdx;
    }
    // Если выходной (сб-вс), выбираем понедельник
    return 0;
  };

  const [selectedDayIndex, setSelectedDayIndex] = useState(initializeSelectedDay()); // Index of selected day in week
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState(1); // Schedule tab is index 1 in navbar
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get user ID and role from local storage
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Используем утилитную функцию для форматирования даты
  const formatDateString = (dateString) => formatDate(dateString);
  
  // Используем утилитную функцию для генерации недель
  // Initial date and number of weeks
  const today = new Date();
  const currentDayOfWeek = getCurrentDayOfWeek(); // 0 - понедельник, 6 - воскресенье
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - currentDayOfWeek); // Начинаем с понедельника текущей недели
  const numberOfWeeks = 4; // Количество недель
  const weeks = generateWeeks(startOfWeek, numberOfWeeks);

  // Get current week and day
  const currentWeek = weeks[0];

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
        
        // Получаем расписание конкретно для пользователя с учетом его роли
        const response = await apiService.schedule.getScheduleForUser(userId, userRole);
        
        if (response && response.schedule && Array.isArray(response.schedule)) {
          // Transform API response to our schedule item format
          const transformedSchedule = response.schedule.map(item => ({
            id: item.id,
            title: item.subject_name || 'Предмет не указан',
            time: `${item.time_start || '00:00'}-${item.time_end || '00:00'}`,
            location: item.classroom_name || 'Не указано',
            tasks: Math.floor(Math.random() * 3) + 1, // Random number of tasks 1-3 for demo
            color: getRandomColor(item.subject_id), // Generate consistent color based on subject_id
            bgShape: getBgShape(item.lesson_type), // Background shape based on lesson type
            teacher: item.teacher_name || 'Преподаватель не указан',
            dayOfWeek: new Date(item.date).getDay(),
            date: formatDateString(item.date), // Форматируем дату правильно
            lessonType: item.lesson_type || 'Тип занятия не указан'
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
        
        // В случае ошибки, пытаемся получить общее расписание
        try {
          const fallbackResponse = await apiService.schedule.getSchedule({});
          
          if (fallbackResponse && Array.isArray(fallbackResponse)) {
            // Transform API response to our schedule item format
            const transformedSchedule = fallbackResponse.map(item => ({
              id: item.id,
              title: item.subject_name || 'Предмет не указан',
              time: `${item.time_start || '00:00'}-${item.time_end || '00:00'}`,
              location: item.classroom_name || 'Не указано',
              tasks: Math.floor(Math.random() * 3) + 1, // Random number of tasks 1-3 for demo
              color: getRandomColor(item.subject_id), // Generate consistent color based on subject_id
              bgShape: getBgShape(item.lesson_type), // Background shape based on lesson type
              teacher: item.teacher_name || 'Преподаватель не указан',
              dayOfWeek: new Date(item.date).getDay(),
              date: formatDateString(item.date), // Форматируем дату правильно
              lessonType: item.lesson_type || 'Тип занятия не указан'
            }));
            
            setScheduleData(transformedSchedule);
            console.log("Fallback schedule data loaded:", transformedSchedule);
            setError(null); // Сбрасываем ошибку, так как удалось получить данные
          } else {
            console.log("Empty or invalid fallback response");
          }
        } catch (fallbackErr) {
          console.error('Error fetching fallback schedule:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchSchedule();
  }, [userId, userRole]);
  
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

  // Filter schedule items based on selected day and filter option
  const getFilteredItems = () => {
    if (loading || !scheduleData.length) return [];

    // Get the selected date
    const selectedDay = currentWeek[selectedDayIndex];
    const selectedDateFormatted = formatDate(new Date(selectedDay.year, selectedDay.month - 1, selectedDay.date));
    
    console.log("Looking for items with date:", selectedDateFormatted);
    
    // Filter by day first
    let filtered = scheduleData.filter(item => {
      if (!item.date) {
        console.log("Item has no date:", item);
        return false;
      }
      
      console.log(`Comparing dates: Item date ${item.date} vs Selected date ${selectedDateFormatted}`);
      
      // Используем утилитную функцию для сравнения дат
      return compareDates(item.date, selectedDateFormatted);
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