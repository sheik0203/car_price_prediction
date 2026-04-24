import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:9000') + '/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use(config => {
    config.headers = { ...config.headers, ...getAuthHeader() };
    return config;
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('access_token');
            if (window.location.pathname !== '/') {
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export const vehicleService = {
    getAll: () => api.get('/vehicles/'),
    create: (data) => api.post('/vehicles/', data),
    update: (id, data) => api.put(`/vehicles/${id}/`, data),
    delete: (id) => api.delete(`/vehicles/${id}/`),
};

export const analyticsService = {
    getDashboard: () => api.get('/analytics/'),
};

export const predictionService = {
    predict: (data) => api.post('/predict/', data),
    getHistory: () => api.get('/history/'),
    deleteHistory: (id) => api.delete(`/history/${id}/`),
    analyzeVehicle: (formData) => api.post('/analyze-vehicle/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
