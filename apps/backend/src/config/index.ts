import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Centralized configuration module
 * Provides type-safe access to all environment variables
 * Requirements: 1.1, 1.4
 */

interface Config {
  // Server configuration
  server: {
    env: 'development' | 'production' | 'test';
    port: number;
    apiBaseUrl: string;
  };

  // Database configuration
  database: {
    url: string;
    pool: {
      max: number;
      min: number;
      idleTimeout: number;
      acquireTimeout: number;
    };
  };

  // JWT configuration
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };

  // Email configuration
  email: {
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
    };
    from: string;
    fromName: string;
  };

  // CORS configuration
  cors: {
    origins: string[];
    credentials: boolean;
  };

  // Rate limiting configuration
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };

  // Security configuration
  security: {
    bcryptSaltRounds: number;
    passwordResetExpiryHours: number;
  };

  // Logging configuration
  logging: {
    level: string;
    logRequests: boolean;
  };
}

/**
 * Parse environment variable as integer with default value
 */
const parseIntEnv = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Parse environment variable as boolean with default value
 */
const parseBoolEnv = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
};

/**
 * Validate required environment variables
 */
const validateConfig = (): void => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  // Validate JWT secret length in production
  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET must be at least 32 characters long in production.\n' +
        'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
  }
};

// Validate configuration on module load
validateConfig();

/**
 * Application configuration object
 */
const config: Config = {
  server: {
    env: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    port: parseIntEnv(process.env.PORT, 3000),
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  },

  database: {
    url: process.env.DATABASE_URL!,
    pool: {
      max: parseIntEnv(process.env.DB_POOL_MAX, 10),
      min: parseIntEnv(process.env.DB_POOL_MIN, 2),
      idleTimeout: parseIntEnv(process.env.DB_POOL_IDLE_TIMEOUT, 10000),
      acquireTimeout: parseIntEnv(process.env.DB_POOL_ACQUIRE_TIMEOUT, 30000),
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseIntEnv(process.env.SMTP_PORT, 587),
      secure: parseBoolEnv(process.env.SMTP_SECURE, false),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@aspa-sanvicente.com',
    fromName: process.env.EMAIL_FROM_NAME || 'ASPA San Vicente',
  },

  cors: {
    origins: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: parseBoolEnv(process.env.CORS_CREDENTIALS, true),
  },

  rateLimit: {
    windowMs: parseIntEnv(process.env.RATE_LIMIT_WINDOW_MS, 900000), // 15 minutes
    maxRequests: parseIntEnv(process.env.RATE_LIMIT_MAX_REQUESTS, 100),
  },

  security: {
    bcryptSaltRounds: parseIntEnv(process.env.BCRYPT_SALT_ROUNDS, 12),
    passwordResetExpiryHours: parseIntEnv(process.env.PASSWORD_RESET_EXPIRY_HOURS, 1),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logRequests: parseBoolEnv(process.env.LOG_REQUESTS, true),
  },
};

/**
 * Check if running in development mode
 */
export const isDevelopment = (): boolean => config.server.env === 'development';

/**
 * Check if running in production mode
 */
export const isProduction = (): boolean => config.server.env === 'production';

/**
 * Check if running in test mode
 */
export const isTest = (): boolean => config.server.env === 'test';

export default config;
