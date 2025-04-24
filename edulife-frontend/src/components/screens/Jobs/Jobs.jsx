// src/components/screens/Jobs/Jobs.jsx
import React, { useState, useEffect } from 'react';
import { } from 'react-router-dom';
import './Jobs.css';
import Navbar from '../../common/Navbar';
import googleLogo from '../../../assets/images/companies/google-logo.png';
import microsoftLogo from '../../../assets/images/companies/microsoft-logo.png';
import skyLogo from '../../../assets/images/companies/sky-logo.png';
import lsnLogo from '../../../assets/images/companies/lsn-logo.png';
import heartIcon from '../../../assets/images/heart-icon.png';
import heartFilledIcon from '../../../assets/images/heart-filled-icon.png';
import shareIcon from '../../../assets/images/share-icon.png';
import searchIcon from '../../../assets/images/search-icon.png';
import closeIcon from '../../../assets/images/close-icon.png';


const Jobs = () => {
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  
  const jobListings = [
    {
      id: 1,
      title: 'UX Designer',
      company: 'Google',
      logo: googleLogo,
      location: 'California, USA',
      description: 'We are looking for a talented UX Designer experienced in crafting intuitive user interfaces. You will be responsible for the design and implementation of new features.',
      type: 'Full-time',
      level: 'Middle',
      backgroundColor: '#e8d9ff'
    },
    {
      id: 2,
      title: 'QA Engineer',
      company: 'Microsoft',
      logo: microsoftLogo,
      location: 'New York, USA',
      description: 'Our Company looking for a professional QA Engineer. Hybrid work format and pleasant office.',
      type: 'Hybrid',
      level: 'Middle+',
      backgroundColor: '#ffe9a8'
    },
    {
      id: 3,
      title: 'Junior UI Designer',
      company: 'Sky',
      logo: skyLogo,
      location: 'London, UK',
      description: 'We\'re here to drive digital communication through technology innovation. The Group Digital Engagement.',
      type: 'Remotely',
      level: 'Junior',
      backgroundColor: '#e8d9ff'
    },
    {
      id: 4,
      title: 'Content Designer',
      company: 'Lsn Hayni',
      logo: lsnLogo,
      location: 'Warsaw, Poland',
      description: 'We are looking for a talented UX/UI designer who will work with our team to create amazing digital experiences.',
      type: 'Full-time',
      level: 'Middle',
      backgroundColor: '#ffcbb8'
    }
  ];

  // Эффект для выполнения поиска при изменении запроса
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = jobListings.filter(job => 
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.description.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.type.toLowerCase().includes(query) ||
      job.level.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery]);
  
  const toggleFavorite = (jobId) => {
    setFavorites(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };
  
  const toggleFavoritesView = () => {
    setShowFavorites(prev => !prev);
  };

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchQuery('');
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };
  
  const shareJob = (job) => {
    // Логика для поделиться вакансией
    if (navigator.share) {
      navigator.share({
        title: `${job.title} at ${job.company}`,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href,
      })
      .catch(error => console.log('Error sharing:', error));
    } else {
      // Fallback для браузеров без поддержки Web Share API
      alert(`Поделиться: ${job.title} в ${job.company}`);
    }
  };

  // Определяем, какие вакансии показывать
  let displayedJobs = jobListings;
  
  if (searchQuery.trim() !== '') {
    // Если есть поисковый запрос, показываем результаты поиска
    displayedJobs = searchResults;
  } else if (showFavorites) {
    // Если нет поискового запроса, но включен режим избранного
    displayedJobs = jobListings.filter(job => favorites[job.id]);
  }

  return (
    <div className="jobs-screen">
      {showSearch ? (
        <div className="search-header">
          <button className="back-button1" onClick={toggleSearch}>
            &lt;
          </button>
          <div className="search-input-container">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск вакансий..."
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
            />
            {searchQuery && (
              <button className="clear-search-button" onClick={clearSearch}>
                <img src={closeIcon} alt="Clear" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="jobs-header">
          <button 
            className={`favorite-button ${showFavorites ? 'active' : ''}`}
            onClick={toggleFavoritesView}
          >
            <img src={showFavorites ? heartFilledIcon : heartIcon} alt="Favorites" />
          </button>
          <h1 className="header-title">Вакансий</h1>
          <button className="search-button" onClick={toggleSearch}>
            <img src={searchIcon} alt="Search" />
          </button>
        </div>
      )}

      {!showSearch && (
        <div className="jobs-tabs">
          <h2 className="tab-title">Стажировки</h2>
        </div>
      )}

      <div className="jobs-content">
        {searchQuery && (
          <div className="search-results-info">
            {searchResults.length > 0 ? (
              <p>Найдено результатов: {searchResults.length}</p>
            ) : (
              <p>По запросу "{searchQuery}" ничего не найдено</p>
            )}
          </div>
        )}

        {displayedJobs.length > 0 ? (
          displayedJobs.map(job => (
            <div 
              key={job.id} 
              className="job-card"
              style={{ backgroundColor: job.backgroundColor }}
            >
              <div className="job-header">
                <div className="company-logo">
                  <img src={job.logo} alt={job.company} />
                </div>
                <div className="job-title-container">
                  <h2 className="job-title">{job.title}</h2>
                  <p className="company-name">{job.company}</p>
                </div>
                <div className="job-location">{job.location}</div>
              </div>
              
              <div className="job-description">
                {job.description}
              </div>
              
              <div className="job-footer">
                <div className="job-tags">
                  <span className="job-type-tag">{job.type}</span>
                  <span className="job-level-tag">{job.level}</span>
                </div>
                
                <div className="job-actions">
                  <button 
                    className="favorite-job-button"
                    onClick={() => toggleFavorite(job.id)}
                  >
                    <img 
                      src={favorites[job.id] ? heartFilledIcon : heartIcon} 
                      alt="Favorite" 
                    />
                  </button>
                  <button 
                    className="share-job-button"
                    onClick={() => shareJob(job)}
                  >
                    <img src={shareIcon} alt="Share" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-favorites">
            {searchQuery ? (
              <>
                <p>По запросу "{searchQuery}" ничего не найдено</p>
                <button 
                  className="show-all-button"
                  onClick={clearSearch}
                >
                  Очистить поиск
                </button>
              </>
            ) : (
              <>
                <p>У вас пока нет избранных вакансий</p>
                <button 
                  className="show-all-button"
                  onClick={() => setShowFavorites(false)}
                >
                  Показать все вакансии
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Jobs;
