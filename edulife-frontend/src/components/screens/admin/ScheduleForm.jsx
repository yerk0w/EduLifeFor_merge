import React, { useState, useEffect } from 'react';

const ScheduleForm = ({ 
  selectedScheduleItem, 
  subjects,
  classrooms,
  lessonTypes,
  teachers,
  groups,
  setIsEditing,
  onSave
}) => {
  const [formData, setFormData] = useState({
    id: selectedScheduleItem?.id || 0,
    date: selectedScheduleItem?.date || new Date().toISOString().split('T')[0],
    time_start: selectedScheduleItem?.time_start || "08:00:00",
    time_end: selectedScheduleItem?.time_end || "09:30:00",
    subject_id: selectedScheduleItem?.subject_id || (subjects && subjects.length > 0 ? subjects[0].id : 1),
    teacher_id: selectedScheduleItem?.teacher_id || (teachers && teachers.length > 0 ? teachers[0].id : 1),
    group_id: selectedScheduleItem?.group_id || (groups && groups.length > 0 ? groups[0].id : 1),
    classroom_id: selectedScheduleItem?.classroom_id || (classrooms && classrooms.length > 0 ? classrooms[0].id : 1),
    lesson_type_id: selectedScheduleItem?.lesson_type_id || (lessonTypes && lessonTypes.length > 0 ? lessonTypes[0].id : 1)
  });

  // Логирование для отладки
  useEffect(() => {
    console.log("Форма расписания загружена с данными:");
    console.log("Subjects:", subjects);
    console.log("Teachers:", teachers);
    console.log("Groups:", groups);
    console.log("Selected item:", selectedScheduleItem);
    console.log("Form data:", formData);
  }, [subjects, teachers, groups, selectedScheduleItem, formData]);

  const isNewScheduleItem = !selectedScheduleItem || selectedScheduleItem.id === 0;
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCancel = () => {
    // Если это новый элемент расписания, который еще не добавлен
    if (isNewScheduleItem) {
      // Возвращаемся к списку без выбранного элемента
      setIsEditing(false);
    } else {
      // Просто выходим из режима редактирования
      setIsEditing(false);
    }
  };

  const handleSave = () => {
    // Валидация данных формы
    if (!formData.date || !formData.time_start || !formData.time_end || 
        !formData.subject_id || !formData.teacher_id || !formData.group_id || 
        !formData.classroom_id || !formData.lesson_type_id) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Проверка корректности времени
    if (formData.time_start >= formData.time_end) {
      alert('Время начала должно быть раньше времени окончания');
      return;
    }
    
    // Преобразуем ID из строк в числа для API
    const apiData = {
      ...formData,
      subject_id: Number(formData.subject_id),
      teacher_id: Number(formData.teacher_id),
      group_id: Number(formData.group_id),
      classroom_id: Number(formData.classroom_id),
      lesson_type_id: Number(formData.lesson_type_id)
    };
    
    // Передаем данные формы родительскому компоненту для сохранения
    onSave(apiData);
  };

  // Если данные еще не загружены, показываем индикатор загрузки
  if (!subjects || !classrooms || !lessonTypes || !teachers || !groups) {
    return (
      <div className="course-edit-form">
        <h3 className="section-title">Загрузка данных...</h3>
      </div>
    );
  }

  return (
    <div className="course-edit-form">
      <h3 className="section-title">
        {isNewScheduleItem ? "Добавление занятия" : "Редактирование занятия"}
      </h3>
      
      <div className="form-group">
        <label className="form-label">Дата занятия</label>
        <input 
          type="date" 
          className="form-input" 
          name="date"
          value={formData.date}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-row">
        <div className="form-group half">
          <label className="form-label">Время начала</label>
          <input 
            type="time" 
            className="form-input" 
            name="time_start"
            value={formData.time_start.substring(0, 5)}
            onChange={(e) => handleChange({
              target: {
                name: 'time_start',
                value: e.target.value + ':00'
              }
            })}
          />
        </div>
        
        <div className="form-group half">
          <label className="form-label">Время окончания</label>
          <input 
            type="time" 
            className="form-input" 
            name="time_end"
            value={formData.time_end.substring(0, 5)}
            onChange={(e) => handleChange({
              target: {
                name: 'time_end',
                value: e.target.value + ':00'
              }
            })}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Предмет</label>
        <select 
          className="form-select"
          name="subject_id"
          value={formData.subject_id}
          onChange={handleChange}
        >
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Тип занятия</label>
        <select 
          className="form-select"
          name="lesson_type_id"
          value={formData.lesson_type_id}
          onChange={handleChange}
        >
          {lessonTypes.map(type => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Преподаватель</label>
        <select 
          className="form-select"
          name="teacher_id"
          value={formData.teacher_id}
          onChange={handleChange}
        >
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name || (teacher.user_id ? `ID пользователя: ${teacher.user_id}` : `ID: ${teacher.id}`)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Группа</label>
        <select 
          className="form-select"
          name="group_id"
          value={formData.group_id}
          onChange={handleChange}
        >
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name || `Группа ID: ${group.id}`}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-group">
        <label className="form-label">Аудитория</label>
        <select 
          className="form-select"
          name="classroom_id"
          value={formData.classroom_id}
          onChange={handleChange}
        >
          {classrooms.map(classroom => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name}
            </option>
          ))}
        </select>
      </div>
      
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
          {isNewScheduleItem ? "Создать занятие" : "Сохранить"}
        </button>
      </div>
    </div>
  );
};

export default ScheduleForm;