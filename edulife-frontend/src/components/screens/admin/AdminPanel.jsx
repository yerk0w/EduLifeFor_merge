import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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

// Импорт сервиса API
import apiService from '../../../services/apiService';

const AdminPanel = () => {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Состояния для данных
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Проверка прав доступа и загрузка данных при монтировании компонента
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    // Проверяем, является ли пользователь администратором
    if (userRole !== 'admin' && userRole !== 'админ') {
      navigate('/'); // Перенаправляем на главную страницу, если не админ
      return;
    }

    // Загружаем данные при монтировании компонента
    const fetchData = async () => {
      setLoading(true);
      try {
        // Загрузка расписания/курсов
        const scheduleResponse = await apiService.schedule.getSchedule();
        
        // Преобразуем данные из API в формат, подходящий для компонента
        const formattedCourses = scheduleResponse.map((item, index) => ({
          id: item.id || index + 1,
          title: item.subject_name || t('Unknown subject', { defaultValue: 'Неизвестный предмет' }),
          description: `${item.classroom_name || t('Class not specified', { defaultValue: 'Класс не указан' })}, ${item.lesson_type || t('Lesson type not specified', { defaultValue: 'Тип занятия не указан' })}`,
          backgroundColor: getRandomColor(),
          hours: `${item.time_start} - ${item.time_end}`,
          people: item.group_id || 0,
          videoType: 'youtube',
          videoUrl: '',
          homework: []
        }));
        setCourses(formattedCourses);

        // Загрузка списка студентов
        const studentsResponse = await apiService.auth.getStudents();
        setStudents(Array.isArray(studentsResponse) ? studentsResponse : []);

        // Загрузка документов
        const documentsResponse = await apiService.documents.getDocuments();
        setDocuments(Array.isArray(documentsResponse) ? documentsResponse : []);

        // Загрузка шаблонов документов
        const templatesResponse = await apiService.documents.getTemplates();
        setTemplates(Array.isArray(templatesResponse) ? templatesResponse : []);
      } catch (err) {
        console.error(t('Error loading data:', { defaultValue: 'Ошибка при загрузке данных:' }), err);
        setError(t('An error occurred while loading data. Please try again later.', { defaultValue: 'Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.' }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, t]);

  // Функция для генерации случайного цвета
  const getRandomColor = () => {
    const colors = [
      '#4A6CF7', '#00E676', '#FFAB00', '#00B0FF', '#FF3D00',
      '#651FFF', '#3D5AFE', '#1DE9B6', '#F50057', '#FFD600'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleBack = () => {
    navigate('/');
  };

  // Статистика для Dashboard
  const stats = {
    totalStudents: students.length || 0,
    activeStudents: students.filter(s => s.is_active).length || 0,
    totalCourses: courses.length || 0,
    completionRate: 78, // Пример статистики
    averageRating: 4.8 // Пример статистики
  };

  if (loading) {
    return (
      <div className="admin-panel loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>{t('Loading data...', { defaultValue: 'Загрузка данных...' })}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            {t('Try again', { defaultValue: 'Попробовать снова' })}
          </button>
        </div>
      </div>
    );
  }

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
          {activeTab === 'students' && <AdminStudents students={students} />}
          {activeTab === 'reports' && <AdminReports courses={courses} />}
          {activeTab === 'documents' && (
            <AdminDocuments 
              documents={documents} 
              templates={templates}
              refreshDocuments={async () => {
                try {
                  const docsResponse = await apiService.documents.getDocuments();
                  setDocuments(Array.isArray(docsResponse) ? docsResponse : []);
                } catch (err) {
                  console.error(t('Error updating documents:', { defaultValue: 'Ошибка при обновлении документов:' }), err);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;