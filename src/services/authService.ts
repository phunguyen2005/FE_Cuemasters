import api from './api';
import { Role } from '../types';

export interface LoginResponse {
  id: string;
  token: string;
  email: string;
  fullName: string;
  role: Role;
}

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, fullName: string, phoneNumber?: string): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/register', { 
      email, 
      password, 
      fullName, 
      phoneNumber 
    });
    return response.data;
  }
};
