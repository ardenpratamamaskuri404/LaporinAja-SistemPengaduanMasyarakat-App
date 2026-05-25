import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Ganti dengan URL ngrok kamu sendiri!
// Contoh: 'https://abc123.ngrok-free.app'
export const BASE_URL = 'https://wisdom-detection-uncharted.ngrok-free.dev';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
