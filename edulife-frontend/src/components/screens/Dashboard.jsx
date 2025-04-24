// src/components/screens/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Navbar from '../common/Navbar';
import CourseCard from '../common/CourseCard';
import apiService from '../../services/apiService';

// Import images
import avatarImage from '../../assets/images/avatar.png';
import notificationIcon from '../../assets/images/notification.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [scheduleData, setScheduleData] = useState([]);
  const [coursesData, setCoursesData] = useState([]);
  
  // Get user ID and role from local storage
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  // Fetch user data and schedule on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setError('User not authenticated');
        setLoading(false);
        navigate('/logreg');
        return;
      }
      
      try {
        setLoading(true);
        
        // Fetch user information
        const userResponse = await apiService.auth.getUserById(userId);
        setUserData(userResponse);
        
        console.log("User data fetched:", userResponse);
        
        // Fetch schedule data directly from raspis service
        const scheduleResponse = await apiService.schedule.getScheduleForUser(userId, userRole);
        console.log("Schedule response:", scheduleResponse);
        
        if (scheduleResponse && scheduleResponse.schedule && Array.isArray(scheduleResponse.schedule)) {
          // Group by subject to create course cards from schedule data
          const subjectMap = new Map();
          
          scheduleResponse.schedule.forEach(item => {
            const subjectId = item.subject_id || 0;
            if (!subjectMap.has(subjectId)) {
              // Get a consistent color based on subject ID
              const color = getRandomColor(subjectId);
              
              subjectMap.set(subjectId, {
                id: subjectId,
                title: item.subject_name || 'Предмет',
                backgroundColor: color,
                hours: `${Math.floor(Math.random() * 30) + 10}h`, // Example hours
                people: `${Math.floor(Math.random() * 50) + 50}`,
                image: null
              });
            }
          });
          
          // Convert map to array
          const courses = Array.from(subjectMap.values());
          console.log("Generated courses:", courses);
          
          setCoursesData(courses);
          setScheduleData(scheduleResponse.schedule);
        } else {
          console.log("No schedule data or empty schedule");
          setCoursesData([]);
          setScheduleData([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId, userRole, navigate]);
  
  // Helper function to get consistent color based on subject ID
  const getRandomColor = (subjectId) => {
    const colors = [
      '#D2FF1F', // Bright green
      '#FF8A65', // Orange/coral
      '#E1BEE7', // Light purple
      '#FFD54F', // Yellow
      '#9C7AE2', // Purple
      '#5AC8FA', // Light blue
    ];
    // Use the subject ID to choose a color deterministically
    const id = parseInt(subjectId) || 0;
    return colors[id % colors.length];
  };
  
  const handleNotifications = () => {
    // Navigation to notifications page
    navigate('/notifications');
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="dashboard-screen">
        <div className="loading-indicator">Loading...</div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="dashboard-screen">
        <div className="error-message">{error}</div>
        <button onClick={() => navigate('/logreg')}>Back to Login</button>
      </div>
    );
  }
  
  return (
    <div className="dashboard-screen">
      {/* Header with avatar and greeting */}
      <div className="dashboard-header">
        <div className="user-info">
          <div className="avatar-container">
            <img src={avatarImage} alt="User avatar" className="avatar-image" />
            <div className="online-indicator"></div>
          </div>
          <p className="greeting">Hello, {userData?.full_name?.split(' ')[0] || 'User'}</p>
        </div>
        <div className="notification-icon" onClick={handleNotifications}>
          <img src={notificationIcon} alt="Notifications" />
          <div className="notification-badge">2</div>
        </div>
      </div>
      
      {/* Schedule section */}
      {coursesData.length > 0 ? (
        <div className="section">
          <h2 className="section-title">Расписание</h2>
          <div className="course-cards-container">
            {coursesData.slice(0, 2).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      ) : (
        <div className="section">
          <h2 className="section-title">Расписание</h2>
          <p className="no-data-message">Расписание недоступно</p>
        </div>
      )}
      
      {/* Internship section - show only if there are enough courses */}
      {coursesData.length > 2 && (
        <div className="section">
          <h2 className="section-title">Стажировка</h2>
          <div className="course-cards-container">
            {coursesData.slice(2, 4).map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}
      
      {/* Popular section - can be shown for all users */}
      <div className="section">
        <h2 className="section-title">Популярно</h2>
        <div className="course-cards-container">
          {coursesData.length > 0 ? (
            coursesData.slice(0, 2).map((course, idx) => (
              <CourseCard 
                key={`popular-${course.id}-${idx}`} 
                course={{
                  ...course,
                  backgroundColor: getRandomColor(course.id + 10) // Different color
                }} 
              />
            ))
          ) : (
            <p className="no-data-message">Курсы не найдены</p>
          )}
        </div>
      </div>
      
      {/* Bottom navigation bar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default Dashboard;