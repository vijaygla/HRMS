import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
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
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Track toast messages to prevent duplicates
let lastToastMessage = '';
let lastToastTime = 0;

const showToast = (type, message) => {
  const now = Date.now();
  // Prevent duplicate toasts within 1 second
  if (message === lastToastMessage && now - lastToastTime < 1000) {
    return;
  }
  
  lastToastMessage = message;
  lastToastTime = now;
  
  if (type === 'error') {
    toast.error(message);
  } else if (type === 'success') {
    toast.success(message);
  } else {
    toast(message);
  }
};

// // Handle response errors
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('API Error:', error);
    
//     const { response, message, code } = error;
    
//     if (code === 'ECONNABORTED') {
//       showToast('error', 'Request timeout. Please try again.');
//     } else if (message === 'Network Error' || !response) {
//       showToast('error', 'Cannot connect to server. Please check if the backend is running on http://localhost:5000');
//     } else if (response?.status === 401) {
//       localStorage.removeItem('hrms_token');
//       localStorage.removeItem('hrms_user');
//       showToast('error', 'Session expired. Please login again.');
//       if (window.location.pathname !== '/login') {
//         window.location.href = '/login';
//       }
//     } else if (response?.status === 403) {
//       showToast('error', 'Access denied. You don\'t have permission for this action.');
//     } else if (response?.status === 404) {
//       showToast('error', 'Resource not found.');
//     } else if (response?.status === 500) {
//       showToast('error', 'Server error. Please try again later.');
//     } else if (response?.data?.message) {
//       showToast('error', response.data.message);
//     } else {
//       showToast('error', 'An unexpected error occurred.');
//     }
    
//     return Promise.reject(error);
//   }
// );

export default api;

