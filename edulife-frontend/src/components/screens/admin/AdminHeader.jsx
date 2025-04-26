import React from 'react';
import { useTranslation } from 'react-i18next';

const AdminHeader = () => {
  const { t } = useTranslation(['admin']);
  
  return (
    <div className="admin-header">
      <div className="admin-logo">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
        <h1 className="admin-title">{t('adminHeader.title')}</h1>
      </div>
      
      <div className="admin-user">
        <div className="user-info1">
          <span className="user-name">{t('adminHeader.adminRole')}</span>
          <span className="user-role">{t('adminHeader.adminRole')}</span>
        </div>
        <div className="user-avatar">
          <img src="/images/admin-avatar.jpg" alt="Admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;