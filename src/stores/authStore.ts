import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  logout: () => void;
}

const getApiBaseUrl = () => (import.meta.env.VITE_API_URL || 'http://localhost:5235/api').replace(/\/$/, '');

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, token, refreshToken) => set({ user, token, refreshToken, isAuthenticated: true }),
      updateUser: (updates) =>
        set((state) => {
          if (!state.user) {
            return {};
          }

          return {
            user: {
              ...state.user,
              ...updates,
            },
          };
        }),
      logout: () => {
        const token = get().token;

        if (token) {
          void fetch(`${getApiBaseUrl()}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }).catch(() => undefined);
        }

        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
