import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const StatsDashboard = ({ stats }) => {
  const [subjectStats, setSubjectStats] = useState([]);
  const [teacherStats, setTeacherStats] = useState([]);
  const [totalAttendance, setTotalAttendance] = useState(0);
  
  // Цвета для графиков
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B'];
  
  useEffect(() => {
    if (!stats || !stats.length) return;
    
    // Обработка статистики по предметам
    const subjectMap = new Map();
    
    stats.forEach(item => {
      const subjectId = item.subject_id;
      const subjectName = item.subject_name || `Предмет ${subjectId}`;
      const currentCount = subjectMap.get(subjectId) || { name: subjectName, count: 0 };
      currentCount.count += item.attendance_count;
      subjectMap.set(subjectId, currentCount);
    });
    
    const subjectData = Array.from(subjectMap.values()).map(item => ({
      name: item.name,
      value: item.count
    }));
    
    setSubjectStats(subjectData);
    
    // Обработка статистики по преподавателям
    const teacherMap = new Map();
    
    stats.forEach(item => {
      const teacherId = item.teacher_id;
      const teacherName = item.teacher_name || `Преподаватель ${teacherId}`;
      const currentCount = teacherMap.get(teacherId) || { name: teacherName, count: 0 };
      currentCount.count += item.attendance_count;
      teacherMap.set(teacherId, currentCount);
    });
    
    const teacherData = Array.from(teacherMap.values()).map(item => ({
      name: item.name,
      value: item.count
    }));
    
    setTeacherStats(teacherData);
    
    // Подсчет общего количества посещений
    const total = stats.reduce((sum, item) => sum + item.attendance_count, 0);
    setTotalAttendance(total);
    
  }, [stats]);
  
  // Кастомный тултип для круговых диаграмм
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}>{`${payload[0].name}: ${payload[0].value}`}</p>
          <p style={{ margin: 0 }}>{`${Math.round((payload[0].value / totalAttendance) * 100)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  // Если статистики нет, показываем сообщение
  if (!stats || stats.length === 0) {
    return (
      <div className="stats-dashboard-container" style={{ 
        backgroundColor: '##2D2D2D', 
        borderRadius: '8px', 
        padding: '20px', 
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        textAlign: 'center'
      }}>
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="stats-dashboard-container" style={{ 
      backgroundColor: '#2D2D2D', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' 
    }}>
      <h4 style={{ marginBottom: '20px' }}>Общая статистика посещений</h4>
      
      <div className="stats-summary" style={{ display: 'flex', gap: "70px",justifyContent: 'space-around', marginBottom: '30px' }}>
        <div className="stat-card" style={{ 
          textAlign: 'center', 
          padding: '15px',
          display: 'flex',
          flexDirection: 'row',
          gap: '220px',
          borderRadius: '8px', 
          backgroundColor: '#f5f7fa',
          minWidth: '150px'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#666' }}>Всего посещений</h5>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0088FE' }}>{totalAttendance}</div>
        </div>
        
        <div className="stat-card" style={{ 
          textAlign: 'center', 
          padding: '15px', 
          display: 'flex',
          flexDirection: 'row',
          gap: '250px',
          borderRadius: '8px', 
          backgroundColor: '#f5f7fa',
          minWidth: '150px'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#666' }}>Предметов</h5>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#00C49F' }}>{subjectStats.length}</div>
        </div>
        
        <div className="stat-card" style={{ 
          textAlign: 'center', 
          padding: '15px', 
          borderRadius: '8px', 
          display: 'flex',
          flexDirection: 'row',
          gap: '220px',
          backgroundColor: '#f5f7fa',
          minWidth: '150px'
        }}>
          <h5 style={{ margin: '0 0 8px 0', color: '#666' }}>Преподавателей</h5>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#FFBB28' }}>{teacherStats.length}</div>
        </div>
      </div>
      
      <div className="charts-row" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="pie-chart-container" style={{ flex: '1', minWidth: '300px', height: '300px' }}>
          <h5 style={{ textAlign: 'center', marginBottom: '15px' }}>Посещаемость по предметам</h5>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {subjectStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="pie-chart-container" style={{ flex: '1', minWidth: '300px', height: '300px' }}>
          <h5 style={{ textAlign: 'center', marginBottom: '15px' }}>Посещаемость по преподавателям</h5>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={teacherStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {teacherStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Таблица лучших показателей */}
      <div className="top-stats" style={{ marginTop: '30px' }}>
        <h5 style={{ marginBottom: '15px' }}>Топ посещаемых пар</h5>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#2D2D2D' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Предмет</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Преподаватель</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #eee' }}>День недели</th>
              <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #eee' }}>Посещений</th>
            </tr>
          </thead>
          <tbody>
            {stats
              .sort((a, b) => b.attendance_count - a.attendance_count)
              .slice(0, 5)
              .map((item, index) => (
                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#2D2D2D' : '#2D2D2D' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.subject_name || `Предмет ${item.subject_id}`}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{item.teacher_name || `Преподаватель ${item.teacher_id}`}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{getDayOfWeekName(item.day_of_week)}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee', textAlign: 'right', fontWeight: 'bold' }}>{item.attendance_count}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Вспомогательная функция для получения названия дня недели
const getDayOfWeekName = (dayIndex) => {
  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
  return dayIndex >= 0 && dayIndex < 7 ? days[dayIndex] : 'Неизвестно';
};

export default StatsDashboard;