import React, { useState, useRef } from 'react';

const AddDocument = ({ setDocumentTab }) => {
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
      <h4 className="subsection-title">Добавление нового документа</h4>
      
      <div className="document-form">
        <div className="form-group">
          <label className="form-label">Тип документа:</label>
          <select 
            className="form-select"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
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
          />
        </div>
        
        <div className="form-group">
          <label className="form-label">Шаблон документа:</label>
          <select 
            className="form-select"
            name="template"
            value={formData.template}
            onChange={handleInputChange}
          >
            <option value="">Выберите шаблон</option>
            <option value="contract_edu">Договор на обучение</option>
            <option value="contract_teacher">Договор с преподавателем</option>
            <option value="certificate_completion">Сертификат об окончании курса</option>
            <option value="reference_education">Справка об обучении</option>
            <option value="reference_attendance">Справка о посещаемости</option>
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
          >
            <option value="">Выберите получателя</option>
            <option value="1">Анна Смирнова</option>
            <option value="2">Иван Петров</option>
            <option value="3">Мария Иванова</option>
            <option value="4">Алексей Сидоров</option>
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
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            className="cancel-button"
            onClick={handleCancel}
          >
            Отмена
          </button>
          <button 
            className="save-button"
            onClick={handleSaveAsDraft}
          >
            Сохранить как черновик
          </button>
          <button 
            className="create-button"
            onClick={handleCreate}
          >
            Создать документ
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddDocument;