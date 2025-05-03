import React from 'react';

const AdminSidebar = ({ activeTab, setActiveTab, handleBack }) => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-tabs">
        <button 
          className={`sidebar-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z" />
          </svg>
          <span className="tab-text">Дашборд</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
          </svg>
          <span className="tab-text">Расписание</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => setActiveTab('subjects')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3M7,7H17V5H19V19H5V5H7V7Z" />
          </svg>
          <span className="tab-text">Предметы</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'classrooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('classrooms')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M19,7H11V14H3V5H1V20H3V17H21V20H23V11A4,4 0 0,0 19,7M7,13A3,3 0 0,0 4,10A3,3 0 0,0 7,7A3,3 0 0,0 10,10A3,3 0 0,0 7,13Z" />
          </svg>
          <span className="tab-text">Аудитории</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('keys')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M22,18V22H18V19H15V16H12L9.74,13.74C9.19,13.91 8.61,14 8,14A6,6 0 0,1 2,8A6,6 0 0,1 8,2A6,6 0 0,1 14,8C14,8.61 13.91,9.19 13.74,9.74L22,18M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5Z" />
          </svg>
          <span className="tab-text">Ключи</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
          </svg>
          <span className="tab-text">Пользователи</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H5.5V13H2M2,5H5.5V7H2M2,17H5.5V19H2Z" />
          </svg>
          <span className="tab-text">Посящение</span>
        </button>
        
        <button 
          className={`sidebar-tab ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M12,12.5A0.5,0.5 0 0,1 11.5,12A0.5,0.5 0 0,1 12,11.5A0.5,0.5 0 0,1 12.5,12A0.5,0.5 0 0,1 12,12.5M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11Z" />
          </svg>
          <span className="tab-text">Документооборот</span>
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

export default AdminSidebar;