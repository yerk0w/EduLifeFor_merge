import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import axios from 'axios';

// Создаем экземпляр axios с настройками по умолчанию
const apiClient = axios.create({
  timeout: 10000, // 10 секунд
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем перехватчик запросов для добавления токена авторизации
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// URL микросервисов
const API_BASE_URL = {
  dock: 'http://localhost:8100'
};

const DocumentRequests = ({
  selectedRequest,
  setSelectedRequest,
  requestSearchQuery,
  setRequestSearchQuery
}) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [operationSuccess, setOperationSuccess] = useState(false);
  const [operationMessage, setOperationMessage] = useState('');

  // Загрузка заявок при монтировании компонента
  useEffect(() => {
    fetchRequests();
  }, []);

  // Функция для загрузки заявок на документы
  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Используем метод getAllDocuments и фильтруем документы со статусом "ожидает"
      const response = await apiService.documents.getAllDocuments();
      
      if (Array.isArray(response)) {
        // Преобразуем формат документов в формат заявок
        const requestsData = response
          .filter(doc => doc.status === 'ожидает')
          .map(doc => ({
            id: doc.id,
            student_name: doc.author_name || 'Неизвестный студент',
            student_avatar: null,
            document_type: doc.template_type || 'Документ',
            created_at: doc.created_at,
            status: 'new', // Для интерфейса используем статус "new"
            comment: doc.content || '',
            student_group: '',
            // Сохраняем оригинальные данные для использования при необходимости
            original_document: doc
          }));
        
        setRequests(requestsData);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error('Ошибка при загрузке заявок на документы:', err);
      setError('Не удалось загрузить заявки на документы');
    } finally {
      setLoading(false);
    }
  };

  // Фильтрация заявок по поисковому запросу и статусу
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      (request.student_name && request.student_name.toLowerCase().includes(requestSearchQuery.toLowerCase())) ||
      (request.document_type && request.document_type.toLowerCase().includes(requestSearchQuery.toLowerCase())) ||
      (request.comment && request.comment.toLowerCase().includes(requestSearchQuery.toLowerCase()));
    
    if (statusFilter === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && request.status === statusFilter;
    }
  });

  // Обработчик изменения статуса заявки
  const handleUpdateStatus = async (requestId, newStatus) => {
    setProcessingRequestId(requestId);
    try {
      // Преобразование статуса для API
      const apiStatus = 
        newStatus === 'new' ? 'ожидает' :
        newStatus === 'completed' ? 'одобрено' :
        newStatus === 'rejected' ? 'отклонено' : 'ожидает';
      
      // Используем маршрут обновления статуса документа
      await apiClient.patch(`${API_BASE_URL.dock}/documents/${requestId}/review`, {
        status: apiStatus
      });
      
      // Обновляем статус в локальном состоянии
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      );
      
      // Показываем сообщение с понятным пользователю текстом статуса
      const statusText = 
        newStatus === 'new' ? 'Новая' :
        newStatus === 'processing' ? 'В обработке' :
        newStatus === 'completed' ? 'Выполнена' :
        newStatus === 'rejected' ? 'Отклонена' : newStatus;
      
      setOperationMessage(`Статус заявки успешно изменен на "${statusText}"`);
      setOperationSuccess(true);
      
      // Если статус изменился на "completed" или "rejected", заявка больше не будет отображаться 
      // в списке, обновляем данные
      if (newStatus === 'completed' || newStatus === 'rejected') {
        setTimeout(() => {
          fetchRequests();
        }, 2000);
      }
    } catch (err) {
      console.error('Ошибка при обновлении статуса заявки:', err);
      setOperationMessage('Не удалось обновить статус заявки');
      setOperationSuccess(false);
    } finally {
      setProcessingRequestId(null);
      setTimeout(() => {
        setOperationMessage('');
      }, 3000);
    }
  };

  // Функция для скачивания документа
  const handleDownloadDocument = async (requestId) => {
    try {
      // Получаем информацию о пути к файлу
      const response = await apiClient.get(`${API_BASE_URL.dock}/documents/${requestId}/download`);
      
      if (response.data && response.data.file_path) {
        // Формируем полный URL к файлу документа
        const fileUrl = `${API_BASE_URL.dock}${response.data.file_path}`;
        
        // Открываем URL в новой вкладке для скачивания/просмотра
        window.open(fileUrl, '_blank');
      } else {
        throw new Error('Путь к файлу документа не найден');
      }
    } catch (err) {
      console.error('Ошибка при скачивании документа:', err);
      setOperationMessage('Не удалось скачать документ');
      setOperationSuccess(false);
      setTimeout(() => {
        setOperationMessage('');
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="documents-requests loading">
        <div className="loading-spinner"></div>
        <p>Загрузка заявок на документы...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documents-requests error">
        <p className="error-message">{error}</p>
        <button className="retry-button" onClick={fetchRequests}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="documents-requests">
      <h4 className="subsection-title">Заявки на документы</h4>
      
      {operationMessage && (
        <div className={`operation-message ${operationSuccess ? 'success' : 'error'}`}
             style={{
               backgroundColor: operationSuccess ? '#4caf50' : '#f44336',
               color: 'white',
               padding: '10px',
               borderRadius: '4px',
               marginBottom: '15px'
             }}>
          {operationMessage}
        </div>
      )}
      
      <div className="documents-controls">
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder="Поиск заявок..." 
            value={requestSearchQuery}
            onChange={(e) => setRequestSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Все заявки</option>
            <option value="new">Новые</option>
            <option value="processing">В обработке</option>
            <option value="completed">Выполненные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
      </div>
      
      <div className="requests-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Студент</th>
              <th>Тип документа</th>
              <th>Дата заявки</th>
              <th>Статус</th>
              <th>Комментарий</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length > 0 ? (
              filteredRequests.map(request => (
                <tr 
                  key={request.id} 
                  className={selectedRequest === request.id ? 'selected' : ''} 
                  onClick={() => setSelectedRequest(request.id)}
                >
                  <td className="student-name">
                    {request.student_avatar ? (
                      <img src={request.student_avatar} alt={request.student_name} className="student-avatar" />
                    ) : (
                      <div className="student-avatar-placeholder">
                        {request.student_name?.charAt(0) || '?'}
                      </div>
                    )}
                    <span>{request.student_name}</span>
                  </td>
                  <td>{request.document_type}</td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>
                      {request.status === 'new' ? 'Новая' :
                       request.status === 'processing' ? 'В обработке' :
                       request.status === 'completed' ? 'Выполнена' :
                       request.status === 'rejected' ? 'Отклонена' : 
                       request.status}
                    </span>
                  </td>
                  <td>{request.comment}</td>
                  <td className="actions-cell">
                    <button 
                      className="table-action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRequest(request.id);
                      }}
                      title="Просмотреть детали"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      </svg>
                    </button>
                    
                    {request.status === 'new' && (
                      <>
                        <button 
                          className="table-action-button accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(request.id, 'processing');
                          }}
                          disabled={processingRequestId === request.id}
                          title="Принять в обработку"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </button>
                        <button 
                          className="table-action-button reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(request.id, 'rejected');
                          }}
                          disabled={processingRequestId === request.id}
                          title="Отклонить"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {request.status === 'processing' && (
                      <>
                        <button 
                          className="table-action-button complete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(request.id, 'completed');
                          }}
                          disabled={processingRequestId === request.id}
                          title="Выполнить"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </button>
                        <button 
                          className="table-action-button reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(request.id, 'rejected');
                          }}
                          disabled={processingRequestId === request.id}
                          title="Отклонить"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {request.status === 'completed' && (
                      <button 
                        className="table-action-button download"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDocument(request.id);
                        }}
                        title="Скачать"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                      </button>
                    )}
                    
                    {request.status === 'rejected' && (
                      <button 
                        className="table-action-button reconsider"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(request.id, 'new');
                        }}
                        disabled={processingRequestId === request.id}
                        title="Пересмотреть"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">Заявки не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Компонент с деталями заявки */}
      {selectedRequest && (
        <RequestDetails 
          request={requests.find(req => req.id === selectedRequest)}
          onUpdateStatus={handleUpdateStatus}
          onDownloadDocument={handleDownloadDocument}
          processingRequestId={processingRequestId}
        />
      )}
    </div>
  );
};

