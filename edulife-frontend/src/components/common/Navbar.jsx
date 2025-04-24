// В компоненте Navbar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import homeIcon from '../../assets/images/home-icon.png';
import scheduleIcon from '../../assets/images/schedule-icon.png';
import qrIcon from '../../assets/images/qr-icon.png';
import jobsIcon from '../../assets/images/documentflow.png';
import mapIcon from '../../assets/images/map-icon.png'; // Иконка для карты
import profileIcon from '../../assets/images/profile-icon.png';

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  
  const handleTabChange = (index) => {
    setActiveTab(index);
    
    // Навигация в зависимости от выбранной вкладки
    switch(index) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/schedule');
        break;
      case 2:
        navigate('/qr-code');
        break;
      case 3:
        navigate('/jobs');
        break;
      case 4:
        // Переход на другой фронтенд с картой
        window.location.href = 'http://localhost:3001/aitumap';
        break;
      case 5:
        navigate('/profile');
        break;
      default:
        navigate('/dashboard');
    }
  };
  
  return (
    <div className="navbar">
      <div 
        className={`navbar-item ${activeTab === 0 ? 'active' : ''}`} 
        onClick={() => handleTabChange(0)}
      >
        <img src={homeIcon} alt="Home" />
      </div>
      <div 
        className={`navbar-item ${activeTab === 1 ? 'active' : ''}`} 
        onClick={() => handleTabChange(1)}
      >
        <img src={scheduleIcon} alt="Schedule" />
      </div>
      <div 
        className={`navbar-item ${activeTab === 2 ? 'active' : ''}`} 
        onClick={() => handleTabChange(2)}
      >
        <img src={qrIcon} alt="QR Code" />
      </div>
      <div 
        className={`navbar-item ${activeTab === 3 ? 'active' : ''}`} 
        onClick={() => handleTabChange(3)}
      >
        <img src={jobsIcon} alt="Jobs" />
      </div>
      <div 
        className={`navbar-item ${activeTab === 4 ? 'active' : ''}`} 
        onClick={() => handleTabChange(4)}
      >
        <img src={mapIcon} alt="Map" />
      </div>
      <div 
        className={`navbar-item ${activeTab === 5 ? 'active' : ''}`} 
        onClick={() => handleTabChange(5)}
      >
        <img src={profileIcon} alt="Profile" />
      </div>
    </div>
  );
};

export default Navbar;
