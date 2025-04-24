import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './Profile.css';
import avatarImage1 from '../../assets/images/avatar.webp';
import notificationIcon from '../../assets/images/notification.webp';
import settingsIcon from '../../assets/images/settings.webp';
import apiService from '../../services/apiService';

const Profile = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('statistics');
    const [timeRange, setTimeRange] = useState('1 Year');
    const [activeTooltip, setActiveTooltip] = useState(null);
    const chartRef = useRef(null);
    
    // Стейт для пользовательских данных
    const [userInfo, setUserInfo] = useState(null);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // State for edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState('');
    const [formData, setFormData] = useState({
      fullName: '',
      birthDate: '',
      gender: '',
      city: '',
      group: '',
      college: '',
      email: '',
      phone: '',
      address: '',
      telegram: ''
    });
  
    // Максимальное значение для графика
    const maxValue = 100; // Максимальное значение - 100%
    const timeRangeOptions = ['6 Months', '1 Year', 'All'];
    const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
    
    // Получение данных пользователя при загрузке компонента
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          setLoading(true);
          
          // Получаем ID пользователя из localStorage
          const userId = localStorage.getItem('userId');
          if (!userId) {
            throw new Error('Пользователь не авторизован');
          }
          
          // Запрашиваем данные пользователя
          const userResponse = await apiService.auth.getUserById(userId);
          
          if (!userResponse) {
            throw new Error('Не удалось получить данные пользователя');
          }
          
          setUserInfo(userResponse);
          
          // Инициализируем форму данными пользователя
          setFormData({
            fullName: userResponse.full_name || '',
            email: userResponse.email || '',
            // Дополнительные поля могут быть получены из других источников или API
            birthDate: '',
            gender: '',
            city: '',
            college: '',
            group: '',
            faculty: '',
            phone: '',
            address: '',
            telegram: ''
          });

          setAttendanceData([]);
          
        } catch (err) {
          console.error('Error fetching user data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }, []);
    
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
    const handleFormSubmit = async (e) => {
      e.preventDefault();
      
      try {
        // Получаем ID пользователя из localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error('Пользователь не авторизован');
        }
        
        // Подготавливаем данные для обновления
        const updateData = {};
        
        if (editingSection === 'personal') {
          // Для персональных данных
          updateData.full_name = formData.fullName;
          // Другие поля могут требовать отдельного API или эндпоинта
        } else if (editingSection === 'contact') {
          // Для контактных данных
          updateData.email = formData.email;
          // Другие поля также могут требовать отдельного API
        }
        
        // Отправляем запрос на обновление данных
        // Имитация обновления через консоль
        console.log('Updating user data:', updateData);
        
        // После успешного обновления, обновляем локальное состояние
        setUserInfo(prev => ({
          ...prev,
          ...updateData,
          full_name: updateData.full_name || prev.full_name,
          email: updateData.email || prev.email
        }));
        
        // Закрываем модальное окно
        setIsEditModalOpen(false);
        
      } catch (err) {
        console.error('Error updating user data:', err);
        alert('Ошибка при обновлении данных: ' + err.message);
      }
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
    
    // Расчет общей статистики посещаемости
    const calculateTotalAttendance = () => {
      if (!attendanceData || attendanceData.length === 0) {
        return {
          totalPresent: 0,
          totalAbsent: 0,
          attendanceRate: 0
        };
      }
      
      const totalPresent = attendanceData.reduce((sum, month) => sum + (month.presentDays || 0), 0);
      const totalAbsent = attendanceData.reduce((sum, month) => sum + (month.absentDays || 0), 0);
      const totalDays = totalPresent + totalAbsent;
      const attendanceRate = totalDays > 0 ? Math.round((totalPresent / totalDays) * 100) : 0;
      
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
                    <div className="personal-data-value">
                      {userInfo?.full_name || formData.fullName || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Дата рождения</div>
                    <div className="personal-data-value">
                      {formData.birthDate || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Пол</div>
                    <div className="personal-data-value">
                      {formData.gender || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Город</div>
                    <div className="personal-data-value">
                      {formData.city || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Колледж</div>
                    <div className="personal-data-value">
                      {formData.college || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Факультет</div>
                    <div className="personal-data-value">
                      {formData.faculty || 'Не указано'}
                    </div>
                  </div>
                  <div className="personal-data-item">
                    <div className="personal-data-label">Группа</div>
                    <div className="personal-data-value">
                      {formData.group || 'Не указано'}
                    </div>
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
                        {userInfo?.email || formData.email || 'Не указано'}
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
                      <div className="contact-value">
                        {formData.phone || 'Не указано'}
                      </div>
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
                      <div className="contact-value">
                        {formData.address || 'Не указано'}
                      </div>
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
                      <div className="contact-value">
                        {formData.telegram || 'Не указано'}
                      </div>
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
          
          {/* Кнопка Документооборот */}
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
          
          {/* Блок Analytics */}
          <div className="analytics-card">
            <div className="analytics-header">
              <h3>Аналитика посещаемости</h3>
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
            
            {attendanceData.length > 0 ? (
              <div className="chart-container" ref={chartRef}>
                {attendanceData.map((item, index) => (
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
            ) : (
              <div className="no-data-message">
                <p>Данные о посещаемости отсутствуют</p>
              </div>
            )}
            
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
    
    if (loading) {
      return (
        <div className="profile-screen">
          <div className="loading-message">Загрузка данных...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="profile-screen">
          <div className="error-message">Ошибка: {error}</div>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Повторить попытку
          </button>
        </div>
      );
    }
    
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
          <h2 className="user-name">{userInfo?.full_name || 'Пользователь'}</h2>
          {userInfo?.role_name && (
            <p className="user-role">{userInfo.role_name === 'admin' ? 'Администратор' : 
                                      userInfo.role_name === 'teacher' ? 'Преподаватель' : 
                                      'Студент'}</p>
          )}
        </div>
        
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
            onClick={() => handleTabChange('statistics')}
          >
            Статистика
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
            Обзор
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
                        <option value="">-- Выберите --</option>
                        <option value="Мужской">Мужской</option>
                        <option value="Женский">Женский</option>
                        <option value="Другой">Другой</option>
                      </select>
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
                      <label className="form-label">Колледж</label>
                      <input 
                        className="form-input"
                        type="text"
                        name="college"
                        value={formData.college}
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