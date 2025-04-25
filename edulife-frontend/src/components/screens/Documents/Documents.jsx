import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Documents.css';
import Slider from 'react-slick';
import Navbar from '../../common/Navbar';
import apiService from '../../../services/apiService';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import osvobozhdenie from '../../../assets/documents/заявление на освобождение от занятий НОВАЯ ФОРМА.pdf';

const Documents = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Исходные данные для шаблонов в случае, если API недоступен
  const defaultTemplates = [
    {
      id: 1,
      name: 'Заявление на освобождение',
      description: 'Шаблон заявления для освобождение от занятий',
      fileUrl: osvobozhdenie,
      fileName: 'заявление на освобождение от занятий НОВАЯ ФОРМА.pdf'
    },
    {
      id: 2,
      name: 'Академический отпуск',
      description: 'Шаблон заявления на академический отпуск',
      fileName: 'akademicheskij-otpusk.pdf'
    },
    {
      id: 3,
      name: 'Заявление на стипендию',
      description: 'Шаблон заявления на повышенную стипендию',
      fileName: 'zajavlenie-na-stipendiju.pdf'
    },
    {
      id: 4,
      name: 'Заявление на перевод',
      description: 'Шаблон заявления на перевод в другую группу/факультет',
      fileName: 'zajavlenie-na-perevod.pdf'
    }
  ];
  
  const [templates, setTemplates] = useState(defaultTemplates);
  const [userDocuments, setUserDocuments] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  
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

  // Проверка авторизации и загрузка данных только после успешной проверки
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    // Если нет токена, не пытаемся загрузить данные через API
    if (!token || !userId) {
      console.log("Работаем в демо-режиме без авторизации");
      return;
    }

    // Загрузка шаблонов только если есть токен
    const fetchTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        // Проверяем доступ к API, используя надежный метод
        const response = await fetch('/api/health-check');
        if (response.ok) {
          // API доступен, пробуем загрузить шаблоны
          const templatesData = await apiService.documents.getTemplates();
          if (templatesData && templatesData.length > 0) {
            setTemplates(templatesData);
          }
        }
      } catch (error) {
        console.log('Используем локальные шаблоны из-за недоступности API:', error);
        // Тихая обработка ошибки - продолжаем использовать defaultTemplates
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    // Загрузка документов пользователя только если есть токен
    const fetchUserDocuments = async () => {
      try {
        setIsLoadingDocuments(true);
        const documentsData = await apiService.documents.getDocuments();
        if (documentsData && Array.isArray(documentsData)) {
          setUserDocuments(documentsData);
        }
      } catch (error) {
        console.log('Не удалось загрузить документы пользователя:', error);
        // Тихая обработка ошибки - показываем пустой список
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchTemplates();
    fetchUserDocuments();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadTemplate = (templateUrl, templateName) => {
    if (!templateUrl) {
      setErrorMessage(`Шаблон "${templateName}" временно недоступен`);
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = templateUrl;
      link.download = templateName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при скачивании шаблона:', error);
      setErrorMessage('Не удалось скачать шаблон документа');
      setTimeout(() => setErrorMessage(''), 3000);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Проверяем авторизацию перед отправкой
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/log');
      return;
    }
    
    if (!formData.title || !formData.content || !formData.file) {
      alert('Пожалуйста, заполните все поля и загрузите файл');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // Имитация отправки на сервер (в реальном случае используйте API)
      // В локальной демо-версии просто имитируем успешную отправку
      setTimeout(() => {
        setSubmitSuccess(true);
        
        // Добавляем документ в локальный список
        const newDocument = {
          id: Date.now(),
          title: formData.title,
          content: formData.content,
          status: 'ожидает',
          created_at: new Date().toISOString(),
          template_type: formData.template_type || null
        };
        
        setUserDocuments(prev => [newDocument, ...prev]);
        
        // Сброс формы после успешной отправки
        setTimeout(() => {
          setFormData({
            title: '',
            content: '',
            template_type: '',
            file: null
          });
          setFileName('');
          setSubmitSuccess(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 2000);
      }, 1500);
      
    } catch (error) {
      console.error('Ошибка при отправке документа:', error);
      setErrorMessage('Произошла ошибка при отправке документа');
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    }
  };

  const sliderSettings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    centerMode: true,
    centerPadding: '40px',
    responsive: [
      {
        breakpoint: 768,
        settings: {
          centerPadding: '20px',
        }
      }
    ]
  };

  return (
    <div className="documents-screen">
      <div className="documents-header">
        <button className="back-button" onClick={handleBack}>
          &lt;
        </button>

        <h1 className="header-title">Документооборот</h1>
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
        
        <section className="templates-section">
          <h2 className="section-title">Шаблоны документов</h2>
          <div className="templates-slider-container">
            <Slider {...sliderSettings}>
              {templates.map(template => (
                <div key={template.id} className="template-banner">
                  <div className="template-content">
                    <h3 className="template-title">{template.name || template.title}</h3>
                    <p className="template-description">{template.description}</p>
                    <button 
                      className="download-template-button"
                      onClick={() => handleDownloadTemplate(template.fileUrl, template.fileName)}
                    >
                      Скачать шаблон
                    </button>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </section>

        <section className="document-submission-section">
          <h2 className="section-title">Отправка документа</h2>
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
                {templates.map(template => (
                  <option key={template.id} value={template.name || template.title}>
                    {template.name || template.title}
                  </option>
                ))}
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

            <button 
              type="submit" 
              className={`submit-document-button ${isSubmitting ? 'loading' : ''} ${submitSuccess ? 'success' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Отправка...' : submitSuccess ? 'Отправлено!' : 'Отправить документ'}
            </button>
          </form>
        </section>

        {/* Секция для отображения документов пользователя */}
        <section className="user-documents-section" style={{ marginTop: '40px' }}>
          <h2 className="section-title">Ваши документы</h2>
          {isLoadingDocuments ? (
            <p>Загрузка документов...</p>
          ) : userDocuments.length > 0 ? (
            <div className="documents-list">
              {userDocuments.map(document => (
                <div key={document.id} className="document-item" style={{ 
                  backgroundColor: '#2D2D2D', 
                  borderRadius: '16px',
                  padding: '15px',
                  marginBottom: '15px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0' }}>{document.title}</h3>
                    <span style={{ 
                      padding: '5px 10px', 
                      borderRadius: '10px',
                      backgroundColor: document.status === 'одобрено' ? '#4CAF50' : 
                                      document.status === 'отклонено' ? '#F44336' : '#FFC107',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {document.status}
                    </span>
                  </div>
                  <p style={{ margin: '10px 0', color: '#ccc' }}>{document.content}</p>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    Дата создания: {new Date(document.created_at).toLocaleDateString()}
                    {document.template_type && <span> • Тип: {document.template_type}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>У вас пока нет документов</p>
          )}
        </section>
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Documents;