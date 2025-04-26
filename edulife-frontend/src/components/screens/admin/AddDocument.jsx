import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AddDocument = ({ setDocumentTab }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    template: '',
    recipient: '',
    comment: '',
    file: null
  });
  const [fileName, setFileName] = useState('');
  const [templates, setTemplates] = useState([]);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // URL микросервиса документов
  const DOCK_API_URL = 'http://localhost:8100';
  const AUTH_API_URL = 'http://localhost:8070';

  // Получаем токен из localStorage
  const getAuthToken = () => localStorage.getItem('authToken');

  // Загрузка шаблонов и списка студентов при инициализации компонента
  useEffect(() => {
    fetchTemplates();
    fetchStudents();
  }, []);

  // Функция для загрузки шаблонов
  const fetchTemplates = async () => {
    try {
      const response = await axios.get(`${DOCK_API_URL}/templates`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке шаблонов:', error);
    }
  };

  // Функция для загрузки списка студентов
  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${AUTH_API_URL}/students`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setStudents(response.data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке списка студентов:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData({ ...formData, file });
        setFileName(file.name);
        setErrorMessage('');
      } else {
        setErrorMessage('Пожалуйста, загрузите файл в формате PDF');
        fileInputRef.current.value = '';
        setFileName('');
      }
    } else {
      setFileName('');
      setFormData({ ...formData, file: null });
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

  const handleSaveAsDraft = async () => {
    if (!formData.name || !formData.type || !formData.file) {
      setErrorMessage('Пожалуйста, заполните обязательные поля и загрузите файл');
      return;
    }

    await uploadDocument('ожидает');
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.type || !formData.file) {
      setErrorMessage('Пожалуйста, заполните обязательные поля и загрузите файл');
      return;
    }

    await uploadDocument('одобрено');
  };

  // Общая функция для загрузки документа с разными статусами
  const uploadDocument = async (status) => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Создаем FormData для отправки файла
      const data = new FormData();
      data.append('title', formData.name);
      data.append('content', formData.comment || 'Документ создан через админ-панель');
      data.append('template_type', formData.type);
      data.append('file', formData.file);
      
      // Если выбран получатель, добавляем его ID
      if (formData.recipient) {
        data.append('recipient_id', formData.recipient);
      }

      // Отправляем запрос на загрузку документа
      let endpoint = `${DOCK_API_URL}/documents/upload`;
      
      // Если выбран получатель, используем endpoint для отправки документа студенту
      if (formData.recipient) {
        endpoint = `${DOCK_API_URL}/documents/admin/send`;
      }

      const response = await axios.post(endpoint, data, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Обработка успешного ответа
      console.log('Документ успешно создан:', response.data);
      setSuccessMessage('Документ успешно создан!');
      
      // Очищаем форму
      setFormData({
        name: '',
        type: '',
        template: '',
        recipient: '',
        comment: '',
        file: null
      });
      setFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Через 1.5 секунды переходим к списку документов
      setTimeout(() => {
        setDocumentTab('documents');
      }, 1500);
    } catch (error) {
      console.error('Ошибка при создании документа:', error);
      setErrorMessage(error.response?.data?.detail || 'Ошибка при создании документа');
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора шаблона
  const handleTemplateChange = async (e) => {
    const templateId = e.target.value;
    setFormData({
      ...formData,
      template: templateId
    });

    if (templateId) {
      try {
        // Получаем информацию о шаблоне
        const response = await axios.get(`${DOCK_API_URL}/templates/${templateId}`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });

        const template = response.data;
        
        // Автоматически заполняем поля формы на основе шаблона
        setFormData(prev => ({
          ...prev,
          name: `Документ на основе шаблона: ${template.name}`,
          type: getDocumentTypeFromTemplate(template.name)
        }));
      } catch (error) {
        console.error('Ошибка при получении данных шаблона:', error);
      }
    }
  };

  // Определяем тип документа на основе названия шаблона
  const getDocumentTypeFromTemplate = (templateName) => {
    if (templateName.toLowerCase().includes('договор')) return 'contract';
    if (templateName.toLowerCase().includes('сертификат')) return 'certificate';
    if (templateName.toLowerCase().includes('справка')) return 'reference';
    return '';
  };

  return (
    <div className="add-document">
      <h4 className="subsection-title">Добавление нового документа</h4>
      
      {errorMessage && (
        <div className="error-message" style={{ 
          color: 'white', 
          backgroundColor: '#e74c3c', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="success-message" style={{ 
          color: 'white', 
          backgroundColor: '#2ecc71', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {successMessage}
        </div>
      )}
      
      <div className="document-form">
        <div className="form-group">
          <label className="form-label">Тип документа:</label>
          <select 
            className="form-select"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled={isLoading}
          >
            <option value="">Выберите тип документа</option>
            <option value="contract">Договор</option>
            <option value="certificate">Сертификат</option>
            <option value="reference">Справка</option>
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Название документа:</label>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Введите название документа"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Шаблон документа:</label>
          <select 
            className="form-select"
            name="template"
            value={formData.template}
            onChange={handleTemplateChange}
            disabled={isLoading}
          >
            <option value="">Выберите шаблон</option>
            {templates.map(template => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Загрузить файл:</label>
          <div className="file-input-container">
            <input 
              type="file" 
              className="file-input" 
              id="document-file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              disabled={isLoading}
            />
            <label htmlFor="document-file" className="file-input-label">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Выбрать файл
            </label>
            <span className="file-name">{fileName || 'Файл не выбран'}</span>
          </div>
        </div>
        
        <div className="form-group">
          <label className="form-label">Получатель (необязательно):</label>
          <select 
            className="form-select"
            name="recipient"
            value={formData.recipient}
            onChange={handleInputChange}
            disabled={isLoading}
          >
            <option value="">Выберите получателя</option>
            {students.map(student => (
              <option key={student.id} value={student.user_id}>
                {student.full_name} - {student.group_name || 'Без группы'}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label className="form-label">Комментарий (необязательно):</label>
          <textarea 
            className="form-textarea" 
            rows="3" 
            placeholder="Введите комментарий..."
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            disabled={isLoading}
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            className="cancel-button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            className="save-button"
            onClick={handleSaveAsDraft}
            disabled={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить как черновик'}
          </button>
          <button 
            className="create-button"
            onClick={handleCreate}
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Создать документ'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;