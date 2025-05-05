import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import './KeyManagementStyles.css';

const KeyManagementTab = () => {
  const [myKeys, setMyKeys] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
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
      
      // Get keys assigned to current user
      try {
        const keysResponse = await apiService.keys.getUserKeys(userId);
        console.log('User keys:', keysResponse);
        setMyKeys(keysResponse || []);
      } catch (keysError) {
        console.error('Error fetching user keys:', keysError);
        setMyKeys([]);
      }
      
      // Get incoming transfer requests
      try {
        const incomingResponse = await apiService.keys.getIncomingTransfers();
        console.log('Incoming transfer requests:', incomingResponse);
        setIncomingRequests(incomingResponse || []);
      } catch (incomingError) {
        console.error('Error fetching incoming transfers:', incomingError);
        setIncomingRequests([]);
      }
      
      // Get outgoing transfer requests
      try {
        const outgoingResponse = await apiService.keys.getOutgoingTransfers();
        console.log('Outgoing transfer requests:', outgoingResponse);
        setOutgoingRequests(outgoingResponse || []);
      } catch (outgoingError) {
        console.error('Error fetching outgoing transfers:', outgoingError);
        setOutgoingRequests([]);
      }
      
      // Get list of available teachers
      try {
        const teachersResponse = await apiService.auth.getTeachers();
        console.log('Teachers list:', teachersResponse);
        
        // Filter out current user from the list
        const filteredTeachers = teachersResponse.filter(teacher => {
          if (!teacher) return false;
          // Get the user_id from teacher object
          const teacherUserId = teacher.user_id !== undefined ? teacher.user_id : null;
          // Only include teachers whose user_id is not the current user's ID
          return teacherUserId !== null && teacherUserId.toString() !== userId.toString();
        });
        
        console.log('Filtered teachers list:', filteredTeachers);
        setAvailableTeachers(filteredTeachers || []);
      } catch (teachersError) {
        console.error('Error fetching teachers list:', teachersError);
        setAvailableTeachers([]);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Create key transfer request
  const handleTransferKey = async () => {
    if (!selectedKey || !selectedTeacher) {
      setError('Please select both a key and a recipient teacher.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId');
      
      // Create transfer request
      await apiService.keys.createTransfer({
        key_id: selectedKey.id,
        from_user_id: parseInt(userId),
        to_user_id: parseInt(selectedTeacher.id),
        notes: transferNote || ''
      });
      
      setSuccessMessage(`Transfer request for key ${selectedKey.key_code} sent to ${selectedTeacher.full_name}`);
      
      // Reset form state
      setSelectedKey(null);
      setSelectedTeacher(null);
      setTransferNote('');
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error creating transfer request:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else {
        setError('Failed to create transfer request. Please check your data and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle approve incoming transfer
  const handleApproveTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.approveTransfer(transferId);
      setSuccessMessage('Transfer request approved. The key is now assigned to you.');
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error approving transfer:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else {
        setError('Failed to approve transfer request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle reject incoming transfer
  const handleRejectTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      const reason = window.prompt('Reason for rejection (optional):');
      await apiService.keys.rejectTransfer(transferId, reason);
      setSuccessMessage('Transfer request rejected successfully.');
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else {
        setError('Failed to reject transfer request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel outgoing transfer
  const handleCancelTransfer = async (transferId) => {
    if (!window.confirm('Are you sure you want to cancel this transfer request?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.cancelTransfer(transferId);
      setSuccessMessage('Transfer request cancelled successfully.');
      
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Error cancelling transfer:', err);
      
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Error: ${err.response.data.detail}`);
      } else {
        setError('Failed to cancel transfer request. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Format date
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
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Clear success message after timeout
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Show loading indicator if data is being loaded
  if (loading && myKeys.length === 0) {
    return (
      <div className="key-management-tab">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading key data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="key-management-tab">
      <h3 className="section-title">Менеджер ключей</h3>
      
      {/* Notification area */}
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
      
      {/* Notification for incoming requests */}
      {incomingRequests.length > 0 && activeTab !== 'incoming' && (
        <div className="inbox-notification" onClick={() => setActiveTab('incoming')}>
          <span className="inbox-icon">📩</span>
          <span className="inbox-count">{incomingRequests.length}</span>
          <span className="inbox-message">У вас есть ожидающие запросы на передачу ключей</span>
        </div>
      )}
      
      {/* Tab navigation */}
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
      
      {/* My Keys tab */}
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
                        Дата назначение: {formatDate(key.assigned_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Transfer form */}
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
                          <span className="select-prompt">Выберите ключ из списка</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="teacher-select">Кому:</label>
                      <select
                        id="teacher-select"
                        value={selectedTeacher?.id || ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const teacher = availableTeachers.find(t => t.id.toString() === selectedId);
                          setSelectedTeacher(teacher || null);
                        }}
                        disabled={!selectedKey}
                      >
                        <option value="">Выберите преподавателя</option>
                        {availableTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name || 'Teacher'} 
                            {teacher.department_name ? ` (${teacher.department_name})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="transfer-note">Заметка (опционально):</label>
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
                      {loading ? 'Processing...' : 'Отправить запрос на перевод'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Incoming Requests tab */}
      {activeTab === 'incoming' && (
        <div className="incoming-requests-section">
          <h4>Ожидающие запросы на передачу ключа</h4>
          
          {incomingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📮</div>
              <p>Отсутствуют входящие запросы на перенос ключей.</p>
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
                  
                  <div className="request-details">
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
                      <span className="request-label">Для:</span>
                      <span className="request-value teacher-name">
                        {request.from_user_name || `ID: ${request.from_user_id}`}
                      </span>
                    </div>
                    {request.notes && (
                      <div className="request-notes">
                        <div className="notes-label">Note:</div>
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
                      {loading ? 'Processing...' : 'Принять'}
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRejectTransfer(request.id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Отклонить'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Outgoing Requests tab */}
      {activeTab === 'outgoing' && (
        <div className="outgoing-requests-section">
          <h4>Мои запросы на обмен ключами</h4>
          
          {outgoingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📤</div>
              <p>У вас нет исходящих запросов на перенос ключа.</p>
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
                      {request.status === 'approved' && 'Одобрено'}
                      {request.status === 'rejected' && 'Отклонено'}
                      {request.status === 'cancelled' && 'Отменено'}
                      {!request.status && '—'}  
                    </div>
                  </div>
                  
                  <div className="request-details">
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
                      <span className="request-label">Для:</span>
                      <span className="request-value teacher-name">
                        {request.to_user_name || `ID: ${request.to_user_id}`}
                      </span>
                    </div>
                    <div className="request-row">
                      <span className="request-label">Дата запроса:</span>
                      <span className="request-value">
                        {formatDate(request.requested_at)}
                      </span>
                    </div>
                    {request.completed_at && (
                      <div className="request-row">
                        <span className="request-label">Дата одобрения:</span>
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
                        {loading ? 'Processing...' : 'Cancel Request'} 
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