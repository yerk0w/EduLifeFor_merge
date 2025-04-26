import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import { useNavigate } from 'react-router-dom';

const DocumentsList = ({ selectedDocument, setSelectedDocument, setDocumentTab, documents, refreshDocuments }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [sendingDocument, setSendingDocument] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState(false);
  const [operationMessage, setOperationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Загрузка студентов при выборе документа
  useEffect(() => {
    const fetchStudents = async () => {
      if (selectedDocument) {
        try {
          setLoading(true);
          const studentsData = await apiService.auth.getStudents();
          setStudents(Array.isArray(studentsData) ? studentsData : []);
        } catch (err) {
          console.error('Ошибка при загрузке списка студентов:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchStudents();
  }, [selectedDocument]);

  // Фильтрация документов
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.author_name && doc.author_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (documentFilter === 'all') {
      return matchesSearch;
    } else if (documentFilter === 'pending') {
      return matchesSearch && doc.status === 'ожидает';
    } else if (documentFilter === 'approved') {
      return matchesSearch && doc.status === 'одобрено';
    } else if (documentFilter === 'rejected') {
      return matchesSearch && doc.status === 'отклонено';
    }
    
    return matchesSearch;
  });

  const handleAddDocument = () => {
    setDocumentTab('add');
  };

  const handleViewDocument = async (documentId) => {
    try {
      const response = await apiService.documents.downloadDocument(documentId);
      const url = URL.createObjectURL(response);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Ошибка при открытии документа:', error);
      setOperationMessage('Не удалось открыть документ');
      setOperationSuccess(false);
      setTimeout(() => setOperationMessage(''), 3000);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот документ?')) {
      return;
    }

    try {
      await apiService.documents.deleteDocument(documentId);
      
      // Обновляем список документов
      if (refreshDocuments) {
        await refreshDocuments();
      }
      
      setOperationMessage('Документ успешно удален');
      setOperationSuccess(true);
      
      if (selectedDocument === documentId) {
        setSelectedDocument(null);
      }
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
      setOperationMessage('Не удалось удалить документ');
      setOperationSuccess(false);
    }
    
    setTimeout(() => setOperationMessage(''), 3000);
  };

  const handleUpdateStatus = async (documentId, newStatus) => {
    try {
      await apiService.documents.updateDocumentStatus(documentId, newStatus);
      
      // Если есть функция обновления списка документов, используем её
      if (refreshDocuments) {
        await refreshDocuments();
      }
      
      setOperationMessage(`Статус документа изменен на "${newStatus}"`);
      setOperationSuccess(true);
    } catch (error) {
      console.error('Ошибка при обновлении статуса документа:', error);
      setOperationMessage('Не удалось обновить статус документа');
      setOperationSuccess(false);
    }
    
    setTimeout(() => setOperationMessage(''), 3000);
  };

  const handleSendToStudent = async (documentId) => {
    if (!selectedStudentId) {
      setOperationMessage('Пожалуйста, выберите студента');
      setOperationSuccess(false);
      setTimeout(() => setOperationMessage(''), 3000);
      return;
    }

    setSendingDocument(true);
    try {
      // Получаем данные документа
      const docToSend = documents.find(d => d.id === documentId);
      
      // Создаем FormData для отправки
      const formData = new FormData();
      formData.append('title', docToSend.title);
      formData.append('content', docToSend.content);
      formData.append('template_type', docToSend.template_type || '');
      formData.append('recipient_id', selectedStudentId);
      
      // Получаем файл документа
      const fileBlob = await apiService.documents.downloadDocument(documentId);
      
      // Добавляем файл в FormData (с расширением PDF)
      const fileName = `document-${documentId}.pdf`;
      formData.append('file', new File([fileBlob], fileName, { type: 'application/pdf' }));
      
      // Отправляем документ студенту
      await apiService.documents.sendDocumentToStudent(formData);
      
      setOperationMessage('Документ успешно отправлен студенту');
      setOperationSuccess(true);
      setSelectedStudentId('');
    } catch (error) {
      console.error('Ошибка при отправке документа студенту:', error);
      setOperationMessage('Не удалось отправить документ студенту');
      setOperationSuccess(false);
    } finally {
      setSendingDocument(false);
      setTimeout(() => setOperationMessage(''), 3000);
    }
  };

  return (
    <div className="documents-list">
      <h4 className="subsection-title">Существующие документы</h4>
      
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
            placeholder="Поиск документов..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select 
            className="filter-select"
            value={documentFilter}
            onChange={e => setDocumentFilter(e.target.value)}
          >
            <option value="all">Все документы</option>
            <option value="pending">Ожидают рассмотрения</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
          </select>
        </div>
        
        <div className="action-buttons">
          <button className="add-document-button" onClick={handleAddDocument}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            Отправить новый документ
          </button>
        </div>
      </div>
      
      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Название документа</th>
              <th>Автор</th>
              <th>Дата создания</th>
              <th>Статус</th>
              <th>Получатель</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map(doc => (
                <tr 
                  key={doc.id} 
                  className={selectedDocument === doc.id ? 'selected' : ''} 
                  onClick={() => setSelectedDocument(doc.id)}
                >
                  <td className="document-name">
                    <svg viewBox="0 0 24 24" width="20" height="20" className="document-icon">
                      <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z" />
                    </svg>
                    <span>{doc.title}</span>
                  </td>
                  <td>{doc.author_name || 'Неизвестно'}</td>
                  <td>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Н/Д'}</td>
                  <td>
                    <span className={`status-badge ${doc.status === 'одобрено' ? 'approved' : 
                                                    doc.status === 'отклонено' ? 'rejected' : 
                                                    'pending'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td>{doc.recipient_id ? 'Назначен' : 'Не назначен'}</td>
                  <td className="actions-cell">
                    <button 
                      className="table-action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(doc.id);
                      }}
                      title="Просмотреть"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      </svg>
                    </button>
                    
                    {/* Кнопки для изменения статуса */}
                    {doc.status === 'ожидает' && (
                      <>
                        <button 
                          className="table-action-button accept"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(doc.id, 'одобрено');
                          }}
                          title="Одобрить"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </button>
                        <button 
                          className="table-action-button reject"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateStatus(doc.id, 'отклонено');
                          }}
                          title="Отклонить"
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </>
                    )}
                    
                    {/* Кнопка удаления - только для администраторов */}
                    {localStorage.getItem('userRole') === 'admin' && (
                      <button 
                        className="table-action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        title="Удалить"
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">Документы не найдены</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Детали выбранного документа */}
      {selectedDocument && (
        <DocumentDetails 
          document={documents.find(d => d.id === selectedDocument)}
          students={students}
          selectedStudentId={selectedStudentId}
          setSelectedStudentId={setSelectedStudentId}
          onSendToStudent={() => handleSendToStudent(selectedDocument)}
          onUpdateStatus={(status) => handleUpdateStatus(selectedDocument, status)}
          onViewDocument={() => handleViewDocument(selectedDocument)}
          sendingDocument={sendingDocument}
          loading={loading}
        />
      )}
    </div>
  );
};

// Компонент для отображения деталей документа
const DocumentDetails = ({ 
  document, 
  students,
  selectedStudentId,
  setSelectedStudentId,
  onSendToStudent,
  onUpdateStatus,
  onViewDocument,
  sendingDocument,
  loading
}) => {
  if (!document) return null;

  const formattedDate = document.created_at ? new Date(document.created_at).toLocaleString() : 'Дата не указана';
  const needsRecipient = document.status === 'ожидает' || document.status === 'одобрено';

  return (
    <div className="document-details">
      <h4 className="detail-title">Детали документа</h4>
      <div className="detail-content">
        <div className="detail-row">
          <div className="detail-label">Название:</div>
          <div className="detail-value">{document.title}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Автор:</div>
          <div className="detail-value">{document.author_name || 'Не указан'}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Описание:</div>
          <div className="detail-value">{document.content}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Дата создания:</div>
          <div className="detail-value">{formattedDate}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Статус:</div>
          <div className="detail-value">
            <span className={`status-badge ${document.status === 'одобрено' ? 'approved' : 
                                           document.status === 'отклонено' ? 'rejected' : 
                                           'pending'}`}>{document.status}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Тип документа:</div>
          <div className="detail-value">{document.template_type || 'Не указан'}</div>
        </div>
        
        {needsRecipient && (
          <div className="document-actions">
            <div className="send-document-form">
              <h5 className="form-subtitle">Отправить документ студенту</h5>
              {loading ? (
                <div>Загрузка списка студентов...</div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Выберите студента:</label>
                  <select 
                    className="form-select" 
                    value={selectedStudentId} 
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    disabled={sendingDocument}
                  >
                    <option value="">Выберите студента</option>
                    {students.map(student => (
                      <option key={student.id} value={student.user_id}>
                        {student.full_name} - {student.group_name || 'Без группы'}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <button 
                className="send-button"
                onClick={onSendToStudent}
                disabled={!selectedStudentId || sendingDocument || loading}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                </svg>
                {sendingDocument ? 'Отправка...' : 'Отправить документ'}
              </button>
            </div>
          </div>
        )}
        
        <div className="document-actions">
          <button className="action-button view" onClick={onViewDocument}>
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
            </svg>
            Просмотреть документ
          </button>
          
          {document.status === 'ожидает' && (
            <>
              <button 
                className="action-button approve"
                onClick={() => onUpdateStatus('одобрено')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Одобрить документ
              </button>
              <button 
                className="action-button reject"
                onClick={() => onUpdateStatus('отклонено')}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
                Отклонить документ
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsList;