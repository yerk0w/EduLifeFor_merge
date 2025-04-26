import React, { useState, useEffect } from 'react';
import apiService from '../../../services/apiService';
import AttendanceStats from './AttendanceStats';

const QRCodeTab = ({ selectedSubject, userId }) => {
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [stats, setStats] = useState({
    attendanceToday: 0,
    totalStudents: 0,
    attendanceRate: 0
  });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [canGenerateQR, setCanGenerateQR] = useState(false);
  
  // Загрузка предметов преподавателя при монтировании
  useEffect(() => {
    const fetchTeacherSubjects = async () => {
      try {
        console.log(`Получение предметов для преподавателя ID: ${userId}`);
        
        // Используем прямой эндпоинт для получения расписания преподавателя
        const scheduleResponse = await apiService.schedule.getTeacherSchedule(userId);
        
        if (scheduleResponse && Array.isArray(scheduleResponse)) {
          // Извлекаем информацию о предметах из расписания
          const subjects = scheduleResponse.map(item => ({
            subject_id: item.subject_id,
            teacher_id: item.teacher_id || parseInt(userId) // Используем ID преподавателя из данных или переданный ID
          }));
          
          console.log('Предметы преподавателя:', subjects);
          setTeacherSubjects(subjects);
        } else {
          console.warn('Не удалось получить расписание преподавателя');
        }
      } catch (error) {
        console.error('Ошибка при получении предметов преподавателя:', error);
      }
    };
    
    fetchTeacherSubjects();
  }, [userId]);
  
  // Проверка, может ли преподаватель создать QR для выбранного предмета
  useEffect(() => {
    if (selectedSubject && teacherSubjects.length > 0) {
      console.log('Проверка прав на генерацию QR для предмета:', selectedSubject);
      console.log('Доступные предметы преподавателя:', teacherSubjects);
      
      // Проверяем, есть ли выбранный предмет в списке предметов преподавателя
      const canGenerate = teacherSubjects.some(subject => 
        subject.subject_id === selectedSubject.subject_id
      );
      
      console.log(`Результат проверки прав: ${canGenerate ? 'Разрешено' : 'Запрещено'}`);
      setCanGenerateQR(canGenerate);
      
      if (!canGenerate) {
        setError('Вы можете создавать QR-коды только для своих занятий');
      } else {
        setError(null);
      }
    }
  }, [selectedSubject, teacherSubjects, userId]);
  
  // Загрузка статистики посещаемости
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      try {
        if (!selectedSubject) return;
        
        // Получаем текущую дату в формате DD.MM.YYYY
        const today = new Date();
        const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${
          (today.getMonth() + 1).toString().padStart(2, '0')}.${
          today.getFullYear()}`;
        
        // Получаем статистику посещаемости
        const statsResponse = await apiService.qr.getEnrichedAttendanceStats(
          formattedDate, 
          formattedDate
        );
        
        // Фильтруем статистику по выбранному предмету и дню недели
        const subjectStats = statsResponse.stats.filter(stat => 
          stat.subject_id === selectedSubject.subject_id &&
          stat.day_of_week === selectedSubject.day_of_week
        )[0] || {};
        
        // Устанавливаем данные статистики
        setStats({
          attendanceToday: subjectStats.attendance_count || 0,
          totalStudents: selectedSubject.group_size || 30, // Если size не указан, используем 30 как значение по умолчанию
          attendanceRate: Math.round(((subjectStats.attendance_count || 0) / (selectedSubject.group_size || 30)) * 100) || 0
        });
      } catch (error) {
        console.error('Ошибка при получении статистики посещаемости:', error);
      }
    };
    
    fetchAttendanceStats();
  }, [selectedSubject]);
  
  // Очистка интервала при размонтировании компонента
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);
  
  // Обработчик для начала/остановки сессии QR-кодов
  const toggleQRSession = () => {
    if (isSessionActive) {
      // Останавливаем текущую сессию
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      setIsSessionActive(false);
      setQrCode('');
      setTimeLeft(0);
    } else {
      // Начинаем новую сессию
      setIsSessionActive(true);
      handleGenerateQR();
      
      // Устанавливаем интервал для автоматической регенерации QR-кодов
      const newIntervalId = setInterval(() => {
        if (timeLeft <= 0) {
          handleGenerateQR();
        }
      }, 31000); // Генерируем новый QR через 31 секунду (чтобы обеспечить непрерывность)
      
      setIntervalId(newIntervalId);
    }
  };
  
  // Обработчик для генерации QR-кода
  const handleGenerateQR = async () => {
    if (!selectedSubject || !canGenerateQR) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Убедимся, что используем корректный ID предмета и ID преподавателя
      const subjectId = selectedSubject.subject_id;
      // Для shift_id используем значение из предмета или 1 по умолчанию
      const shiftId = selectedSubject.shift_id || 1;
      
      console.log(`Генерация QR-кода: subject_id=${subjectId}, shift_id=${shiftId}, teacher_id=${userId}`);
      
      const result = await apiService.qr.generateQR(
        subjectId, 
        shiftId,
        parseInt(userId)
      );
      
      setQrCode(result.qr_code);
      setTimeLeft(30); // QR код действителен 30 секунд
      
      // Начинаем отсчет времени
      const countdownInterval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      
      // Возвращаем функцию очистки для этого эффекта
      return () => clearInterval(countdownInterval);
    } catch (err) {
      console.error('Ошибка при генерации QR-кода:', err);
      setError('Не удалось сгенерировать QR-код. Пожалуйста, попробуйте снова.');
      setIsSessionActive(false);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-qrcode">
      <h3 className="section-title">QR-код для отметки посещаемости</h3>
      
      {selectedSubject ? (
        <div className="qrcode-container">
          <div className="subject-info">
            <h4>Предмет: {selectedSubject.subject_name}</h4>
            <p>Группа: {selectedSubject.group_name}</p>
            <p>Аудитория: {selectedSubject.room_number}</p>
            <p>Время: {selectedSubject.time_start} - {selectedSubject.time_end}</p>
            
            {/* Статус авторизации для создания QR */}
            <div className={`auth-status ${canGenerateQR ? 'authorized' : 'unauthorized'}`}>
              {canGenerateQR ? (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                  </svg>
                  <span>Вы можете создавать QR-коды для этого занятия</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                  </svg>
                  <span>Вы не можете создавать QR-коды для чужих занятий</span>
                </>
              )}
            </div>
          </div>
          
          {/* Кнопка для начала/остановки сессии генерации QR */}
          <div className="qr-session-control">
            <button 
              className={`session-toggle-button ${isSessionActive ? 'active' : ''}`}
              onClick={toggleQRSession}
              disabled={!canGenerateQR || loading}
            >
              {isSessionActive ? (
                <>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M18,18H6V6H18V18Z" />
                  </svg>
                  Остановить проверку посещаемости
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                  </svg>
                  Начать проверку посещаемости
                </>
              )}
            </button>
          </div>
          
          <div className="qrcode-box">
            {qrCode ? (
              <>
                <div className="qrcode-image">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCode)}`} 
                    alt="QR-код для отметки посещаемости" 
                  />
                  <div className="qr-timer">
                    <svg viewBox="0 0 24 24" width="20" height="20">
                      <path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" />
                    </svg>
                    <span>{timeLeft} сек</span>
                  </div>
                </div>
                <div className="qrcode-info">
                  <div className="qrcode-hint">
                    Покажите этот QR-код студентам для отметки посещаемости
                  </div>
                  <p className="qrcode-hint-secondary">
                    QR-код автоматически обновляется каждые 30 секунд
                  </p>
                </div>
              </>
            ) : (
              <div className="qrcode-placeholder">
                <svg viewBox="0 0 24 24" width="64" height="64">
                  <path d="M3,11H5V13H3V11M11,5H13V9H11V5M9,11H13V15H11V13H9V11M15,11H17V13H19V11H21V13H19V15H21V19H19V21H17V19H13V21H11V17H15V15H17V13H15V11M19,19V15H17V19H19M15,3H21V9H15V3M17,5V7H19V5H17M3,3H9V9H3V3M5,5V7H7V5H5M3,15H9V21H3V15M5,17V19H7V17H5Z" />
                </svg>
                <p>{isSessionActive ? 'Генерация QR-кода...' : 'Нажмите кнопку "Начать проверку посещаемости"'}</p>
              </div>
            )}
          </div>
          
          {!isSessionActive && (
            <div className="qrcode-actions">
              <button 
                className="regenerate-qr-button" 
                onClick={handleGenerateQR}
                disabled={loading || timeLeft > 0 || !canGenerateQR}
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z" />
                </svg>
                {loading ? 'Генерация...' : timeLeft > 0 ? `Подождите (${timeLeft}с)` : 'Сгенерировать одиночный QR-код'}
              </button>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {isSessionActive && (
            <div className="session-status">
              <div className="pulse-indicator"></div>
              <span>Сессия QR-кодов активна</span>
            </div>
          )}
          
          <AttendanceStats stats={stats} />
        </div>
      ) : (
        <div className="no-subject-selected">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />
          </svg>
          <p>Выберите предмет из расписания для генерации QR-кода посещаемости</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeTab;