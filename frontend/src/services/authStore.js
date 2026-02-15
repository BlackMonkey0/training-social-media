import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al iniciar sesión';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.error || 'Error al registrarse';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getProfile();
      set({ user: response.data.user, isLoading: false });
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
      throw error;
    }
  },
}));
