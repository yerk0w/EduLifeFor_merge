// src/components/common/CourseCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  
  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };
  
  const handleCardClick = () => {
    // Navigate to the course detail page with the course ID
    navigate(`/course/${course.id}`);
  };
  
  // Разделяем заголовок на две части, если это возможно
  const formatTitle = (title) => {
    if (title === 'UX/UI designer') {
      return (
        <>
          <span className="title-top">UX/UI</span>
          <span className="title-bottom">designer</span>
        </>
      );
    } else if (title.includes(' ')) {
      const parts = title.split(' ');
      const firstPart = parts.slice(0, Math.ceil(parts.length / 2)).join(' ');
      const secondPart = parts.slice(Math.ceil(parts.length / 2)).join(' ');
      return (
        <>
          <span className="title-top">{firstPart}</span>
          <span className="title-bottom">{secondPart}</span>
        </>
      );
    }
    return <span className="title-top">{title}</span>;
  };
  
  return (
    <div 
      className="course-card" 
      style={{ backgroundColor: course.backgroundColor }}
      onClick={handleCardClick}
    >
      <div className="course-background">
        {course.image && <img src={course.image} alt="" className="background-image" />}
      </div>
      
      <div className="course-card-content">
        <h3 className="course-title">
          {formatTitle(course.title)}
        </h3>
      </div>
      
      <div className="course-card-footer">
        <div className="course-stat-item hours">
          <span>{course.hours}</span>
        </div>
        <div className="course-stat-item people">
          <span>{course.people}</span>
        </div>
        <div className={`favorite-button ${isFavorite ? 'active' : ''}`} onClick={toggleFavorite}>
          <svg viewBox="0 0 24 24" className="heart-icon">
            <path d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
