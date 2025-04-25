import React, { useState, useEffect } from 'react';

const AdminClassrooms = ({ classrooms, onAddClassroom, onUpdateClassroom, onDeleteClassroom }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newClassroomName, setNewClassroomName] = useState('');

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectClassroom = (classroom) => {
    setSelectedClassroom(classroom);
    setNewClassroomName(classroom.name);
    setIsEditing(false);
  };

  const handleEditClassroom = () => {
    setIsEditing(true);
  };

  const handleAddNewClassroom = () => {
    setSelectedClassroom(null);
    setNewClassroomName('');
    setIsEditing(true);
  };

  const handleSaveClassroom = async () => {
    if (!newClassroomName.trim()) {
      alert('Название аудитории не может быть пустым');
      return;
    }

    try {
      if (selectedClassroom) {
        // Обновляем существующую аудиторию
        await onUpdateClassroom({
          id: selectedClassroom.id,
          name: newClassroomName
        });
      } else {
        // Создаем новую аудиторию
        await onAddClassroom({
          name: newClassroomName
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении аудитории:', error);
      alert('Произошла ошибка при сохранении аудитории');
    }
  };

  const handleDeleteClassroom = async () => {
    if (!selectedClassroom) return;

    if (window.confirm(`Вы уверены, что хотите удалить аудиторию "${selectedClassroom.name}"?`)) {
      try {
        await onDeleteClassroom(selectedClassroom.id);
        setSelectedClassroom(null);
      } catch (error) {
        console.error('Ошибка при удалении аудитории:', error);
        alert('Произошла ошибка при удалении аудитории');
      }
    }
  };

  return (
    <div className="admin-courses">
      <div className="courses-list-container">
        <div className="courses-header">
          <h3 className="section-title">Аудитории</h3>
          <button className="add-course-button" onClick={handleAddNewClassroom}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Добавить аудиторию
          </button>
        </div>
        
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder="Поиск аудиторий..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="courses-list">
          {filteredClassrooms.length > 0 ? (
            filteredClassrooms.map(classroom => (
              <div 
                key={classroom.id} 
                className={`course-list-item ${selectedClassroom && selectedClassroom.id === classroom.id ? 'active' : ''}`}
                onClick={() => handleSelectClassroom(classroom)}
              >
                <div className="course-color" style={{ backgroundColor: '#FF7F50' }}></div>
                <div className="course-list-content">
                  <div className="course-list-title">{classroom.name}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses-message">
              {searchQuery ? 'Аудитории не найдены' : 'Нет доступных аудиторий'}
            </div>
          )}
        </div>
      </div>
      
      <div className="course-details-container">
        {isEditing ? (
          <div className="course-edit-form">
            <h3 className="section-title">
              {selectedClassroom ? "Редактирование аудитории" : "Добавление новой аудитории"}
            </h3>
            
            <div className="form-group">
              <label className="form-label">Название аудитории</label>
              <input 
                type="text" 
                className="form-input" 
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="Введите название аудитории"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="cancel-button" 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (!selectedClassroom) {
                    setSelectedClassroom(null);
                  }
                }}
              >
                Отмена
              </button>
              <button 
                className="save-button"
                type="button"
                onClick={handleSaveClassroom}
              >
                {selectedClassroom ? "Сохранить" : "Создать аудиторию"}
              </button>
            </div>
          </div>
        ) : selectedClassroom ? (
          <div className="course-details">
            <div className="course-details-header">
              <h3 className="course-details-title">{selectedClassroom.name}</h3>
              <div className="course-actions">
                <button className="edit-button" onClick={handleEditClassroom}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                  Редактировать
                </button>
                <button className="delete-button" onClick={handleDeleteClassroom}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                  Удалить
                </button>
              </div>
            </div>
            
            <div className="course-preview">
              <div 
                className="course-image-container" 
                style={{ 
                  backgroundColor: '#FF7F50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '36px',
                  fontWeight: 'bold'
                }}
              >
                <svg viewBox="0 0 24 24" width="64" height="64" fill="white">
                  <path d="M19,7H11V14H3V5H1V20H3V17H21V20H23V11A4,4 0 0,0 19,7M7,13A3,3 0 0,0 4,10A3,3 0 0,0 7,7A3,3 0 0,0 10,10A3,3 0 0,0 7,13Z" />
                </svg>
              </div>
              
              <div className="course-info">
                <div className="info-group">
                  <div className="info-label">Название аудитории</div>
                  <div className="info-value description">{selectedClassroom.name}</div>
                </div>
                
                <div className="info-group">
                  <div className="info-label">ID аудитории</div>
                  <div className="info-value">{selectedClassroom.id}</div>
                </div>
                
                <div className="info-group">
                  <div className="info-label">Расписание занятий в аудитории</div>
                  <div className="info-value">
                    <button className="view-schedule-button">
                      Посмотреть расписание
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-course-selected">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
            </svg>
            <p>Выберите аудиторию из списка слева или создайте новую</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminClassrooms;