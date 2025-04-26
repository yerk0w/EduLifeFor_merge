// DocumentRequests.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const DocumentRequests = ({
  selectedRequest,
  setSelectedRequest,
  requestSearchQuery,
  setRequestSearchQuery
}) => {
  const { t } = useTranslation(['admin']);
  
  // Моковые данные заявок для примера
  const requests = [
    { id: 1, student: 'Анна Смирнова', type: 'Справка об обучении', date: '23.04.2025', status: 'new', statusText: t('documentRequests.status.new'), comment: 'Нужна для предоставления в налоговую службу', avatar: '/images/avatar1.jpg' },
    { id: 2, student: 'Иван Петров', type: 'Сертификат об окончании курса', date: '22.04.2025', status: 'processing', statusText: t('documentRequests.status.processing'), comment: 'Курс "JavaScript для начинающих"', avatar: '/images/avatar2.jpg' },
    { id: 3, student: 'Мария Иванова', type: 'Договор на обучение', date: '20.04.2025', status: 'completed', statusText: t('documentRequests.status.completed'), comment: 'Копия договора для работодателя', avatar: '/images/avatar3.jpg' },
    { id: 4, student: 'Алексей Сидоров', type: 'Справка о посещаемости', date: '18.04.2025', status: 'rejected', statusText: t('documentRequests.status.rejected'), comment: 'Недостаточно данных о посещаемости', avatar: '/images/avatar4.jpg' }
  ];

  // Фильтрация заявок на основе поиска
  const filteredRequests = requests.filter(request => 
    request.student.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
    request.type.toLowerCase().includes(requestSearchQuery.toLowerCase()) ||
    request.comment.toLowerCase().includes(requestSearchQuery.toLowerCase())
  );

  return (
    <div className="documents-requests">
      <h4 className="subsection-title">{t('documentRequests.title')}</h4>
      
      <div className="documents-controls">
        <div className="search-container">
          <svg viewBox="0 0 24 24" width="20" height="20" className="search-icon">
            <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
          </svg>
          <input 
            type="text" 
            className="search-input5" 
            placeholder={t('documentRequests.search')} 
            value={requestSearchQuery}
            onChange={(e) => setRequestSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="filter-container">
          <select className="filter-select">
            <option value="all">{t('documentRequests.filter.all')}</option>
            <option value="new">{t('documentRequests.filter.new')}</option>
            <option value="processing">{t('documentRequests.filter.processing')}</option>
            <option value="completed">{t('documentRequests.filter.completed')}</option>
            <option value="rejected">{t('documentRequests.filter.rejected')}</option>
          </select>
        </div>
      </div>
      
      <div className="requests-table-container">
        <table className="documents-table">
          <thead>
            <tr>
              <th>{t('documentRequests.columns.student')}</th>
              <th>{t('documentRequests.columns.docType')}</th>
              <th>{t('documentRequests.columns.date')}</th>
              <th>{t('documentRequests.columns.status')}</th>
              <th>{t('documentRequests.columns.comment')}</th>
              <th>{t('documentRequests.columns.actions')}</th>
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
                    <img src={request.avatar} alt={request.student} className="student-avatar" />
                    <span>{request.student}</span>
                  </td>
                  <td>{request.type}</td>
                  <td>{request.date}</td>
                  <td>
                    <span className={`status-badge ${request.status}`}>{request.statusText}</span>
                  </td>
                  <td>{request.comment}</td>
                  <td className="actions-cell">
                    <button className="table-action-button">
                      <svg viewBox="0 0 24 24" width="18" height="18">
                        <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                      </svg>
                    </button>
                    {request.status === 'new' && (
                      <>
                        <button className="table-action-button accept">
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </button>
                        <button className="table-action-button reject">
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </>
                    )}
                    {request.status === 'processing' && (
                      <>
                        <button className="table-action-button complete">
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                          </svg>
                        </button>
                        <button className="table-action-button reject">
                          <svg viewBox="0 0 24 24" width="18" height="18">
                            <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                          </svg>
                        </button>
                      </>
                    )}
                    {request.status === 'completed' && (
                      <button className="table-action-button download">
                        <svg viewBox="0 0 24 24" width="18" height="18">
                          <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                        </svg>
                      </button>
                    )}
                    {request.status === 'rejected' && (
                      <button className="table-action-button reconsider">
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
                <td colSpan="6" className="no-results">{t('documentRequests.noResults')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {selectedRequest && (
        <RequestDetails 
          requestId={selectedRequest} 
        />
      )}
    </div>
  );
};

// Компонент с деталями заявки
const RequestDetails = ({ requestId }) => {
  const { t } = useTranslation();
  
  // Получаем информацию о заявке по ID
  const getRequestInfo = (id) => {
    const requests = {
      1: {
        student: 'Анна Смирнова',
        type: 'Справка об обучении',
        date: '23.04.2025',
        status: 'new',
        statusText: t('documentRequests.status.new'),
        comment: 'Нужна для предоставления в налоговую службу'
      },
      2: {
        student: 'Иван Петров',
        type: 'Сертификат об окончании курса',
        date: '22.04.2025',
        status: 'processing',
        statusText: t('documentRequests.status.processing'),
        comment: 'Курс "JavaScript для начинающих"'
      },
      3: {
        student: 'Мария Иванова',
        type: 'Договор на обучение',
        date: '20.04.2025',
        status: 'completed',
        statusText: t('documentRequests.status.completed'),
        comment: 'Копия договора для работодателя'
      },
      4: {
        student: 'Алексей Сидоров',
        type: 'Справка о посещаемости',
        date: '18.04.2025',
        status: 'rejected',
        statusText: t('documentRequests.status.rejected'),
        comment: 'Недостаточно данных о посещаемости'
      }
    };
    
    return requests[id];
  };

  const request = getRequestInfo(requestId);

  return (
    <div className="request-details">
      <h4 className="detail-title">{t('documentRequests.details.title')}</h4>
      <div className="detail-content">
        <div className="detail-row">
          <div className="detail-label">{t('documentRequests.details.student')}</div>
          <div className="detail-value">{request.student}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">{t('documentRequests.details.docType')}</div>
          <div className="detail-value">{request.type}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">{t('documentRequests.details.date')}</div>
          <div className="detail-value">{request.date}</div>
        </div>
        <div className="detail-row">
          <div className="detail-label">{t('documentRequests.details.status')}</div>
          <div className="detail-value">
            <span className={`status-badge ${request.status}`}>{request.statusText}</span>
          </div>
        </div>
        <div className="detail-row">
          <div className="detail-label">{t('documentRequests.details.comment')}</div>
          <div className="detail-value">{request.comment}</div>
        </div>
        
        {request.status === 'new' && (
          <div className="request-actions">
            <button className="action-button process">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
              {t('documentRequests.actions.process')}
            </button>
            <button className="action-button reject">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
              {t('documentRequests.actions.reject')}
            </button>
          </div>
        )}
        
        {request.status === 'processing' && (
          <div className="request-actions">
            <button className="action-button create-doc">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              {t('documentRequests.actions.createDoc')}
            </button>
            <button className="action-button reject">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
              {t('documentRequests.actions.reject')}
            </button>
          </div>
        )}
        
        {request.status === 'completed' && (
          <div className="request-actions">
            <button className="action-button download">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
              </svg>
              {t('documentRequests.actions.download')}
            </button>
            <button className="action-button send">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
              </svg>
              {t('documentRequests.actions.sendAgain')}
            </button>
          </div>
        )}
        
        {request.status === 'rejected' && (
          <div className="request-actions">
            <button className="action-button reconsider">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
              </svg>
              {t('documentRequests.actions.reconsider')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentRequests;