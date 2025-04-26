import React from 'react';
import { useTranslation } from 'react-i18next';

const ActivityChart = () => {
  const { t } = useTranslation(['admin']);

  const chartData = [
    { day: t('activityChart.days.mon'), value: 65 },
    { day: t('activityChart.days.tue'), value: 80 },
    { day: t('activityChart.days.wed'), value: 45 },
    { day: t('activityChart.days.thu'), value: 70 },
    { day: t('activityChart.days.fri'), value: 90 },
    { day: t('activityChart.days.sat'), value: 60 },
    { day: t('activityChart.days.sun'), value: 75 }
  ];

  return (
    <div className="chart-card">
      <div className="chart-header">
        <h4 className="chart-title">{t('activityChart.title')}</h4>
        <div className="chart-period">
          <select className="period-select">
            <option value="week">{t('activityChart.period.week')}</option>   
            <option value="month" selected>{t('activityChart.period.month')}</option>
            <option value="year">{t('activityChart.period.year')}</option>
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