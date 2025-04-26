import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Импортируем хук для работы с переводами
import Navbar from '../common/Navbar';
import './Profile.css';
import avatarImage1 from '../../assets/images/avatar.webp';
import apiService from '../../services/apiService';
import { FaCog, FaBell } from 'react-icons/fa';

const Profile = () => {
  const { t } = useTranslation(['screens']); // Используем пространство имен 'screens' из kz.json
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics'); // Активная вкладка
  const [timeRange, setTimeRange] = useState('1 Year'); // Диапазон времени для аналитики
  const [activeTooltip, setActiveTooltip] = useState(null); // Активный тултип
  const chartRef = useRef(null); // Ссылка на график
  
  // Состояние для данных пользователя
  const [userInfo, setUserInfo] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояние для модального окна редактирования
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    gender: '',
    city: '',
    cityId: null,
    collegeId: null,
    college: '',
    email: '',
    phone: '',
    address: '',
    telegram: '',
    group_name: ''
  });

  // Состояние для списков городов и колледжей
  const [cities, setCities] = useState([]);
  const [colleges, setColleges] = useState([]);
  
  // Максимальное значение для графика (100%)
  const maxValue = 100;
  const timeRangeOptions = ['6 Months', '1 Year', 'All'];
  const [showTimeRangeDropdown, setShowTimeRangeDropdown] = useState(false);
  
  // Загружаем данные пользователя при монтировании компонента
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Получаем ID пользователя из localStorage
        const userId = localStorage.getItem('userId');
        if (!userId) {
          throw new Error(t('screens:profile.error', { error: 'User not authenticated' }));
        }
        
        // Запрашиваем города и колледжи
        const citiesResponse = await apiService.auth.getCities();
        setCities(citiesResponse || []);
        
        const collegesResponse = await apiService.auth.getColleges();
        setColleges(collegesResponse || []);
        
        // Запрашиваем профиль пользователя
        const userResponse = await apiService.auth.getUserProfile(userId);
        
        if (!userResponse) {
          throw new Error(t('screens:profile.error', { error: 'Failed to get user profile' }));
        }
        
        setUserInfo(userResponse);
        
        // Инициализируем форму данными пользователя
        setFormData({
          fullName: userResponse.full_name || '',
          email: userResponse.email || '',
          birthDate: userResponse.birth_date || '',
          gender: userResponse.gender || '',
          cityId: userResponse.city_id || null,
          city: userResponse.city_name || '',
          collegeId: userResponse.college_id || null,
          college: userResponse.college_name || '',
          phone: userResponse.phone_number || '',
          address: '',
          telegram: userResponse.telegram || '',
          group_name: userResponse.group_name || '',
          faculty_name: userResponse.faculty_name || ''
        });

        setAttendanceData([]);
        
      } catch (err) {
        console.error('Ошибка загрузки данных пользователя:', err);
        setError(t('screens:profile.error', { error: err.message }));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [t]); // Добавляем t в зависимости
  
  // Обработчик нажатия на кнопку редактирования
  const handleEditClick = (section) => {
    setEditingSection(section);
    setIsEditModalOpen(true);
  };
  
  // Обработчик изменения выбора города
  const handleCityChange = async (e) => {
    const cityId = e.target.value ? parseInt(e.target.value) : null;
    
    setFormData({
      ...formData,
      cityId: cityId,
      city: cityId ? cities.find(c => c.id === cityId)?.name || '' : '',
      collegeId: null,
      college: ''
    });
    
    if (cityId) {
      try {
        const collegesResponse = await apiService.auth.getColleges(cityId);
        setColleges(collegesResponse || []);
      } catch (error) {
        console.error('Ошибка загрузки колледжей для города:', error);
      }
    }
  };
  
  // Обработчик изменения выбора колледжа
  const handleCollegeChange = (e) => {
    const collegeId = e.target.value ? parseInt(e.target.value) : null;
    
    setFormData({
      ...formData,
      collegeId: collegeId,
      college: collegeId ? colleges.find(c => c.id === collegeId)?.name || '' : ''
    });
  };
  
  // Обработчик изменения полей формы
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Обработчик отправки формы
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error(t('screens:profile.error', { error: 'User not authenticated' }));
      }
      
      const updateData = {};
      
      if (editingSection === 'personal') {
        updateData.gender = formData.gender || null;
        updateData.birth_date = formData.birthDate || null;
        updateData.city_id = formData.cityId || null;
        updateData.college_id = formData.collegeId || null;
      } else if (editingSection === 'contact') {
        updateData.email = formData.email || null;
        updateData.phone_number = formData.phone || null;
        updateData.telegram = formData.telegram || null;
      }
      
      const updatedProfile = await apiService.auth.updateUserProfile(userId, updateData);
      
      setUserInfo(updatedProfile);
      
      setIsEditModalOpen(false);
      
    } catch (err) {
      console.error('Ошибка обновления данных пользователя:', err);
      alert(t('screens:profile.error', { error: err.message }));
    }
  };
  
  const handleTimeRangeClick = () => {
    setShowTimeRangeDropdown(!showTimeRangeDropdown);
  };
  
  const handleTimeRangeSelect = (range) => {
    setTimeRange(range);
    setShowTimeRangeDropdown(false);
  };
  
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
  
  // Вычисляем общую статистику посещаемости
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
          <h3>{t('screens:profile.myData')}</h3> {/* Используем перевод */}
          
          {/* Персональные данные */}
          <div className="user-data-card">
            <div className="user-data-header">
              <div className="user-data-title">{t('screens:profile.personalData')}</div>
              <button className="user-data-edit-button" onClick={() => handleEditClick('personal')}>
                <svg className="user-data-edit-icon" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                {t('screens:profile.edit')}
              </button>
            </div>
            
            <div className="personal-data-list">
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.fullName')}</div>
                <div className="personal-data-value">
                  {userInfo?.full_name || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.birthDate')}</div>
                <div className="personal-data-value">
                  {userInfo?.birth_date || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.gender')}</div>
                <div className="personal-data-value">
                  {userInfo?.gender || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.city')}</div>
                <div className="personal-data-value">
                  {userInfo?.city_name || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.college')}</div>
                <div className="personal-data-value">
                  {userInfo?.college_name || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.faculty')}</div>
                <div className="personal-data-value">
                  {formData.faculty_name || t('screens:profile.notSpecified')}
                </div>
              </div>
              <div className="personal-data-item">
                <div className="personal-data-label">{t('screens:profile.group')}</div>
                <div className="personal-data-value">
                  {formData.group_name || t('screens:profile.notSpecified')}
                </div>
              </div>
            </div>
          </div>
          
          {/* Контактные данные */}
          <div className="user-data-card">
            <div className="user-data-header">
              <div className="user-data-title">{t('screens:profile.contactData')}</div>
              <button className="user-data-edit-button" onClick={() => handleEditClick('contact')}>
                <svg className="user-data-edit-icon" viewBox="0 0 24 24">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                {t('screens:profile.edit')}
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
                  <div className="contact-type">{t('screens:profile.email')}</div>
                  <div className="contact-value verified">
                    {userInfo?.email || t('screens:profile.notSpecified')}
                    <span className="verified-badge">{t('screens:profile.verified')}</span>
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
                  <div className="contact-type">{t('screens:profile.phone')}</div>
                  <div className="contact-value">
                    {userInfo?.phone_number || t('screens:profile.notSpecified')}
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
                  <div className="contact-type">{t('screens:profile.address')}</div>
                  <div className="contact-value">
                    {formData.address || t('screens:profile.notSpecified')}
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
                  <div className="contact-type">{t('screens:profile.telegram')}</div>
                  <div className="contact-value">
                    {userInfo?.telegram || t('screens:profile.notSpecified')}
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
        {/* Кнопка документооборота */}
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
            <span>{t('screens:profile.documentFlow')}</span>
          </button>
        </div>
        
        {/* Карточка аналитики */}
        <div className="analytics-card">
          <div className="analytics-header">
            <h3>{t('screens:profile.attendanceAnalytics')}</h3>
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
                              <span>{t('profile.presentDays', { totalPresent: item.presentDays })}</span>
                              <span>{t('profile.daysThisYear')}</span>
                            </div>
                            <div className="tooltip-absent">
                              <span>{t('profile.absentDays', { totalAbsent: item.absentDays })}</span>
                              <span>{t('profile.daysThisYear')}</span>
                            </div>
                            <div className="tooltip-rate">
                              {t('profile.attendanceRate', { attendanceRate: item.value })}
                            </div>
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
              <p>{t('screens:profile.noAttendanceData')}</p>
            </div>
          )}
          
          <div className="attendance-summary">
            <div className="attendance-days">
              <span className="days-present">{t('screens:profile.presentDays', { totalPresent: totalAttendance.totalPresent })}</span>
              <span className="days-absent">{t('screens:profile.absentDays', { totalAbsent: totalAttendance.totalAbsent })}</span>
            </div>
            <div className="attendance-rate">
              <span className="rate-label">{t('screens:profile.attendanceLabel')}:</span>
              <span className="rate-value">{t('screens:profile.attendanceRate', { attendanceRate: totalAttendance.attendanceRate })}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderReviewsTab = () => {
    return (
      <div className="profile-reviews">
        <h3>{t('screens:profile.attendance')}</h3>
        <div className="attendance-info">
          <div className="attendance-stat">
            <div className="attendance-value">{totalAttendance.totalPresent}/{totalAttendance.totalPresent + totalAttendance.totalAbsent}</div>
            <div className="attendance-label">{t('screens:profile.daysThisYear')}</div>
          </div>
          <div className="attendance-stat">
            <div className="attendance-value">{t('screens:profile.attendanceRate', { attendanceRate: totalAttendance.attendanceRate })}</div>
            <div className="attendance-label">{t('screens:profile.attendanceLabel')}</div>
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
        <div className="loading-message">
          <div className="loader">
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__bar"></div>
            <div className="loader__ball"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="profile-screen">
        <div className="error-message">{error}</div>
        <button className="retry-button" onClick={() => window.location.reload()}>
          {t('screens:profile.retry')}
        </button>
      </div>
    );
  }
  
  return (
    <div className="profile-screen">
      {/* Заголовок профиля */}
      <div className="profile-header">
        <button className="header-icon-button" onClick={handleSettings}>
          <FaCog size={24} color="var(--text-color)" />
        </button>
        <h1>{t('screens:profile.myProfile')}</h1>
        <button className="header-icon-button" onClick={handleNotifications}>
          <FaBell size={24} color="var(--text-color)" />
          <div className="notification-badge"></div>
        </button>
      </div>

      {/* Информация о пользователе */}
      <div className="profile-user-info">
        <div className="avatar1-container">
          <img src={avatarImage1} alt="User avatar" className="avatar1-image" />
          <div className="avatar-border"></div>
        </div>
        <h2 className="user-name">{userInfo?.full_name || 'Пользователь'}</h2>
        {userInfo?.role_name && (
          <p className="user-role">
            {userInfo.role_name === 'admin' ? t('screens:profile.admin') :
             userInfo.role_name === 'teacher' ? t('screens:profile.teacher') :
             t('screens:profile.student')}
          </p>
        )}
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => handleTabChange('statistics')}
        >
          {t('screens:profile.statistics')}
        </button>
        <button
          className={`tab-button ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => handleTabChange('portfolio')}
        >
          {t('screens:profile.myData')}
        </button>
        <button
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => handleTabChange('reviews')}
        >
          {t('screens:profile.overview')}
        </button>
      </div>

      <div className="profile-content">
        {renderTabContent()}
      </div>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Модальное окно редактирования */}
      {isEditModalOpen && (
        <div className="edit-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div className="edit-modal-title">
                {editingSection === 'personal' ? t('screens:profile.editPersonalData') : t('screens:profile.editContactData')}
              </div>
              <button className="edit-modal-close" onClick={() => setIsEditModalOpen(false)}>×</button>
            </div>
            
            <form className="edit-form" onSubmit={handleFormSubmit}>
              {editingSection === 'personal' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.fullName')}</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      name="fullName" 
                      value={formData.fullName} 
                      onChange={handleInputChange} 
                      disabled={true}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.birthDate')}</label>
                    <input 
                      className="form-input" 
                      type="date" 
                      name="birthDate" 
                      value={formData.birthDate} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.gender')}</label>
                    <select 
                      className="form-select" 
                      name="gender" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                    >
                      <option value="">{t('screens:profile.selectOption')}</option>
                      <option value="Мужской">{t('screens:profile.male')}</option>
                      <option value="Женский">{t('screens:profile.female')}</option>
                      <option value="Другой">{t('screens:profile.other')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.city')}</label>
                    <select
                      className="form-select"
                      name="cityId"
                      value={formData.cityId || ''}
                      onChange={handleCityChange}
                    >
                      <option value="">{t('screens:profile.selectCity')}</option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.college')}</label>
                    <select
                      className="form-select"
                      name="collegeId"
                      value={formData.collegeId || ''}
                      onChange={handleCollegeChange}
                      disabled={!formData.cityId}
                    >
                      <option value="">{t('screens:profile.selectCollege')}</option>
                      {colleges.map(college => (
                        <option key={college.id} value={college.id}>{college.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.email')}</label>
                    <input 
                      className="form-input" 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      disabled={true}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.phone')}</label>
                    <input 
                      className="form-input" 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleInputChange} 
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.address')}</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('screens:profile.telegram')}</label>
                    <input 
                      className="form-input" 
                      type="text" 
                      name="telegram" 
                      value={formData.telegram} 
                      onChange={handleInputChange} 
                      placeholder="@username"
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
                  {t('screens:profile.cancel')}
                </button>
                <button type="submit" className="form-button save">
                  {t('screens:profile.save')}
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