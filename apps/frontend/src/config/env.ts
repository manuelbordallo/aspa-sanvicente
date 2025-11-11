/**
 * Environment configuration
 * Provides type-safe access to environment variables
 */

export interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    detectionTimeout: number;
  };
  app: {
    name: string;
    version: string;
    defaultLanguage: string;
    defaultTheme: 'light' | 'dark' | 'system';
  };
  features: {
    notifications: boolean;
    analytics: boolean;
    mockMode: boolean;
    showConnectionStatus: boolean;
  };
  auth: {
    tokenKey: string;
    tokenExpiry: number;
  };
  debug: boolean;
}

const getEnvVar = (key: string, defaultValue: string = ''): string => {
  return import.meta.env[key] || defaultValue;
};

const getEnvBoolean = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  return value === 'true' || value === true;
};

const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const config: AppConfig = {
  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', '/api'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    detectionTimeout: getEnvNumber('VITE_BACKEND_DETECTION_TIMEOUT', 2000),
  },
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Gestión Escolar'),
    version: getEnvVar('VITE_APP_VERSION', '0.0.0'),
    defaultLanguage: getEnvVar('VITE_APP_DEFAULT_LANGUAGE', 'es'),
    defaultTheme: getEnvVar('VITE_APP_DEFAULT_THEME', 'system') as
      | 'light'
      | 'dark'
      | 'system',
  },
  features: {
    notifications: getEnvBoolean('VITE_ENABLE_NOTIFICATIONS', true),
    analytics: getEnvBoolean('VITE_ENABLE_ANALYTICS', false),
    mockMode: getEnvBoolean('VITE_ENABLE_MOCK_MODE', false),
    showConnectionStatus: getEnvBoolean('VITE_SHOW_CONNECTION_STATUS', true),
  },
  auth: {
    tokenKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'auth_token'),
    tokenExpiry: getEnvNumber('VITE_AUTH_TOKEN_EXPIRY', 86400000),
  },
  debug: getEnvBoolean('VITE_ENABLE_DEBUG', false),
};

// Log configuration in development
if (config.debug) {
  console.log('App Configuration:', config);
}

export default config;
