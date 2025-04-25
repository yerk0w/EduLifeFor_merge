import React, { useState, useEffect } from 'react';
import ScheduleList from './ScheduleList';
import ScheduleDetails from './ScheduleDetails';
import ScheduleForm from './ScheduleForm';

const AdminSchedule = ({ 
  scheduleItems = [], 
  subjects = [], 
  classrooms = [], 
  lessonTypes = [], 
  teachers = [], 
  groups = [],
  onUpdate 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheduleItem, setSelectedScheduleItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Логи для отладки
  useEffect(() => {
    console.log("AdminSchedule props:", {
      scheduleItemsCount: scheduleItems.length,
      subjectsCount: subjects.length,
      classroomsCount: classrooms.length,
      lessonTypesCount: lessonTypes.length,
      teachersCount: teachers.length,
      groupsCount: groups.length
    });
  }, [scheduleItems, subjects, classrooms, lessonTypes, teachers, groups]);

  // Фильтрация расписания по поисковому запросу
  const filteredScheduleItems = scheduleItems.filter(item =>
    (item.subject_name && item.subject_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.teacher_name && item.teacher_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.group_name && item.group_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.classroom_name && item.classroom_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleScheduleSelect = (scheduleItem) => {
    setSelectedScheduleItem(scheduleItem);
    setIsEditing(false);
  };

  const handleEditSchedule = () => {
    setIsEditing(true);
  };

  const handleAddSchedule = () => {
    // Создаем новый элемент расписания с базовыми данными
    const newScheduleItem = {
      id: 0, // будет заменено на реальный ID после сохранения
      date: new Date().toISOString().split('T')[0], // текущая дата в формате YYYY-MM-DD
      time_start: "08:00:00",
      time_end: "09:30:00",
      subject_id: subjects.length > 0 ? subjects[0].id : 1,
      subject_name: subjects.length > 0 ? subjects[0].name : "Предмет не выбран",
      teacher_id: teachers.length > 0 ? teachers[0].id : 1,
      teacher_name: teachers.length > 0 ? teachers[0].full_name : "Преподаватель не выбран",
      group_id: groups.length > 0 ? groups[0].id : 1,
      group_name: groups.length > 0 ? groups[0].name : "Группа не выбрана",
      classroom_id: classrooms.length > 0 ? classrooms[0].id : 1,
      classroom_name: classrooms.length > 0 ? classrooms[0].name : "Аудитория не выбрана",
      lesson_type_id: lessonTypes.length > 0 ? lessonTypes[0].id : 1,
      lesson_type: lessonTypes.length > 0 ? lessonTypes[0].name : "Тип занятия не выбран"
    };
    
    setSelectedScheduleItem(newScheduleItem);
    setIsEditing(true);
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      let response;
      const raspisBaseUrl = 'http://localhost:8090'; // URL сервиса расписания
      
      // Если id равен 0, то это новая запись
      if (scheduleData.id === 0) {
        response = await fetch(`${raspisBaseUrl}/schedule`, {
          method: 'POST',
          headers,
          body: JSON.stringify(scheduleData)
        });
      } else {
        // Иначе обновляем существующую запись
        response = await fetch(`${raspisBaseUrl}/schedule/${scheduleData.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(scheduleData)
        });
      }
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }
      
      setIsEditing(false);
      
      // Если у нас есть функция обновления, вызываем ее
      if (onUpdate) {
        await onUpdate();
      }
      
    } catch (error) {
      console.error('Ошибка при сохранении расписания:', error);
      setError('Ошибка при сохранении расписания. Проверьте консоль для подробностей.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (window.confirm('Вы уверены, что хотите удалить это занятие из расписания?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const headers = { 
          'Authorization': `Bearer ${token}`
        };
        
        const raspisBaseUrl = 'http://localhost:8090'; // URL сервиса расписания
        const response = await fetch(`${raspisBaseUrl}/schedule/${scheduleId}`, {
          method: 'DELETE',
          headers
        });
        
        if (!response.ok) {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
        
        setSelectedScheduleItem(null);
        
        // Если у нас есть функция обновления, вызываем ее
        if (onUpdate) {
          await onUpdate();
        }
        
      } catch (error) {
        console.error('Ошибка при удалении расписания:', error);
        setError('Ошибка при удалении расписания. Проверьте консоль для подробностей.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner"></div>
        <p>Загрузка данных...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => setError(null)}>Закрыть</button>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <ScheduleList 
        scheduleItems={filteredScheduleItems}
        selectedScheduleItem={selectedScheduleItem}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleScheduleSelect={handleScheduleSelect}
        handleAddSchedule={handleAddSchedule}
      />
      
      <div className="course-details-container">
        {selectedScheduleItem ? (
          isEditing ? (
            <ScheduleForm 
              selectedScheduleItem={selectedScheduleItem}
              subjects={subjects}
              classrooms={classrooms}
              lessonTypes={lessonTypes}
              teachers={teachers}
              groups={groups}
              setIsEditing={setIsEditing}
              onSave={handleSaveSchedule}
            />
          ) : (
            <ScheduleDetails 
              selectedScheduleItem={selectedScheduleItem}
              handleEditSchedule={handleEditSchedule}
              handleDeleteSchedule={handleDeleteSchedule}
            />
          )
        ) : (
          <div className="no-course-selected">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
            </svg>
            <p>Выберите занятие из списка слева для просмотра деталей</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSchedule;