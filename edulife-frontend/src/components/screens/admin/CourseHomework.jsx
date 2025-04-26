import React from 'react';
import { useTranslation } from 'react-i18next';

const CourseHomework = ({ homework = [] }) => {
  const { t } = useTranslation(['admin']);
  
  return (
    <div className="homework-section">
      <h4 className="subsection-title">{t('courseHomework.title')}</h4>
      
      {homework && homework.length > 0 ? (
        <div className="homework-list">
          {homework.map((question, index) => (
            <div key={index} className="homework-item">
              <div className="question-text">
                <span className="question-number">{index + 1}.</span> {question.question}
              </div>
              <div className="options-list">
                {question.options.map((option, optIndex) => (
                  <div key={optIndex} className={`option-item ${optIndex === question.correctAnswer ? 'correct' : ''}`}>
                    {option}
                    {optIndex === question.correctAnswer && (
                      <svg viewBox="0 0 24 24" width="16" height="16" className="correct-icon">
                        <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-homework">
          {t('courseHomework.noHomework')}
        </div>
      )}
    </div>
  );
};

export default CourseHomework;