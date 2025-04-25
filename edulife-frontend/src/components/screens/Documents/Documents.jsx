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
  
  // Состояния для документов и шаблонов
  const [templates, setTemplates] = useState([]);
  const [userDocuments, setUserDocuments] = useState([]);
  const [adminDocuments, setAdminDocuments] = useState([]);
  
  // Состояния загрузки
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [isLoadingAdminDocuments, setIsLoadingAdminDocuments] = useState(true);
  
  // Состояние формы
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    template_type: '',
    file: null
  });
  
  // Прочие состояния
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'студент');

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    // Проверка наличия токена
    if (!localStorage.getItem('authToken')) {
      console.log('Демо-режим: создаем фейковый токен');
      localStorage.setItem('authToken', 'demo_token');
      localStorage.setItem('userId', '1');
      localStorage.setItem('userRole', 'студент');
      setUserRole('студент');
    }

    fetchData();
  }, []);

  // Функция для загрузки всех данных
  const fetchData = async () => {
    await Promise.all([
      fetchTemplates(),
      fetchUserDocuments(),
      fetchAdminDocuments()
    ]);
  };

  // Загрузка шаблонов документов
  const fetchTemplates = async () => {
    try {
      setIsLoadingTemplates(true);
      const response = await apiService.documents.getTemplates();
      
      if (response && Array.isArray(response) && response.length > 0) {
        console.log('Получены шаблоны с сервера:', response);
        setTemplates(response);
      } else {
        console.log('Нет доступных шаблонов, использую дефолтные');
        // Используем дефолтные шаблоны, если с сервера ничего не пришло
        setTemplates([
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
        ]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке шаблонов:', error);
      setErrorMessage('Не удалось загрузить шаблоны документов');
      setTimeout(() => setErrorMessage(''), 3000);
      
      // Используем дефолтные шаблоны в случае ошибки
      setTemplates([
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
        }
      ]);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Загрузка документов пользователя
  const fetchUserDocuments = async () => {
    try {
      setIsLoadingDocuments(true);
      const response = await apiService.documents.getDocuments();
      
      if (response && Array.isArray(response)) {
        console.log('Получены документы пользователя с сервера:', response);
        setUserDocuments(response);
      } else {
        // Если ничего не пришло, устанавливаем пустой массив
        setUserDocuments([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке документов пользователя:', error);
      setUserDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  // Загрузка документов от администрации
  const fetchAdminDocuments = async () => {
    try {
      setIsLoadingAdminDocuments(true);
      const response = await apiService.auth.getAdminDocuments();
      
      if (response && Array.isArray(response)) {
        console.log('Получены документы от администрации:', response);
        setAdminDocuments(response);
      } else {
        setAdminDocuments([]);
      }
    } catch (error) {
      console.error('Ошибка при загрузке документов администрации:', error);
      setAdminDocuments([]);
    } finally {
      setIsLoadingAdminDocuments(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Скачивание шаблона документа
  const handleDownloadTemplate = async (templateId, templateName) => {
    try {
      setErrorMessage('');
      
      // Если у шаблона есть fileUrl (локальный файл), используем его
      if (templateId && typeof templateId === 'string' && templateId.startsWith('http')) {
        const link = document.createElement('a');
        link.href = templateId;
        link.download = templateName || 'шаблон.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Для локальных файлов
      if (!templateId || templateId === 'fileUrl') {
        const link = document.createElement('a');
        link.href = osvobozhdenie;
        link.download = templateName || 'шаблон.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      
      // Иначе загружаем с сервера по ID
      try {
        console.log(`Скачивание шаблона с ID=${templateId}`);
        const blob = await apiService.documents.downloadTemplate(templateId);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = templateName || `template-${templateId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Ошибка при загрузке шаблона с сервера, используем локальный файл:', error);
        // В случае ошибки используем локальный файл
        const link = document.createElement('a');
        link.href = osvobozhdenie;
        link.download = templateName || 'шаблон.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Ошибка при скачивании шаблона:', error);
      setErrorMessage('Не удалось скачать шаблон документа');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Обработка выбора файла
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData({ ...formData, file });
        setFileName(file.name);
      } else {
        alert('Пожалуйста, загрузите файл в формате PDF');
        fileInputRef.current.value = '';
        setFileName('');
      }
    }
  };

  // Обработка изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Отправка формы документа
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.file) {
      alert('Пожалуйста, заполните все поля и загрузите файл');
      return;
    }
  
    setIsSubmitting(true);
    setErrorMessage('');
  
    try {
      // Создаем FormData для отправки файла
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      
      // Добавляем template_type только если он не пустой
      if (formData.template_type) {
        data.append('template_type', formData.template_type);
      }
      
      // Убедимся, что файл корректно добавлен
      if (formData.file) {
        data.append('file', formData.file);
        console.log('Файл добавлен:', formData.file.name, formData.file.size, 'байт');
      }
      
      console.log('Отправка документа на сервер...');
      
      try {
        // Прямая отправка через fetch для большего контроля
        const token = localStorage.getItem('authToken');
        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            // Не указываем Content-Type, чтобы браузер автоматически установил с boundary
            'Authorization': `Bearer ${token}`
          },
          body: data
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('Ответ сервера:', responseData);
        
        // Отображаем успех
        setSubmitSuccess(true);
        
        // Обновляем список документов пользователя
        await fetchUserDocuments();
      } catch (fetchError) {
        console.error('Ошибка при отправке через fetch:', fetchError);
        
        // Пробуем резервный вариант через axios
        console.log('Пробуем через apiService...');
        const response = await apiService.documents.uploadDocument(data);
        console.log('Ответ сервера через apiService:', response);
        
        // Отображаем успех
        setSubmitSuccess(true);
        
        // Обновляем список документов пользователя
        await fetchUserDocuments();
      }
      
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
    } catch (error) {
      console.error('Ошибка при отправке документа:', error);
      setErrorMessage('Произошла ошибка при отправке документа. ' + 
        (error.message || 'Пожалуйста, проверьте подключение и попробуйте еще раз.'));
      
      // Проверяем, если в localStorage установлен флаг demoMode или нет сети, имитируем успешную отправку
      if (localStorage.getItem('demoMode') === 'true' || !navigator.onLine) {
        setTimeout(() => {
          setSubmitSuccess(true);
          
          // Добавляем документ в локальный список
          const newDocument = {
            id: Date.now(),
            title: formData.title,
            content: formData.content,
            status: 'ожидает',
            created_at: new Date().toISOString(),
            template_type: formData.template_type || null,
            author_name: localStorage.getItem('username') || 'Вы'
          };
          
          setUserDocuments(prev => [newDocument, ...prev]);
          
          // Сброс формы
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
      }
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 1500);
    }
  };

  // Удаление документа
  const handleDeleteDocument = async (documentId) => {
    const confirmDelete = window.confirm('Вы уверены, что хотите отменить этот документ?');
    if (!confirmDelete) return;
    
    try {
      // Для демо-режима просто удаляем из локального состояния
      setUserDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      // Здесь должен быть код для отправки запроса на сервер
      // await apiService.documents.deleteDocument(documentId);
      
    } catch (error) {
      console.error('Ошибка при удалении документа:', error);
      setErrorMessage('Не удалось удалить документ');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  // Открытие файла документа
  const handleOpenDocument = (filePath) => {
    if (filePath) {
      const fullPath = filePath.startsWith('/') ? `/api${filePath}` : `/api/${filePath}`;
      window.open(fullPath, '_blank');
    } else {
      setErrorMessage('Путь к файлу документа не найден');
      setTimeout(() => setErrorMessage(''), 3000);
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

  // Отображение статуса документа с соответствующим цветом
  const renderDocumentStatus = (status) => {
    let backgroundColor = '#FFC107'; // По умолчанию желтый (ожидает)
    
    if (status === 'одобрено') {
      backgroundColor = '#4CAF50'; // Зеленый
    } else if (status === 'отклонено') {
      backgroundColor = '#F44336'; // Красный
    }
    
    return (
      <span style={{ 
        padding: '5px 10px', 
        borderRadius: '10px',
        backgroundColor,
        color: 'white',
        fontSize: '12px'
      }}>
        {status}
      </span>
    );
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
        
        {/* Раздел с шаблонами документов */}
        <section className="templates-section">
          <h2 className="section-title">Шаблоны документов</h2>
          {isLoadingTemplates ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Загрузка шаблонов...</p>
            </div>
          ) : (
            <div className="templates-slider-container">
              <Slider {...sliderSettings}>
                {templates.map((template, index) => (
                  <div key={template.id || index} className="template-banner">
                    <div className="template-content">
                      <h3 className="template-title">{template.name || template.title}</h3>
                      <p className="template-description">{template.description}</p>
                      <button 
                        className="download-template-button"
                        onClick={() => handleDownloadTemplate(template.id || template.fileUrl, template.name || template.title)}
                      >
                        Скачать шаблон
                      </button>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </section>

        {/* Форма отправки документа */}
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
                {templates.map((template, index) => (
                  <option key={template.id || index} value={template.name || template.title}>
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
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p>Загрузка документов...</p>
            </div>
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
                    {renderDocumentStatus(document.status)}
                  </div>
                  <p style={{ margin: '10px 0', color: '#ccc' }}>{document.content}</p>
                  <div style={{ fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Дата создания: {new Date(document.created_at).toLocaleDateString()}</span>
                    {document.template_type && <span>Тип: {document.template_type}</span>}
                    {document.author_name && document.author_name !== localStorage.getItem('username') && 
                      <span>От: {document.author_name}</span>
                    }
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {document.file_path && (
                      <button 
                        onClick={() => handleOpenDocument(document.file_path)}
                        style={{
                          backgroundColor: '#3a3a3a',
                          color: '#ddd',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Открыть файл
                      </button>
                    )}
                    {document.status === 'ожидает' && (
                      <button 
                        onClick={() => handleDeleteDocument(document.id)}
                        style={{
                          backgroundColor: '#3a3a3a',
                          color: '#ff8080',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              У вас пока нет документов
            </p>
          )}
        </section>

        {/* Документы от администрации */}
        {userRole !== 'admin' && userRole !== 'админ' && (
          <section className="admin-documents-section" style={{ marginTop: '40px' }}>
            <h2 className="section-title">Документы от администрации</h2>
            {isLoadingAdminDocuments ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p>Загрузка документов от администрации...</p>
              </div>
            ) : adminDocuments.length > 0 ? (
              <div className="documents-list">
                {adminDocuments.map(document => (
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
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        Официальный документ
                      </span>
                    </div>
                    <p style={{ margin: '10px 0', color: '#ccc' }}>{document.content}</p>
                    <div style={{ fontSize: '12px', color: '#999', display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span>Дата создания: {new Date(document.created_at).toLocaleDateString()}</span>
                      {document.template_type && <span>Тип: {document.template_type}</span>}
                      {document.author_name && <span>От: {document.author_name}</span>}
                    </div>
                    {document.file_path && (
                      <button 
                        onClick={() => handleOpenDocument(document.file_path)}
                        style={{
                          backgroundColor: '#3a3a3a',
                          color: '#ddd',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '5px 10px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Открыть файл
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                У вас нет документов от администрации
              </p>
            )}
          </section>
        )}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Documents;