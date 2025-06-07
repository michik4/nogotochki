// Модель пользователя для PostgreSQL

export type UserType = 'client' | 'master' | 'admin';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  phone: string;
  avatar?: string;
  type: UserType;
  location?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Client extends User {
  type: 'client';
  total_bookings: number;
  favorite_count: number;
  uploads_count: number;
}

export interface Master extends User {
  type: 'master';
  rating: number;
  reviews_count: number;
  experience: string;
  specialties: string[];
  can_do_designs: number;
  uploads_count: number;
  is_verified: boolean;
  portfolio_images?: string[];
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone: string;
  type: UserType;
  location?: string;
  specialties?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  location?: string;
  specialties?: string[];
} 