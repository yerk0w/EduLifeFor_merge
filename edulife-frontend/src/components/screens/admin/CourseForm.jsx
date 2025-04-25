import React from 'react';

const CourseForm = ({ selectedCourse, courses, setIsEditing, setSelectedCourse }) => {
  const isNewCourse = !courses.some(c => c.id === selectedCourse.id);
  
  const handleCancel = () => {
    // Если это новый курс, который еще не добавлен в список
    if (isNewCourse) {
      setSelectedCourse(null);
    } else {
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    // Здесь должен быть код для сохранения изменений
    // Если это новый курс, его нужно добавить в список
    // Если существующий - обновить его данные
    setIsEditing(false);
  };

  return (
    <div className="course-edit-form">
      <h3 className="section-title">
        {isNewCourse ? "Добавление нового курса" : "Редактирование курса"}
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
      
      <CourseFormHomework 
        homework={selectedCourse.homework || []} 
      />
      
      <div className="form-actions">
        <button 
          className="cancel-button" 
          type="button"
          onClick={handleCancel}
        >
          Отмена
        </button>
        <button 
          className="save-button"
          type="button"
          onClick={handleSave}
        >
          {isNewCourse ? "Создать курс" : "Сохранить"}
        </button>
      </div>
    </div>
  );
};

const CourseFormHomework = ({ homework }) => {
  const handleAddQuestion = (e) => {
    e.preventDefault();
    // Здесь должен быть код для добавления нового вопроса
  };

  return (
    <>
      <h4 className="subsection-title">Домашнее задание</h4>
      
      {homework.map((question, index) => (
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
                    type="button"
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
              type="button"
            >
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Добавить вариант
            </button>
            
            <button 
              className="remove-question-button"
              type="button"
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
        type="button"
        onClick={handleAddQuestion}
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
        Добавить вопрос
      </button>
    </>
  );
};

export default CourseForm;