import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = ({ courses = [] }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('courses');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const stats = {
    totalStudents: 2458,
    activeStudents: 1845,
    totalCourses: courses.length,
    completionRate: 78,
    averageRating: 4.8
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setIsEditing(false);
  };

  const handleEditCourse = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    navigate('/');
  };

  const renderDashboard = () => (
    <div className="admin-dashboard">
      <h3 className="section-title">Обзор платформы</h3>

      <div className="stats-overview">
        <div className="stats-row">
          <div className="stat-card primary">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalStudents}</div>
              <div className="stat-label">Всего студентов</div>
            </div>
            <div className="stat-trend positive">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M16,6L18.29,8.29L13.41,13.17L9.41,9.17L2,16.59L3.41,18L9.41,12L13.41,16L19.71,9.71L22,12V6H16Z" />
              </svg>
              <span>+12.5%</span>
            </div>
          </div>

          <div className="stat-card warning">
            <div className="stat-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{"3"}</div>
              <div className="stat-label">Всего курсов</div>
            </div>
          </div>
          
        </div>
        
        <div className="stats-row">
          
          <div className="chart-card">
            <div className="chart-header">
              <h4 className="chart-title">Активность студентов</h4>
              <div className="chart-period">
                <select className="period-select">
                  <option value="week">За неделю</option>   
                  <option value="month" selected>За месяц</option>
                  <option value="year">За год</option>
                </select>
              </div>
            </div>
            <div className="chart-content">
              <div className="chart-bars">
                <div className="chart-bar" style={{ height: '65%' }}>
                  <div className="bar-tooltip">65</div>
                </div>
                <div className="chart-bar" style={{ height: '80%' }}>
                  <div className="bar-tooltip">80</div>
                </div>
                <div className="chart-bar" style={{ height: '45%' }}>
                  <div className="bar-tooltip">45</div>
                </div>
                <div className="chart-bar" style={{ height: '70%' }}>
                  <div className="bar-tooltip">70</div>
                </div>
                <div className="chart-bar" style={{ height: '90%' }}>
                  <div className="bar-tooltip">90</div>
                </div>
                <div className="chart-bar" style={{ height: '60%' }}>
                  <div className="bar-tooltip">60</div>
                </div>
                <div className="chart-bar" style={{ height: '75%' }}>
                  <div className="bar-tooltip">75</div>
                </div>
              </div>
              <div className="chart-labels">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Вс</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-sections">
        <div className="activity-section">
          <div className="section-header">
            <h4 className="section-title">Последняя активность</h4>
            <button className="view-all-button">
              Все активности
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
              </svg>
            </button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-avatar">
                <img src="/images/avatar1.jpg" alt="User" />
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-user">Анна Смирнова</span> завершила курс <span className="activity-course">UX/UI Designer</span>
                </div>
                <div className="activity-time">2 часа назад</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-avatar">
                <img src="/images/avatar2.jpg" alt="User" />
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-user">Иван Петров</span> присоединился к курсу <span className="activity-course">Web Development</span>
                </div>
                <div className="activity-time">4 часа назад</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-avatar">
                <img src="/images/avatar3.jpg" alt="User" />
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-user">Мария Иванова</span> оставила отзыв на курс <span className="activity-course">Interface Design</span>
                </div>
                <div className="activity-time">вчера</div>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-avatar">
                <img src="/images/avatar4.jpg" alt="User" />
              </div>
              <div className="activity-content">
                <div className="activity-text">
                  <span className="activity-user">Алексей Сидоров</span> выполнил домашнее задание по курсу <span className="activity-course">Mobile App Design</span>
                </div>
                <div className="activity-time">вчера</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
);
 
  
  const renderCourses = () => {
    const handleAddCourse = () => {
      const newCourse = {
        id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
        title: "Новый курс",
        description: "Описание нового курса",
        backgroundColor: "#4A6CF7",
        hours: "0 часов",
        people: 0,
        videoType: "youtube",
        videoUrl: "",
        image: "",
        homework: []
      };
      // Например: onCoursesUpdate([...courses, newCourse]);
      setSelectedCourse(newCourse);
      setIsEditing(true);
    };
  
    return (
      <div className="admin-courses">
        <div className="courses-list-container">
          <div className="courses-header">
            <h3 className="section-title">Курсы</h3>
            <button className="add-course-button" onClick={handleAddCourse}>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Добавить курс
            </button>
          </div>
          
          <div className="search-container">
            <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon2">
              <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
            </svg>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Поиск курсов..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="courses-list">
            {filteredCourses.map(course => (
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
        
        <div className="course-details-container">
          {selectedCourse ? (
            isEditing ? (
              <div className="course-edit-form">
                <h3 className="section-title">
                  {selectedCourse.id && courses.some(c => c.id === selectedCourse.id) 
                    ? "Редактирование курса" 
                    : "Добавление нового курса"
                  }
                </h3>
                
                <div className="form-group">
                  <label className="form-label">Название курса</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={selectedCourse.title} 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Описание</label>
                  <textarea 
                    className="form-textarea" 
                    rows="4"
                    defaultValue={selectedCourse.description}
                  ></textarea>
                </div>
                
                <div className="form-row">
                  <div className="form-group half">
                    <label className="form-label">Цвет фона</label>
                    <input 
                      type="color" 
                      className="form-color" 
                      defaultValue={selectedCourse.backgroundColor} 
                    />
                  </div>
                  
                  <div className="form-group half">
                    <label className="form-label">Продолжительность</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      defaultValue={selectedCourse.hours} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">URL видео</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    defaultValue={selectedCourse.videoUrl} 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Тип видео</label>
                  <select className="form-select" defaultValue={selectedCourse.videoType}>
                    <option value="youtube">YouTube</option>
                    <option value="direct">Прямая ссылка</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Изображение курса</label>
                  <div className="file-input-container">
                    <input type="file" className="file-input" id="course-image" />
                    <label htmlFor="course-image" className="file-input-label">
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                      </svg>
                      Выбрать файл
                    </label>
                    <span className="file-name">
                      {selectedCourse.image ? selectedCourse.image.split('/').pop() : 'Файл не выбран'}
                    </span>
                  </div>
                </div>
                
                <h4 className="subsection-title">Домашнее задание</h4>
                
                {selectedCourse.homework && selectedCourse.homework.map((question, index) => (
                  <div key={index} className="homework-question-edit">
                    <div className="form-group">
                      <label className="form-label">Вопрос {index + 1}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        defaultValue={question.question} 
                      />
                    </div>
                    
                    <div className="options-container">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="form-group option-group">
                          <div className="option-row">
                            <input 
                              type="radio" 
                              name={`correct-${index}`} 
                              id={`option-${index}-${optIndex}`}
                              defaultChecked={optIndex === question.correctAnswer}
                              className="option-radio"
                            />
                            <input 
                              type="text" 
                              className="form-input option-input" 
                              defaultValue={option} 
                            />
                            <button 
                              className="remove-option-button"
                              type="button" // Добавляем тип кнопки
                              onClick={(e) => {
                                e.preventDefault(); // Предотвращаем отправку формы
                                // Здесь должен быть код для удаления варианта ответа
                              }}
                            >
                              <svg viewBox="0 0 24 24" width="20" height="20">
                                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                              </svg>
                            </button>
                          </div>
                          <label htmlFor={`option-${index}-${optIndex}`} className="option-label">
                            {optIndex === question.correctAnswer ? 'Правильный ответ' : ''}
                          </label>
                        </div>
                      ))}
                    </div>
                    
                    <div className="question-actions">
                      <button 
                        className="add-option-button"
                        type="button" // Добавляем тип кнопки
                        onClick={(e) => {
                          e.preventDefault(); // Предотвращаем отправку формы
                          // Здесь должен быть код для добавления варианта ответа
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                        </svg>
                        Добавить вариант
                      </button>
                      
                      <button 
                        className="remove-question-button"
                        type="button" // Добавляем тип кнопки
                        onClick={(e) => {
                          e.preventDefault(); // Предотвращаем отправку формы
                          // Здесь должен быть код для удаления вопроса
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                        Удалить вопрос
                      </button>
                    </div>
                  </div>
                ))}
                
                <button 
                  className="add-question-button"
                  type="button" // Добавляем тип кнопки
                  onClick={(e) => {
                    e.preventDefault(); // Предотвращаем отправку формы
                    // Здесь должен быть код для добавления нового вопроса
                  }}
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                  </svg>
                  Добавить вопрос
                </button>
                
                <div className="form-actions">
                  <button 
                    className="cancel-button" 
                    type="button" // Добавляем тип кнопки
                    onClick={() => {
                      // Если это новый курс, который еще не добавлен в список
                      if (!courses.some(c => c.id === selectedCourse.id)) {
                        setSelectedCourse(null);
                      } else {
                        setIsEditing(false);
                      }
                    }}
                  >
                    Отмена
                  </button>
                  <button 
                    className="save-button"
                    type="button" // Добавляем тип кнопки
                    onClick={() => {
                      // Здесь должен быть код для сохранения изменений
                      // Если это новый курс, его нужно добавить в список
                      // Если существующий - обновить его данные
                      setIsEditing(false);
                    }}
                  >
                    {selectedCourse.id && courses.some(c => c.id === selectedCourse.id) 
                      ? "Сохранить" 
                      : "Создать курс"
                    }
                  </button>
                </div>
              </div>
            ) : (
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
                    <button 
                    className="delete-button"
                    onClick={() => {
                      // Здесь должен быть код для удаления курса
                      // Например: onCoursesUpdate(courses.filter(c => c.id !== selectedCourse.id));
                      setSelectedCourse(null);
                      
                      // Можно добавить подтверждение удаления
                      if (window.confirm(`Вы уверены, что хотите удалить курс "${selectedCourse.title}"?`)) {
                        // Удаление курса из списка
                        // onCoursesUpdate(courses.filter(c => c.id !== selectedCourse.id));
                      }
                    }}
                  >
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
              
              <div className="homework-section">
                <h4 className="subsection-title">Домашнее задание</h4>
                
                {selectedCourse.homework && selectedCourse.homework.length > 0 ? (
                  <div className="homework-list">
                    {selectedCourse.homework.map((question, index) => (
                      <div key={index} className="homework-item">
                        <div className="question-text">
                          <span className="question-number">{index + 1}.</span> {question.question}
                        </div>
                        <div className="options-list">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className={`option-item ${optIndex === question.correctAnswer ? 'correct' : ''}`}>
                              {option}
                              {optIndex === question.correctAnswer && (
                                <svg viewBox="0 0 24 24" width="16" height="16" className="correct-icon">
                                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-homework">
                    Для этого курса еще не добавлено домашнее задание.
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="no-course-selected">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
            </svg>
            <p>Выберите курс из списка слева для просмотра деталей</p>
          </div>
        )}
      </div>
    </div>
  );
};
 
  
  const renderStudents = () => (
    <div className="admin-students">
      <h3 className="section-title">Студенты</h3>
      <div className="students-controls">
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input type="text" className="search-input" placeholder="Поиск студентов..." />
        </div>
        
        <div className="filter-container">
          <select className="filter-select">
            <option value="all">Все студенты</option>
            <option value="active">Активные</option>
            <option value="inactive">Неактивные</option>
          </select>
        </div>
      </div>
      
      <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Курсы</th>
              <th>Прогресс</th>
              <th>Последняя активность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="student-name">
                <img src="/images/avatar1.jpg" alt="Анна Смирнова" className="student-avatar" />
                <span>Анна Смирнова</span>
              </td>
              <td>anna@example.com</td>
              <td>3</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '85%' }}></div>
                </div>
                <span className="progress-text">85%</span>
              </td>
              <td>2 часа назад</td>
              <td className="actions-cell">
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  </svg>
                </button>
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button className="table-action-button delete">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr>
              <td className="student-name">
                <img src="/images/avatar2.jpg" alt="Иван Петров" className="student-avatar" />
                <span>Иван Петров</span>
              </td>
              <td>ivan@example.com</td>
              <td>2</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }}></div>
                </div>
                <span className="progress-text">45%</span>
              </td>
              <td>4 часа назад</td>
              <td className="actions-cell">
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  </svg>
                </button>
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button className="table-action-button delete">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr>
              <td className="student-name">
                <img src="/images/avatar3.jpg" alt="Мария Иванова" className="student-avatar" />
                <span>Мария Иванова</span>
              </td>
              <td>maria@example.com</td>
              <td>5</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '92%' }}></div>
                </div>
                <span className="progress-text">92%</span>
              </td>
              <td>вчера</td>
              <td className="actions-cell">
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  </svg>
                </button>
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button className="table-action-button delete">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr>
              <td className="student-name">
                <img src="/images/avatar4.jpg" alt="Алексей Сидоров" className="student-avatar" />
                <span>Алексей Сидоров</span>
              </td>
              <td>alexey@example.com</td>
              <td>1</td>
              <td>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
                <span className="progress-text">60%</span>
              </td>
              <td>вчера</td>
              <td className="actions-cell">
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  </svg>
                </button>
                <button className="table-action-button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                  </svg>
                </button>
                <button className="table-action-button delete">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="pagination">
        <button className="pagination-button prev">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
          </svg>
        </button>
        <div className="pagination-pages">
          <button className="pagination-page active">1</button>
          <button className="pagination-page">2</button>
          <button className="pagination-page">3</button>
          <span className="pagination-ellipsis">...</span>
          <button className="pagination-page">10</button>
        </div>
        <button className="pagination-button next">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="admin-reports">
      <h3 className="section-title">Отчеты</h3>
      
      <div className="reports-filters">
        <div className="date-range">
          <label className="filter-label">Период:</label>
          <select className="filter-select">
            <option value="week">Последняя неделя</option>
            <option value="month" selected>Последний месяц</option>
            <option value="quarter">Последний квартал</option>
            <option value="year">Последний год</option>
            <option value="custom">Произвольный период</option>
          </select>
        </div>
        
        <div className="course-filter">
          <label className="filter-label">Курс:</label>
          <select className="filter-select">
            <option value="all">Все курсы</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
        
        <button className="generate-report-button">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,19L11.5,17.5L9,15L11.5,12.5L10,11L6,15L10,19M18,15L14,11L12.5,12.5L15,15L12.5,17.5L14,19L18,15Z" />
          </svg>
          Экспорт в CSV
        </button>
      </div>
      
      <div className="reports-charts">
        <div className="chart-container1">
          <h4 className="chart-title">Активность студентов</h4>
          <div className="chart-placeholder">
            <div className="chart-bars">
              <div className="chart-bar" style={{ height: '65%' }}><span className="bar-value">65</span></div>
              <div className="chart-bar" style={{ height: '80%' }}><span className="bar-value">80</span></div>
              <div className="chart-bar" style={{ height: '45%' }}><span className="bar-value">45</span></div>
              <div className="chart-bar" style={{ height: '70%' }}><span className="bar-value">70</span></div>
              <div className="chart-bar" style={{ height: '90%' }}><span className="bar-value">90</span></div>
              <div className="chart-bar" style={{ height: '60%' }}><span className="bar-value">60</span></div>
              <div className="chart-bar" style={{ height: '75%' }}><span className="bar-value">75</span></div>
            </div>
            <div className="chart-labels">
              <span>Пн</span>
              <span>Вт</span>
              <span>Ср</span>
              <span>Чт</span>
              <span>Пт</span>
              <span>Сб</span>
              <span>Вс</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="reports-tables">
        
        
        <div className="report-table-container">
          <h4 className="table-title">Последние регистрации</h4>
          <table className="report-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Курс</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Елена Кузнецова</td>
                <td>UX/UI Designer</td>
                <td>23 апреля 2025</td>
              </tr>
              <tr>
                <td>Дмитрий Волков</td>
                <td>Web Development</td>
                <td>22 апреля 2025</td>
              </tr>
              <tr>
                <td>Ольга Соколова</td>
                <td>Mobile App Design</td>
                <td>21 апреля 2025</td>
              </tr>
              <tr>
                <td>Сергей Новиков</td>
                <td>Interface Design</td>
                <td>20 апреля 2025</td>
              </tr>
              <tr>
                <td>Татьяна Морозова</td>
                <td>UX/UI Designer</td>
                <td>19 апреля 2025</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );



  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-logo">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
          </svg>
          <h1 className="admin-title">EduLife
          </h1>
        </div>
        
        <div className="admin-user">
          <div className="user-info1">
            <span className="user-name">Администратор</span>
            <span className="user-role">Администратор</span>
          </div>
          <div className="user-avatar">
            <img src="/images/admin-avatar.jpg" alt="Admin" />
          </div>
        </div>
      </div>
      
      <div className="admin-content">
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
              <span className="tab-text">Курсы</span>
            </button>
            
            <button 
              className={`sidebar-tab ${activeTab === 'students' ? 'active' : ''}`}
              onClick={() => setActiveTab('students')}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
              </svg>
              <span className="tab-text">Студенты</span>
            </button>
            
            <button 
              className={`sidebar-tab ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M7,13H21V11H7M7,19H21V17H7M7,7H21V5H7M2,11H5.5V13H2M2,5H5.5V7H2M2,17H5.5V19H2Z" />
              </svg>
              <span className="tab-text">Отчеты</span>
            </button>
            

          </div>
          
          <button className="logout-button" onClick={handleBack}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path d="M19,3H5C3.89,3 3,3.89 3,5V9H5V5H19V19H5V15H3V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10.08,15.58L11.5,17L16.5,12L11.5,7L10.08,8.41L12.67,11H3V13H12.67L10.08,15.58Z" />
            </svg>
            <span className="button-text">Выйти</span>
          </button>
        </div>
        
        <div className="admin-main">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'courses' && renderCourses()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
