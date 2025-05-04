import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import './KeyManagementStyles.css';

const KeyManagementTab = () => {
  const [myKeys, setMyKeys] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [teacherId, setTeacherId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [transferNote, setTransferNote] = useState('');
  const [activeTab, setActiveTab] = useState('my-keys');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Load data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId');

      // Получаем информацию о преподавателе
      let currentTeacherId = null;
      try {
        const teacherInfo = await apiService.auth.getTeacherByUser(userId);
        console.log('Информация о преподавателе:', teacherInfo);
        if (teacherInfo && teacherInfo.id) {
          currentTeacherId = teacherInfo.id;
          setTeacherId(teacherInfo.id);
        }
      } catch (teacherError) {
        console.error('Ошибка при получении информации о преподавателе:', teacherError);
      }

      // Если не удалось получить ID преподавателя, используем ID пользователя
      if (!currentTeacherId) {
        console.warn('Не удалось получить ID преподавателя, используем ID пользователя');
        currentTeacherId = parseInt(userId);
        setTeacherId(parseInt(userId));
      }
      
      console.log('Используемый ID преподавателя для запросов:', currentTeacherId);
      
      // Получаем ключи преподавателя
      try {
        const keysResponse = await apiService.keys.getTeacherKeys(currentTeacherId);
        console.log('Ключи преподавателя:', keysResponse);
        setMyKeys(keysResponse || []);
      } catch (keysError) {
        console.error('Ошибка при получении ключей:', keysError);
        setMyKeys([]);
      }
      
      // Получаем входящие запросы на передачу
      try {
        const incomingResponse = await apiService.keys.getIncomingTransfers();
        console.log('Входящие запросы:', incomingResponse);
        setIncomingRequests(incomingResponse || []);
      } catch (incomingError) {
        console.error('Ошибка при получении входящих запросов:', incomingError);
        setIncomingRequests([]);
      }
      
      // Получаем исходящие запросы на передачу
      try {
        const outgoingResponse = await apiService.keys.getOutgoingTransfers();
        console.log('Исходящие запросы:', outgoingResponse);
        setOutgoingRequests(outgoingResponse || []);
      } catch (outgoingError) {
        console.error('Ошибка при получении исходящих запросов:', outgoingError);
        setOutgoingRequests([]);
      }
      
      // Получаем список доступных преподавателей
      try {
        const teachersResponse = await apiService.auth.getTeachers();
        console.log('Список преподавателей:', teachersResponse);
        // Исключаем текущего преподавателя из списка
        const filteredTeachers = teachersResponse.filter(teacher => {
          if (!teacher) return false;
          // Используем или user_id, или id для сравнения
          const teacherUserId = teacher.user_id !== undefined ? teacher.user_id : null;
          return teacherUserId !== null && teacherUserId.toString() !== userId.toString();
        });
        console.log('Отфильтрованный список преподавателей:', filteredTeachers);
        setAvailableTeachers(filteredTeachers || []);
      } catch (teachersError) {
        console.error('Ошибка при получении списка преподавателей:', teachersError);
        setAvailableTeachers([]);
      }
      
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Инициация передачи ключа
  const handleTransferKey = async () => {
    if (!selectedKey || !selectedTeacher) {
      setError('Пожалуйста, выберите ключ и преподавателя для передачи.');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Отладочная информация
    console.log('Данные для передачи:', {
      key_id: selectedKey.id,
      from_teacher_id: Number(teacherId), // Преобразуем в число
      to_teacher_id: Number(selectedTeacher.id), // Преобразуем в число
      notes: transferNote
    });
    
    try {
      // Создаем запрос на передачу
      await apiService.keys.createTransfer({
        key_id: selectedKey.id,
        from_teacher_id: Number(teacherId), // Преобразуем в число
        to_teacher_id: Number(selectedTeacher.id), // Преобразуем в число
        notes: transferNote || ''  // Используем пустую строку, если примечание отсутствует
      });
      
      setSuccessMessage(`Запрос на передачу ключа ${selectedKey.key_code} отправлен ${selectedTeacher.full_name}`);
      setSelectedKey(null);
      setSelectedTeacher(null);
      setTransferNote('');
      
      // Обновляем данные
      fetchData();
    } catch (err) {
      console.error('Ошибка при создании передачи ключа:', err);
      
      // Подробная информация об ошибке
      if (err.response) {
        console.log('Статус ошибки:', err.response.status);
        console.log('Данные ошибки:', err.response.data);
        
        // Устанавливаем сообщение об ошибке на основе ответа сервера
        if (err.response.data && err.response.data.detail) {
          setError(`Ошибка: ${err.response.data.detail}`);
        } else {
          setError('Не удалось создать запрос на передачу ключа. Пожалуйста, проверьте данные и попробуйте снова.');
        }
      } else if (err.request) {
        console.log('Запрос был отправлен, но ответ не получен:', err.request);
        setError('Сервер не отвечает. Пожалуйста, проверьте подключение и попробуйте снова.');
      } else {
        console.log('Ошибка при настройке запроса:', err.message);
        setError('Произошла ошибка при создании запроса. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработка одобрения входящего запроса на передачу
  const handleApproveTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.approveTransfer(transferId);
      setSuccessMessage('Запрос на передачу одобрен. Ключ теперь назначен вам.');
      
      // Обновляем данные
      fetchData();
    } catch (err) {
      console.error('Ошибка при одобрении передачи:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Ошибка: ${err.response.data.detail}`);
      } else {
        setError('Не удалось одобрить запрос на передачу. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработка отклонения входящего запроса
  const handleRejectTransfer = async (transferId, reason = 'Request rejected') => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.rejectTransfer(transferId, reason);
      setSuccessMessage('Запрос на передачу отклонен.');
      
      // Обновляем данные
      fetchData();
    } catch (err) {
      console.error('Ошибка при отклонении передачи:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Ошибка: ${err.response.data.detail}`);
      } else {
        setError('Не удалось отклонить запрос на передачу. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Обработка отмены исходящего запроса
  const handleCancelTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.cancelTransfer(transferId);
      setSuccessMessage('Запрос на передачу отменен.');
      
      // Обновляем данные
      fetchData();
    } catch (err) {
      console.error('Ошибка при отмене передачи:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Ошибка: ${err.response.data.detail}`);
      } else {
        setError('Не удалось отменить запрос на передачу. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Форматирование даты и времени
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      console.error('Ошибка при форматировании даты:', e);
      return dateString;
    }
  };

  // Очистка сообщения об успехе через 5 секунд
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Показываем индикатор загрузки, если данные загружаются и нет ключей
  if (loading && myKeys.length === 0) {
    return (
      <div className="key-management-tab">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="key-management-tab">
      <h3 className="section-title">Управление ключами</h3>
      
      {/* Область уведомлений */}
      {error && (
        <div className="notification error">
          <span className="notification-icon">⚠️</span>
          <span className="notification-message">{error}</span>
          <button className="notification-close" onClick={() => setError(null)}>×</button>
        </div>
      )}
      
      {successMessage && (
        <div className="notification success">
          <span className="notification-icon">✅</span>
          <span className="notification-message">{successMessage}</span>
          <button className="notification-close" onClick={() => setSuccessMessage(null)}>×</button>
        </div>
      )}
      
      {/* Уведомление о входящих запросах */}
      {incomingRequests.length > 0 && activeTab !== 'incoming' && (
        <div className="inbox-notification" onClick={() => setActiveTab('incoming')}>
          <span className="inbox-icon">📩</span>
          <span className="inbox-count">{incomingRequests.length}</span>
          <span className="inbox-message">У вас есть ожидающие запросы на передачу ключей</span>
        </div>
      )}
      
      {/* Навигация по вкладкам */}
      <div className="key-tabs">
        <button 
          className={`key-tab ${activeTab === 'my-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-keys')}
        >
          Мои ключи
          {myKeys.length > 0 && <span className="tab-badge">{myKeys.length}</span>}
        </button>
        
        <button 
          className={`key-tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Входящие запросы
          {incomingRequests.length > 0 && <span className="tab-badge">{incomingRequests.length}</span>}
        </button>
        
        <button 
          className={`key-tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Исходящие запросы
          {outgoingRequests.length > 0 && <span className="tab-badge">{outgoingRequests.length}</span>}
        </button>
      </div>
      
      {/* Вкладка "Мои ключи" */}
      {activeTab === 'my-keys' && (
        <div className="my-keys-section">
          {myKeys.length === 0 ? (
            <div className="no-keys-message">
              <div className="no-keys-icon">🔑</div>
              <p>Вам не назначены ключи.</p>
            </div>
          ) : (
            <>
              <div className="keys-grid">
                {myKeys.map(key => (
                  <div
                    key={key.id}
                    className={`key-card ${selectedKey?.id === key.id ? 'selected' : ''}`}
                    onClick={() => setSelectedKey(selectedKey?.id === key.id ? null : key)}
                  >
                    <div className="key-card-header">
                      <span className="key-code">{key.key_code}</span>
                      <span className="key-icon">🔑</span>
                    </div>
                    <div className="key-card-body">
                      <div className="key-detail">
                        <span className="key-label">Кабинет:</span>
                        <span className="key-value">{key.room_number}</span>
                      </div>
                      {key.building && (
                        <div className="key-detail">
                          <span className="key-label">Блок:</span>
                          <span className="key-value">{key.building}</span>
                        </div>
                      )}
                      {key.floor && (
                        <div className="key-detail">
                          <span className="key-label">Этаж:</span>
                          <span className="key-value">{key.floor}</span>
                        </div>
                      )}
                      {key.description && (
                        <div className="key-description">
                          {key.description}
                        </div>
                      )}
                    </div>
                    <div className="key-card-footer">
                      <span className="assigned-date">
                        Назначен: {formatDate(key.assigned_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Форма передачи ключа */}
              <div className="transfer-form">
                <h4>Передать ключ другому учителю</h4>
                <div className="transfer-form-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Выберите ключ:</label>
                      <div className="selected-key">
                        {selectedKey ? (
                          <span><strong>{selectedKey.key_code}</strong> - Кабинет {selectedKey.room_number}</span>
                        ) : (
                          <span className="select-prompt">Выберите ключ из списка выше</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="teacher-select">Передача преподавателю:</label>
                      <select
                        id="teacher-select"
                        value={selectedTeacher?.id || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          console.log('Выбран преподаватель с ID:', selectedId);
                          const teacher = availableTeachers.find(t => t.id.toString() === selectedId);
                          console.log('Найден преподаватель:', teacher);
                          setSelectedTeacher(teacher || null);
                        }}
                        disabled={!selectedKey}
                      >
                        <option value="">Выберите преподователя</option>
                        {availableTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name || 'Преподаватель'} 
                            {teacher.department_name ? ` (${teacher.department_name})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="transfer-note">Заметка (дополнительно):</label>
                      <textarea
                        id="transfer-note"
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        placeholder="Добавьте примечание об этом переводе (например, причину, инструкции и т.д.)"
                        disabled={!selectedKey}
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button
                      className="transfer-button"
                      onClick={handleTransferKey}
                      disabled={!selectedKey || !selectedTeacher || loading}
                    >
                      {loading ? 'В процессе...' : 'Отправить запрос на передачу'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Вкладка "Входящие запросы" */}
      {activeTab === 'incoming' && (
        <div className="incoming-requests-section">
          <h4>Ожидающие запросы на передачу ключа</h4>
          
          {incomingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📮</div>
              <p>Входящие запросы на перенос ключей отсутствуют. </p>
            </div>
          ) : (
            <div className="requests-list">
              {incomingRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-title">
                      <span className="key-icon">🔑</span>
                      <span className="key-code">{request.key_code}</span>
                    </div>
                    <div className="request-date">
                      {formatDate(request.requested_at)}
                    </div>
                  </div>
                  
                  <div className="request-detailss">
                    <div className="request-row">
                      <span className="request-label">Кабинет:</span>
                      <span className="request-value">{request.room_number}</span>
                    </div>
                    {request.building && (
                      <div className="request-row">
                        <span className="request-label">Блок:</span>
                        <span className="request-value">{request.building}</span>
                      </div>
                    )}
                    <div className="request-row">
                      <span className="request-label">От учителя :</span>
                      <span className="request-value teacher-name">
                        {request.from_teacher_name || `ID: ${request.from_teacher_id}`}
                      </span>
                    </div>
                    {request.notes && (
                      <div className="request-notes">
                        <div className="notes-label">Заметка:</div>
                        <div className="notes-content">{request.notes}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="request-actions">
                    <button
                      className="accept-button"
                      onClick={() => handleApproveTransfer(request.id)}
                      disabled={loading}
                    >
                      {loading ? 'В процессе...' : 'Принять'}
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRejectTransfer(request.id)}
                      disabled={loading}
                    >
                      {loading ? 'В процессе...' : 'Отклонить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Вкладка "Исходящие запросы" */}
      {activeTab === 'outgoing' && (
        <div className="outgoing-requests-section">
          <h4>Мои запросы на передачу ключей</h4>
          
          {outgoingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📤</div>
              <p>Вы не имеете запросы на передачу ключей</p>
            </div>
          ) : (
            <div className="requests-list">
              {outgoingRequests.map(request => (
                <div key={request.id} className="request-card">
                  <div className="request-header">
                    <div className="request-title">
                      <span className="key-icon">🔑</span>
                      <span className="key-code">{request.key_code}</span>
                    </div>
                    <div className={`request-status ${request.status}`}>
                      {request.status === 'pending' && 'Ожидает'}
                      {request.status === 'approved' && 'Одобрен'}
                      {request.status === 'rejected' && 'Отклонен'}
                      {request.status === 'cancelled' && 'Отменен'}
                      {!request.status && 'Неизвестно'}
                    </div>
                  </div>
                  
                  <div className="request-detailss">
                    <div className="request-row">
                      <span className="request-label">Кабинет:</span>
                      <span className="request-value">{request.room_number}</span>
                    </div>
                    {request.building && (
                      <div className="request-row">
                        <span className="request-label">Блок:</span>
                        <span className="request-value">{request.building}</span>
                      </div>
                    )}
                    <div className="request-row">
                      <span className="request-label">Для :</span>
                      <span className="request-value teacher-name">
                        {request.to_teacher_name || `ID: ${request.to_teacher_id}`}
                      </span>
                    </div>
                    <div className="request-row">
                      <span className="request-label">Запрос:</span>
                      <span className="request-value">
                        {formatDate(request.requested_at)}
                      </span>
                    </div>
                    {request.completed_at && (
                      <div className="request-row">
                        <span className="request-label">Завершен:</span>
                        <span className="request-value">
                          {formatDate(request.completed_at)}
                        </span>
                      </div>
                    )}
                    {request.notes && (
                      <div className="request-notes">
                        <div className="notes-label">Заметка:</div>
                        <div className="notes-content">{request.notes}</div>
                      </div>
                    )}
                  </div>
                  
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelTransfer(request.id)}
                        disabled={loading}
                      >
                        {loading ? 'В процессе...' : 'Отменить запрос'} 
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyManagementTab;