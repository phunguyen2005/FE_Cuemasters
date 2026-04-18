/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/authStore';
import { Role } from '../types';

interface RefreshResponse {
  id: string;
  token: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: Role;
}

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5235/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url || '';
    const isLoginRequest = requestUrl.includes('/auth/login');
    const isRefreshRequest = requestUrl.includes('/auth/refresh-token');

    if (status !== 401 || !originalRequest || originalRequest._retry || isLoginRequest || isRefreshRequest) {
      return Promise.reject(error);
    }

    const { refreshToken, login, logout } = useAuthStore.getState();
    if (!refreshToken) {
      logout();
      window.location.assign('/login');
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshResponse = await axios.post<RefreshResponse>(
        `${api.defaults.baseURL}/auth/refresh-token`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const refreshed = refreshResponse.data;
      login(
        {
          id: refreshed.id,
          email: refreshed.email,
          fullName: refreshed.fullName,
          role: refreshed.role,
        },
        refreshed.token,
        refreshed.refreshToken,
      );

      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${refreshed.token}`,
      } as RetryRequestConfig['headers'];

      return api(originalRequest);
    } catch (refreshError) {
      logout();
      window.location.assign('/login');
      return Promise.reject(refreshError);
    }
  }
);

export default api;