// Компонент с деталями заявки
const RequestDetails = ({ request, onUpdateStatus, onDownloadDocument, processingRequestId }) => {
  if (!request) return null;

  const formattedDate = new Date(request.created_at).toLocaleString();
  const statusText = 
    request.status === 'new' ? 'Новая' :
    request.status === 'processing' ? 'В обработке' :
    request.status === 'completed' ? 'Выполнена' :
    request.status === 'rejected' ? 'Отклонена' : 
    request.status;

  return (
    <div className="request-details">
      <h4 className="detail-title">Детали заявки</h4>
      <div className="detail-content">
        <div className="detail-row">
          <div className="detail-label">Студент:</div>
          <div className="detail-value">{request.student_name}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Группа:</div>
          <div className="detail-value">{request.student_group || 'Не указана'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Тип документа:</div>
          <div className="detail-value">{request.document_type}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Дата заявки:</div>
          <div className="detail-value">{formattedDate}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Статус:</div>
          <div className="detail-value">
            <span className={`status-badge ${request.status}`}>{statusText}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Комментарий:</div>
          <div className="detail-value">{request.comment || 'Нет комментария'}</div>
        </div>
        
        {/* Действия в зависимости от статуса */}
        <div className="request-actions">
          {request.status === 'new' && (
            <>
              <button 
                className="action-button process"
                onClick={() => onUpdateStatus(request.id, 'processing')}
                disabled={processingRequestId === request.id}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Принять в обработку
              </button>
              <button 
                className="action-button reject"
                onClick={() => onUpdateStatus(request.id, 'rejected')}
                disabled={processingRequestId === request.id}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
                Отклонить
              </button>
            </>
          )}
          
          {request.status === 'processing' && (
            <>
              <button 
                className="action-button create-doc"
                onClick={() => onUpdateStatus(request.id, 'completed')}
                disabled={processingRequestId === request.id}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                Выполнить заявку
              </button>
              <button 
                className="action-button reject"
                onClick={() => onUpdateStatus(request.id, 'rejected')}
                disabled={processingRequestId === request.id}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
                Отклонить
              </button>
            </>
          )}
          
          {request.status === 'completed' && (
            <button 
              className="action-button download"
              onClick={() => onDownloadDocument(request.id)}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
              Скачать документ
            </button>
          )}
          
          {request.status === 'rejected' && (
            <button 
              className="action-button reconsider"
              onClick={() => onUpdateStatus(request.id, 'new')}
              disabled={processingRequestId === request.id}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
              Пересмотреть заявку
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentRequests;