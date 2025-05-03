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
      
      // Get all keys assigned to the current teacher
      const keysResponse = await apiService.keys.getTeacherKeys(userId);
      setMyKeys(keysResponse || []);
      
      // Get incoming transfer requests
      const incomingResponse = await apiService.keys.getIncomingTransfers();
      setIncomingRequests(incomingResponse || []);
      
      // Get outgoing transfer requests
      const outgoingResponse = await apiService.keys.getOutgoingTransfers();
      setOutgoingRequests(outgoingResponse || []);
      
      // Get available teachers for transfers
      const teachersResponse = await apiService.auth.getTeachers();
      // Filter out current user from available teachers
      const filteredTeachers = teachersResponse.filter(
        teacher => teacher.user_id.toString() !== userId
      );
      setAvailableTeachers(filteredTeachers || []);
      
    } catch (err) {
      console.error('Error fetching key management data:', err);
      setError('Failed to load key management data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Initiate key transfer to another teacher
  const handleTransferKey = async () => {
    if (!selectedKey || !selectedTeacher) {
      setError('Please select both a key and a teacher to transfer to.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const userId = localStorage.getItem('userId');
      
      await apiService.keys.createTransfer({
        key_id: selectedKey.id,
        from_teacher_id: parseInt(userId),
        to_teacher_id: selectedTeacher.id,
        notes: transferNote
      });
      
      setSuccessMessage(`Transfer request for key ${selectedKey.key_code} has been sent to ${selectedTeacher.full_name}`);
      setSelectedKey(null);
      setSelectedTeacher(null);
      setTransferNote('');
      
      // Refresh data to update the UI
      fetchData();
    } catch (err) {
      console.error('Error creating key transfer:', err);
      setError(err.response?.data?.detail || 'Failed to create key transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming transfer approval
  const handleApproveTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.approveTransfer(transferId);
      setSuccessMessage('Transfer request has been approved. The key is now assigned to you.');
      
      // Refresh data to update the UI
      fetchData();
    } catch (err) {
      console.error('Error approving transfer:', err);
      setError(err.response?.data?.detail || 'Failed to approve transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle incoming transfer rejection
  const handleRejectTransfer = async (transferId, reason = 'Request rejected') => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.rejectTransfer(transferId, reason);
      setSuccessMessage('Transfer request has been rejected.');
      
      // Refresh data to update the UI
      fetchData();
    } catch (err) {
      console.error('Error rejecting transfer:', err);
      setError(err.response?.data?.detail || 'Failed to reject transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle outgoing transfer cancellation
  const handleCancelTransfer = async (transferId) => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.cancelTransfer(transferId);
      setSuccessMessage('Transfer request has been cancelled.');
      
      // Refresh data to update the UI
      fetchData();
    } catch (err) {
      console.error('Error cancelling transfer:', err);
      setError(err.response?.data?.detail || 'Failed to cancel transfer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format datetime
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      <h3 className="section-title">Key Management</h3>
      
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
      
      {/* Inbox badge notification */}
      {incomingRequests.length > 0 && activeTab !== 'incoming' && (
        <div className="inbox-notification" onClick={() => setActiveTab('incoming')}>
          <span className="inbox-icon">📩</span>
          <span className="inbox-count">{incomingRequests.length}</span>
          <span className="inbox-message">You have pending key transfer requests</span>
        </div>
      )}
      
      {/* Tab navigation */}
      <div className="key-tabs">
        <button 
          className={`key-tab ${activeTab === 'my-keys' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-keys')}
        >
          My Keys
          {myKeys.length > 0 && <span className="tab-badge">{myKeys.length}</span>}
        </button>
        
        <button 
          className={`key-tab ${activeTab === 'incoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('incoming')}
        >
          Incoming Requests
          {incomingRequests.length > 0 && <span className="tab-badge">{incomingRequests.length}</span>}
        </button>
        
        <button 
          className={`key-tab ${activeTab === 'outgoing' ? 'active' : ''}`}
          onClick={() => setActiveTab('outgoing')}
        >
          Outgoing Requests
          {outgoingRequests.length > 0 && <span className="tab-badge">{outgoingRequests.length}</span>}
        </button>
      </div>
      
      {/* My Keys Tab */}
      {activeTab === 'my-keys' && (
        <div className="my-keys-section">
          {myKeys.length === 0 ? (
            <div className="no-keys-message">
              <div className="no-keys-icon">🔑</div>
              <p>You don't have any keys assigned to you.</p>
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
                        <span className="key-label">Room:</span>
                        <span className="key-value">{key.room_number}</span>
                      </div>
                      {key.building && (
                        <div className="key-detail">
                          <span className="key-label">Building:</span>
                          <span className="key-value">{key.building}</span>
                        </div>
                      )}
                      {key.floor && (
                        <div className="key-detail">
                          <span className="key-label">Floor:</span>
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
                        Assigned: {formatDate(key.assigned_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Transfer form */}
              <div className="transfer-form">
                <h4>Transfer Key to Another Teacher</h4>
                <div className="transfer-form-content">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Selected Key:</label>
                      <div className="selected-key">
                        {selectedKey ? (
                          <span><strong>{selectedKey.key_code}</strong> - Room {selectedKey.room_number}</span>
                        ) : (
                          <span className="select-prompt">Please select a key from above</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="teacher-select">Transfer to Teacher:</label>
                      <select
                        id="teacher-select"
                        value={selectedTeacher?.id || ''}
                        onChange={(e) => {
                          const teacherId = e.target.value;
                          const teacher = availableTeachers.find(t => t.id.toString() === teacherId);
                          setSelectedTeacher(teacher || null);
                        }}
                        disabled={!selectedKey}
                      >
                        <option value="">Select a teacher</option>
                        {availableTeachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.full_name} ({teacher.department_name})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group full-width">
                      <label htmlFor="transfer-note">Note (optional):</label>
                      <textarea
                        id="transfer-note"
                        value={transferNote}
                        onChange={(e) => setTransferNote(e.target.value)}
                        placeholder="Add a note about this transfer (e.g., reason, instructions, etc.)"
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
                      {loading ? 'Processing...' : 'Send Transfer Request'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Incoming Requests Tab */}
      {activeTab === 'incoming' && (
        <div className="incoming-requests-section">
          <h4>Pending Key Transfer Requests</h4>
          
          {incomingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📮</div>
              <p>You don't have any incoming key transfer requests.</p>
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
                      <span className="request-label">Room:</span>
                      <span className="request-value">{request.room_number}</span>
                    </div>
                    {request.building && (
                      <div className="request-row">
                        <span className="request-label">Building:</span>
                        <span className="request-value">{request.building}</span>
                      </div>
                    )}
                    <div className="request-row">
                      <span className="request-label">From Teacher:</span>
                      <span className="request-value teacher-name">
                        {request.from_teacher_name || `ID: ${request.from_teacher_id}`}
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
                      {loading ? 'Processing...' : 'Accept'}
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => handleRejectTransfer(request.id)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Outgoing Requests Tab */}
      {activeTab === 'outgoing' && (
        <div className="outgoing-requests-section">
          <h4>My Key Transfer Requests</h4>
          
          {outgoingRequests.length === 0 ? (
            <div className="no-requests-message">
              <div className="no-requests-icon">📤</div>
              <p>You don't have any outgoing key transfer requests.</p>
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
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </div>
                  </div>
                  
                  <div className="request-details">
                    <div className="request-row">
                      <span className="request-label">Room:</span>
                      <span className="request-value">{request.room_number}</span>
                    </div>
                    {request.building && (
                      <div className="request-row">
                        <span className="request-label">Building:</span>
                        <span className="request-value">{request.building}</span>
                      </div>
                    )}
                    <div className="request-row">
                      <span className="request-label">To Teacher:</span>
                      <span className="request-value teacher-name">
                        {request.to_teacher_name || `ID: ${request.to_teacher_id}`}
                      </span>
                    </div>
                    <div className="request-row">
                      <span className="request-label">Requested:</span>
                      <span className="request-value">
                        {formatDate(request.requested_at)}
                      </span>
                    </div>
                    {request.completed_at && (
                      <div className="request-row">
                        <span className="request-label">Completed:</span>
                        <span className="request-value">
                          {formatDate(request.completed_at)}
                        </span>
                      </div>
                    )}
                    {request.notes && (
                      <div className="request-notes">
                        <div className="notes-label">Note:</div>
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