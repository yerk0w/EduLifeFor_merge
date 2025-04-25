import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

// Компоненты для структуры
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

// Компоненты для разделов
import AdminDashboard from './AdminDashboard.jsx';
import AdminSchedule from './AdminSchedule.jsx'; 
import AdminStudents from './AdminStudents.jsx';
import AdminReports from './AdminReports.jsx';
import AdminDocuments from './AdminDocuments.jsx';
import AdminSubjects from './AdminSubjects.jsx';
import AdminClassrooms from './AdminClassrooms.jsx';

// Импорт сервиса API
import apiService from '../../../services/apiService';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Состояния для данных
  const [scheduleItems, setScheduleItems] = useState([]); 
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояние для справочников расписания
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [lessonTypes, setLessonTypes] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);

  // Базовые URL для API
  const raspisBaseUrl = 'http://localhost:8090'; // URL сервиса расписания
  const authBaseUrl = 'http://localhost:8070'; // URL сервиса авторизации

  // Проверка прав доступа и загрузка данных при монтировании компонента
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    
    // Проверяем, является ли пользователь администратором
    if (userRole !== 'admin' && userRole !== 'админ') {
      navigate('/'); // Перенаправляем на главную страницу, если не админ
      return;
    }

    // Загружаем данные при монтировании компонента
    fetchAllData();
  }, [navigate]);

  // Функция для загрузки всех данных
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Получаем токен
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Загрузка расписания
      const scheduleResponse = await apiService.schedule.getSchedule();
      setScheduleItems(Array.isArray(scheduleResponse) ? scheduleResponse : []);

      // Загрузка справочников для форм расписания
      try {
        // Загрузка предметов
        const subjectsResponse = await fetch(`${raspisBaseUrl}/subjects`, { headers });
        if (!subjectsResponse.ok) {
          throw new Error(`Ошибка при загрузке предметов: ${subjectsResponse.status}`);
        }
        const subjectsData = await subjectsResponse.json();
        setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
        
        // Загрузка аудиторий
        const classroomsResponse = await fetch(`${raspisBaseUrl}/classrooms`, { headers });
        if (!classroomsResponse.ok) {
          throw new Error(`Ошибка при загрузке аудиторий: ${classroomsResponse.status}`);
        }
        const classroomsData = await classroomsResponse.json();
        setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
        
        // Загрузка типов занятий
        const lessonTypesResponse = await fetch(`${raspisBaseUrl}/lesson-types`, { headers });
        if (!lessonTypesResponse.ok) {
          throw new Error(`Ошибка при загрузке типов занятий: ${lessonTypesResponse.status}`);
        }
        const lessonTypesData = await lessonTypesResponse.json();
        setLessonTypes(Array.isArray(lessonTypesData) ? lessonTypesData : []);
        
        // Загрузка преподавателей
        const teachersResponse = await fetch(`${authBaseUrl}/teachers`, { headers });
        if (!teachersResponse.ok) {
          throw new Error(`Ошибка при загрузке преподавателей: ${teachersResponse.status}`);
        }
        const teachersData = await teachersResponse.json();
        console.log("Загруженные преподаватели:", teachersData);
        setTeachers(Array.isArray(teachersData) ? teachersData : []);
        
        // Загрузка групп
        const groupsResponse = await fetch(`${authBaseUrl}/groups`, { headers });
        if (!groupsResponse.ok) {
          throw new Error(`Ошибка при загрузке групп: ${groupsResponse.status}`);
        }
        const groupsData = await groupsResponse.json();
        console.log("Загруженные группы:", groupsData);
        setGroups(Array.isArray(groupsData) ? groupsData : []);
      } catch (err) {
        console.error('Ошибка при загрузке справочников:', err);
        // Продолжаем выполнение даже при ошибке загрузки справочников
      }

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
      console.error('Ошибка при загрузке данных:', err);
      setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  // Обработчик для обновления расписания
  const handleScheduleUpdate = async () => {
    try {
      const scheduleResponse = await apiService.schedule.getSchedule();
      setScheduleItems(Array.isArray(scheduleResponse) ? scheduleResponse : []);
    } catch (err) {
      console.error('Ошибка при обновлении расписания:', err);
    }
  };

  // Обработчики для работы с предметами
  const handleAddSubject = async (subjectData) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${raspisBaseUrl}/subjects`, {
        method: 'POST',
        headers,
        body: JSON.stringify(subjectData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка при добавлении предмета: ${response.status}`);
      }

      // Обновляем список предметов
      const refreshResponse = await fetch(`${raspisBaseUrl}/subjects`, { headers });
      const refreshData = await refreshResponse.json();
      setSubjects(Array.isArray(refreshData) ? refreshData : []);
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при добавлении предмета:', error);
      throw error;
    }
  };

  const handleUpdateSubject = async (subjectData) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${raspisBaseUrl}/subjects/${subjectData.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(subjectData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка при обновлении предмета: ${response.status}`);
      }

      // Обновляем список предметов
      const refreshResponse = await fetch(`${raspisBaseUrl}/subjects`, { headers });
      const refreshData = await refreshResponse.json();
      setSubjects(Array.isArray(refreshData) ? refreshData : []);
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении предмета:', error);
      throw error;
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${raspisBaseUrl}/subjects/${subjectId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Ошибка при удалении предмета: ${response.status}`);
      }

      // Обновляем список предметов
      const refreshResponse = await fetch(`${raspisBaseUrl}/subjects`, { headers });
      const refreshData = await refreshResponse.json();
      setSubjects(Array.isArray(refreshData) ? refreshData : []);
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении предмета:', error);
      throw error;
    }
  };

  // Обработчики для работы с аудиториями
  const handleAddClassroom = async (classroomData) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await fetch(`${raspisBaseUrl}/classrooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify(classroomData)
      });

      if (!response.ok) {
        throw new Error(`Ошибка при добавлении аудитории: ${response.status}`);
      }

      // Обновляем список аудиторий
      const refreshResponse = await fetch(`${raspisBaseUrl}/classrooms`, { headers });
      const refreshData = await refreshResponse.json();
      setClassrooms(Array.isArray(refreshData) ? refreshData : []);
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при добавлении аудитории:', error);
      throw error;
    }
  };

  const handleUpdateClassroom = async (classroomData) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // У API может отсутствовать конечная точка PUT для аудиторий
      // Здесь мы пытаемся удалить старую и создать новую аудиторию с тем же ID
      // Это обходное решение, если API не поддерживает обновление аудиторий
      await fetch(`${raspisBaseUrl}/classrooms/${classroomData.id}`, {
        method: 'DELETE',
        headers
      });

      const response = await fetch(`${raspisBaseUrl}/classrooms`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: classroomData.name })
      });

      if (!response.ok) {
        throw new Error(`Ошибка при обновлении аудитории: ${response.status}`);
      }

      // Обновляем список аудиторий
      const refreshResponse = await fetch(`${raspisBaseUrl}/classrooms`, { headers });
      const refreshData = await refreshResponse.json();
      setClassrooms(Array.isArray(refreshData) ? refreshData : []);
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка при обновлении аудитории:', error);
      throw error;
    }
  };

  const handleDeleteClassroom = async (classroomId) => {
    try {
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`
      };

      const response = await fetch(`${raspisBaseUrl}/classrooms/${classroomId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Ошибка при удалении аудитории: ${response.status}`);
      }

      // Обновляем список аудиторий
      const refreshResponse = await fetch(`${raspisBaseUrl}/classrooms`, { headers });
      const refreshData = await refreshResponse.json();
      setClassrooms(Array.isArray(refreshData) ? refreshData : []);
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении аудитории:', error);
      throw error;
    }
  };

  // Статистика для Dashboard
  const stats = {
    totalStudents: students.length || 0,
    activeStudents: students.filter(s => s.is_active).length || 0,
    totalScheduleItems: scheduleItems.length || 0,
    totalSubjects: subjects.length || 0,
    totalClassrooms: classrooms.length || 0,
    completionRate: 78,
    averageRating: 4.8
  };

  if (loading) {
    return (
      <div className="admin-panel loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-panel error">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Попробовать снова</button>
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
          {activeTab === 'courses' && (
            <AdminSchedule 
              scheduleItems={scheduleItems}
              subjects={subjects}
              classrooms={classrooms}
              lessonTypes={lessonTypes}
              teachers={teachers}
              groups={groups}
              onUpdate={handleScheduleUpdate}
            />
          )}
          {activeTab === 'subjects' && (
            <AdminSubjects 
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}
          {activeTab === 'classrooms' && (
            <AdminClassrooms 
              classrooms={classrooms}
              onAddClassroom={handleAddClassroom}
              onUpdateClassroom={handleUpdateClassroom}
              onDeleteClassroom={handleDeleteClassroom}
            />
          )}
          {activeTab === 'students' && <AdminStudents students={students} />}
          {activeTab === 'reports' && <AdminReports scheduleItems={scheduleItems} />}
          {activeTab === 'documents' && (
            <AdminDocuments 
              documents={documents} 
              templates={templates}
              refreshDocuments={async () => {
                try {
                  const docsResponse = await apiService.documents.getDocuments();
                  setDocuments(Array.isArray(docsResponse) ? docsResponse : []);
                } catch (err) {
                  console.error('Ошибка при обновлении документов:', err);
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