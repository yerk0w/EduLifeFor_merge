import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const AddDocument = ({ setDocumentTab }) => {
  const { t } = useTranslation(['admin']);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    template: '',
    recipient: '',
    comment: ''
  });
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCancel = () => {
    setDocumentTab('documents');
  };

  const handleSaveAsDraft = () => {
    console.log('Сохранение черновика:', { ...formData, file: fileName });
    setDocumentTab('documents');
  };

  const handleCreate = () => {
    console.log('Создание документа:', { ...formData, file: fileName });
    setDocumentTab('documents');
  };

  return (
    <div className="add-document">
      <h4 className="subsection-title">{t('addDocument.title')}</h4>
      
      <div className="document-form">
        <div className="form-group">
          <label className="form-label">{t('addDocument.docType')}</label>
          <select 
            className="form-select"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="">{t('addDocument.selectType')}</option>
            <option value="contract">{t('addDocument.docType.contract')}</option>
            <option value="certificate">{t('addDocument.docType.certificate')}</option>
            <option value="reference">{t('addDocument.docType.reference')}</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">{t('addDocument.docName')}</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder={t('addDocument.docNamePlaceholder')}
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">{t('addDocument.template')}</label>
          <select 
            className="form-select"
            name="template"
            value={formData.template}
            onChange={handleInputChange}
          >
            <option value="">{t('addDocument.selectTemplate')}</option>
            <option value="contract_edu">{t('addDocument.template.contractEdu')}</option>
            <option value="contract_teacher">{t('addDocument.template.contractTeacher')}</option>
            <option value="certificate_completion">{t('addDocument.template.certificateCompletion')}</option>
            <option value="reference_education">{t('addDocument.template.referenceEducation')}</option>
            <option value="reference_attendance">{t('addDocument.template.referenceAttendance')}</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">{t('addDocument.uploadFile')}</label>
          <div className="file-input-container">
            <input 
              type="file" 
              className="file-input" 
              id="document-file"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <label htmlFor="document-file" className="file-input-label">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              {t('addDocument.selectFile')}
            </label>
            <span className="file-name">{fileName || t('addDocument.fileNotSelected')}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">{t('addDocument.recipient')}</label>
          <select 
            className="form-select"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
          >
            <option value="">{t('addDocument.selectRecipient')}</option>
            <option value="1">Анна Смирнова</option>
            <option value="2">Иван Петров</option>
            <option value="3">Мария Иванова</option>
            <option value="4">Алексей Сидоров</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">{t('addDocument.comment')}</label>
          <textarea 
            className="form-textarea" 
            rows="3" 
            placeholder={t('addDocument.commentPlaceholder')}
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            className="cancel-button"
            onClick={handleCancel}
          >
            {t('addDocument.cancel')}
          </button>
          <button 
            className="save-button"
            onClick={handleSaveAsDraft}
          >
            {t('addDocument.saveAsDraft')}
          </button>
          <button 
            className="create-button"
            onClick={handleCreate}
          >
            {t('addDocument.createDocument')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;