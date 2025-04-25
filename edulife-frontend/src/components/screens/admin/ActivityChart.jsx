import React from 'react';

const ActivityChart = () => {
  const chartData = [
    { day: 'Пн', value: 65 },
    { day: 'Вт', value: 80 },
    { day: 'Ср', value: 45 },
    { day: 'Чт', value: 70 },
    { day: 'Пт', value: 90 },
    { day: 'Сб', value: 60 },
    { day: 'Вс', value: 75 }
  ];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">Активность студентов</h4>
        <div className="chart-period">
          <select className="period-select">
            <option value="week">За неделю</option>   
            <option value="month" selected>За месяц</option>
            <option value="year">За год</option>
          </select>
        </div>
      </div>
      <div className="chart-content">
        <div className="chart-bars">
          {chartData.map(item => (
            <div 
              key={item.day} 
              className="chart-bar" 
              style={{ height: `${item.value}%` }}
            >
              <div className="bar-tooltip">{item.value}</div>
            </div>
          ))}
        </div>
        <div className="chart-labels">
          {chartData.map(item => (
            <span key={item.day}>{item.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityChart;