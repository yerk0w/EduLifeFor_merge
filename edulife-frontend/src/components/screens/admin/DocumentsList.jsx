import React, { useState } from 'react';

const DocumentsList = ({ selectedDocument, setSelectedDocument, setDocumentTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentFilter, setDocumentFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState('');

  // Моковые данные документов для примера
  const documents = [
    {
      id: 1, 
      name: 'Договор на обучение №123-45',
      type: 'Договор',
      date: '15.04.2025',
      status: 'approved',
      statusText: 'Подписан',
      recipient: 'Анна Смирнова'
    },
    {
      id: 2, 
      name: 'Сертификат об окончании курса "JavaScript"',
      type: 'Сертификат',
      date: '10.04.2025',
      status: 'approved',
      statusText: 'Выдан',
      recipient: 'Мария Иванова'
    },
    {
      id: 3, 
      name: 'Справка об обучении №45-67',
      type: 'Справка',
      date: '05.04.2025',
      status: 'pending',
      statusText: 'Ожидает отправки',
      recipient: null
    },
    {
      id: 4, 
      name: 'Договор с преподавателем №45-67',
      type: 'Договор',
      date: '01.04.2025',
      status: 'draft',
      statusText: 'Черновик',
      recipient: null
    }
  ];

  // Фильтрация документов
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.recipient && doc.recipient.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (documentFilter === 'all') {
      return matchesSearch;
    }
    
    return matchesSearch && doc.type.toLowerCase() === documentFilter.toLowerCase();
  });

  const handleAddDocument = () => {
    setDocumentTab('add');
  };

  return (
    <div className="documents-list">
      <h4 className="subsection-title">Существующие документы</h4>
      
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
            <option value="договор">Договоры</option>
            <option value="сертификат">Сертификаты</option>
            <option value="справка">Справки</option>
          </select>
        </div>
        
        <button className="add-document-button" onClick={handleAddDocument}>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Добавить документ
        </button>
      </div>
      
      <div className="documents-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>Название документа</th>
              <th>Тип</th>
              <th>Дата создания</th>
              <th>Статус</th>
              <th>Получатель</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map(doc => (
              <tr 
                key={doc.id} 
                className={selectedDocument === doc.id ? 'selected' : ''} 
                onClick={() => setSelectedDocument(doc.id)}
              >
                <td className="document-name">
                  <svg viewBox="0 0 24 24" width="20" height="20" className="document-icon">
                    <path d="M6,2A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6M6,4H13V9H18V20H6V4M8,12V14H16V12H8M8,16V18H13V16H8Z" />
                  </svg>
                  <span>{doc.name}</span>
                </td>
                <td>{doc.type}</td>
                <td>{doc.date}</td>
                <td>
                  <span className={`status-badge ${doc.status}`}>{doc.statusText}</span>
                </td>
                <td>{doc.recipient || 'Не назначен'}</td>
                <td className="actions-cell">
                  <button className="table-action-button">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                    </svg>
                  </button>
                  <button className="table-action-button">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                    </svg>
                  </button>
                  {doc.status !== 'draft' ? (
                    <button className="table-action-button send">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                      </svg>
                    </button>
                  ) : (
                    <>
                      <button className="table-action-button edit">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                        </svg>
                      </button>
                      <button className="table-action-button delete">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                        </svg>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {selectedDocument && (
        <DocumentDetails 
          documentId={selectedDocument}
          selectedStudent={selectedStudent}
          setSelectedStudent={setSelectedStudent}
        />
      )}
    </div>
  );
};

// Компонент с деталями документа
const DocumentDetails = ({ documentId, selectedStudent, setSelectedStudent }) => {
  // Получаем информацию о документе по ID
  const getDocumentInfo = (id) => {
    const documents = {
      1: {
        name: 'Договор на обучение №123-45',
        type: 'Договор',
        date: '15.04.2025',
        status: 'approved',
        statusText: 'Подписан',
        recipient: 'Анна Смирнова'
      },
      2: {
        name: 'Сертификат об окончании курса "JavaScript"',
        type: 'Сертификат',
        date: '10.04.2025',
        status: 'approved',
        statusText: 'Выдан',
        recipient: 'Мария Иванова'
      },
      3: {
        name: 'Справка об обучении №45-67',
        type: 'Справка',
        date: '05.04.2025',
        status: 'pending',
        statusText: 'Ожидает отправки',
        recipient: null
      },
      4: {
        name: 'Договор с преподавателем №45-67',
        type: 'Договор',
        date: '01.04.2025',
        status: 'draft',
        statusText: 'Черновик',
        recipient: null
      }
    };
    
    return documents[id];
  };

  const document = getDocumentInfo(documentId);
  const needsRecipient = document.status === 'pending' || document.status === 'draft';

  return (
    <div className="document-details">
      <h4 className="detail-title">Детали документа</h4>
      <div className="detail-content">
        <div className="detail-row">
          <div className="detail-label">Название:</div>
          <div className="detail-value">{document.name}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Тип документа:</div>
          <div className="detail-value">{document.type}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Дата создания:</div>
          <div className="detail-value">{document.date}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Статус:</div>
          <div className="detail-value">
            <span className={`status-badge ${document.status}`}>{document.statusText}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">Получатель:</div>
          <div className="detail-value recipient-search">
            <div className="search-container compact">
              <svg viewBox="0 0 24 24" width="18" height="18" className="search-icon-small">
                <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
              </svg>
              <input 
                type="text" 
                className="search-input recipient-input" 
                placeholder="Поиск получателя..." 
                readOnly={!needsRecipient}
                value={document.recipient || selectedStudent}
                onChange={e => needsRecipient && setSelectedStudent(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        {needsRecipient && (
          <div className="document-actions">
            <div className="send-document-form">
              <h5 className="form-subtitle">Отправить документ студенту</h5>
              <div className="form-group">
                <label className="form-label">Выберите студента:</label>
                <select 
                  className="form-select" 
                  value={selectedStudent} 
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Выберите студента</option>
                  <option value="Анна Смирнова">Анна Смирнова</option>
                  <option value="Иван Петров">Иван Петров</option>
                  <option value="Мария Иванова">Мария Иванова</option>
                  <option value="Алексей Сидоров">Алексей Сидоров</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Комментарий (необязательно):</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  placeholder="Введите комментарий для студента..."
                ></textarea>
              </div>
              <button className="send-button">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                </svg>
                Отправить документ
              </button>
            </div>
          </div>
        )}
        
        {(document.status === 'approved') && (
          <div className="document-actions">
            <button className="action-button download">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
              Скачать документ
            </button>
            <button className="action-button send-again">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
              Отправить повторно
            </button>
            {document.type === 'Договор' && (
              <button className="action-button print">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
                </svg>
                Распечатать
              </button>
            )}
          </div>
        )}
        
        {document.status === 'draft' && (
          <div className="document-actions">
            <button className="action-button edit">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
              </svg>
              Редактировать
            </button>
            <button className="action-button delete">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
              </svg>
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsList;