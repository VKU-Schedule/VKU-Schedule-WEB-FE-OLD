const USER_API_URL = import.meta.env.VITE_USER_API_URL || 'http://localhost:8081/api';
const DAOTAO_API_URL = import.meta.env.VITE_DAOTAO_API_URL || 'http://localhost:8080/api';

// Helper function for API calls
const apiCall = async (baseUrl, endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth APIs (User Service)
export const authAPI = {
  login: (idToken) => apiCall(USER_API_URL, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
  verify: (idToken) => apiCall(USER_API_URL, '/auth/verify', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  }),
};

// Student APIs (Daotao Service)
export const studentAPI = {
  getAvailableCourses: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiCall(DAOTAO_API_URL, `/student/available-courses${query ? `?${query}` : ''}`);
  },
  getMyEnrollments: () => apiCall(DAOTAO_API_URL, '/student/enrollments'),
  registerCourse: (classSectionId) => apiCall(DAOTAO_API_URL, '/student/enrollment/register', {
    method: 'POST',
    body: JSON.stringify({ classSectionId }),
  }),
  dropCourse: (enrollmentId) => apiCall(DAOTAO_API_URL, `/student/enrollment/${enrollmentId}`, {
    method: 'DELETE',
  }),
};

export default {
  authAPI,
  studentAPI,
};
