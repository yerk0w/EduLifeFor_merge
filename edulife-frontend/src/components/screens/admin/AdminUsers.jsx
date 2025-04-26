import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [groups, setGroups] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState(null);
  const usersPerPage = 10;

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchAllData();
  }, []);

  // Функция для загрузки всех необходимых данных
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Получаем токен
      const token = localStorage.getItem('authToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Загрузка пользователей
      try {
        const usersResponse = await apiService.auth.getAllUsers();
        setUsers(Array.isArray(usersResponse) ? usersResponse : []);
      } catch (err) {
        console.error('Ошибка при загрузке пользователей:', err);
        setUsers([]);
      }

      // Загрузка факультетов
      try {
        const facultiesResponse = await apiService.auth.getFaculties();
        setFaculties(Array.isArray(facultiesResponse) ? facultiesResponse : []);
      } catch (err) {
        console.error('Ошибка при загрузке факультетов:', err);
        setFaculties([]);
      }

      // Загрузка кафедр
      try {
        const departmentsResponse = await apiService.auth.getDepartments();
        setDepartments(Array.isArray(departmentsResponse) ? departmentsResponse : []);
      } catch (err) {
        console.error('Ошибка при загрузке кафедр:', err);
        setDepartments([]);
      }

      // Загрузка групп
      try {
        const groupsResponse = await apiService.auth.getGroups();
        setGroups(Array.isArray(groupsResponse) ? groupsResponse : []);
      } catch (err) {
        console.error('Ошибка при загрузке групп:', err);
        setGroups([]);
      }

      // Загрузка ролей
      try {
        const rolesResponse = await apiService.auth.getRoles();
        setRoles(Array.isArray(rolesResponse) ? rolesResponse : [
          { id: 1, name: 'admin', display_name: 'Администратор' },
          { id: 2, name: 'teacher', display_name: 'Преподаватель' },
          { id: 3, name: 'student', display_name: 'Студент' }
        ]);
      } catch (err) {
        console.error('Ошибка при загрузке ролей:', err);
        // Устанавливаем стандартные роли, если не удалось загрузить
        setRoles([
          { id: 1, name: 'admin', display_name: 'Администратор' },
          { id: 2, name: 'teacher', display_name: 'Преподаватель' },
          { id: 3, name: 'student', display_name: 'Студент' }
        ]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Произошла ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация пользователей по поиску и роли
  const filteredUsers = users.filter(user => {
    const fullName = user.full_name || '';
    const username = user.username || '';
    const email = user.email || '';
    const role = user.role_name || '';
    
    const matchesSearch = 
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && role === filter;
  });

  // Пагинация
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Открытие модального окна редактирования пользователя
  const handleEditUser = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setEditingUser({
        ...user,
        student_info: null,
        teacher_info: null
      });
      
      // Загрузка данных о студенте и преподавателе, если они существуют
      if (user.role_name === 'student') {
        apiService.auth.getStudentByUser(userId)
          .then(data => {
            if (data) {
              setEditingUser(prev => ({
                ...prev,
                student_info: data
              }));
            }
          })
          .catch(err => console.error('Ошибка при загрузке данных студента:', err));
      } else if (user.role_name === 'teacher') {
        apiService.auth.getTeacherByUser(userId)
          .then(data => {
            if (data) {
              setEditingUser(prev => ({
                ...prev,
                teacher_info: data
              }));
            }
          })
          .catch(err => console.error('Ошибка при загрузке данных преподавателя:', err));
      }
    }
  };

  // Закрытие модального окна редактирования
  const handleCloseModal = () => {
    setEditingUser(null);
  };

  // Сохранение данных пользователя
  const handleSaveUser = async () => {
    if (!editingUser) return;
    
    try {
      // Обновление базовой информации пользователя
      await apiService.auth.updateUser(editingUser.id, {
        username: editingUser.username,
        email: editingUser.email,
        full_name: editingUser.full_name,
        role_id: editingUser.role_id,
        disabled: editingUser.disabled
      });
      
      // Обновление информации о студенте, если роль - студент
      if (editingUser.role_name === 'student' && editingUser.student_info) {
        if (editingUser.student_info.id) {
          // Обновление существующего студента
          await apiService.auth.updateStudent(editingUser.student_info.id, {
            group_id: editingUser.student_info.group_id,
            student_id: editingUser.student_info.student_id,
            enrollment_year: editingUser.student_info.enrollment_year
          });
        } else {
          // Создание нового студента
          await apiService.auth.createStudent({
            user_id: editingUser.id,
            group_id: editingUser.student_info.group_id,
            student_id: editingUser.student_info.student_id || `ST${Date.now()}`,
            enrollment_year: editingUser.student_info.enrollment_year || new Date().getFullYear()
          });
        }
      }
      
      // Обновление информации о преподавателе, если роль - преподаватель
      if (editingUser.role_name === 'teacher' && editingUser.teacher_info) {
        if (editingUser.teacher_info.id) {
          // Обновление существующего преподавателя
          await apiService.auth.updateTeacher(editingUser.teacher_info.id, {
            department_id: editingUser.teacher_info.department_id,
            position: editingUser.teacher_info.position,
            contact_info: editingUser.teacher_info.contact_info
          });
        } else {
          // Создание нового преподавателя
          await apiService.auth.createTeacher({
            user_id: editingUser.id,
            department_id: editingUser.teacher_info.department_id,
            position: editingUser.teacher_info.position || 'Преподаватель',
            contact_info: editingUser.teacher_info.contact_info || ''
          });
        }
      }
      
      // Обновляем список пользователей
      fetchAllData();
      handleCloseModal();
    } catch (error) {
      console.error('Ошибка при сохранении пользователя:', error);
      setError('Не удалось сохранить изменения. Пожалуйста, попробуйте снова.');
    }
  };

  // Изменение полей пользователя
  const handleUserChange = (field, value) => {
    setEditingUser(prev => {
      const updated = { ...prev, [field]: value };
      
      // Если меняем роль, инициализируем соответствующие данные
      if (field === 'role_id') {
        const selectedRole = roles.find(r => r.id === parseInt(value));
        updated.role_name = selectedRole ? selectedRole.name : '';
        
        if (updated.role_name === 'student' && !updated.student_info) {
          updated.student_info = {
            group_id: '',
            student_id: '',
            enrollment_year: new Date().getFullYear()
          };
        } else if (updated.role_name === 'teacher' && !updated.teacher_info) {
          updated.teacher_info = {
            department_id: '',
            position: 'Преподаватель',
            contact_info: ''
          };
        }
      }
      
      return updated;
    });
  };

  // Изменение полей студента
  const handleStudentChange = (field, value) => {
    setEditingUser(prev => ({
      ...prev,
      student_info: {
        ...prev.student_info,
        [field]: value
      }
    }));
  };

  // Изменение полей преподавателя
  const handleTeacherChange = (field, value) => {
    setEditingUser(prev => ({
      ...prev,
      teacher_info: {
        ...prev.teacher_info,
        [field]: value
      }
    }));
  };

  // Удаление пользователя
  const handleDeleteUser = async (userId) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      try {
        await apiService.auth.deleteUser(userId);
        // Обновляем список пользователей
        fetchAllData();
      } catch (error) {
        console.error('Ошибка при удалении пользователя:', error);
        setError('Не удалось удалить пользователя. Пожалуйста, попробуйте позже.');
      }
    }
  };

  // Открытие модального окна создания пользователя
  const handleCreateUser = () => {
    setEditingUser({
      id: null,
      username: '',
      email: '',
      full_name: '',
      role_id: 3, // По умолчанию - студент
      role_name: 'student',
      disabled: false,
      student_info: {
        group_id: '',
        student_id: '',
        enrollment_year: new Date().getFullYear()
      }
    });
  };

  // Пагинация - предыдущая страница
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Пагинация - следующая страница
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Генерация кнопок для пагинации
  const renderPageButtons = () => {
    const pageButtons = [];
    
    // Всегда показываем первую страницу
    pageButtons.push(
      <button 
        key={1} 
        className={`pagination-page ${currentPage === 1 ? 'active' : ''}`}
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );
    
    // Добавляем многоточие если нужно
    if (currentPage > 3) {
      pageButtons.push(<span key="ellipsis1" className="pagination-ellipsis">...</span>);
    }
    
    // Добавляем страницы вокруг текущей
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue; // Пропускаем первую и последнюю страницы
      
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
    
    // Добавляем многоточие если нужно
    if (currentPage < totalPages - 2) {
      pageButtons.push(<span key="ellipsis2" className="pagination-ellipsis">...</span>);
    }
    
    // Всегда показываем последнюю страницу если их больше одной
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

  // Модальное окно редактирования/создания пользователя
  const renderEditModal = () => {
    if (!editingUser) return null;

    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-header">
            <h3>{editingUser.id ? 'Редактировать пользователя' : 'Создать пользователя'}</h3>
            <button className="close-button" onClick={handleCloseModal}>×</button>
          </div>
          <div className="modal-content">
            <div className="form-group">
              <label>ФИО:</label>
              <input 
                type="text" 
                value={editingUser.full_name || ''} 
                onChange={(e) => handleUserChange('full_name', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Логин:</label>
              <input 
                type="text" 
                value={editingUser.username || ''} 
                onChange={(e) => handleUserChange('username', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input 
                type="email" 
                value={editingUser.email || ''} 
                onChange={(e) => handleUserChange('email', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Роль:</label>
              <select 
                value={editingUser.role_id || ''} 
                onChange={(e) => handleUserChange('role_id', parseInt(e.target.value))}
                className="form-select"
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.display_name || role.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Статус:</label>
              <select 
                value={editingUser.disabled ? '1' : '0'} 
                onChange={(e) => handleUserChange('disabled', e.target.value === '1')}
                className="form-select"
              >
                <option value="0">Активен</option>
                <option value="1">Заблокирован</option>
              </select>
            </div>

            {/* Дополнительные поля для студента */}
            {editingUser.role_name === 'student' && editingUser.student_info && (
              <div className="student-fields">
                <h4>Данные студента</h4>
                <div className="form-group">
                  <label>Группа:</label>
                  <select 
                    value={editingUser.student_info.group_id || ''} 
                    onChange={(e) => handleStudentChange('group_id', parseInt(e.target.value))}
                    className="form-select"
                  >
                    <option value="">Выберите группу</option>
                    {groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name} - {group.faculty_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ID студента:</label>
                  <input 
                    type="text" 
                    value={editingUser.student_info.student_id || ''} 
                    onChange={(e) => handleStudentChange('student_id', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Год поступления:</label>
                  <input 
                    type="number" 
                    value={editingUser.student_info.enrollment_year || new Date().getFullYear()} 
                    onChange={(e) => handleStudentChange('enrollment_year', parseInt(e.target.value))}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* Дополнительные поля для преподавателя */}
            {editingUser.role_name === 'teacher' && editingUser.teacher_info && (
              <div className="teacher-fields">
                <h4>Данные преподавателя</h4>
                <div className="form-group">
                  <label>Кафедра:</label>
                  <select 
                    value={editingUser.teacher_info.department_id || ''} 
                    onChange={(e) => handleTeacherChange('department_id', parseInt(e.target.value))}
                    className="form-select"
                  >
                    <option value="">Выберите кафедру</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} - {dept.faculty_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Должность:</label>
                  <input 
                    type="text" 
                    value={editingUser.teacher_info.position || ''} 
                    onChange={(e) => handleTeacherChange('position', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Контактная информация:</label>
                  <textarea 
                    value={editingUser.teacher_info.contact_info || ''} 
                    onChange={(e) => handleTeacherChange('contact_info', e.target.value)}
                    className="form-textarea"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="cancel-button" onClick={handleCloseModal}>Отмена</button>
            <button className="save-button" onClick={handleSaveUser}>
              {editingUser.id ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="admin-users loading">
        <h3 className="section-title">Пользователи</h3>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <h3 className="section-title">Управление пользователями</h3>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Закрыть</button>
        </div>
      )}
      
      <div className="reports-filters">
        <div className="search-container">
        <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder="Поиск пользователей..." 
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
            <option value="all">Все пользователи</option>
            <option value="admin">Администраторы</option>
            <option value="teacher">Преподаватели</option>
            <option value="student">Студенты</option>
          </select>
        </div>
        
        <button className="add-course-button" onClick={handleCreateUser}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Добавить пользователя
        </button>
      </div>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>ФИО</th>
              <th>Логин</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length > 0 ? (
              currentUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.full_name}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role_name}</td>
                  <td>{user.disabled ? 'Заблокирован' : 'Активен'}</td>
                  <td className="actions-cell">
                    <button 
                      className="table-action-button" 
                      onClick={() => handleEditUser(user.id)}
                      title="Редактировать"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                      </svg>
                    </button>
                    <button 
                      className="table-action-button delete"
                      onClick={() => handleDeleteUser(user.id)}
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
                <td colSpan="7" className="no-data">
                  {searchQuery
                    ? 'Не найдено пользователей по вашему запросу'
                    : 'Пользователи не найдены'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length > 0 && (
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
      
      {/* Модальное окно редактирования/создания пользователя */}
      {renderEditModal()}
    </div>
  );
};

export default AdminUsers;