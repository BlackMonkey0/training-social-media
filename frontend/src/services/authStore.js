import { create } from 'zustand';
import { authAPI } from '../services/api';

const TOKEN_KEY = 'token';
const USERS_KEY = 'sc_users';
const CURRENT_USER_KEY = 'sc_current_user';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeUser(input) {
  return {
    id: input.id || crypto.randomUUID(),
    username: input.username,
    email: input.email,
    firstName: input.firstName || '',
    lastName: input.lastName || '',
    sportPreference: input.sportPreference || 'running',
  };
}

function createLocalToken(user) {
  return `local-${user.id}-${Date.now()}`;
}

function registerLocal(userData) {
  const users = readJson(USERS_KEY, []);
  const exists = users.some(
    (u) => u.username?.toLowerCase() === userData.username?.toLowerCase()
      || u.email?.toLowerCase() === userData.email?.toLowerCase()
  );

  if (exists) {
    const error = new Error('Usuario o email ya existe');
    error.response = { data: { error: 'Usuario o email ya existe' } };
    throw error;
  }

  const user = normalizeUser(userData);
  users.push({ ...user, password: userData.password });
  writeJson(USERS_KEY, users);
  writeJson(CURRENT_USER_KEY, user);
  return { user, token: createLocalToken(user) };
}

function loginLocal(username, password) {
  const users = readJson(USERS_KEY, []);
  const found = users.find((u) => u.username === username);
  if (!found || found.password !== password) {
    const error = new Error('Credenciales invalidas');
    error.response = { data: { error: 'Credenciales invalidas' } };
    throw error;
  }

  const user = normalizeUser(found);
  writeJson(CURRENT_USER_KEY, user);
  return { user, token: createLocalToken(user) };
}

function resolveAuthError(error, fallback) {
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.request) return 'No se pudo conectar con la API. Se usara modo local.';
  return fallback;
}

export const useAuthStore = create((set) => ({
  user: readJson(CURRENT_USER_KEY, null),
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ username, password });
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      writeJson(CURRENT_USER_KEY, user);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      try {
        const { token, user } = loginLocal(username, password);
        localStorage.setItem(TOKEN_KEY, token);
        set({ token, user, isLoading: false, error: null });
        return user;
      } catch (localError) {
        const message = resolveAuthError(localError, 'Error al iniciar sesion');
        set({ error: message, isLoading: false });
        throw localError;
      }
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      writeJson(CURRENT_USER_KEY, user);
      set({ token, user, isLoading: false });
      return user;
    } catch (error) {
      try {
        const { token, user } = registerLocal(userData);
        localStorage.setItem(TOKEN_KEY, token);
        set({ token, user, isLoading: false, error: null });
        return user;
      } catch (localError) {
        const message = resolveAuthError(localError, 'Error al registrarse');
        set({ error: message, isLoading: false });
        throw localError;
      }
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    set({ user: null, token: null });
  },

  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const response = await authAPI.getProfile();
      const user = response.data.user;
      writeJson(CURRENT_USER_KEY, user);
      set({ user, isLoading: false });
      return response.data;
    } catch {
      const user = readJson(CURRENT_USER_KEY, null);
      if (user) {
        set({ user, isLoading: false });
        return { user };
      }

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      set({ user: null, token: null, isLoading: false });
      throw new Error('No session');
    }
  },
}));
