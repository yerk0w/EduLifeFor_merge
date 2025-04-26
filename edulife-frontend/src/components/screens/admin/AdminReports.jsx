import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { formatDate } from '../../../utils/dateUtils';
import { exportStatsToExcel } from '../../../utils/exportUtils';
import { printAttendanceReport } from '../../../utils/printUtils';
import ActivityChart from './ActivityChart.jsx'; 
import StatsDashboard from './StatsDashboard.jsx'; 
import TrendChart from './TrendChart'; 
import StatsCards from './StatsCards'; 
import LoadingIndicator from './LoadingIndicator.jsx'; 
import InfoTooltip from './InfoTooltip.jsx'; 

const AdminReports = ({ courses = [] }) => {
  const [period, setPeriod] = useState('month');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDates, setShowCustomDates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Получение статистики при загрузке и изменении фильтров
  useEffect(() => {
    fetchStatistics();
  }, [period, selectedCourse]);

  // Функция для получения дат по выбранному периоду
  const getDateRangeByPeriod = (periodType) => {
    const today = new Date();
    const end = formatDate(today);

    let start = new Date(today);
    
    switch (periodType) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        start.setMonth(today.getMonth() - 1); // по умолчанию месяц
    }

    return {
      startDate: formatDate(start),
      endDate: end
    };
  };

  // Получение статистики с сервера
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      let dates = {};

      if (period === 'custom' && startDate && endDate) {
        dates = { startDate, endDate };
      } else {
        dates = getDateRangeByPeriod(period);
      }

      // Используем новый метод для получения обогащенной статистики
      const response = await apiService.qr.getEnrichedAttendanceStats(dates.startDate, dates.endDate);
      
      if (response && response.stats) {
        setStats(response.stats);
        
        // Собираем уникальные предметы из статистики с их названиями
        const uniqueSubjects = new Map();
        response.stats.forEach(item => {
          if (item.subject_id && !uniqueSubjects.has(item.subject_id)) {
            uniqueSubjects.set(item.subject_id, {
              id: item.subject_id,
              name: item.subject_name || `Предмет ${item.subject_id}`
            });
          }
        });
        
        setSubjects(Array.from(uniqueSubjects.values()));
      }
    } catch (error) {
      console.error('Ошибка при получении статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения периода
  const handlePeriodChange = (e) => {
    const newPeriod = e.target.value;
    setPeriod(newPeriod);
    setShowCustomDates(newPeriod === 'custom');
  };

  // Обработчик изменения курса
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
  };

  // Обработчик изменения предмета
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  // Обработчик кнопки генерации отчета
  const handleGenerateReport = () => {
    fetchStatistics();
  };
  
  // Обработчик кнопки экспорта в Excel
  const handleExportToExcel = () => {
    if (stats && stats.length > 0) {
      const selectedPeriodText = period === 'custom' 
        ? `${startDate}_${endDate}` 
        : period;
      
      const filename = `attendance_stats_${selectedPeriodText}`;
      exportStatsToExcel(stats, filename);
    } else {
      alert('Нет данных для экспорта. Сначала сформируйте отчет.');
    }
  };
  
  // Обработчик кнопки печати отчета
  const handlePrintReport = () => {
    if (stats && stats.length > 0) {
      printAttendanceReport(stats, { 
        period, 
        startDate: period === 'custom' ? startDate : undefined, 
        endDate: period === 'custom' ? endDate : undefined 
      });
    } else {
      alert('Нет данных для печати. Сначала сформируйте отчет.');
    }
  };

  // Подготовка данных для графика по дням недели
  const prepareActivityData = () => {
    // Инициализация данных по дням недели
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    const dayStats = daysOfWeek.map(day => ({ day, value: 0 }));
    
    // Фильтрация по выбранному предмету, если выбран
    let filteredStats = stats;
    if (selectedSubject !== 'all') {
      filteredStats = stats.filter(item => item.subject_id.toString() === selectedSubject);
    }
    
    // Подсчет посещений по дням недели
    filteredStats.forEach(item => {
      if (item.day_of_week >= 0 && item.day_of_week <= 6) {
        dayStats[item.day_of_week].value += item.attendance_count;
      }
    });
    
    // Нормализация значений для отображения (0-100%)
    const maxValue = Math.max(...dayStats.map(item => item.value), 1);
    return dayStats.map(item => ({
      ...item,
      value: Math.round((item.value / maxValue) * 100)
    }));
  };

  const activityData = prepareActivityData();

  return (
    <div className="admin-reports">
      <h3 className="section-title">
        Посещаемость
        <InfoTooltip text="Статистика посещаемости студентами занятий. Информация собирается на основе сканирования QR-кодов при посещении занятий." />
      </h3>
      
      <div className="reports-filters">
        <div className="date-range">
          <label className="filter-label">
            Период:
            <InfoTooltip text="Выберите период времени для анализа статистики посещений" position="right" />
          </label>
          <select 
            className="filter-select"
            value={period}
            onChange={handlePeriodChange}
          >
            <option value="week">Последняя неделя</option>
            <option value="month">Последний месяц</option>
            <option value="quarter">Последний квартал</option>
            <option value="year">Последний год</option>
            <option value="custom">Произвольный период</option>
          </select>
        </div>
        
        {showCustomDates && (
          <div className="custom-date-range">
            <div className="date-input">
              <label className="filter-label">С:</label>
              <input 
                type="date" 
                className="date-picker"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="date-input">
              <label className="filter-label">По:</label>
              <input 
                type="date" 
                className="date-picker"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        
        <div className="course-filter">
          <label className="filter-label">
            Предмет:
            <InfoTooltip text="Фильтрация данных по выбранному предмету. Для просмотра статистики по всем предметам выберите 'Все предметы'" position="right" />
          </label>
          <select 
            className="filter-select"
            value={selectedSubject}
            onChange={handleSubjectChange}
          >
            <option value="all">Все предметы</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="buttons-group" style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="generate-report-button"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,19H5V5H19V19M9,7H7V17H9V7M13,7H11V17H13V7M17,7H15V17H17V7Z" />
            </svg>
            {loading ? 'Загрузка...' : 'Сформировать отчет'}
          </button>
          
          <button 
            className="export-button"
            onClick={handleExportToExcel}
            disabled={loading || !stats.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M14,2H6C4.89,2 4,2.89 4,4V20C4,21.11 4.89,22 6,22H18C19.11,22 20,21.11 20,20V8L14,2M18,20H6V4H13V9H18V20M15,11C13.89,11 13,11.89 13,13V17H14V16H16V17H17V13C17,11.89 16.11,11 15,11M15,12C15.55,12 16,12.45 16,13V15H14V13C14,12.45 14.45,12 15,12Z" />
            </svg>
            Экспорт в Excel
          </button>
          
          <button 
            className="print-button"
            onClick={handlePrintReport}
            disabled={loading || !stats.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '8px 16px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="white">
              <path d="M19,8H5C3.34,8 2,9.34 2,11V17H6V21H18V17H22V11C22,9.34 20.66,8 19,8M16,19H8V14H16V19M19,12C18.45,12 18,11.55 18,11C18,10.45 18.45,10 19,10C19.55,10 20,10.45 20,11C20,11.55 19.55,12 19,12M18,3H6V7H18V3Z" />
            </svg>
            Печать отчета
          </button>
        </div>
      </div>
      
      <div className="reports-charts">
        {loading ? (
          <LoadingIndicator size="large" text="Загрузка статистики..." />
        ) : stats.length > 0 ? (
          <>
            <StatsCards stats={stats} />
            <TrendChart stats={stats} />
            <ActivityChart data={activityData} />
            <StatsDashboard stats={stats} />
            <AttendanceStatsTable stats={stats} />
          </>
        ) : (
          <div className="no-data" style={{ 
            padding: '30px', 
            textAlign: 'center', 
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
          }}>
            <p>Нет данных для отображения. Пожалуйста, выберите период и нажмите "Сформировать отчет".</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AttendanceStatsTable = ({ stats }) => {
  // Если статистики нет, не показываем таблицу
  if (!stats || stats.length === 0) {
    return <div className="no-data">Нет данных для отображения</div>;
  }

  return (
    <div className="stats-table-container">
      <h4 className="table-title">Детальная статистика посещений</h4>
      <table className="stats-table">
        <thead>
          <tr>
            <th>Предмет</th>
            <th>Смена</th>
            <th>Преподаватель</th>
            <th>День недели</th>
            <th>Количество посещений</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item, index) => (
            <tr key={index}>
              <td>{item.subject_name || `Предмет ${item.subject_id}`}</td>
              <td>{getShiftName(item.shift_id)}</td>
              <td>{item.teacher_name || `Преподаватель ${item.teacher_id}`}</td>
              <td>{getDayOfWeekName(item.day_of_week)}</td>
              <td>{item.attendance_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Вспомогательная функция для получения названия дня недели
const getDayOfWeekName = (dayIndex) => {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return dayIndex >= 0 && dayIndex < 7 ? days[dayIndex] : 'Неизвестно';
};

// Вспомогательная функция для получения названия смены
const getShiftName = (shiftId) => {
  const shifts = {
    1: 'Первая смена',
    2: 'Вторая смена',
    3: 'Вечерняя смена'
  };
  return shifts[shiftId] || `Смена ${shiftId}`;
};

export default AdminReports;