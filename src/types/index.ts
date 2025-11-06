export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notice {
  id: string;
  content: string;
  author: User;
  recipients: User[] | UserGroup[];
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  author: User;
  createdAt: Date;
}

export interface AppSettings {
  theme: Theme;
  language: string;
  currentCourse: string;
}

export interface UserGroup {
  id: string;
  name: string;
  users: User[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface LoginResponse {
  token: string;
  user: User;
  expiresAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error State Types
export interface ErrorState {
  hasError: boolean;
  error: ApiError | null;
  isLoading: boolean;
}

export interface FormError {
  field: string;
  message: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

// Form Data Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface NewsFormData {
  title: string;
  content: string;
  summary: string;
}

export interface NoticeFormData {
  content: string;
  recipients: string[]; // User IDs or group IDs
}

export interface EventFormData {
  title: string;
  description: string;
  date: Date;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Type Guards
export const isUser = (obj: any): obj is User => {
  return obj && typeof obj.id === 'string' && typeof obj.email === 'string';
};

export const isApiError = (obj: any): obj is ApiError => {
  return (
    obj && typeof obj.message === 'string' && typeof obj.status === 'number'
  );
};

export type UserRole = 'user' | 'admin';
export type Theme = 'light' | 'dark' | 'system';

// Re-export validators for convenience
export { ValidationService, ValidationRules } from '../utils/validators.js';
export type { ValidationRule } from '../utils/validators.js';
