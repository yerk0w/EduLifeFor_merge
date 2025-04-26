// src/components/common/ScheduleItem.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // Импортируйте хук
import './ScheduleItem.css';

const ScheduleItem = ({ item }) => {
  const { t } = useTranslation('common'); // Укажите пространство имён 'common'
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`schedule-item ${expanded ? 'expanded' : ''}`} style={{ backgroundColor: item.color }}>
      <div className="schedule-item-content">
        <h3 className="schedule-item-title">{item.title}</h3>
        <div className="schedule-item-time">{item.time}</div>
        <div className="schedule-item-location">
          <span className="location-icon">{item.location === 'Online' ? '🌐' : '📍'}</span>
          <span>{item.location}</span>
        </div>

        {expanded && (
          <div className="schedule-item-details">
            <div className="detail-item">
              <span className="detail-label">{t('scheduleItem.teacherLabel')}</span>
              <span className="detail-value">{item.teacher || t('scheduleItem.notSpecified')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('scheduleItem.lessonTypeLabel')}</span>
              <span className="detail-value">{item.lessonType || t('scheduleItem.notSpecified')}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">{t('scheduleItem.dateLabel')}</span>
              <span className="detail-value">{item.date}</span>
            </div>
          </div>
        )}
      </div>

      <div className={`schedule-item-bg-shape ${item.bgShape}`}></div>

      <div className="schedule-item-tasks">
        <span>
          {item.tasks}{' '}
          {item.tasks === 1 ? t('scheduleItem.taskSingular') : t('scheduleItem.tasksPlural')}
        </span>
      </div>

      <button className="expand-button" onClick={toggleExpand}>
        <span className="expand-icon">{expanded ? '↑' : '↓'}</span>
      </button>
    </div>
  );
};

export default ScheduleItem;