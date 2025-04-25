import React, { useState, useEffect } from 'react';

const AdminSubjects = ({ subjects, onAddSubject, onUpdateSubject, onDeleteSubject }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setNewSubjectName(subject.name);
    setIsEditing(false);
  };

  const handleEditSubject = () => {
    setIsEditing(true);
  };

  const handleAddNewSubject = () => {
    setSelectedSubject(null);
    setNewSubjectName('');
    setIsEditing(true);
  };

  const handleSaveSubject = async () => {
    if (!newSubjectName.trim()) {
      alert('Название предмета не может быть пустым');
      return;
    }

    try {
      if (selectedSubject) {
        // Обновляем существующий предмет
        await onUpdateSubject({
          id: selectedSubject.id,
          name: newSubjectName
        });
      } else {
        // Создаем новый предмет
        await onAddSubject({
          name: newSubjectName
        });
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при сохранении предмета:', error);
      alert('Произошла ошибка при сохранении предмета');
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    if (window.confirm(`Вы уверены, что хотите удалить предмет "${selectedSubject.name}"?`)) {
      try {
        await onDeleteSubject(selectedSubject.id);
        setSelectedSubject(null);
      } catch (error) {
        console.error('Ошибка при удалении предмета:', error);
        alert('Произошла ошибка при удалении предмета');
      }
    }
  };

  return (
    <div className="admin-courses">
      <div className="courses-list-container">
        <div className="courses-header">
          <h3 className="section-title">Предметы</h3>
          <button className="add-course-button" onClick={handleAddNewSubject}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Добавить предмет
          </button>
        </div>
        
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder="Поиск предметов..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="courses-list">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map(subject => (
              <div 
                key={subject.id} 
                className={`course-list-item ${selectedSubject && selectedSubject.id === subject.id ? 'active' : ''}`}
                onClick={() => handleSelectSubject(subject)}
              >
                <div className="course-color" style={{ backgroundColor: '#4A6CF7' }}></div>
                <div className="course-list-content">
                  <div className="course-list-title">{subject.name}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-courses-message">
              {searchQuery ? 'Предметы не найдены' : 'Нет доступных предметов'}
            </div>
          )}
        </div>
      </div>
      
      <div className="course-details-container">
        {isEditing ? (
          <div className="course-edit-form">
            <h3 className="section-title">
              {selectedSubject ? "Редактирование предмета" : "Добавление нового предмета"}
            </h3>
            
            <div className="form-group">
              <label className="form-label">Название предмета</label>
              <input 
                type="text" 
                className="form-input" 
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="Введите название предмета"
              />
            </div>
            
            <div className="form-actions">
              <button 
                className="cancel-button" 
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  if (!selectedSubject) {
                    setSelectedSubject(null);
                  }
                }}
              >
                Отмена
              </button>
              <button 
                className="save-button"
                type="button"
                onClick={handleSaveSubject}
              >
                {selectedSubject ? "Сохранить" : "Создать предмет"}
              </button>
            </div>
          </div>
        ) : selectedSubject ? (
          <div className="course-details">
            <div className="course-details-header">
              <h3 className="course-details-title">{selectedSubject.name}</h3>
              <div className="course-actions">
                <button className="edit-button" onClick={handleEditSubject}>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                  Редактировать
                </button>
                <button className="delete-button" onClick={handleDeleteSubject}>
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
                  backgroundColor: '#4A6CF7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '36px',
                  fontWeight: 'bold'
                }}
              >
                {selectedSubject.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="course-info">
                <div className="info-group">
                  <div className="info-label">Название предмета</div>
                  <div className="info-value description">{selectedSubject.name}</div>
                </div>
                
                <div className="info-group">
                  <div className="info-label">ID предмета</div>
                  <div className="info-value">{selectedSubject.id}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-course-selected">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
            </svg>
            <p>Выберите предмет из списка слева или создайте новый</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSubjects;