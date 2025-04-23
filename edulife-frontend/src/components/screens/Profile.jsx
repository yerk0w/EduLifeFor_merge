import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './Profile.css';
import avatarImage1 from '../../assets/images/avatar.png';
import notificationIcon from '../../assets/images/notification.png';
import settingsIcon from '../../assets/images/settings.png';

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('statistics');
    const [timeRange, setTimeRange] = useState('1 Year');
    const [activeTooltip, setActiveTooltip] = useState(null);
    const chartRef = useRef(null);
    
    // State for edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState('');
    const [formData, setFormData] = useState({
      fullName: 'Jane Soci',
      birthDate: '15.06.1995',
      gender: 'Женский',
      country: 'Россия',
      city: 'Москва',
      language: 'Русский',
      email: 'jane.soci@example.com',
      phone: '+7 (123) 456-78-90',
      address: 'ул. Примерная, д. 123, кв. 45',
      telegram: '@janesoci'
    });
    
    // Данные для графика посещаемости по месяцам
    const monthsData = [
      { month: 'Jan', value: 85, presentDays: 25, absentDays: 5, totalDays: 30, year: 2024 },
      { month: 'Feb', value: 90, presentDays: 27, absentDays: 2, totalDays: 29, year: 2024 },
      { month: 'Mar', value: 80, presentDays: 24, absentDays: 6, totalDays: 30, year: 2024 },
      { month: 'Apr', value: 88, presentDays: 22, absentDays: 3, totalDays: 25, year: 2024 },
      { month: 'May', value: 92, presentDays: 28, absentDays: 3, totalDays: 31, year: 2024 },
      { month: 'Jun', value: 75, presentDays: 20, absentDays: 5, totalDays: 25, year: 2024 },
      { month: 'Jul', value: 0, presentDays: 0, absentDays: 0, totalDays: 31, year: 2024, isVacation: true },
      { month: 'Aug', value: 0, presentDays: 0, absentDays: 0, totalDays: 31, year: 2024, isVacation: true },
      { month: 'Sep', value: 88, presentDays: 26, absentDays: 4, totalDays: 30, year: 2024 },
      { month: 'Oct', value: 95, presentDays: 29, absentDays: 2, totalDays: 31, year: 2024 },
      { month: 'Nov', value: 91, presentDays: 27, absentDays: 3, totalDays: 30, year: 2024 },
      { month: 'Dec', value: 85, presentDays: 26, absentDays: 5, totalDays: 31, year: 2024 }
    ];
  
    // Максимальное значение для графика
    const maxValue = 100; // Максимальное значение - 100%
    const timeRangeOptions = ['6 Months', '1 Year', 'All'];
    const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
    
    // Function to handle edit button click
    const handleEditClick = (section) => {
      setEditingSection(section);
      setIsEditModalOpen(true);
    };
    
    // Function to handle form input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value
      });
    };
    
    // Function to handle form submission
    const handleFormSubmit = (e) => {
      e.preventDefault();
      // Here you would typically send the data to your backend
      console.log('Form submitted:', formData);
      setIsEditModalOpen(false);
    };
    
    const handleTimeRangeClick = () => {
      setShowTimeRangeDropdown(!showTimeRangeDropdown);
    };
    
    const handleTimeRangeSelect = (range) => {
      setTimeRange(range);
      setShowTimeRangeDropdown(false);
    };
    
    // Обработчики для всплывающих подсказок
    const handleBarClick = (index) => {
      if (activeTooltip === index) {
        setActiveTooltip(null);
      } else {
        setActiveTooltip(index);
      }
    };
    
    const handleTabChange = (tab) => {
      setActiveTab(tab);
    };
    
    const handleSettings = () => {
      navigate('/settings');
    };
    
    const handleNotifications = () => {
      navigate('/notifications');
    };
    
    
    // Фильтрация данных в зависимости от выбранного временного диапазона
    const getFilteredMonthsData = () => {
      if (timeRange === '6 Months') {
        return monthsData.slice(-6);
      } else if (timeRange === '1 Year') {
        return monthsData;
      } else {
        return monthsData; // Для 'All' показываем все данные
      }
    };
    
    const filteredMonthsData = getFilteredMonthsData();
    
    // Расчет общей статистики посещаемости
    const calculateTotalAttendance = () => {
      const totalPresent = filteredMonthsData.reduce((sum, month) => sum + month.presentDays, 0);
      const totalAbsent = filteredMonthsData.reduce((sum, month) => sum + month.absentDays, 0);
      const totalDays = totalPresent + totalAbsent;
      const attendanceRate = Math.round((totalPresent / totalDays) * 100);
      
      return {
        totalPresent,
        totalAbsent,
        attendanceRate
      };
    };
    
    const totalAttendance = calculateTotalAttendance();
    
    const renderPortfolioTab = () => {
        return (
          <div className="profile-portfolio">
            <div className="user-data-section">
              <h3>Мои данные</h3>
              
              {/* Персональные данные */}
              <div className="user-data-card">
                <div className="user-data-header">
                  <div className="user-data-title">Персональные данные</div>
                  <button className="user-data-edit-button" onClick={() => handleEditClick('personal')}>
                    <svg className="user-data-edit-icon" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Редактировать
                  </button>
                </div>
                
                <div className="personal-data-list">
                  <div className="personal-data-item">
                    <div className="personal-data-label">Полное имя</div>
                    <div className="personal-data-value">{formData.fullName}</div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Дата рождения</div>
                    <div className="personal-data-value">{formData.birthDate}</div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Пол</div>
                    <div className="personal-data-value">{formData.gender}</div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Страна</div>
                    <div className="personal-data-value">{formData.country}</div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Город</div>
                    <div className="personal-data-value">{formData.city}</div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Язык</div>
                    <div className="personal-data-value">{formData.language}</div>
                  </div>
                </div>
              </div>
              
              {/* Контактные данные */}
              <div className="user-data-card">
                <div className="user-data-header">
                  <div className="user-data-title">Контактные данные</div>
                  <button className="user-data-edit-button" onClick={() => handleEditClick('contact')}>
                    <svg className="user-data-edit-icon" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                    </svg>
                    Редактировать
                  </button>
                </div>
                
                <div className="contact-data-list">
                  <div className="contact-data-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                    </div>
                    <div className="contact-info">
                      <div className="contact-type">Email</div>
                      <div className="contact-value verified">
                        {formData.email}
                        <span className="verified-badge">Подтвержден</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-data-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                      </svg>
                    </div>
                    <div className="contact-info">
                      <div className="contact-type">Телефон</div>
                      <div className="contact-value">{formData.phone}</div>
                    </div>
                  </div>
                  
                  <div className="contact-data-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    </div>
                    <div className="contact-info">
                      <div className="contact-type">Адрес</div>
                      <div className="contact-value">{formData.address}</div>
                    </div>
                  </div>
                  
                  <div className="contact-data-item">
                    <div className="contact-icon">
                      <svg viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="contact-info">
                      <div className="contact-type">Telegram</div>
                      <div className="contact-value">{formData.telegram}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    };
      
    const renderStatisticsTab = () => {
      return (
        <div className="profile-statistics">
          
          {/* Новый контейнер для кнопки Документооборот */}
          <div className="document-flow-container">
            <button className="document-flow-button" onClick={() => navigate('/documents')}>
              <div className="document-flow-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Документооборот</span>
            </button>
          </div>
          
          {/* Существующий блок Analytics */}
          <div className="analytics-card">
            <div className="analytics-header">
              <h3>Analytics</h3>
              <div className="time-range-selector" onClick={handleTimeRangeClick}>
                <span>{timeRange}</span>
                <span className="dropdown-icon">▼</span>
                
                {showTimeRangeDropdown && (
                  <div className="time-range-dropdown">
                    {timeRangeOptions.map(range => (
                      <div 
                        key={range} 
                        className={`dropdown-item ${timeRange === range ? 'active' : ''}`}
                        onClick={() => handleTimeRangeSelect(range)}
                      >
                        {range}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="chart-container" ref={chartRef}>
              {filteredMonthsData.map((item, index) => (
                <div key={index} className="chart-column">
                  <div 
                    className="chart-bar-container"
                    onClick={() => handleBarClick(index)}
                  >
                    <div 
                      className={`chart-bar ${item.isVacation ? 'vacation' : ''}`}
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                    >
                      <div className="chart-bar-handle"></div>
                    </div>
                  </div>
                  <div className={`chart-label ${item.isVacation ? 'vacation' : ''}`}>
                    {item.month}
                  </div>
                  
                  {activeTooltip === index && (
                    <div className="chart-tooltip">
                      <div className="tooltip-content">
                        <div className="tooltip-title">{item.month} {item.year}</div>
                        {!item.isVacation ? (
                          <>
                            <div className="tooltip-attendance">
                              <div className="tooltip-present">
                                <span>Присутствовал:</span>
                                <span>{item.presentDays} дней</span>
                              </div>
                              <div className="tooltip-absent">
                                <span>Отсутствовал:</span>
                                <span>{item.absentDays} дней</span>
                              </div>
                            </div>
                            <div className="tooltip-rate">
                              Посещаемость: {item.value}%
                            </div>
                          </>
                        ) : (
                          <div className="tooltip-vacation">
                            <span>Каникулы</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="attendance-summary">
              <div className="attendance-days">
                <span className="days-present">Присутствовал: {totalAttendance.totalPresent} дней</span>
                <span className="days-absent">Отсутствовал: {totalAttendance.totalAbsent} дней</span>
              </div>
              <div className="attendance-rate">
                <span className="rate-label">Посещаемость:</span>
                <span className="rate-value">{totalAttendance.attendanceRate}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    };
    
    const renderReviewsTab = () => {
      return (
        <div className="profile-reviews">
          <h3>Мои промокоды</h3>
          <div className="promo-list">
            <div className="promo-item">
              <div className="promo-code">WELCOME20</div>
              <div className="promo-info">
                <div className="promo-description">Скидка 20% на курс</div>
                <div className="promo-validity">Действует до: 31.05.2025</div>
              </div>
              <button className="promo-copy-button">Копировать</button>
            </div>
            <div className="promo-item">
              <div className="promo-code">FRIEND50</div>
              <div className="promo-info">
                <div className="promo-description">50% на второй курс</div>
                <div className="promo-validity">Действует до: 15.06.2025</div>
              </div>
              <button className="promo-copy-button">Копировать</button>
            </div>
          </div>
          
          <h3>Посещаемость</h3>
          <div className="attendance-info">
            <div className="attendance-stat">
              <div className="attendance-value">{totalAttendance.totalPresent}/{totalAttendance.totalPresent + totalAttendance.totalAbsent}</div>
              <div className="attendance-label">Дней в этом году</div>
            </div>
            <div className="attendance-stat">
              <div className="attendance-value">{totalAttendance.attendanceRate}%</div>
              <div className="attendance-label">Посещаемость</div>
            </div>
          </div>
        </div>
      );
    };
    
    const renderTabContent = () => {
      switch(activeTab) {
        case 'statistics':
          return renderStatisticsTab();
        case 'portfolio':
          return renderPortfolioTab();
        case 'reviews':
          return renderReviewsTab();
        default:
          return null;
      }
    };
    
    return (
      <div className="profile-screen">
        <div className="profile-header">
          <button className="header-icon-button" onClick={handleSettings}>
            <img src={settingsIcon} alt="Settings" />
          </button>
          <h1>Мой профиль</h1>
          <button className="header-icon-button" onClick={handleNotifications}>
            <img src={notificationIcon} alt="Notifications" />
            <div className="notification-badge">2</div>
          </button>
        </div>
        
        <div className="profile-user-info">
          <div className="avatar1-container">
            <img src={avatarImage1} alt="User avatar" className="avatar1-image" />
            <div className="avatar-border"></div>
          </div>
          <h2 className="user-name">Jane Soci</h2>
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => handleTabChange('statistics')}
          >
            Statistics
          </button>
          <button 
            className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => handleTabChange('portfolio')}
          >
            Мои данные
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => handleTabChange('reviews')}
          >
            Reviews
          </button>
        </div>
        
        <div className="profile-content">
          {renderTabContent()}
        </div>
        
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="edit-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
            <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
              <div className="edit-modal-header">
                <div className="edit-modal-title">
                  {editingSection === 'personal' ? 'Редактировать персональные данные' : 'Редактировать контактные данные'}
                </div>
                <button className="edit-modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
              </div>
              
              <form className="edit-form" onSubmit={handleFormSubmit}>
                {editingSection === 'personal' ? (
                  <>
                    <div className="form-group">
                      <label className="form-label">Полное имя</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Дата рождения</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="birthDate" 
                        value={formData.birthDate} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Пол</label>
                      <select 
                        className="form-select" 
                        name="gender" 
                        value={formData.gender} 
                        onChange={handleInputChange}
                      >
                        <option value="Мужской">Мужской</option>
                        <option value="Женский">Женский</option>
                        <option value="Другой">Другой</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Страна</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="country" 
                        value={formData.country} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Город</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Язык</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="language" 
                        value={formData.language} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input 
                        className="form-input" 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Телефон</label>
                      <input 
                        className="form-input" 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Адрес</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="address" 
                        value={formData.address} 
                        onChange={handleInputChange} 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Telegram</label>
                      <input 
                        className="form-input" 
                        type="text" 
                        name="telegram" 
                        value={formData.telegram} 
                        onChange={handleInputChange} 
                      />
                    </div>
                  </>
                )}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="form-button cancel" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Отмена
                  </button>
                  <button type="submit" className="form-button save">
                    Сохранить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
};

export default Profile;
