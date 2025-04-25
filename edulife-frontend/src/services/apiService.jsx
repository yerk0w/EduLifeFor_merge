// src/services/apiService.js
import axios from 'axios';

// Base URLs for different microservices
const API_BASE_URL = {
  auth: 'http://localhost:8070',
  qr: 'http://localhost:8080',
  raspis: 'http://localhost:8090',
  dock: 'http://localhost:8100',
  integration: 'http://localhost:8110'
};

// Create an axios instance with default configuration
const apiClient = axios.create({
  timeout: 50000, // 10 seconds timeout
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
    
    logout: () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
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
    }
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
        const response = await apiClient.get(`${API_BASE_URL.auth}/departments/user/${userId}/schedule`);
        console.log(`Schedule response from department API:`, response.data);
        
        // Если API департаментов вернуло данные, используем их
        if (response.data && Array.isArray(response.data)) {
          return { schedule: response.data };
        }
        
        // В качестве запасного варианта используем старый подход
        // Different parameters based on user role
        const params = {};
        if (userRole === 'teacher') {
          params.teacher_id = userId;
        } else if (userRole === 'student') {
          // First we need to get the student's group ID
          const studentResponse = await apiClient.get(`${API_BASE_URL.auth}/students?user_id=${userId}`);
          if (studentResponse.data && studentResponse.data.length > 0) {
            const groupId = studentResponse.data[0].group_id;
            params.group_id = groupId;
          }
        }
        
        // Make the actual schedule request
        const fallbackResponse = await apiClient.get(`${API_BASE_URL.raspis}/schedule`, {
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
            const studentResponse = await apiClient.get(`${API_BASE_URL.auth}/students/${userId}`);
            if (studentResponse.data && studentResponse.data.length > 0) {
              const groupId = studentResponse.data[0].group_id;
              params.group_id = groupId;
            }
          }
          
          const fallbackResponse = await apiClient.get(`${API_BASE_URL.raspis}/schedule`, {
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
// Обновленные методы для документов в apiService.jsx
documents: {
  documents: {
    getDocuments: async (page = 1, limit = 10) => {
      try {
        // Проверка наличия токена
        const token = localStorage.getItem('authToken');
        if (!token) {
          console.log('Нет токена, возвращаем пустой список документов');
          return [];
        }
        
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents`, {
          params: { skip: (page - 1) * limit, limit },
          // Таймаут в 5 секунд для быстрого реагирования
          timeout: 5000
        });
        
        return Array.isArray(response.data) ? response.data : [];
      } catch (error) {
        console.error('Error fetching documents:', error);
        // Возвращаем пустой массив вместо ошибки
        return [];
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
        
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates`, {
          // Таймаут в 5 секунд для быстрого реагирования
          timeout: 5000
        });
        
        return Array.isArray(response.data) ? response.data : [];
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
  
  createDocument: async (documentData) => {
    try {
      // Проверяем, является ли documentData экземпляром FormData
      let headers = {};
      if (documentData instanceof FormData) {
        headers = {
          'Content-Type': 'multipart/form-data'
        };
      }
      
      const response = await apiClient.post(`${API_BASE_URL.dock}/documents`, documentData, { 
        headers 
      });
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },
  
  updateDocument: async (documentId, documentData) => {
    try {
      const response = await apiClient.put(`${API_BASE_URL.dock}/documents/${documentId}`, documentData);
      return response.data;
    } catch (error) {
      console.error(`Error updating document ${documentId}:`, error);
      throw error;
    }
  },
  
  deleteDocument: async (documentId) => {
    try {
      const response = await apiClient.delete(`${API_BASE_URL.dock}/documents/${documentId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error;
    }
  },
  downloadTemplate: async (templateId) => {
    try {
      const response = await apiClient.get(`${API_BASE_URL.dock}/templates/${templateId}/download`, {
        responseType: 'blob'
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error downloading template ${templateId}:`, error);
      throw error;
    }
  }
},
},
documents: {
  getDocuments: async (page = 1, limit = 10) => {
    try {
      // Check if token exists
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token available, returning empty document list');
        return [];
      }
      
      const response = await apiClient.get(`${API_BASE_URL.dock}/documents`, {
        params: { skip: (page - 1) * limit, limit }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      // Return empty array instead of throwing
      return [];
    }
  },
  
  getTemplates: async () => {
    try {
      const response = await apiClient.get(`${API_BASE_URL.dock}/templates`);
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      // Return empty array instead of throwing
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
  
  createDocument: async (documentData) => {
    try {
      const response = await apiClient.post(`${API_BASE_URL.dock}/documents`, documentData);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
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
      // Using direct fetch with blob response type for file download
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_BASE_URL.dock}/templates/${templateId}/download`, {
        headers: headers,
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download template: ${response.statusText}`);
      }
      
      return response.blob();
    } catch (error) {
      console.error(`Error downloading template ${templateId}:`, error);
      throw error;
    }
  }
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
  }
};

export default apiService;