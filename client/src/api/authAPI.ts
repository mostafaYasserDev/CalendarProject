import axios from 'axios';
import { User } from '../types/user';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
  },

  localLogin: async (systemUsername: string) => {
    const response = await axios.post(`${API_URL}/auth/local-login`, { systemUsername });
    return response.data;
  },

  getProfile: async () => {
    const response = await axios.get(`${API_URL}/auth/profile`);
    return response.data;
  },

  getUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  createUser: async (userData: { 
    name: string; 
    email: string; 
    password: string; 
    role?: string;
    systemUsername?: string;
  }) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  },

  updateUser: async (id: string, userData: Partial<User>) => {
    const response = await axios.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    await axios.delete(`${API_URL}/users/${id}`);
  },

  getAllUsers: async () => {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await axios.post(`${API_URL}/auth/change-password`, { currentPassword, newPassword });
  }
}; 