import axios from 'axios';
import { storage, STORAGE_KEYS } from '../utils/storage';

const API_URL = 'http://192.168.1.2:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await storage.get<string>('AUTH_TOKEN');
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (error) {
    console.warn('Error reading auth token', error);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/auth/logout') {
      const { useAuthStore } = require('../store/useAuthStore');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
