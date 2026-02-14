import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor para agregar token a las solicitudes
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Autenticación
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
};

// Rutas
export const routesAPI = {
  createRoute: (data) => apiClient.post('/routes', data),
  updateRoute: (routeId, data) => apiClient.put(`/routes/${routeId}`, data),
  getRoutes: (filters) => apiClient.get('/routes', { params: filters }),
  getRouteById: (routeId) => apiClient.get(`/routes/${routeId}`),
  joinRoute: (routeId) => apiClient.post(`/routes/${routeId}/join`),
};

// Actividades
export const activitiesAPI = {
  logActivity: (data) => apiClient.post('/activities', data),
  getActivities: (params) => apiClient.get('/activities', { params }),
  getStats: () => apiClient.get('/activities/stats'),
  syncDevice: (data) => apiClient.post('/activities/device/sync', data),
};

// Nutrición
export const nutritionAPI = {
  logNutrition: (data) => apiClient.post('/nutrition', data),
  getLogs: (params) => apiClient.get('/nutrition', { params }),
  getStats: () => apiClient.get('/nutrition/stats'),
  addCustomFood: (data) => apiClient.post('/nutrition/food/custom', data),
};

// Reseñas
export const reviewsAPI = {
  addReview: (data) => apiClient.post('/reviews', data),
  updateReview: (reviewId, data) => apiClient.put(`/reviews/${reviewId}`, data),
  deleteReview: (reviewId) => apiClient.delete(`/reviews/${reviewId}`),
  getRouteReviews: (routeId) => apiClient.get(`/reviews/route/${routeId}`),
};

export default apiClient;
