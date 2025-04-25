import React from 'react';
import CourseHomework from './CourseHomework.jsx';

const CourseDetails = ({ selectedCourse, handleEditCourse, setSelectedCourse, courses }) => {
  const handleDeleteCourse = () => {
    if (window.confirm(`Вы уверены, что хотите удалить курс "${selectedCourse.title}"?`)) {
      // Здесь должен быть код для удаления курса из списка
      // onCoursesUpdate(courses.filter(c => c.id !== selectedCourse.id));
      setSelectedCourse(null);
    }
  };

  return (
    <div className="course-details">
      <div className="course-details-header">
        <h3 className="course-details-title">{selectedCourse.title}</h3>
        <div className="course-actions">
          <button className="edit-button" onClick={handleEditCourse}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
            </svg>
            Редактировать
          </button>
          <button className="delete-button" onClick={handleDeleteCourse}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
            </svg>
            Удалить
          </button>
        </div>
      </div>
      
      <div className="course-preview">
        <div className="course-image-container" style={{ backgroundColor: selectedCourse.backgroundColor }}>
          {selectedCourse.image ? (
            <img src={selectedCourse.image} alt={selectedCourse.title} className="course-image" />
          ) : (
            <div className="course-image-placeholder">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z" />
              </svg>
            </div>
          )}
        </div>
        
        <div className="course-info">
          <div className="info-group">
            <div className="info-label">Описание</div>
            <div className="info-value description">{selectedCourse.description}</div>
          </div>
          
          <div className="info-row">
            <div className="info-group half">
              <div className="info-label">Продолжительность</div>
              <div className="info-value">{selectedCourse.hours}</div>
            </div>
            
            <div className="info-group half">
              <div className="info-label">Студентов</div>
              <div className="info-value">{selectedCourse.people}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-label">Тип видео</div>
            <div className="info-value">{selectedCourse.videoType === 'youtube' ? 'YouTube' : 'Прямая ссылка'}</div>
          </div>
          
          <div className="info-group">
            <div className="info-label">URL видео</div>
            <div className="info-value url">{selectedCourse.videoUrl}</div>
          </div>
        </div>
      </div>
      
      <CourseHomework homework={selectedCourse.homework} />
    </div>
  );
};

export default CourseDetails;