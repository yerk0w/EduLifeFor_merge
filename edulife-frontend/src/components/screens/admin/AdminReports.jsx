import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const AdminReports = ({ courses = [] }) => {
  const { t } = useTranslation(['admin']);
  const [period, setPeriod] = useState('month');
  const [selectedCourse, setSelectedCourse] = useState('all');
  
  // Данные для графика активности по дням недели
  const activityData = [
    { day: t('activityChart.days.mon'), value: 65 },
    { day: t('activityChart.days.tue'), value: 80 },
    { day: t('activityChart.days.wed'), value: 45 },
    { day: t('activityChart.days.thu'), value: 70 },
    { day: t('activityChart.days.fri'), value: 90 },
    { day: t('activityChart.days.sat'), value: 60 },
    { day: t('activityChart.days.sun'), value: 75 }
  ];

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  };

  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  const handleGenerateReport = () => {
    // Логика для генерации отчета
    console.log('Генерация отчета:', { period, selectedCourse });
  };

  return (
    <div className="admin-reports">
      <h3 className="section-title">{t('adminReports.title')}</h3>
      
      <div className="reports-filters">
        <div className="date-range">
          <label className="filter-label">{t('adminReports.period')}</label>
          <select 
            className="filter-select"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="week">{t('adminReports.period.lastWeek')}</option>
            <option value="month">{t('adminReports.period.lastMonth')}</option>
            <option value="quarter">{t('adminReports.period.lastQuarter')}</option>
            <option value="year">{t('adminReports.period.lastYear')}</option>
            <option value="custom">{t('adminReports.period.custom')}</option>
          </select>
        </div>
        
        <div className="course-filter">
          <label className="filter-label">{t('adminReports.course')}</label>
          <select 
            className="filter-select"
            value={selectedCourse}
            onChange={handleCourseChange}
          >
            <option value="all">{t('adminReports.course.all')}</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="generate-report-button"
          onClick={handleGenerateReport}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M9,7H7V17H9V7M13,7H11V17H13V7M17,7H15V17H17V7Z" />
          </svg>
          {t('adminReports.generateReport')}
        </button>
      </div>
      
      <div className="reports-charts">
        <ActivityChart data={activityData} />
      </div>
    </div>
  );
};

const ActivityChart = ({ data }) => {
  const { t } = useTranslation();
  
  return (
    <div className="chart-container1">
      <h4 className="chart-title">{t('adminReports.studentActivity')}</h4>
      <div className="chart-placeholder">
        <div className="chart-bars">
          {data.map(item => (
            <div 
              key={item.day} 
              className="chart-bar" 
              style={{ height: `${item.value}%` }}
            >
              <span className="bar-value">{item.value}</span>
            </div>
          ))}
        </div>
        <div className="chart-labels">
          {data.map(item => (
            <span key={item.day}>{item.day}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminReports;