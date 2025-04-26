import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../../services/apiService';

const AdminSendDocument = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
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
        const studentsData = await apiService.auth.getStudents();
        if (studentsData && Array.isArray(studentsData)) {
          setStudents(studentsData);
        } else {
          console.error('Ошибка: данные студентов не являются массивом');
          setErrorMessage('Не удалось загрузить список студентов');
        }
      } catch (error) {
        console.error('Ошибка при загрузке студентов:', error);
        setErrorMessage('Ошибка при загрузке списка студентов');
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
      setErrorMessage('');
    } else {
      alert('Пожалуйста, загрузите файл в формате PDF');
      fileInputRef.current.value = '';
      setFileName('');
      setFormData({ ...formData, file: null });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleStudentSelection = (e) => {
    setSelectedStudentId(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.file || !selectedStudentId) {
      setErrorMessage('Пожалуйста, заполните все поля, загрузите файл и выберите получателя');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Создаем FormData для отправки файла
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('template_type', formData.template_type || '');
      data.append('file', formData.file);
      data.append('recipient_id', selectedStudentId);
      
      // Отправка документа через API
      await apiService.documents.sendDocumentToStudent(data);
      
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
        setSelectedStudentId("");
        setSubmitSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch (error) {
      console.error('Ошибка при отправке документа:', error);
      setErrorMessage('Произошла ошибка при отправке документа');
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
          &lt;
        </button>

        <h1 className="header-title">Отправка документов студентам</h1>
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
          <h2 className="section-title">Заполните информацию о документе</h2>
          <form className="document-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Название документа:</label>
              <input 
                type="text" 
                id="title" 
                name="title" 
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Введите название документа"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Описание:</label>
              <input 
                type="text" 
                id="content" 
                name="content" 
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Краткое описание документа"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="template_type">Тип документа:</label>
              <select 
                id="template_type" 
                name="template_type" 
                value={formData.template_type}
                onChange={handleInputChange}
              >
                <option value="">Выберите тип документа</option>
                <option value="Приказ">Приказ</option>
                <option value="Распоряжение">Распоряжение</option>
                <option value="Справка">Справка</option>
                <option value="Уведомление">Уведомление</option>
              </select>
            </div>

            <div className="form-group file-upload-group">
              <label className="file-label">Загрузите документ (PDF):</label>
              <div className="file-upload-container">
                <label htmlFor="document-file" className="file-upload-button">
                  <span>Выбрать файл</span>
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
              <label htmlFor="recipients">Получатель:</label>
              <select 
                id="recipients" 
                name="recipients" 
                value={selectedStudentId}
                onChange={handleStudentSelection}
                required
              >
                <option value="">Выберите студента</option>
                {isLoadingStudents ? (
                  <option disabled>Загрузка студентов...</option>
                ) : (
                  students.map(student => (
                    <option key={student.id} value={student.user_id}>
                      {student.full_name} - {student.group_name || "Без группы"}
                    </option>
                  ))
                )}
              </select>
            </div>

            <button 
              type="submit" 
              className={`submit-document-button ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : submitSuccess ? 'Отправлено!' : 'Отправить документ'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminSendDocument;