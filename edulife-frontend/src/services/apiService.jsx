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
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('authToken');
      // Redirect to login page
      window.location.href = '/log';
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

  },
  // Document Service APIs
  documents: {
    getDocuments: async (page = 1, limit = 10) => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/documents`, {
          params: { page, limit }
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching documents:', error);
        throw error;
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
    
    getTemplates: async () => {
      try {
        const response = await apiClient.get(`${API_BASE_URL.dock}/templates`);
        return response.data;
      } catch (error) {
        console.error('Error fetching templates:', error);
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