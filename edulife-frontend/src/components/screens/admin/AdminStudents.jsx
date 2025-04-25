import React, { useState } from 'react';

const AdminStudents = () => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Моковые данные студентов для примера
  const studentsData = [
    {
      id: 1,
      name: 'Анна Смирнова',
      email: 'anna@example.com',
      coursesCount: 3,
      progress: 85,
      lastActivity: '2 часа назад',
      avatar: '/images/avatar1.jpg'
    },
    {
      id: 2,
      name: 'Иван Петров',
      email: 'ivan@example.com',
      coursesCount: 2,
      progress: 45,
      lastActivity: '4 часа назад',
      avatar: '/images/avatar2.jpg'
    },
    {
      id: 3,
      name: 'Мария Иванова',
      email: 'maria@example.com',
      coursesCount: 5,
      progress: 92,
      lastActivity: 'вчера',
      avatar: '/images/avatar3.jpg'
    },
    {
      id: 4,
      name: 'Алексей Сидоров',
      email: 'alexey@example.com',
      coursesCount: 1,
      progress: 60,
      lastActivity: 'вчера',
      avatar: '/images/avatar4.jpg'
    }
  ];

  // Фильтрация студентов по поиску
  const filteredStudents = studentsData.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStudent = (studentId) => {
    // Логика для просмотра профиля студента
    console.log('Просмотреть студента:', studentId);
  };

  const handleEditStudent = (studentId) => {
    // Логика для редактирования профиля студента
    console.log('Редактировать студента:', studentId);
  };

  const handleDeleteStudent = (studentId) => {
    // Логика для удаления студента
    console.log('Удалить студента:', studentId);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    // Предположим, что максимальное количество страниц равно 10
    if (currentPage < 10) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="admin-students">
      <h3 className="section-title">Студенты</h3>
      <div className="students-controls">
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder="Поиск студентов..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select 
            className="filter-select"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
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
            {filteredStudents.map(student => (
              <tr key={student.id}>
                <td className="student-name">
                  <img src={student.avatar} alt={student.name} className="student-avatar" />
                  <span>{student.name}</span>
                </td>
                <td>{student.email}</td>
                <td>{student.coursesCount}</td>
                <td>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${student.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{student.progress}%</span>
                </td>
                <td>{student.lastActivity}</td>
                <td className="actions-cell">
                  <button 
                    className="table-action-button" 
                    onClick={() => handleViewStudent(student.id)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                  </button>
                  <button 
                    className="table-action-button"
                    onClick={() => handleEditStudent(student.id)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                    </svg>
                  </button>
                  <button 
                    className="table-action-button delete"
                    onClick={() => handleDeleteStudent(student.id)}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <Pagination 
        currentPage={currentPage} 
        onPreviousPage={handlePreviousPage}
        onNextPage={handleNextPage}
        onSelectPage={page => setCurrentPage(page)}
      />
    </div>
  );
};

const Pagination = ({ currentPage, onPreviousPage, onNextPage, onSelectPage }) => {
  return (
    <div className="pagination">
      <button 
        className="pagination-button prev"
        onClick={onPreviousPage}
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
        </svg>
      </button>
      <div className="pagination-pages">
        <button 
          className={`pagination-page ${currentPage === 1 ? 'active' : ''}`}
          onClick={() => onSelectPage(1)}
        >
          1
        </button>
        <button 
          className={`pagination-page ${currentPage === 2 ? 'active' : ''}`}
          onClick={() => onSelectPage(2)}
        >
          2
        </button>
        <button 
          className={`pagination-page ${currentPage === 3 ? 'active' : ''}`}
          onClick={() => onSelectPage(3)}
        >
          3
        </button>
        <span className="pagination-ellipsis">...</span>
        <button 
          className={`pagination-page ${currentPage === 10 ? 'active' : ''}`}
          onClick={() => onSelectPage(10)}
        >
          10
        </button>
      </div>
      <button 
        className="pagination-button next"
        onClick={onNextPage}
      >
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
        </svg>
      </button>
    </div>
  );
};

export default AdminStudents;