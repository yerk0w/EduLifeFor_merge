// src/components/common/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

// Импортируем иконки из библиотеки React Icons
import { GrHomeRounded } from "react-icons/gr";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { LuScanQrCode } from "react-icons/lu";
import { MdOutlineWorkOutline } from "react-icons/md";
import { PiMapPinAreaBold } from "react-icons/pi";
import { LuUser } from "react-icons/lu";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Локальное состояние для мгновенного отклика
  const [localActiveTab, setLocalActiveTab] = useState(activeTab);
  
  // Синхронизация с внешним состоянием
  useEffect(() => {
    setLocalActiveTab(activeTab);
  }, [activeTab]);
  
  // Синхронизация с текущим маршрутом
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/dashboard')) {
      setLocalActiveTab(0);
      setActiveTab(0);
    } else if (path.includes('/schedule')) {
      setLocalActiveTab(1);
      setActiveTab(1);
    } else if (path.includes('/qr-code')) {
      setLocalActiveTab(2);
      setActiveTab(2);
    } else if (path.includes('/jobs')) {
      setLocalActiveTab(3);
      setActiveTab(3);
    } else if (path.includes('/profile')) {
      setLocalActiveTab(5);
      setActiveTab(5);
    }
  }, [location, setActiveTab]);
  
  const handleTabChange = (index) => {
    // Сначала обновляем локальное состояние для мгновенного отклика
    setLocalActiveTab(index);
    // Затем обновляем внешнее состояние
    setActiveTab(index);
    
    // Затем выполняем навигацию
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
        window.location.href = 'http://localhost:3000/aitumap';
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
        className={`navbar-item ${localActiveTab === 0 ? 'active' : ''}`} 
        onClick={() => handleTabChange(0)}
      >
        <GrHomeRounded className="navbar-icon" />
      </div>
      <div 
        className={`navbar-item ${localActiveTab === 1 ? 'active' : ''}`} 
        onClick={() => handleTabChange(1)}
      >
        <RiCalendarScheduleLine className="navbar-icon" />
      </div>
      <div 
        className={`navbar-item ${localActiveTab === 2 ? 'active' : ''}`} 
        onClick={() => handleTabChange(2)}
      >
        <LuScanQrCode className="navbar-icon" />
      </div>
      <div 
        className={`navbar-item ${localActiveTab === 3 ? 'active' : ''}`} 
        onClick={() => handleTabChange(3)}
      >
        <MdOutlineWorkOutline className="navbar-icon" />
      </div>
      <div 
        className={`navbar-item ${localActiveTab === 4 ? 'active' : ''}`} 
        onClick={() => handleTabChange(4)}
      >
        <PiMapPinAreaBold className="navbar-icon" />
      </div>
      <div 
        className={`navbar-item ${localActiveTab === 5 ? 'active' : ''}`} 
        onClick={() => handleTabChange(5)}
      >
        <LuUser className="navbar-icon" />
      </div>
    </div>
  );
};

export default Navbar;
