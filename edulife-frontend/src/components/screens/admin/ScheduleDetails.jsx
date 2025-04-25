import React from 'react';

const ScheduleDetails = ({ selectedScheduleItem, handleEditSchedule, handleDeleteSchedule }) => {
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

  // Определяем цвет фона в зависимости от типа занятия
  const getBackgroundColor = (lessonType) => {
    switch(lessonType) {
      case 'лекция': return '#4A6CF7';
      case 'практика': return '#5DBB63';
      case 'лаб': return '#FF7F50';
      case 'экзамен': return '#FF5733';
      default: return '#9370DB';
    }
  };

  return (
    <div className="course-details">
      <div className="course-details-header">
        <h3 className="course-details-title">Занятие: {selectedScheduleItem.subject_name}</h3>
        <div className="course-actions">
          <button className="edit-button" onClick={handleEditSchedule}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
            </svg>
            Редактировать
          </button>
          <button className="delete-button" onClick={() => handleDeleteSchedule(selectedScheduleItem.id)}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
            Удалить
          </button>
        </div>
      </div>
      
      <div className="course-preview">
        <div 
          className="course-image-container" 
          style={{ 
            backgroundColor: getBackgroundColor(selectedScheduleItem.lesson_type),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
              {formatTime(selectedScheduleItem.time_start)}
            </div>
            <div style={{ fontSize: '24px' }}>
              {formatDate(selectedScheduleItem.date)}
            </div>
          </div>
        </div>
        
        <div className="course-info">
          <div className="info-group">
            <div className="info-label">Предмет</div>
            <div className="info-value description">{selectedScheduleItem.subject_name}</div>
          </div>
          
          <div className="info-row">
            <div className="info-group half">
              <div className="info-label">Время</div>
              <div className="info-value">{formatTime(selectedScheduleItem.time_start)} - {formatTime(selectedScheduleItem.time_end)}</div>
            </div>
            
            <div className="info-group half">
              <div className="info-label">Тип занятия</div>
              <div className="info-value">{selectedScheduleItem.lesson_type}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Преподаватель</div>
            <div className="info-value">{selectedScheduleItem.teacher_name || "Не указан"}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Группа</div>
            <div className="info-value">{selectedScheduleItem.group_name || "Не указана"}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Аудитория</div>
            <div className="info-value">{selectedScheduleItem.classroom_name}</div>
          </div>
        </div>
      </div>
      
      <div className="schedule-attendance-section">
        <h4 className="subsection-title">Посещаемость</h4>
        <div className="no-homework">
          Данные о посещаемости для этого занятия недоступны.
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetails;