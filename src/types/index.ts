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

export type UserRole = 'user' | 'admin';
export type Theme = 'light' | 'dark' | 'system';
