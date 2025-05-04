// src/services/apiService.js
import axios from 'axios';

// Base URLs for different microservices
const API_BASE_URL = {
  auth: 'http://localhost:8070',
  qr: 'http://localhost:8080',
  raspis: 'http://localhost:8090',
  dock: 'http://localhost:8100',
  integration: 'http://localhost:8110',
  keys: 'http://localhost:8120'
};

// Create an axios instance with default configuration
const apiClient = axios.create({
  timeout: 50000, // 50 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Проверяем, является ли это ошибкой сети или CORS
    if (!error.response) {
      console.error('Сетевая ошибка или CORS:', error);
      // В случае ошибки сети не перенаправляем на страницу логина
      return Promise.reject(error);
    }
    
    // Проверяем код ответа
    if (error.response.status === 401) {
      console.log('Ошибка аутентификации 401, проверяем на странице документов');
      // Перенаправляем только если мы не на странице документов
      if (!window.location.pathname.includes('/documents')) {
        localStorage.removeItem('authToken');
        window.location.href = '/log';
      }
    }
    
    return Promise.reject(error);
  }
);


const apiService = {
  auth: {
    // Метод для логина
    login: async (username, password) => {
      try {
        const response = await axios.post(`${API_BASE_URL.auth}/auth/login`,
          new URLSearchParams({
            'username': username,
            'password': password
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );
        
        // Store the token and user info in localStorage
        if (response.data.access_token) {
          localStorage.setItem('authToken', response.data.access_token);
          localStorage.setItem('userId', response.data.user_id);
          localStorage.setItem('username', response.data.username);
          localStorage.setItem('userRole', response.data.role);
        }
        
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    register: async (userData) => {
      try {
        const response = await axios.post(`${API_BASE_URL.auth}/auth/register`, userData);
        return response.data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    getCurrentUser: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/auth/me`);
        return response.data;
      } catch (error) {
        console.error('Get current user error:', error);
        throw error;
      }
    },
    getAllUsers: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/users`);
        return response.data;
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    
    // Получение факультетов
    getFaculties: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/faculties`);
        return response.data;
      } catch (error) {
        console.error('Error fetching faculties:', error);
        return [];
      }
    },
    
    // Получение кафедр
    getDepartments: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/departments`);
        return response.data;
      } catch (error) {
        console.error('Error fetching departments:', error);
        return [];
      }
    },
    
    // Получение групп
    getGroups: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/groups`);
        return response.data;
      } catch (error) {
        console.error('Error fetching groups:', error);
        return [];
      }
    },
    
    // Получение ролей
    getRoles: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/roles`);
        return response.data;
      } catch (error) {
        console.error('Error fetching roles:', error);
        // Возвращаем стандартные роли если API не реализовано
        return [
          { id: 1, name: 'admin', display_name: 'Администратор' },
          { id: 2, name: 'teacher', display_name: 'Преподаватель' },
          { id: 3, name: 'student', display_name: 'Студент' }
        ];
      }
    },
    
    // Обновление пользователя
    updateUser: async (userId, userData) => {
      try {
        const response = await apiClient.put(`${API_BASE_URL.auth}/users/${userId}`, userData);
        return response.data;
      } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        throw error;
      }
    },
    
    // Удаление пользователя
    deleteUser: async (userId) => {
      try {
        const response = await apiClient.delete(`${API_BASE_URL.auth}/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw error;
      }
    },
    
    // Получение информации о студенте по ID пользователя
    getStudentByUser: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/students/by-user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching student info for user ${userId}:`, error);
        return null;
      }
    },
    
    // Получение информации о преподавателе по ID пользователя
    getTeacherByUser: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/teachers/by-user/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching teacher info for user ${userId}:`, error);
        return null;
      }
    },
    
    // Создание студента
    createStudent: async (studentData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.auth}/students`, studentData);
        return response.data;
      } catch (error) {
        console.error('Error creating student:', error);
        throw error;
      }
    },
    
    // Обновление студента
    updateStudent: async (studentId, studentData) => {
      try {
        const response = await apiClient.put(`${API_BASE_URL.auth}/students/${studentId}`, studentData);
        return response.data;
      } catch (error) {
        console.error(`Error updating student ${studentId}:`, error);
        throw error;
      }
    },
    
    // Создание преподавателя
    createTeacher: async (teacherData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.auth}/teachers`, teacherData);
        return response.data;
      } catch (error) {
        console.error('Error creating teacher:', error);
        throw error;
      }
    },
    
    // Обновление преподавателя
    updateTeacher: async (teacherId, teacherData) => {
      try {
        const response = await apiClient.put(`${API_BASE_URL.auth}/teachers/${teacherId}`, teacherData);
        return response.data;
      } catch (error) {
        console.error(`Error updating teacher ${teacherId}:`, error);
        throw error;
      }
    },
    
    // Создание пользователя (для администраторов)
    createUser: async (userData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.auth}/users`, userData);
        return response.data;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }},
    
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
    },


    getStudents: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/students`);
        return response.data;
      } catch (error) {
        console.error('Error fetching students:', error);
        return [];
      }
    },
    
    // Отправка документа студенту (для админов)
    sendDocumentToStudent: async (formData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.dock}/documents/admin/send`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Ошибка при отправке документа студенту:', error);
        throw error;
      }
    },
    getTemplateById: async (templateId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates/${templateId}`);
        return response.data;
      } catch (error) {
        console.error(`Ошибка при получении шаблона ${templateId}:`, error);
        throw error;
      }
    },
    // Метод для скачивания шаблона
    downloadTemplateFile: async (templateId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates/${templateId}/download`, {
          responseType: 'blob'
        });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при скачивании шаблона ${templateId}:`, error);
        throw error;
      }
    },
    uploadTemplate: async (formData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.dock}/templates`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке шаблона:', error);
        throw error;
      }
    },

    
    // Получение документов, отправленных администратором текущему пользователю
    getReceivedDocuments: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/admin/received`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении полученных документов:', error);
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
    },
    
    getUserById: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/users/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        throw error;
      }
    },
    
    // New profile-related methods
    getUserProfile: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/profile/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching user profile ${userId}:`, error);
        throw error;
      }
    },
    
    updateUserProfile: async (userId, profileData) => {
      try {
        const response = await apiClient.put(`${API_BASE_URL.auth}/profile/${userId}`, profileData);
        return response.data;
      } catch (error) {
        console.error(`Error updating user profile ${userId}:`, error);
        throw error;
      }
    },
    
    getCities: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/profile/cities`);
        return response.data;
      } catch (error) {
        console.error('Error fetching cities:', error);
        return [];
      }
    },
    
    getColleges: async (cityId = null) => {
      try {
        const url = cityId 
          ? `${API_BASE_URL.auth}/profile/colleges?city_id=${cityId}`
          : `${API_BASE_URL.auth}/profile/colleges`;
        const response = await apiClient.get(url);
        return response.data;
      } catch (error) {
        console.error('Error fetching colleges:', error);
        return [];
      }
    },
    // Получение всех преподавателей
    getTeachers: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/teachers`);
        return response.data;
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    },
  },

  // QR Service APIs
  qr: {
    generateQR: async (subjectId, shiftId, teacherId) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.qr}/qr`, {
          subject_id: subjectId,
          shift_id: shiftId,
          teacher_id: teacherId
        });
        return response.data;
      } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
      }
    },
    
    validateQR: async (userId, qrCode) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.qr}/validate_qr`, {
          user_id: userId,
          qr_code: qrCode
        });
        return response.data;
      } catch (error) {
        console.error('Error validating QR code:', error);
        throw error;
      }
    },
    
    getUserSessions: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.qr}/sessions/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching user sessions for ${userId}:`, error);
        throw error;
      }
    },
    
    getScheduleForUser: async (userId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.qr}/schedule/${userId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching schedule for user ${userId}:`, error);
        throw error;
      }
    },
    getAttendanceStats: async (startDate = null, endDate = null) => {
      try {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        
        const response = await apiClient.get(`${API_BASE_URL.qr}/stats`, { params });
        return response.data;
      } catch (error) {
        console.error('Error fetching attendance statistics:', error);
        return { stats: [] };
      }
    },
    getSubjects: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.raspis}/subjects`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching subjects:', error);
        return [];
      }
    },
    
    getTeachers: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.auth}/teachers`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching teachers:', error);
        return [];
      }
    },
    // Метод для получения обогащенной статистики с именами предметов и преподавателей
    getEnrichedAttendanceStats: async (startDate = null, endDate = null) => {
      try {
        // Сначала получаем базовую статистику
        const statsResponse = await apiService.qr.getAttendanceStats(startDate, endDate);
        
        if (!statsResponse || !statsResponse.stats || !Array.isArray(statsResponse.stats)) {
          return { stats: [] };
        }
        
        // Получаем информацию о предметах
        const subjects = await apiService.qr.getSubjects();
        const subjectsMap = subjects.reduce((map, subject) => {
          map[subject.id] = subject.name || `Предмет ${subject.id}`;
          return map;
        }, {});
        
        // Получаем информацию о преподавателях
        const teachers = await apiService.qr.getTeachers();
        const teachersMap = teachers.reduce((map, teacher) => {
          map[teacher.id] = teacher.full_name || `Преподаватель ${teacher.id}`;
          return map;
        }, {});
        
        // Обогащаем статистику дополнительной информацией
        const enrichedStats = statsResponse.stats.map(stat => ({
          ...stat,
          subject_name: subjectsMap[stat.subject_id] || `Предмет ${stat.subject_id}`,
          teacher_name: teachersMap[stat.teacher_id] || `Преподаватель ${stat.teacher_id}`
        }));
        
        return { stats: enrichedStats };
      } catch (error) {
        console.error('Error fetching enriched attendance statistics:', error);
        return { stats: [] };
      }
    }

  },
  
  // Schedule Service APIs
  schedule: {
    getSchedule: async (filters = {}) => {
      try {
        console.log(`Requesting schedule with filters:`, filters);
        const response = await apiClient.get(`${API_BASE_URL.raspis}/schedule`, {
          params: filters
        });
        console.log(`Schedule response:`, response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching schedule:', error);
        // Return empty array instead of failing
        return [];
      }
    },
    
    getScheduleForUser: async (userId, userRole) => {
      try {
        console.log(`Requesting schedule for user ${userId} with role ${userRole}`);
        
        // Используем непосредственно API департаментов для получения расписания пользователя
        const response = await apiClient.get(`${API_BASE_URL.raspis}/schedule/user/${userId}`);
        console.log(`Schedule response from department API:`, response.data);
        
        // Если API департаментов вернуло данные, используем их
        if (response.data && Array.isArray(response.data)) {
          return { schedule: response.data };
        }
        // Если API департаментов не вернуло данные, используем fallback
        console.log(`Fallback to default schedule API`);
        const params = {};
        if (userRole === 'teacher') {
          params.teacher_id = userId;
        } else if (userRole === 'student') {
          // First we need to get the student's group ID
          const studentResponse = await apiClient.get(`${API_BASE_URL.auth}/students/by-user/${userId}`);
          if (studentResponse.data && studentResponse.data.length > 0) {
            const groupId = studentResponse.data[0].group_id;
            params.group_id = groupId;
          }
        }
        const fallbackResponse = await apiClient.get(`${API_BASE_URL.raspis}/schedule/${groupId}`, {
          params: params
        });
        
        console.log(`Fallback schedule response:`, fallbackResponse.data);
        return { schedule: fallbackResponse.data };
      } catch (error) {
        console.error(`Error fetching schedule for user ${userId}:`, error);
        
        try {
          // В случае ошибки с API департаментов, попробуем прямой запрос
          const params = {};
          if (userRole === 'teacher') {
            params.teacher_id = userId;
          } else if (userRole === 'student') {
            // Получаем группу студента
            const studentResponse = await apiClient.get(`${API_BASE_URL.auth}/students/by-user/${userId}`);
            if (studentResponse.data && studentResponse.data.length > 0) {
              const groupId = studentResponse.data[0].group_id;
              params.group_id = groupId;
            }
          }
          // Запрос расписания с использованием ID группы
          console.log(`Fallback request for group ID ${groupId}`);
          // Используем API расписания для получения расписания группы
          const fallbackResponse = await apiClient.get(`${API_BASE_URL.raspis}/schedule/${groupId}`, {
            params: params
          });
          
          return { schedule: fallbackResponse.data };
        } catch (fallbackError) {
          console.error('Fallback request also failed:', fallbackError);
          // Return empty schedule if everything fails
          return { schedule: [] };
        }
      }
    },
    getTeacherSchedule: async (teacherId) => {
      try {
        console.log(`Запрос расписания для преподавателя ID: ${teacherId}`);
        localStorage.setItem('teacherId', teacherId);
        const response = await apiClient.get(`${API_BASE_URL.raspis}/schedule/teacher/${teacherId}`);
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error(`Ошибка при получении расписания преподавателя ${teacherId}:`, error);
        return [];
      }
    },
    getNotifications: async (groupId = null) => {
      try {
        let endpoint = `${API_BASE_URL.raspis}/notifications`;
        
        // Если указан ID группы, получаем уведомления только для этой группы
        if (groupId) {
          endpoint = `${API_BASE_URL.raspis}/notifications/group/${groupId}`;
        } else {
          // Для студента автоматически получаем его группу
          const userRole = localStorage.getItem('userRole');
          const userId = localStorage.getItem('userId');
          
          if (userRole === 'student' && userId) {
            try {
              const studentInfo = await apiClient.get(`${API_BASE_URL.auth}/students/${userId}`);
              if (studentInfo.data && studentInfo.data.group_id) {
                endpoint = `${API_BASE_URL.raspis}/notifications/group/${studentInfo.data.group_id}`;
              }
            } catch (error) {
              console.error('Error fetching student group info:', error);
            }
          }
        }
        
        const response = await apiClient.get(endpoint);
        return response.data;
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }
    },
    
    // Метод для отметки уведомления как прочитанного
    markNotificationRead: async (notificationId) => {
      try {
        const response = await apiClient.put(`${API_BASE_URL.raspis}/notifications/${notificationId}/mark-read`);
        return response.data;
      } catch (error) {
        console.error(`Error marking notification ${notificationId} as read:`, error);
        return false;
      }
    }

  },
  // Document Service APIs
  documents: {
    getDocuments: async (page = 1, limit = 100) => {
      try {
        // Проверка наличия токена
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('Нет токена, возвращаем пустой список документов');
          return [];
        }
        
        // Используем URL с прямым адресом сервиса документов
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/`, {
          params: { skip: (page - 1) * limit, limit },
          // Таймаут в 5 секунд для быстрого реагирования
          timeout: 50000
        });
        
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching documents:', error);
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
    },
    uploadDocument: async (formData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.dock}/documents/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Ошибка при загрузке документа:', error);
        throw error;
      }
    },
    sendDocumentToStudent: async (formData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.dock}/documents/admin/send`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      } catch (error) {
        console.error('Ошибка при отправке документа студенту:', error);
        throw error;
      }
    },    
    
    getTemplates: async () => {
      try {
        // Проверка наличия токена
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('Нет токена, возвращаем пустой список шаблонов');
          return [];
        }
        
        // Используем URL с прямым адресом сервиса документов
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates`);
        return response.data;
      } catch (error) {
        console.error('Error fetching templates:', error);
        // Возвращаем пустой массив вместо ошибки
        return [];
      }
    },
  
    getDocumentById: async (documentId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/${documentId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching document ${documentId}:`, error);
        throw error;
      }
    },
    // Обновление статуса документа/заявки
    updateRequestStatus: async (documentId, newStatus) => {
      try {
        // Преобразование статуса из формата фронтенда в формат API
        const apiStatus = 
          newStatus === 'new' ? 'ожидает' :
          newStatus === 'completed' ? 'одобрено' :
          newStatus === 'rejected' ? 'отклонено' : 'ожидает';
        
        const response = await apiClient.patch(`${API_BASE_URL.dock}/documents/${documentId}/review`, {
          status: apiStatus
        });
        return response.data;
      } catch (error) {
        console.error(`Ошибка при обновлении статуса документа ${documentId}:`, error);
        throw error;
      }
    },
    getDocumentRequests: async () => {
      try {
        // Используем маршрут /documents для получения заявок (документы со статусом "ожидает")
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/all`);
        
        if (Array.isArray(response.data)) {
          // Преобразуем документы в формат заявок
          return response.data
            .filter(doc => doc.status === 'ожидает') // Фильтруем только ожидающие
            .map(doc => ({
              id: doc.id,
              student_name: doc.author_name || 'Неизвестный студент',
              student_avatar: null,
              document_type: doc.template_type || 'Документ',
              created_at: doc.created_at,
              status: 'new', // Для отображения в интерфейсе
              comment: doc.content || '',
              student_group: ''
            }));
        }
        return [];
      } catch (error) {
        console.error('Ошибка при получении заявок на документы:', error);
        return [];
      }
    },
    getAllDocuments: async (page = 1, limit = 100) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/all`, {
          params: { skip: (page - 1) * limit, limit }
        });
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Ошибка при получении всех документов:', error);
        return [];
      }
    },
    
    createDocument: async (documentData) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.dock}/documents`, documentData);
        return response.data;
      } catch (error) {
        console.error('Error creating document:', error);
        throw error;
      }
    },
    // Метод для удаления документа
    deleteDocument: async (documentId) => {
      try {
        const response = await apiClient.delete(`${API_BASE_URL.dock}/documents/${documentId}`);
        return response.data;
      } catch (error) {
        console.error(`Error deleting document ${documentId}:`, error);
        throw error;
      }
    },
    
    updateDocumentStatus: async (documentId, status) => {
      try {
        const response = await apiClient.patch(`${API_BASE_URL.dock}/documents/${documentId}/review`, {
          status: status
        });
        return response.data;
      } catch (error) {
        console.error(`Error updating document status ${documentId}:`, error);
        throw error;
      }
    },
  
    downloadTemplate: async (templateId) => {
      try {
        // Using blob response type for file download
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates/${templateId}/download`, {
          responseType: 'blob'
        });
        
        return response.data;
      } catch (error) {
        console.error(`Error downloading template ${templateId}:`, error);
        throw error;
      }
    },
    
    downloadDocument: async (documentId) => {
      try {
        // Сначала получаем информацию о пути к файлу
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents/${documentId}/download`);
        
        if (response.data && response.data.file_path) {
          // Полный URL для доступа к файлу
          const fileUrl = `${API_BASE_URL.dock}${response.data.file_path}`;
          
          // Получаем содержимое файла
          const fileResponse = await fetch(fileUrl);
          
          if (!fileResponse.ok) {
            throw new Error(`Ошибка при скачивании документа: ${fileResponse.statusText}`);
          }
          
          return fileResponse.blob();
        } else {
          throw new Error('Путь к файлу документа не найден');
        }
      } catch (error) {
        console.error(`Ошибка при скачивании документа ${documentId}:`, error);
        throw error;
      }
    },
    downloadRequestDocument: async (requestId) => {
      return apiService.documents.downloadDocument(requestId);
    },
    
  },

  // Integration Service APIs
  integration: {
    createAttendanceReport: async (groupId, startDate, endDate) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.integration}/integration/attendance-report/${groupId}`, null, {
          params: { start_date: startDate, end_date: endDate }
        });
        return response.data;
      } catch (error) {
        console.error('Error creating attendance report:', error);
        throw error;
      }
    },
    
    createAbsenceRequest: async (studentId, date, reason) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.integration}/integration/absence-request/${studentId}`, null, {
          params: { date, reason }
        });
        return response.data;
      } catch (error) {
        console.error('Error creating absence request:', error);
        throw error;
      }
    },
    
    createStudentReference: async (studentId) => {
      try {
        const response = await apiClient.post(`${API_BASE_URL.integration}/integration/reference/${studentId}`);
        return response.data;
      } catch (error) {
        console.error('Error creating student reference:', error);
        throw error;
      }
    },
    
    getTeacherSchedule: async (teacherId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.integration}/integration/teacher-schedule/${teacherId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching teacher schedule for ${teacherId}:`, error);
        throw error;
      }
    },
    
    getStudentAttendance: async (studentId) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.integration}/integration/student-attendance/${studentId}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching student attendance for ${studentId}:`, error);
        throw error;
      }
    }
  },
    // Key Management Service APIs
  keys: {
      // Get all keys (admin only)
      getAllKeys: async () => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/keys/`);
          return response.data;
        } catch (error) {
          console.error('Error fetching all keys:', error);
          return [];
        }
      },
      // Get keys assigned to a specific teacher
      getTeacherKeys: async (teacherId) => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/keys/teacher/${teacherId}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching keys for teacher ${teacherId}:`, error);
          return [];
        }
      },
      
      // Get incoming transfer requests
      getIncomingTransfers: async () => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/transfers/incoming`);
          return response.data;
        } catch (error) {
          console.error('Error fetching incoming transfers:', error);
          return [];
        }
      },
      
      // Get outgoing transfer requests
      getOutgoingTransfers: async () => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/transfers/outgoing`);
          return response.data;
        } catch (error) {
          console.error('Error fetching outgoing transfers:', error);
          return [];
        }
      },
      
      // Create a new key transfer request
      createTransfer: async (transferData) => {
        try {
          const response = await apiClient.post(`${API_BASE_URL.keys}/transfers/`, transferData);
          return response.data;
        } catch (error) {
          console.error('Error creating key transfer:', error);
          throw error;
        }
      },
      
      // Approve a key transfer request
      approveTransfer: async (transferId) => {
        try {
          const response = await apiClient.post(`${API_BASE_URL.keys}/transfers/${transferId}/approve`);
          return response.data;
        } catch (error) {
          console.error(`Error approving transfer ${transferId}:`, error);
          throw error;
        }
      },
      
      // Reject a key transfer request
      rejectTransfer: async (transferId, reason) => {
        try {
          const response = await apiClient.post(
            `${API_BASE_URL.keys}/transfers/${transferId}/reject`,
            null,
            { params: { reason } }
          );
          return response.data;
        } catch (error) {
          console.error(`Error rejecting transfer ${transferId}:`, error);
          throw error;
        }
      },
      
      // Cancel a key transfer request
      cancelTransfer: async (transferId) => {
        try {
          const response = await apiClient.post(`${API_BASE_URL.keys}/transfers/${transferId}/cancel`);
          return response.data;
        } catch (error) {
          console.error(`Error cancelling transfer ${transferId}:`, error);
          throw error;
        }
      },
      
      // Get key history
      getKeyHistory: async (keyId) => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/history/key/${keyId}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching history for key ${keyId}:`, error);
          return [];
        }
      },
      
      // Get teacher key history
      getTeacherHistory: async (teacherId) => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/history/teacher/${teacherId}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching key history for teacher ${teacherId}:`, error);
          return [];
        }
      },
      
      // Get dashboard data
      getDashboardData: async () => {
        try {
          const response = await apiClient.get(`${API_BASE_URL.keys}/dashboard`);
          return response.data;
        } catch (error) {
          console.error('Error fetching key dashboard data:', error);
          return [];
        }
      },
      
      // Admin methods for key management
      createKey: async (keyData) => {
        try {
          const response = await apiClient.post(`${API_BASE_URL.keys}/keys/`, keyData);
          return response.data;
        } catch (error) {
          console.error('Error creating key:', error);
          throw error;
        }
      },
      
      updateKey: async (keyId, keyData) => {
        try {
          const response = await apiClient.put(`${API_BASE_URL.keys}/keys/${keyId}`, keyData);
          return response.data;
        } catch (error) {
          console.error(`Error updating key ${keyId}:`, error);
          throw error;
        }
      },
      
      deleteKey: async (keyId) => {
        try {
          const response = await apiClient.delete(`${API_BASE_URL.keys}/keys/${keyId}`);
          return response.data;
        } catch (error) {
          console.error(`Error deleting key ${keyId}:`, error);
          throw error;
        }
      },
      
      assignKey: async (keyId, teacherId, notes) => {
        try {
          const response = await apiClient.post(
            `${API_BASE_URL.keys}/keys/${keyId}/assign/${teacherId}`,
            null,
            { params: { notes } }
          );
          return response.data;
        } catch (error) {
          console.error(`Error assigning key ${keyId} to teacher ${teacherId}:`, error);
          throw error;
        }
      },
      
      unassignKey: async (keyId, notes) => {
        try {
          const response = await apiClient.post(
            `${API_BASE_URL.keys}/keys/${keyId}/unassign`,
            null,
            { params: { notes } }
          );
          return response.data;
        } catch (error) {
          console.error(`Error unassigning key ${keyId}:`, error);
          throw error;
        }
      }
    }
  
};

export default apiService;