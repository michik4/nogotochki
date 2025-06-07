
import { apiService, ApiResponse } from './api';
import { User, Client, Master } from '@/contexts/UserContext';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  type: 'client' | 'master';
  location?: string;
  specialties?: string[];
}

export const userService = {
  async login(credentials: LoginCredentials): Promise<ApiResponse<Client | Master>> {
    return apiService.post<Client | Master>('/auth/login', credentials);
  },

  async register(data: RegisterData): Promise<ApiResponse<Client | Master>> {
    return apiService.post<Client | Master>('/auth/register', data);
  },

  async getProfile(userId: string): Promise<ApiResponse<Client | Master>> {
    return apiService.get<Client | Master>(`/users/${userId}`);
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<ApiResponse<Client | Master>> {
    return apiService.put<Client | Master>(`/users/${userId}`, updates);
  },

  async logout(): Promise<ApiResponse<null>> {
    return apiService.post<null>('/auth/logout', {});
  }
};
