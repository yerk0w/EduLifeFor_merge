// src/components/screens/teacher/ScheduleTab.jsx
import React, { useState, useEffect } from 'react';
import ScheduleItem from './ScheduleItem';

const ScheduleTab = ({ schedule, onSubjectSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [scheduleByDay, setScheduleByDay] = useState({});
  
  // Дни недели для отображения
  const daysOfWeek = [
    'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'
  ];
  
  // Определение дня недели из даты
  const getDayOfWeekFromDate = (dateString) => {
    try {
      if (!dateString) return null;
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // getDay() возвращает 0 для воскресенья, 1 для понедельника, и т.д.
      // Преобразуем к нашему формату (1 - понедельник, 6 - суббота)
      const day = date.getDay();
      return day === 0 ? 7 : day;
    } catch (e) {
      console.error("Ошибка при определении дня недели из даты:", e);
      return null;
    }
  };
  
  // Группировка занятий по дням недели при изменении расписания
  useEffect(() => {
    console.log("Обработка расписания:", schedule);
    const groupedSchedule = {};
    
    // Инициализация пустыми массивами для каждого дня
    daysOfWeek.forEach((day, index) => {
      groupedSchedule[index + 1] = [];
    });
    
    // Проверка, что расписание - это массив
    if (Array.isArray(schedule)) {
      // Сортировка занятий по времени начала
      const sortedSchedule = [...schedule].sort((a, b) => {
        const timeA = a.time_start ? a.time_start.replace(':', '') : '0000';
        const timeB = b.time_start ? b.time_start.replace(':', '') : '0000';
        return parseInt(timeA) - parseInt(timeB);
      });
      
      // Заполнение расписания
      sortedSchedule.forEach(item => {
        // Используем день недели из даты, если доступно, или напрямую из day_of_week
        let dayOfWeek = item.day_of_week;
        
        if (!dayOfWeek && item.date) {
          dayOfWeek = getDayOfWeekFromDate(item.date);
        }
        
        // Проверяем, что день недели корректный (от 1 до 6)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          groupedSchedule[dayOfWeek].push(item);
        } else {
          console.warn("Не удалось определить день недели для занятия:", item);
        }
      });
    }
    
    console.log("Сгруппированное расписание:", groupedSchedule);
    setScheduleByDay(groupedSchedule);
  }, [schedule]);
  
  // Фильтрация расписания по поисковому запросу
  const getFilteredSchedule = () => {
    if (!searchQuery) return [];
    
    if (Array.isArray(schedule)) {
      return schedule.filter(item => 
        (item.subject_name && item.subject_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.group_name && item.group_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.room_number && item.room_number.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return [];
  };
  
  const filteredSchedule = getFilteredSchedule();
  
  // Отображение сегодняшнего дня первым
  const currentDayIndex = new Date().getDay();
  // Корректируем индекс (чтобы 1 был понедельник, а не воскресенье)
  const adjustedCurrentDay = currentDayIndex === 0 ? 7 : currentDayIndex;

  return (
    <div className="admin-courses">
      <div className="courses-header">
        <h3 className="section-title">Расписание занятий</h3>
        {Array.isArray(schedule) && schedule.length === 0 && (
          <div className="no-schedule-warning">
            Расписание не найдено. Обратитесь к администратору для назначения занятий.
          </div>
        )}
      </div>
      
      <div className="search-container">
        <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
        <input 
          type="text" 
          className="search-input5" 
          placeholder="Поиск по предмету, группе или аудитории..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {searchQuery ? (
        // Отображение результатов поиска
        <div className="schedule-search-results">
          <h4>Результаты поиска</h4>
          {filteredSchedule.length > 0 ? (
            <div className="schedule-day-items">
              {filteredSchedule.map((item, index) => (
                <ScheduleItem 
                  key={`search-${index}`} 
                  item={item} 
                  onSubjectSelect={onSubjectSelect} 
                />
              ))}
            </div>
          ) : (
            <p className="no-results">Занятия не найдены</p>
          )}
        </div>
      ) : (
        // Отображение расписания по дням недели
        <div className="schedule-days">
          {/* Сначала показываем текущий день */}
          <div className="schedule-day current-day">
            <h4 className="day-title">{daysOfWeek[adjustedCurrentDay - 1]} (Сегодня)</h4>
            {scheduleByDay[adjustedCurrentDay]?.length > 0 ? (
              <div className="schedule-day-items">
                {scheduleByDay[adjustedCurrentDay].map((item, index) => (
                  <ScheduleItem 
                    key={`today-${index}`} 
                    item={item} 
                    onSubjectSelect={onSubjectSelect} 
                    isToday={true}
                  />
                ))}
              </div>
            ) : (
              <p className="no-classes">Нет занятий</p>
            )}
          </div>
          
          {/* Затем остальные дни недели */}
          {daysOfWeek.map((day, index) => {
            const dayIndex = index + 1;
            if (dayIndex === adjustedCurrentDay) return null; // Пропускаем текущий день, т.к. он уже отображен
            
            return (
              <div className="schedule-day" key={dayIndex}>
                <h4 className="day-title">{day}</h4>
                {scheduleByDay[dayIndex]?.length > 0 ? (
                  <div className="schedule-day-items">
                    {scheduleByDay[dayIndex].map((item, idx) => (
                      <ScheduleItem 
                        key={`day${dayIndex}-${idx}`} 
                        item={item} 
                        onSubjectSelect={onSubjectSelect} 
                      />
                    ))}
                  </div>
                ) : (
                  <p className="no-classes">Нет занятий</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;