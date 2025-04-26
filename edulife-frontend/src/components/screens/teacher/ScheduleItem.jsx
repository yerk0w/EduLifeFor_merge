import React from 'react';

const ScheduleItem = ({ item, onSubjectSelect, isToday = false }) => {
  // Получаем данные предмета из предоставленного объекта
  // Поддержка разных форматов данных API
  const safeItem = {
    subject_name: item.subject_name || 'Неизвестный предмет',
    group_name: item.group_name || 'Группа не указана',
    room_number: item.room_number || item.cabinet || 'Аудитория не указана',
    time_start: item.time_start || '',
    time_end: item.time_end || '',
    subject_id: item.subject_id || 0,
    teacher_id: item.teacher_id || 0,
    day_of_week: item.day_of_week || 0,
    shift_id: item.shift_id || 1,
    group_size: item.group_size || 0,
    date: item.date || null,
    id: item.id || 0
  };

  console.log("Обработка элемента расписания:", safeItem);

  // Генерация цвета на основе имени предмета
  const getSubjectColor = (subjectName) => {
    if (!subjectName) return '#4A6CF7'; // Дефолтный цвет
    
    // Простой алгоритм для генерации цвета на основе строки
    let hash = 0;
    for (let i = 0; i < subjectName.length; i++) {
      hash = subjectName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      '#4A6CF7', // Синий
      '#F76C6C', // Красный
      '#6CF7B0', // Зеленый
      '#F7B96C', // Оранжевый
      '#B96CF7', // Фиолетовый
      '#6CC3F7', // Голубой
      '#F76CC3'  // Розовый
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Функция для форматирования времени
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    // Если время уже в формате ЧЧ:ММ или ЧЧ:ММ:СС, форматируем его
    if (timeString.includes(':')) {
      // Убираем секунды, если они есть
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
      return timeString;
    }
    
    // Пробуем конвертировать из формата ISO
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        return timeString; // Если не удалось преобразовать
      }
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      console.error("Ошибка форматирования времени:", e);
      return timeString;
    }
  };

  const subjectColor = getSubjectColor(safeItem.subject_name);
  
  // Если это текущее занятие (проверка по текущему времени)
  const isCurrentClass = () => {
    if (!isToday) return false;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // Пытаемся получить времена начала и конца
    let startTime, endTime;
    
    try {
      const startParts = formatTime(safeItem.time_start).split(':');
      const endParts = formatTime(safeItem.time_end).split(':');
      
      if (startParts.length !== 2 || endParts.length !== 2) {
        return false; // Неправильный формат времени
      }
      
      startTime = parseInt(startParts[0]) * 60 + parseInt(startParts[1]);
      endTime = parseInt(endParts[0]) * 60 + parseInt(endParts[1]);
      
      return currentTime >= startTime && currentTime <= endTime;
    } catch (e) {
      console.error("Ошибка определения текущего занятия:", e);
      return false;
    }
  };
  
  const currentClass = isCurrentClass();

  // Обработчик клика, передаём все необходимые поля для создания QR-кода
  const handleClick = () => {
    // Создаем объект с только необходимыми свойствами для генерации QR-кода
    const qrData = {
      subject_id: safeItem.subject_id,
      subject_name: safeItem.subject_name,
      teacher_id: safeItem.teacher_id,
      day_of_week: safeItem.day_of_week,
      shift_id: safeItem.shift_id,
      group_name: safeItem.group_name,
      group_size: safeItem.group_size,
      room_number: safeItem.room_number,
      time_start: safeItem.time_start,
      time_end: safeItem.time_end,
      date: safeItem.date,
      id: safeItem.id
    };
    
    onSubjectSelect(qrData);
  };

  return (
    <div 
      className={`course-list-item schedule-item ${currentClass ? 'current-class' : ''}`}
      onClick={handleClick}
    >
      <div className="course-color" style={{ backgroundColor: subjectColor }}></div>
      <div className="course-list-content">
        <div className="course-list-title">{safeItem.subject_name}</div>
        <div className="schedule-details">
          <div className="schedule-time">
            {formatTime(safeItem.time_start)} - {formatTime(safeItem.time_end)}
          </div>
          <div className="schedule-location">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z" />
            </svg>
            {safeItem.room_number}
          </div>
        </div>
        <div className="schedule-group">
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
          </svg>
          {safeItem.group_name}
        </div>
        {safeItem.date && (
          <div className="schedule-date">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M19,19H5V8H19M16,1V3H8V1H6V3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3H18V1" />
            </svg>
            {new Date(safeItem.date).toLocaleDateString()}
          </div>
        )}
      </div>
      
      {isToday && (
        <div className="generate-qr-button" onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
          </svg>
          <span>QR-код</span>
        </div>
      )}
    </div>
  );
};

export default ScheduleItem;