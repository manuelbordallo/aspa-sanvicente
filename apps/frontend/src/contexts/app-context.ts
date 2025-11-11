import { createContext } from '@lit/context';
import type { User, Theme } from '../types/index.js';

// Auth Context
export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export const authContext = createContext<AuthContextValue>('auth');

// Settings Context
export interface SettingsContextValue {
  theme: Theme;
  language: string;
  currentCourse: string;
}

export const settingsContext = createContext<SettingsContextValue>('settings');

// Notification Context
export interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'createdAt'>
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  createdAt: Date;
}

export const notificationContext =
  createContext<NotificationContextValue>('notifications');

// App State Context (for global app state)
export interface AppStateContextValue {
  currentView: string;
  isMobileMenuOpen: boolean;
  isNavigationCollapsed: boolean;
  isLoading: boolean;
}

export const appStateContext = createContext<AppStateContextValue>('appState');
