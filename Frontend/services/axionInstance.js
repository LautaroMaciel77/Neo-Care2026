// /services/axiosInstance.js
import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Para Vite
    // baseURL: process.env.REACT_APP_API_URL, // Para Create React App
});

// Interceptor para agregar el token automáticamente (opcional si querés)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;