# Configuration Guide

This document provides detailed information about configuring the ASPA San Vicente Backend API for different environments.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Development Configuration](#development-configuration)
- [Production Configuration](#production-configuration)
- [Configuration Module](#configuration-module)
- [Security Best Practices](#security-best-practices)

## Environment Variables

All configuration is managed through environment variables defined in `.env` files. The application uses different configuration files for different environments:

- `.env` - Development environment (default)
- `.env.production` - Production environment
- `.env.test` - Test environment

### Required Variables

The following environment variables are **required** for the application to run:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for signing JWT tokens (minimum 32 characters in production)

### Server Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `NODE_ENV` | Environment mode | `development` | `development`, `production`, `test` |
| `PORT` | Server port | `3000` | `3000` |
| `API_BASE_URL` | Base URL for API | `http://localhost:3000` | `https://api.aspa-sanvicente.com` |

### Database Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - | `postgresql://user:pass@localhost:5432/db` |
| `DB_POOL_MAX` | Maximum connections in pool | `10` | `20` |
| `DB_POOL_MIN` | Minimum connections in pool | `2` | `5` |
| `DB_POOL_IDLE_TIMEOUT` | Idle timeout (ms) | `10000` | `10000` |
| `DB_POOL_ACQUIRE_TIMEOUT` | Acquire timeout (ms) | `30000` | `30000` |

### JWT Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `JWT_SECRET` | Secret for signing tokens | - | `your-256-bit-secret` |
| `JWT_EXPIRES_IN` | Access token expiration | `1h` | `30m`, `1h`, `2h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` | `7d`, `14d`, `30d` |

**Generating a secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Email Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP server port | `587` | `587`, `465`, `25` |
| `SMTP_SECURE` | Use SSL/TLS | `false` | `true` for port 465 |
| `SMTP_USER` | SMTP username | - | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | - | `your-app-password` |
| `EMAIL_FROM` | Sender email address | `noreply@aspa-sanvicente.com` | `noreply@example.com` |
| `EMAIL_FROM_NAME` | Sender name | `ASPA San Vicente` | `Your App Name` |

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password: https://support.google.com/accounts/answer/185833
3. Use the App Password as `SMTP_PASSWORD`

### CORS Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` | `https://example.com,https://www.example.com` |
| `CORS_CREDENTIALS` | Allow credentials | `true` | `true`, `false` |

### Rate Limiting Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `RATE_LIMIT_WINDOW_MS` | Time window (ms) | `900000` (15 min) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` | `50`, `100`, `200` |

### Security Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds | `12` | `10`, `12`, `14` |
| `PASSWORD_RESET_EXPIRY_HOURS` | Reset token expiry | `1` | `1`, `2`, `24` |

### Logging Configuration

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `LOG_LEVEL` | Logging level | `info` | `error`, `warn`, `info`, `debug` |
| `LOG_REQUESTS` | Enable request logging | `true` | `true`, `false` |

## Development Configuration

For local development, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your local settings:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/aspa_dev_db
JWT_SECRET=dev-secret-key-at-least-32-characters-long
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Development Features

- Detailed logging (query logs, warnings, errors)
- Request logging enabled by default
- Less strict JWT secret requirements
- CORS allows multiple local origins

## Production Configuration

For production deployment, create `.env.production` based on `.env.production.example`:

```bash
cp .env.production.example .env.production
```

### Production Checklist

- [ ] Use strong, randomly generated `JWT_SECRET` (minimum 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use secure database connection with SSL (`?sslmode=require`)
- [ ] Configure production email service (SendGrid, AWS SES, etc.)
- [ ] Restrict `CORS_ORIGIN` to production frontend domain(s) only
- [ ] Use stricter rate limiting (`RATE_LIMIT_MAX_REQUESTS=50`)
- [ ] Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`
- [ ] Disable request logging (`LOG_REQUESTS=false`)
- [ ] Use environment-specific secrets management (AWS Secrets Manager, etc.)

### Production Environment Variables

```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.aspa-sanvicente.com
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@db.example.com:5432/aspa_prod_db?sslmode=require
JWT_SECRET=<generated-with-crypto-randomBytes>
JWT_EXPIRES_IN=30m
CORS_ORIGIN=https://aspa-sanvicente.com,https://www.aspa-sanvicente.com
RATE_LIMIT_MAX_REQUESTS=50
LOG_LEVEL=warn
LOG_REQUESTS=false
```

## Configuration Module

The application uses a centralized configuration module (`src/config/index.ts`) that:

1. Loads environment variables from `.env` files
2. Validates required variables
3. Provides type-safe access to configuration
4. Sets sensible defaults for optional variables

### Usage Example

```typescript
import config from './config';

// Access configuration values
const port = config.server.port;
const dbUrl = config.database.url;
const jwtSecret = config.jwt.secret;
const corsOrigins = config.cors.origins;

// Check environment
import { isDevelopment, isProduction } from './config';

if (isDevelopment()) {
  console.log('Running in development mode');
}
```

### Configuration Structure

```typescript
interface Config {
  server: {
    env: 'development' | 'production' | 'test';
    port: number;
    apiBaseUrl: string;
  };
  database: {
    url: string;
    pool: {
      max: number;
      min: number;
      idleTimeout: number;
      acquireTimeout: number;
    };
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
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
  cors: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  security: {
    bcryptSaltRounds: number;
    passwordResetExpiryHours: number;
  };
  logging: {
    level: string;
    logRequests: boolean;
  };
}
```

## Security Best Practices

### JWT Secret

- **Development**: Use a placeholder secret (minimum 32 characters)
- **Production**: Generate a cryptographically secure random secret
- **Never** commit production secrets to version control
- Rotate secrets periodically

### Database Security

- Use strong passwords (minimum 16 characters, mixed case, numbers, symbols)
- Enable SSL/TLS for database connections in production
- Use connection pooling to prevent connection exhaustion
- Implement regular backups
- Use read-only database users where appropriate

### Email Security

- Use App Passwords for Gmail (never use account password)
- Use dedicated email service providers for production (SendGrid, AWS SES)
- Implement rate limiting for email sending
- Validate email addresses before sending

### CORS Security

- **Development**: Allow localhost origins for testing
- **Production**: Only allow specific production domains
- Never use `*` (wildcard) in production
- Enable credentials only when necessary

### Rate Limiting

- Implement stricter limits in production
- Consider different limits for different endpoints
- Monitor for abuse patterns
- Use Redis for distributed rate limiting in multi-server setups

### Environment Variables

- Never commit `.env` files to version control
- Use `.env.example` as a template
- Use secrets management services in production (AWS Secrets Manager, HashiCorp Vault)
- Rotate credentials regularly
- Implement least privilege access

## Troubleshooting

### Missing Environment Variables

If you see an error about missing environment variables:

```
Error: Missing required environment variables: DATABASE_URL, JWT_SECRET
```

Solution: Ensure your `.env` file exists and contains all required variables.

### Database Connection Failed

If database connection fails:

1. Verify `DATABASE_URL` is correct
2. Ensure PostgreSQL is running
3. Check database credentials
4. Verify network connectivity
5. Check firewall rules

### CORS Errors

If you see CORS errors in the browser:

1. Verify frontend URL is in `CORS_ORIGIN`
2. Check for trailing slashes in URLs
3. Ensure `CORS_CREDENTIALS=true` if using cookies
4. Clear browser cache

### Email Sending Failed

If emails fail to send:

1. Verify SMTP credentials
2. Check SMTP port and security settings
3. Ensure firewall allows SMTP traffic
4. Check email service provider status
5. Review email service logs

## Additional Resources

- [Prisma Connection Pooling](https://www.prisma.io/docs/concepts/components/prisma-client/connection-management)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
