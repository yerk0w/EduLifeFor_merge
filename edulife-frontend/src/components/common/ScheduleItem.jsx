// src/components/common/ScheduleItem.jsx (с встроенными SVG)
import React, {useState} from 'react';
import './ScheduleItem.css';

const ScheduleItem = ({ item }) => {
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
              <span className="location-icon">
                {item.location === 'Online' ? '🌐' : '📍'}
              </span>
              <span>{item.location}</span>
            </div>
        
        {expanded && (
          <div className="schedule-item-details">
            <div className="detail-item">
              <span className="detail-label">Преподаватель:</span>
              <span className="detail-value">Иванов И.И.</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Описание:</span>
              <span className="detail-value">Изучение основных принципов проектирования программного обеспечения.</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Задания:</span>
              <ul className="tasks-list">
                <li>Подготовить презентацию по теме</li>
              </ul>
            </div>
          </div>
        )}
      </div>
      
      <div className={`schedule-item-bg-shape ${item.bgShape}`}></div>
      
      <div className="schedule-item-tasks">
        <span>{item.tasks} {item.tasks === 1 ? 'Task' : 'Tasks'}</span>
      </div>
      
      <button className="expand-button" onClick={toggleExpand}>
        <span className="expand-icon">{expanded ? '↑' : '↓'}</span>
      </button>
    </div>
  );
};

export default ScheduleItem;
