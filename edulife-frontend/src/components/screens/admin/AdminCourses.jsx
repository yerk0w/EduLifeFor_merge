import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CoursesList from './CoursesList';
import CourseDetails from './CourseDetails';
import CourseForm from './CourseForm';

const AdminCourses = ({ courses = [] }) => {
  const { t } = useTranslation(['admin']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setIsEditing(false);
  };

  const handleEditCourse = () => {
    setIsEditing(true);
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1,
      title: t('adminCourses.newCourse'),
      description: t('adminCourses.newCourseDescription'),
      backgroundColor: "#4A6CF7",
      hours: "0 часов",
      people: 0,
      videoType: "youtube",
      videoUrl: "",
      image: "",
      homework: []
    };
    setSelectedCourse(newCourse);
    setIsEditing(true);
  };

  return (
    <div className="admin-courses">
      <CoursesList 
        courses={filteredCourses}
        selectedCourse={selectedCourse}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleCourseSelect={handleCourseSelect}
        handleAddCourse={handleAddCourse}
      />
      
      <div className="course-details-container">
        {selectedCourse ? (
          isEditing ? (
            <CourseForm 
              selectedCourse={selectedCourse}
              courses={courses}
              setIsEditing={setIsEditing}
              setSelectedCourse={setSelectedCourse}
            />
          ) : (
            <CourseDetails 
              selectedCourse={selectedCourse}
              handleEditCourse={handleEditCourse}
              setSelectedCourse={setSelectedCourse}
              courses={courses}
            />
          )
        ) : (
          <div className="no-course-selected">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
            </svg>
            <p>{t('adminCourses.noCourseSelected')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;