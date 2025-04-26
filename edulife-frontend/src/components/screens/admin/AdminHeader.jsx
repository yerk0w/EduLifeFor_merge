import React from 'react';

const AdminHeader = () => {


  const username = localStorage.getItem('username') || 'Admin';
  const userRole = localStorage.getItem('userRole') || 'Admin';
  const userId = localStorage.getItem('userId') || 'Admin';
  return (
    <div className="admin-header">
      <div className="admin-logo">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
        <h1 className="admin-title">EduLife</h1>
      </div>
      
      <div className="admin-user">
        <div className="user-info1">
          <span className="user-name">{username}</span>
          <span className="user-role">{userRole}</span>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;