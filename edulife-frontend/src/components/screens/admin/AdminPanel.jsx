import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

// Компоненты для структуры
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

// Компоненты для разделов
import AdminDashboard from './AdminDashboard.jsx';
import AdminCourses from './AdminCourses.jsx';
import AdminStudents from './AdminStudents.jsx';
import AdminReports from './AdminReports.jsx';
import AdminDocuments from './AdminDocuments.jsx';

const AdminPanel = ({ courses = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleBack = () => {
    navigate('/');
  };

  // Статистика для передачи в компонент Dashboard
  const stats = {
    totalStudents: 2458,
    activeStudents: 1845,
    totalCourses: courses.length,
    completionRate: 78,
    averageRating: 4.8
  };

  return (
    <div className="admin-panel">
      <AdminHeader />
      
      <div className="admin-content">
        <AdminSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          handleBack={handleBack} 
        />
        
        <div className="admin-main">
          {activeTab === 'dashboard' && <AdminDashboard stats={stats} />}
          {activeTab === 'courses' && <AdminCourses courses={courses} />}
          {activeTab === 'students' && <AdminStudents />}
          {activeTab === 'reports' && <AdminReports courses={courses} />}
          {activeTab === 'documents' && <AdminDocuments />}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;