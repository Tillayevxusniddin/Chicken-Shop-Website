// src/services/api.ts
import axios from 'axios';

// 1. Asosiy API instance'ni yaratamiz
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // .env faylidagi manzilni oladi
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. Interceptor qo'shamiz (bu juda muhim!)
// Har bir so'rov yuborilishidan oldin bu funksiya ishlaydi
api.interceptors.request.use(
  (config) => {
    // Keyinchalik token'ni localStorage'dan olamiz
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Agar token mavjud bo'lsa, uni "Authorization" sarlavhasiga qo'shib yuboramiz
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
