import React from 'react';

const ScheduleList = ({ 
  scheduleItems, 
  selectedScheduleItem, 
  searchQuery, 
  setSearchQuery, 
  handleScheduleSelect, 
  handleAddSchedule 
}) => {
  // Функция для форматирования даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  // Функция для форматирования времени
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Преобразуем '08:30:00' в '08:30'
    return timeString.substring(0, 5);
  };

  // Группировка расписания по датам
  const groupedSchedule = scheduleItems.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});

  // Сортировка дат
  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  return (
    <div className="courses-list-container">
      <div className="courses-header">
        <h3 className="section-title">Расписание</h3>
        <button className="add-course-button" onClick={handleAddSchedule}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Добавить занятие
        </button>
      </div>
      
      <div className="search-container">
        <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
        <input 
          type="text" 
          className="search-input5" 
          placeholder="Поиск в расписании..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="courses-list">
        {sortedDates.map(date => (
          <div key={date} className="schedule-date-group">
            <div className="schedule-date-header">
              {formatDate(date)}
            </div>
            {groupedSchedule[date].sort((a, b) => a.time_start.localeCompare(b.time_start)).map(scheduleItem => (
              <div 
                key={scheduleItem.id} 
                className={`course-list-item ${selectedScheduleItem && selectedScheduleItem.id === scheduleItem.id ? 'active' : ''}`}
                onClick={() => handleScheduleSelect(scheduleItem)}
              >
                <div className="course-color" style={{ backgroundColor: scheduleItem.lesson_type === 'лекция' ? '#4A6CF7' : 
                                                       scheduleItem.lesson_type === 'практика' ? '#5DBB63' : 
                                                       scheduleItem.lesson_type === 'лаб' ? '#FF7F50' : 
                                                       scheduleItem.lesson_type === 'экзамен' ? '#FF5733' : '#9370DB' }}></div>
                <div className="course-list-content">
                  <div className="course-list-title">
                    {formatTime(scheduleItem.time_start)} - {formatTime(scheduleItem.time_end)} • {scheduleItem.subject_name}
                  </div>
                  <div className="course-list-stats">
                    <span className="course-stat">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                      </svg>
                      {scheduleItem.teacher_name || "Преподаватель не указан"}
                    </span>
                    <span className="course-stat">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
                      </svg>
                      {scheduleItem.group_name || "Группа не указана"}
                    </span>
                    <span className="course-stat">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M19,7H11V14H3V5H1V20H3V17H21V20H23V11A4,4 0 0,0 19,7M7,13A3,3 0 0,0 4,10A3,3 0 0,0 7,7A3,3 0 0,0 10,10A3,3 0 0,0 7,13Z" />
                      </svg>
                      {scheduleItem.classroom_name || "Аудитория не указана"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScheduleList;