import React from 'react';

const CoursesList = ({ 
  courses, 
  selectedCourse, 
  searchQuery, 
  setSearchQuery, 
  handleCourseSelect, 
  handleAddCourse 
}) => {
  return (
    <div className="courses-list-container">
      <div className="courses-header">
        <h3 className="section-title">Расписание</h3>
        <button className="add-course-button" onClick={handleAddCourse}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Добавить расписание
        </button>
      </div>
      
      <div className="search-container">
        <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
          <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
        </svg>
        <input 
          type="text" 
          className="search-input5" 
          placeholder="Поиск курсов..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="courses-list">
        {courses.map(course => (
          <div 
            key={course.id} 
            className={`course-list-item ${selectedCourse && selectedCourse.id === course.id ? 'active' : ''}`}
            onClick={() => handleCourseSelect(course)}
          >
            <div className="course-color" style={{ backgroundColor: course.backgroundColor }}></div>
            <div className="course-list-content">
              <div className="course-list-title">{course.title}</div>
              <div className="course-list-stats">
                <span className="course-stat">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                  </svg>
                  {course.people}
                </span>
                <span className="course-stat">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                  </svg>
                  {course.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoursesList;