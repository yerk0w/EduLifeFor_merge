// src/components/screens/Documents/Documents.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Documents.css';
import Slider from 'react-slick';
import Navbar from '../../common/Navbar';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import osvobozhdenie from '../../../assets/documents/заявление на освобождение от занятий НОВАЯ ФОРМА.pdf';
// import academicLeaveTemplate from '../../../assets/documents/academic-leave.pdf';
// import scholarshipApplicationTemplate from '../../../assets/documents/scholarship-application.pdf';
// import transferApplicationTemplate from '../../../assets/documents/transfer-application.pdf';

const Documents = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Исправление строки 45: используем useState правильно
  const [formData, setFormData] = useState({
    name: '',
    group: '',
    course: '',
    file: null
  });
  
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDownloadTemplate = (templateUrl, templateName) => {
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = templateName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      // Исправление строки 56: используем setFormData вместо formData
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
    // Исправление строки 77: используем setFormData вместо formData
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.group || !formData.course || !formData.file) {
      alert('Пожалуйста, заполните все поля и загрузите файл');
      return;
    }

    setIsSubmitting(true);

    // Здесь должна быть логика отправки формы на сервер
    // Имитация отправки
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Сброс формы после успешной отправки
      setTimeout(() => {
        setFormData({
          name: '',
          group: '',
          course: '',
          file: null
        });
        setFileName('');
        setSubmitSuccess(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);
    }, 1500);
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

  const documentTemplates = [
    {
      id: 1,
      title: 'Заявление на освобождение',
      description: 'Шаблон заявления для освобождение от занятий',
      fileUrl: osvobozhdenie,
      fileName: 'заявление на освобождение от занятий НОВАЯ ФОРМА.pdf'
    },
    {
      id: 2,
      title: 'Академический отпуск',
      description: 'Шаблон заявления на академический отпуск',
    //   fileUrl: academicLeaveTemplate,
      fileName: 'akademicheskij-otpusk.pdf'
    },
    {
      id: 3,
      title: 'Заявление на стипендию',
      description: 'Шаблон заявления на повышенную стипендию',
    //   fileUrl: scholarshipApplicationTemplate,
      fileName: 'zajavlenie-na-stipendiju.pdf'
    },
    {
      id: 4,
      title: 'Заявление на перевод',
      description: 'Шаблон заявления на перевод в другую группу/факультет',
    //   fileUrl: transferApplicationTemplate,
      fileName: 'zajavlenie-na-perevod.pdf'
    }
  ];

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
        <section className="templates-section">
          <h2 className="section-title">Шаблоны документов</h2>
          <div className="templates-slider-container">
            <Slider {...sliderSettings}>
              {documentTemplates.map(template => (
                <div key={template.id} className="template-banner">
                  <div className="template-content">
                    <h3 className="template-title">{template.title}</h3>
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
              <label htmlFor="name">ФИО:</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите ваше полное имя"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="group">Группа:</label>
              <input 
                type="text" 
                id="group" 
                name="group" 
                value={formData.group}
                onChange={handleInputChange}
                placeholder="Например: ИС-12"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="course">Курс:</label>
              <select 
                id="course" 
                name="course" 
                value={formData.course}
                onChange={handleInputChange}
                required
              >
                <option value="">Выберите курс</option>
                <option value="1">1 курс</option>
                <option value="2">2 курс</option>
                <option value="3">3 курс</option>
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
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Documents;
