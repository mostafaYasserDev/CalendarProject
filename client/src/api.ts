import axios from 'axios';

export const API_URL = 'http://localhost:5000/api';

// إعداد الإعتراض للطلبات
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// إعداد الإعتراض للاستجابات
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error);
    if (error.response) {
      console.log('Response data:', error.response.data);
      console.log('Response status:', error.response.status);
    }
    return Promise.reject(error);
  }
);

export const getUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// ... باقي الدوال 