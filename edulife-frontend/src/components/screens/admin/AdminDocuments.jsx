import React, { useState } from 'react';
import DocumentRequests from './DocumentRequests.jsx';
import DocumentsList from './DocumentsList.jsx';
import AddDocument from './AddDocument.jsx';

const AdminDocuments = () => {
  const [documentTab, setDocumentTab] = useState('requests');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [requestSearchQuery, setRequestSearchQuery] = useState('');

  return (
    <div className="admin-documents">
      <h3 className="section-title">Документооборот</h3>
      
      <div className="document-tabs">
        <button 
          className={`document-tab ${documentTab === 'requests' ? 'active' : ''}`}
          onClick={() => setDocumentTab('requests')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9H18V11H6M14,14H6V12H14M18,8H6V6H18" />
          </svg>
          Заявки на документы
        </button>
        <button 
          className={`document-tab ${documentTab === 'documents' ? 'active' : ''}`}
          onClick={() => setDocumentTab('documents')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
          Документы
        </button>
        <button 
          className={`document-tab ${documentTab === 'add' ? 'active' : ''}`}
          onClick={() => setDocumentTab('add')}
        >
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
          </svg>
          Добавить документ
        </button>
      </div>
      
      <div className="document-content">
        {documentTab === 'requests' && (
          <DocumentRequests 
            selectedRequest={selectedRequest}
            setSelectedRequest={setSelectedRequest}
            requestSearchQuery={requestSearchQuery}
            setRequestSearchQuery={setRequestSearchQuery}
          />
        )}
        {documentTab === 'documents' && (
          <DocumentsList
            selectedDocument={selectedDocument}
            setSelectedDocument={setSelectedDocument}
            setDocumentTab={setDocumentTab}
          />
        )}
        {documentTab === 'add' && (
          <AddDocument setDocumentTab={setDocumentTab} />
        )}
      </div>
    </div>
  );
};

export default AdminDocuments;