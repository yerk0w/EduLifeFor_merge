import React from 'react';

const StatCard = ({ type, icon, value, label, trend, trendType }) => {
  return (
    <div className={`stat-card ${type}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
      {trend && (
        <div className={`stat-trend ${trendType}`}>
          <svg viewBox="0 0 24 24" width="16" height="16">
            <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
          </svg>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;