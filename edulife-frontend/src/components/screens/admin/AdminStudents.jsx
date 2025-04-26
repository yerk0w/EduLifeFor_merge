import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

const AdminStudents = ({ students: initialStudents }) => {
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState(initialStudents || []);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const studentsPerPage = 10;

  // Загрузить студентов, если они не переданы в props
  useEffect(() => {
    if (!initialStudents || initialStudents.length === 0) {
      fetchStudents();
    } else {
      setStudents(initialStudents);
      setTotalPages(Math.ceil(initialStudents.length / studentsPerPage));
    }
  }, [initialStudents]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await apiService.auth.getStudents();
      
      if (Array.isArray(response)) {
        setStudents(response);
        setTotalPages(Math.ceil(response.length / studentsPerPage));
      } else {
        // Если API не вернул массив, используем пустой массив
        setStudents([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Ошибка при загрузке студентов:', error);
      
      // В случае ошибки используем моковые данные
      const mockStudents = [
        {
          id: 1,
          user_id: 1,
          name: 'Анна Смирнова',
          full_name: 'Анна Смирнова',
          email: 'anna@example.com',
          group_name: 'ИТ-101',
          progress: 85,
          last_activity: '2 часа назад',
          is_active: true
        },
        {
          id: 2,
          user_id: 2,
          name: 'Иван Петров',
          full_name: 'Иван Петров',
          email: 'ivan@example.com',
          group_name: 'ИТ-102',
          progress: 45,
          last_activity: '4 часа назад',
          is_active: true
        },
        {
          id: 3,
          user_id: 3,
          name: 'Мария Иванова',
          full_name: 'Мария Иванова',
          email: 'maria@example.com',
          group_name: 'ИТ-101',
          progress: 92,
          last_activity: 'вчера',
          is_active: true
        },
        {
          id: 4,
          user_id: 4,
          name: 'Алексей Сидоров',
          full_name: 'Алексей Сидоров',
          email: 'alexey@example.com',
          group_name: 'ИТ-102',
          progress: 60,
          last_activity: 'вчера',
          is_active: false
        }
      ];
      
      setStudents(mockStudents);
      setTotalPages(Math.ceil(mockStudents.length / studentsPerPage));
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация студентов по поиску и статусу
  const filteredStudents = students.filter(student => {
    const name = student.full_name || student.name || '';
    const email = student.email || '';
    const group = student.group_name || '';
    
    const matchesSearch = 
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') {
      return matchesSearch;
    }
    
    if (filter === 'active') {
      return matchesSearch && student.is_active;
    }
    
    if (filter === 'inactive') {
      return matchesSearch && !student.is_active;
    }
    
    return matchesSearch;
  });

  // Пагинация
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const handleViewStudent = (studentId) => {
    // Логика для просмотра профиля студента
    console.log('Просмотреть студента:', studentId);
    // Можно открыть модальное окно или перейти на страницу студента
  };

  const handleEditStudent = (studentId) => {
    // Логика для редактирования профиля студента
    console.log('Редактировать студента:', studentId);
    // Можно открыть модальное окно с формой редактирования
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого студента?')) {
      try {
        // В реальном приложении здесь должен быть запрос к API
        // await apiService.auth.deleteStudent(studentId);
        
        // Обновляем локальное состояние
        setStudents(students.filter(student => student.id !== studentId));
        console.log('Студент удален:', studentId);
      } catch (error) {
        console.error('Ошибка при удалении студента:', error);
        alert('Не удалось удалить студента. Пожалуйста, попробуйте позже.');
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page buttons
  const renderPageButtons = () => {
    const pageButtons = [];
    
    // Always show first page
    pageButtons.push(
      <button 
        key={1} 
        className={`pagination-page ${currentPage === 1 ? 'active' : ''}`}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );
    
    // Add ellipsis if needed
    if (currentPage > 3) {
      pageButtons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
    }
    
    // Add pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Skip first and last page as they're always shown
      
      pageButtons.push(
        <button 
          key={i} 
          className={`pagination-page ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    
    // Add ellipsis if needed
    if (currentPage < totalPages - 2) {
      pageButtons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1) {
      pageButtons.push(
        <button 
          key={totalPages} 
          className={`pagination-page ${currentPage === totalPages ? 'active' : ''}`}
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return pageButtons;
  };

  // Получение заглушки аватара
  const getAvatarPlaceholder = (name) => {
    if (!name) return '/images/avatar-placeholder.jpg';
    
    // В реальном приложении можно использовать сервис генерации аватаров
    // по первым буквам имени. Для примера используем фиксированные аватары
    const avatars = [
      '/images/avatar1.jpg',
      '/images/avatar2.jpg',
      '/images/avatar3.jpg',
      '/images/avatar4.jpg'
    ];
    
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length] || '/images/avatar-placeholder.jpg';
  };

  if (loading) {
    return (
      <div className="admin-students loading">
        <h3 className="section-title">Студенты</h3>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

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
              <th>Группа</th>
              <th>Прогресс</th>
              <th>Последняя активность</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map(student => (
                <tr key={student.id}>
                  <td className="student-name">
                  {student.full_name || student.name}
                  </td>
                  <td>{student.email}</td>
                  <td>{student.group_name || 'Не указана'}</td>
                  <td>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${student.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{student.progress || 0}%</span>
                  </td>
                  <td>{student.last_activity || 'Не активен'}</td>
                  <td className="actions-cell">
                    <button 
                      className="table-action-button" 
                      onClick={() => handleViewStudent(student.id)}
                      title="Просмотреть"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      </svg>
                    </button>
                    <button 
                      className="table-action-button"
                      onClick={() => handleEditStudent(student.id)}
                      title="Редактировать"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                      </svg>
                    </button>
                    <button 
                      className="table-action-button delete"
                      onClick={() => handleDeleteStudent(student.id)}
                      title="Удалить"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchQuery
                    ? 'Не найдено студентов по вашему запросу'
                    : 'Студенты не найдены'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredStudents.length > 0 && (
        <div className="pagination">
          <button 
            className="pagination-button prev"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
            </svg>
          </button>
          <div className="pagination-pages">
            {renderPageButtons()}
          </div>
          <button 
            className="pagination-button next"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;