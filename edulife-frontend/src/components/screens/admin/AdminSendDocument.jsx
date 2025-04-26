import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiService from '../../../services/apiService';

const AdminSendDocument = () => {
  const { t } = useTranslation(['admin']);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    template_type: '',
    file: null
  });
  
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Проверяем права администратора
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin' && userRole !== 'админ') {
      navigate('/documents');
      return;
    }
    
    // Загрузка списка студентов
    const fetchStudents = async () => {
      try {
        setIsLoadingStudents(true);
        // В реальном приложении используйте API
        const studentsData = await apiService.auth.getStudents();
        if (studentsData && Array.isArray(studentsData)) {
          setStudents(studentsData);
        } else {
          // Демо-данные для тестирования
          setStudents([
            { id: 1, user_id: 1, full_name: 'Иванов Иван', group_name: 'ИТ-101' },
            { id: 2, user_id: 2, full_name: 'Петров Петр', group_name: 'ИТ-102' },
            { id: 3, user_id: 3, full_name: 'Сидорова Анна', group_name: 'ИТ-101' },
            { id: 4, user_id: 4, full_name: 'Козлова Мария', group_name: 'ИТ-102' }
          ]);
        }
      } catch (error) {
        console.error('Ошибка при загрузке студентов:', error);
        // Демо-данные для тестирования
        setStudents([
          { id: 1, user_id: 1, full_name: 'Иванов Иван', group_name: 'ИТ-101' },
          { id: 2, user_id: 2, full_name: 'Петров Петр', group_name: 'ИТ-102' },
          { id: 3, user_id: 3, full_name: 'Сидорова Анна', group_name: 'ИТ-101' },
          { id: 4, user_id: 4, full_name: 'Козлова Мария', group_name: 'ИТ-102' }
        ]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  const handleBack = () => {
    navigate('/documents');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData({ ...formData, file });
      setFileName(file.name);
    } else {
      alert('Пожалуйста, загрузите файл в формате PDF');
      fileInputRef.current.value = '';
      setFileName('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStudentSelection = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      option => parseInt(option.value)
    );
    setSelectedStudents(selectedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.file || selectedStudents.length === 0) {
      alert(t('adminSendDocument.fillAllFields'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Отправляем документ каждому выбранному студенту
      for (const studentId of selectedStudents) {
        // Создаем FormData для отправки файла
        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('template_type', formData.template_type || '');
        data.append('file', formData.file);
        data.append('recipient_id', studentId);
        
        try {
          // В реальном приложении используйте API для отправки
          await apiService.documents.sendDocumentToStudent(data);
        } catch (error) {
          console.error(`Ошибка при отправке документа студенту ${studentId}:`, error);
        }
      }
      
      // Отображаем успех
      setSubmitSuccess(true);
      
      // Сброс формы после успешной отправки
      setTimeout(() => {
        setFormData({
          title: '',
          content: '',
          template_type: '',
          file: null
        });
        setFileName('');
        setSelectedStudents([]);
        setSubmitSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Ошибка при отправке документов:', error);
      setErrorMessage(t('adminSendDocument.error'));
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    }
  };

  return (
    <div className="documents-screen">
      <div className="documents-header">
        <button className="back-button" onClick={handleBack}>
          &lt; {t('adminSendDocument.back')}
        </button>

        <h1 className="header-title">{t('adminSendDocument.title')}</h1>
        <div className="header-spacer"></div>
      </div>

      <div className="documents-content">
        {errorMessage && (
          <div style={{ 
            backgroundColor: '#ff5252', 
            color: 'white', 
            padding: '10px', 
            borderRadius: '8px',
            marginBottom: '15px',
            textAlign: 'center' 
          }}>
            {errorMessage}
          </div>
        )}
        
        <section className="document-submission-section">
          <h2 className="section-title">{t('adminSendDocument.formTitle')}</h2>
          <form className="document-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">{t('adminSendDocument.docTitle')}</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('adminSendDocument.docTitlePlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">{t('adminSendDocument.description')}</label>
              <input 
                type="text" 
                id="content" 
                name="content" 
                value={formData.content}
                onChange={handleInputChange}
                placeholder={t('adminSendDocument.descriptionPlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="template_type">{t('adminSendDocument.docType')}</label>
              <select 
                id="template_type" 
                name="template_type" 
                value={formData.template_type}
                onChange={handleInputChange}
              >
                <option value="">{t('adminSendDocument.selectDocType')}</option>
                <option value="Приказ">{t('adminSendDocument.docType.order')}</option>
                <option value="Распоряжение">{t('adminSendDocument.docType.decree')}</option>
                <option value="Справка">{t('adminSendDocument.docType.reference')}</option>
                <option value="Уведомление">{t('adminSendDocument.docType.notification')}</option>
              </select>
            </div>

            <div className="form-group file-upload-group">
              <label className="file-label">{t('adminSendDocument.uploadDocument')}</label>
              <div className="file-upload-container">
                <label htmlFor="document-file" className="file-upload-button">
                  <span>{t('adminSendDocument.selectFile')}</span>
                  <input 
                    type="file" 
                    id="document-file" 
                    ref={fileInputRef}
                    accept=".pdf" 
                    onChange={handleFileChange}
                    className="file-input"
                  />
                </label>
                {fileName && (
                  <div className="file-name">{fileName}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="recipients">{t('adminSendDocument.recipients')}</label>
              <select 
                id="recipients" 
                name="recipients" 
                multiple 
                size={Math.min(6, students.length)}
                value={selectedStudents}
                onChange={handleStudentSelection}
                style={{ height: 'auto' }}
                required
              >
                {isLoadingStudents ? (
                  <option disabled>{t('adminSendDocument.loadingStudents')}</option>
                ) : (
                  students.map(student => (
                    <option key={student.id} value={student.user_id}>
                      {student.full_name} - {student.group_name}
                    </option>
                  ))
                )}
              </select>
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#999' }}>
                {t('adminSendDocument.multiSelectHint')}
              </div>
            </div>

            <button 
              type="submit" 
              className={`submit-document-button ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? t('adminSendDocument.sending') : submitSuccess ? t('adminSendDocument.sent') : t('adminSendDocument.send')}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminSendDocument;