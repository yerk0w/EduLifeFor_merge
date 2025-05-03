import React from 'react';

const AttendanceStats = ({ stats }) => {
  return (
    <div className="qrcode-stats">
      <h4 className="subsection-title">Статистика посещаемости</h4>
      <div className="qrcode-stats-row">
        <div className="qrcode-stat-card">
          <div className="qrcode-stat-value">{stats.attendanceToday}</div>
          <div className="qrcode-stat-label">Отметились сегодня</div>
        </div>
        <div className="qrcode-stat-card">
          <div className="qrcode-stat-value">{stats.totalStudents}</div>
          <div className="qrcode-stat-label">Всего студентов в группе</div>
        </div>
        <div className="qrcode-stat-card">
          <div className="qrcode-stat-value">{stats.attendanceRate}%</div>
          <div className="qrcode-stat-label">Посещаемость</div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;