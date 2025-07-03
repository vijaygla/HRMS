import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hrms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    toast.error('Request failed. Please try again.');
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, message } = error;
    
    if (response?.status === 401) {
      localStorage.removeItem('hrms_token');
      localStorage.removeItem('hrms_user');
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else if (response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (response?.status === 404) {
      toast.error('Resource not found.');
    } else if (response?.status === 500) {
      toast.error('Server error. Please try again later.');
    } else if (message === 'Network Error') {
      toast.error('Network error. Please check your connection.');
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;