import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, handleBack }) => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
          </svg>
          <span className="tab-text">Расписание</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'qrcode' ? 'active' : ''}`}
          onClick={() => setActiveTab('qrcode')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
          </svg>
          <span className="tab-text">QR-код</span>
        </button>
      </div>
      
      <button className="logout-button" onClick={handleBack}>
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z" />
        </svg>
        <span className="button-text">Выйти</span>
      </button>
    </div>
  );
};

export default Sidebar;