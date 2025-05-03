import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import './AdminKeyManagement.css';

const AdminKeyManagement = () => {
  const [allKeys, setAllKeys] = useState([]);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  // State for key form
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [keyFormData, setKeyFormData] = useState({
    key_code: '',
    room_number: '',
    building: '',
    floor: '',
    description: '',
    teacher_id: ''
  });
  
  // State for editing key
  const [editingKeyId, setEditingKeyId] = useState(null);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Fetch all necessary data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all keys
      const keysResponse = await apiService.keys.getAllKeys();
      setAllKeys(keysResponse || []);
      
      // Get pending transfers
      const transfersResponse = await apiService.keys.getIncomingTransfers();
      setPendingTransfers(transfersResponse || []);
      
      // Get all teachers
      const teachersResponse = await apiService.auth.getTeachers();
      setTeachers(teachersResponse || []);
      
    } catch (err) {
      console.error('Error fetching key management data:', err);
      setError('Failed to load key management data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle key form input change
  const handleKeyFormChange = (e) => {
    const { name, value } = e.target;
    setKeyFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle key form submission
  const handleKeyFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const formattedData = {
        ...keyFormData,
        floor: keyFormData.floor ? parseInt(keyFormData.floor) : null,
        teacher_id: keyFormData.teacher_id ? parseInt(keyFormData.teacher_id) : null
      };
      
      if (editingKeyId) {
        // Update existing key
        await apiService.keys.updateKey(editingKeyId, formattedData);
        setSuccessMessage(`Key ${keyFormData.key_code} updated successfully`);
      } else {
        // Create new key
        await apiService.keys.createKey(formattedData);
        setSuccessMessage(`Key ${keyFormData.key_code} created successfully`);
      }
      
      // Reset form and refresh data
      resetKeyForm();
      fetchData();
      
    } catch (err) {
      console.error('Error submitting key form:', err);
      setError(err.response?.data?.detail || 'Error processing your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Reset key form
  const resetKeyForm = () => {
    setKeyFormData({
      key_code: '',
      room_number: '',
      building: '',
      floor: '',
      description: '',
      teacher_id: ''
    });
    setEditingKeyId(null);
    setIsAddingKey(false);
  };
  
  // Handle edit key
  const handleEditKey = (key) => {
    setKeyFormData({
      key_code: key.key_code,
      room_number: key.room_number,
      building: key.building || '',
      floor: key.floor || '',
      description: key.description || '',
      teacher_id: key.teacher_id || ''
    });
    setEditingKeyId(key.id);
    setIsAddingKey(true);
  };
  
  // Handle delete key
  const handleDeleteKey = async (keyId, keyCode) => {
    if (!window.confirm(`Are you sure you want to delete key ${keyCode}?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await apiService.keys.deleteKey(keyId);
      setSuccessMessage(`Key ${keyCode} deleted successfully`);
      fetchData();
    } catch (err) {
      console.error('Error deleting key:', err);
      setError(err.response?.data?.detail || 'Failed to delete key. It may be currently assigned or have pending transfers.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle key assignment
  const handleAssignKey = async (key) => {
    const teacherId = window.prompt('Enter teacher ID to assign this key:');
    if (!teacherId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const notes = window.prompt('Optional note for this assignment:') || 'Assigned by admin';
      await apiService.keys.assignKey(key.id, parseInt(teacherId), notes);
      setSuccessMessage(`Key ${key.key_code} assigned successfully`);
      fetchData();
    } catch (err) {
      console.error('Error assigning key:', err);
      setError(err.response?.data?.detail || 'Failed to assign key. Please check the teacher ID and try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle key unassignment
  const handleUnassignKey = async (key) => {
    if (!window.confirm(`Are you sure you want to unassign key ${key.key_code}?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const notes = window.prompt('Optional note for this unassignment:') || 'Unassigned by admin';
      await apiService.keys.unassignKey(key.id, notes);
      setSuccessMessage(`Key ${key.key_code} unassigned successfully`);
      fetchData();
    } catch (err) {
      console.error('Error unassigning key:', err);
      setError(err.response?.data?.detail || 'Failed to unassign key.');
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to format datetime
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    if (!teacherId) return 'Not assigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.full_name : `Teacher ID: ${teacherId}`;
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
  
  if (loading && allKeys.length === 0) {
    return (
      <div className="admin-key-management">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading key data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-key-management">
      <div className="admin-panel-header">
        <h3 className="section-title">Key Management</h3>
        <button 
          className="add-key-button"
          onClick={() => setIsAddingKey(!isAddingKey)}
        >
          {isAddingKey ? 'Cancel' : '+ Add New Key'}
        </button>
      </div>
      
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
      
      {/* Key Form */}
      {isAddingKey && (
        <div className="key-form-container">
          <h4>{editingKeyId ? 'Edit Key' : 'Add New Key'}</h4>
          <form onSubmit={handleKeyFormSubmit} className="key-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="key-code">Key Code*</label>
                <input
                  id="key-code"
                  type="text"
                  name="key_code"
                  value={keyFormData.key_code}
                  onChange={handleKeyFormChange}
                  placeholder="e.g., K001"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="room-number">Room Number*</label>
                <input
                  id="room-number"
                  type="text"
                  name="room_number"
                  value={keyFormData.room_number}
                  onChange={handleKeyFormChange}
                  placeholder="e.g., 301"
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="building">Building</label>
                <input
                  id="building"
                  type="text"
                  name="building"
                  value={keyFormData.building}
                  onChange={handleKeyFormChange}
                  placeholder="e.g., Main Building"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="floor">Floor</label>
                <input
                  id="floor"
                  type="number"
                  name="floor"
                  value={keyFormData.floor}
                  onChange={handleKeyFormChange}
                  placeholder="e.g., 3"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={keyFormData.description}
                  onChange={handleKeyFormChange}
                  placeholder="Optional description of the room or key"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group full-width">
                <label htmlFor="teacher-id">Initial Assignment (Optional)</label>
                <select
                  id="teacher-id"
                  name="teacher_id"
                  value={keyFormData.teacher_id}
                  onChange={handleKeyFormChange}
                >
                  <option value="">No initial assignment</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.department_name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={resetKeyForm}>
                Cancel
              </button>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Processing...' : (editingKeyId ? 'Update Key' : 'Create Key')}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Keys Table */}
      <div className="keys-table-container">
        <h4>All Keys</h4>
        {allKeys.length === 0 ? (
          <div className="no-keys-message">
            <p>No keys found. Add a new key to get started.</p>
          </div>
        ) : (
          <table className="keys-table">
            <thead>
              <tr>
                <th>Key Code</th>
                <th>Room</th>
                <th>Building</th>
                <th>Current Holder</th>
                <th>Assigned Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allKeys.map(key => (
                <tr key={key.id}>
                  <td className="key-code-cell">{key.key_code}</td>
                  <td>{key.room_number}</td>
                  <td>{key.building || '—'}</td>
                  <td className={key.teacher_id ? 'assigned' : 'unassigned'}>
                    {getTeacherName(key.teacher_id)}
                  </td>
                  <td>{formatDate(key.assigned_at)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-button edit"
                      onClick={() => handleEditKey(key)}
                      title="Edit Key"
                    >
                      ✏️
                    </button>
                    {key.teacher_id ? (
                      <button
                        className="action-button unassign"
                        onClick={() => handleUnassignKey(key)}
                        title="Unassign Key"
                      >
                        🔄
                      </button>
                    ) : (
                      <button
                        className="action-button assign"
                        onClick={() => handleAssignKey(key)}
                        title="Assign Key"
                      >
                        👤
                      </button>
                    )}
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteKey(key.id, key.key_code)}
                      title="Delete Key"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Pending Transfers Section */}
      <div className="pending-transfers-container">
        <h4>Pending Key Transfer Requests</h4>
        {pendingTransfers.length === 0 ? (
          <div className="no-transfers-message">
            <p>No pending key transfer requests.</p>
          </div>
        ) : (
          <table className="transfers-table">
            <thead>
              <tr>
                <th>Key</th>
                <th>Room</th>
                <th>From Teacher</th>
                <th>To Teacher</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingTransfers.map(transfer => (
                <tr key={transfer.id}>
                  <td className="key-code-cell">{transfer.key_code}</td>
                  <td>{transfer.room_number}</td>
                  <td>{getTeacherName(transfer.from_teacher_id)}</td>
                  <td>{getTeacherName(transfer.to_teacher_id)}</td>
                  <td>{formatDate(transfer.requested_at)}</td>
                  <td className="actions-cell">
                    <button
                      className="action-button approve"
                      onClick={async () => {
                        if (window.confirm('Approve this transfer?')) {
                          setLoading(true);
                          try {
                            await apiService.keys.approveTransfer(transfer.id);
                            setSuccessMessage('Transfer approved successfully');
                            fetchData();
                          } catch (err) {
                            setError('Failed to approve transfer');
                          } finally {
                            setLoading(false);
                          }
                        }
                      }}
                      title="Approve Transfer"
                    >
                      ✅
                    </button>
                    <button
                      className="action-button reject"
                      onClick={async () => {
                        const reason = window.prompt('Reason for rejection (optional):');
                        setLoading(true);
                        try {
                          await apiService.keys.rejectTransfer(transfer.id, reason);
                          setSuccessMessage('Transfer rejected successfully');
                          fetchData();
                        } catch (err) {
                          setError('Failed to reject transfer');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      title="Reject Transfer"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminKeyManagement;