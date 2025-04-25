// src/components/screens/CourseDetail.jsx
import React, { useState, useRef} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import './CourseDetail.css';
import { MdArrowBack } from 'react-icons/md';

const CourseDetail = ({ courses }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [showHomework, setShowHomework] = useState(false);
  
  // Find the course with the matching ID
  const course = courses.find(c => c.id === id) || {
    id: 'default',
    title: 'Interface Design',
    description: "Explore strategies, tools, and platforms to excel in today's digital landscape. From SEO and social media to email campaigns and analytics, gain practical skills for success. Perfect for beginners and experienced marketers alike. Enroll now and unleash your digital marketing potential. Watch video and doing homework!",
    image: null,
    hours: '48:03',
    people: '245',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    videoType: 'youtube',
    homework: [
      {
        question: "What is the main purpose of interface design?",
        options: [
          "To make websites look pretty",
          "To create user-friendly and intuitive experiences",
          "To use as many colors as possible",
          "To show off technical skills"
        ],
        correctAnswer: 1
      },
      {
        question: "Which principle is NOT typically associated with good interface design?",
        options: [
          "Consistency",
          "Complexity",
          "Clarity",
          "Feedback"
        ],
        correctAnswer: 1
      },
      {
        question: "What does UI stand for?",
        options: [
          "User Interaction",
          "Universal Interface",
          "User Interface",
          "Unified Integration"
        ],
        correctAnswer: 2
      }
    ]
  };
  
  const handleBack = () => {
    navigate(-1); // Go back to the previous page
  };
  
  const handlePlayVideo = () => {
    if (course.videoType === 'direct' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVideoProgress = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setVideoProgress(progress);
    }
  };
  
  const handleProgressBarClick = (e) => {
    if (videoRef.current && course.videoType === 'direct') {
      const progressBar = e.currentTarget;
      const rect = progressBar.getBoundingClientRect();
      const position = (e.clientX - rect.left) / rect.width;
      
      videoRef.current.currentTime = position * videoRef.current.duration;
      setVideoProgress(position * 100);
    }
  };
  
  const toggleHomework = () => {
    setShowHomework(!showHomework);
  };
  
  const renderVideoPlayer = () => {
    if (course.videoType === 'youtube') {
      // For YouTube videos
      return (
        <div className="youtube-container">
          <iframe 
            src={`${course.videoUrl}?autoplay=0&rel=0`}
            title={course.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    } else {
      // For direct video files
      return (
        <>
          <div className="video-thumbnail" onClick={handlePlayVideo}>
            {!isPlaying && (
              <>
                {course.image ? (
                  <img src={course.image} alt={course.title} />
                ) : (
                  <div className="placeholder-image"></div>
                )}
                <div className="play-button">
                  <svg viewBox="0 0 24 24" width="48" height="48">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" fill="white" />
                  </svg>
                </div>
                <div className="video-duration">{course.hours}</div>
              </>
            )}
            <video 
              ref={videoRef}
              className={isPlaying ? "video-player visible" : "video-player"}
              src={course.videoUrl}
              poster={course.image}
              onTimeUpdate={handleVideoProgress}
              onEnded={() => setIsPlaying(false)}
              onClick={handlePlayVideo}
              controls={isPlaying}
            ></video>
          </div>
          <div 
            className="video-progress-bar" 
            onClick={handleProgressBarClick}
          >
            <div className="progress-fill" style={{ width: `${videoProgress}%` }}></div>
          </div>
        </>
      );
    }
  };
  
  const renderHomework = () => {
    if (!course.homework || course.homework.length === 0) {
      return (
        <div className="homework-empty">
          <p>Домашняя работа пока недоступна.</p>
        </div>
      );
    }
    
    return (
      <div className="homework-quiz">
        <h3>Тест по материалу</h3>
        {course.homework.map((question, index) => (
          <div key={index} className="quiz-question">
            <div className="question-text2">{index + 1}. {question.question}</div>
            <div className="question-options">
              {question.options.map((option, optIndex) => (
                <label key={optIndex} className="option-label">
                  <input 
                    type="radio" 
                    name={`question-${index}`} 
                    value={optIndex} 
                    className="option-input" 
                  />
                  <span className="option-text">{option}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <button className="submit-homework">Отправить ответы</button>
      </div>
    );
  };
  
  return (
    <div className="course-detail-screen">
      <div className="course-detail-header">
      <button className="back-button2" onClick={handleBack}>
      <MdArrowBack size={24}  /> {/* Используем React Icon */}
    </button>
        <h1 className="header-title">О предмете</h1>
        <div className="header-spacer"></div>
      </div>
      
      <div className="course-detail-content">
        <h2 className="course-title">{course.title}</h2>
        
        {!showHomework ? (
          <>
            <div className="course-video-container">
              {renderVideoPlayer()}
            </div>
            
            <div className="course-description">
              {course.description}
            </div>
            
            <div className="course-actions">
              <button className="homework-button" onClick={toggleHomework}>
                Домашняя работа
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" fill="white" />
                </svg>
              </button>
              
              <button className="download-button">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" fill="white" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="homework-container">
            <button className="back-to-video" onClick={toggleHomework}>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" fill="white" />
              </svg>
              Вернуться к видео
            </button>
            {renderHomework()}
          </div>
        )}
      </div>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default CourseDetail;
