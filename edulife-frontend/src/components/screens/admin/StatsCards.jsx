import React from 'react';

const StatsCards = ({ stats }) => {
  // Расчет общих показателей
  const calculateTotals = () => {
    if (!stats || !stats.length) {
      return {
        totalAttendance: 0,
        uniqueSubjects: 0,
        uniqueTeachers: 0,
        averagePerDay: 0
      };
    }
    
    // Общее количество посещений
    const totalAttendance = stats.reduce((sum, item) => sum + item.attendance_count, 0);
    
    // Уникальные предметы
    const subjects = new Set(stats.map(item => item.subject_id));
    
    // Уникальные преподаватели
    const teachers = new Set(stats.map(item => item.teacher_id));
    
    // Среднее количество посещений в день
    const days = new Set(stats.map(item => item.day_of_week));
    const averagePerDay = days.size > 0 ? Math.round(totalAttendance / days.size) : 0;
    
    return {
      totalAttendance,
      uniqueSubjects: subjects.size,
      uniqueTeachers: teachers.size,
      averagePerDay
    };
  };
  
  const { totalAttendance, uniqueSubjects, uniqueTeachers, averagePerDay } = calculateTotals();
  
  // Стили для карточек
  const cardContainerStyle = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '30px'
  };
  
  const cardStyle = {
    flex: '1',
    minWidth: '200px',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  const cardTitleStyle = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '10px',
    textAlign: 'center'
  };
  
  const cardValueStyle = {
    fontSize: '28px',
    fontWeight: 'bold'
  };
  
  // Цвета для карточек
  const colors = {
    attendance: '#2C7BE5',
    subjects: '#00C49F',
    teachers: '#FFBB28',
    average: '#FF8042'
  };

  return (
    <div style={cardContainerStyle}>
      <div style={cardStyle}>
        <div style={cardTitleStyle}>ВСЕГО ПОСЕЩЕНИЙ</div>
        <div style={{...cardValueStyle, color: colors.attendance}}>{totalAttendance}</div>
      </div>
      
      <div style={cardStyle}>
        <div style={cardTitleStyle}>ПРЕДМЕТОВ</div>
        <div style={{...cardValueStyle, color: colors.subjects}}>{uniqueSubjects}</div>
      </div>
      
      <div style={cardStyle}>
        <div style={cardTitleStyle}>ПРЕПОДАВАТЕЛЕЙ</div>
        <div style={{...cardValueStyle, color: colors.teachers}}>{uniqueTeachers}</div>
      </div>
      
      <div style={cardStyle}>
        <div style={cardTitleStyle}>СРЕДНЕЕ В ДЕНЬ</div>
        <div style={{...cardValueStyle, color: colors.average}}>{averagePerDay}</div>
      </div>
    </div>
  );
};

export default StatsCards;