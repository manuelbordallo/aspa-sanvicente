# ASPA San Vicente - Backend API

Backend REST API for the ASPA San Vicente school management application. This API provides secure authentication, user management, news articles, notices/messages, calendar events, and user group management.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [API Endpoints](#api-endpoints)
- [Common API Examples](#common-api-examples)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- **Runtime**: Node.js 18+ with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Validation**: Zod schemas
- **Documentation**: Swagger/OpenAPI 3.0
- **Testing**: Jest + Supertest
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate Limiting

## Features

- ✅ **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Password reset via email
  - Secure password hashing with bcrypt

- ✅ **User Management**
  - CRUD operations for users (admin only)
  - User profile management
  - User activation/deactivation

- ✅ **News Management**
  - Create, read, update, delete news articles
  - Pagination and search
  - Date filtering

- ✅ **Notice System**
  - Send notices to individual users or groups
  - Mark as read/unread
  - Unread count tracking
  - Sent notices history

- ✅ **Calendar Events**
  - Event management with date/time
  - Date range filtering
  - Search functionality

- ✅ **User Groups**
  - Create and manage user groups
  - Bulk notice sending to groups

- ✅ **API Documentation**
  - Interactive Swagger UI
  - Complete endpoint documentation
  - Request/response examples

## Getting Started

### Prerequisites

**Option 1: Local Development**
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

**Option 2: Docker Development**
- Docker Engine 20.10+
- Docker Compose 2.0+

### Local Installation

1. **Clone the repository and navigate to backend**:
```bash
cd apps/backend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Set up environment variables**:
```bash
cp .env.example .env
```

Edit `.env` and configure your settings (see [Environment Variables](#environment-variables) section).

4. **Set up the database**:
```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# (Optional) Seed with sample data
npm run seed
```

The seed script creates:
- 1 admin user: `admin@aspa-sanvicente.com` / `Admin123`
- 5 sample users (password: `User123`)
- 2 user groups (Profesores, Padres)
- 3 news articles
- 5 calendar events
- Sample notices

5. **Start the development server**:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Docker Installation

1. **Copy the Docker environment file**:
```bash
cp .env.docker .env
```

Edit `.env` with your configuration (especially `JWT_SECRET`, `DB_PASSWORD`, and email settings).

2. **Build and start containers**:
```bash
docker-compose up -d
```

3. **Run database migrations**:
```bash
docker-compose exec backend npx prisma migrate deploy
```

4. **(Optional) Seed the database**:
```bash
docker-compose exec backend npx prisma db seed
```

5. **Verify the deployment**:
- API: http://localhost:3000
- API Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/health

For detailed Docker instructions, see [DOCKER.md](./DOCKER.md).


## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `3000` |
| `API_BASE_URL` | Base URL for API | `http://localhost:3000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/aspa_db` |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) | Generate with crypto |
| `JWT_EXPIRES_IN` | Access token expiration | `1h` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |

### Email Configuration (SMTP)

| Variable | Description | Example |
|----------|-------------|---------|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP server port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL/TLS | `false` for port 587 |
| `SMTP_USER` | SMTP username | `your-email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password | App password for Gmail |
| `EMAIL_FROM` | Sender email address | `noreply@aspa-sanvicente.com` |
| `EMAIL_FROM_NAME` | Sender name | `ASPA San Vicente` |

### Security Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGIN` | Allowed origins (comma-separated) | `http://localhost:3000,http://localhost:5173` |
| `CORS_CREDENTIALS` | Allow credentials in CORS | `true` |
| `BCRYPT_SALT_ROUNDS` | Bcrypt salt rounds (10-12 recommended) | `12` |
| `PASSWORD_RESET_EXPIRY_HOURS` | Password reset token expiry | `1` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (milliseconds) | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_REQUESTS` | Enable request logging | `true` |
| `DB_POOL_MAX` | Max database connections | `10` |
| `DB_POOL_MIN` | Min database connections | `2` |

**Important for Production**:
- Generate a strong `JWT_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Use a secure `DB_PASSWORD`
- Configure proper `CORS_ORIGIN` for your domain
- Set up email service credentials (Gmail App Password recommended)

See `.env.example` for complete documentation of all variables.

## Development Workflow

### Development Server

Start the development server with hot reload:
```bash
npm run dev
```

The server will automatically restart when you make changes to the code.

### Building for Production

Compile TypeScript to JavaScript:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Database Migrations

Create a new migration:
```bash
npm run prisma:migrate
```

Apply migrations (production):
```bash
npx prisma migrate deploy
```

Check migration status:
```bash
npx prisma migrate status
```

### Database Management

Open Prisma Studio (visual database editor):
```bash
npm run prisma:studio
```

Access at `http://localhost:5555`

Seed the database:
```bash
npm run seed
```

### Code Quality

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## API Documentation

### Interactive Documentation

Once the server is running, access the interactive Swagger UI documentation:

**URL**: `http://localhost:3000/api/docs`

The Swagger UI provides:
- Complete list of all endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality for testing endpoints
- Example requests and responses

### Health Check

Check if the API is running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | Yes | Logout current user |
| POST | `/api/auth/refresh` | Yes | Refresh JWT token |
| GET | `/api/auth/validate` | Yes | Validate current token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update current user profile |

### User Management Endpoints (Admin Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users (paginated) |
| GET | `/api/users/:id` | Admin | Get user by ID |
| POST | `/api/users` | Admin | Create new user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Deactivate user |

### News Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/news` | Yes | List news (paginated, filtered) |
| GET | `/api/news/:id` | Yes | Get news by ID |
| POST | `/api/news` | Admin | Create news article |
| PUT | `/api/news/:id` | Admin | Update news article |
| DELETE | `/api/news/:id` | Admin | Delete news article |

### Notice Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notices` | Yes | List received notices (paginated) |
| GET | `/api/notices/sent` | Yes | List sent notices |
| GET | `/api/notices/unread-count` | Yes | Get unread count |
| GET | `/api/notices/recipients` | Yes | Get available recipients |
| GET | `/api/notices/:id` | Yes | Get notice by ID |
| POST | `/api/notices` | Yes | Create notice |
| PATCH | `/api/notices/:id/read` | Yes | Mark notice as read |
| PATCH | `/api/notices/:id/unread` | Yes | Mark notice as unread |
| PATCH | `/api/notices/mark-all-read` | Yes | Mark all notices as read |
| DELETE | `/api/notices/:id` | Yes | Delete notice (author only) |

### Calendar Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/calendar/events` | Yes | List events (paginated, filtered) |
| GET | `/api/calendar/events/:id` | Yes | Get event by ID |
| POST | `/api/calendar/events` | Admin | Create event |
| PUT | `/api/calendar/events/:id` | Admin | Update event |
| DELETE | `/api/calendar/events/:id` | Admin | Delete event |

### User Group Endpoints (Admin Only)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/groups` | Admin | List all groups |
| GET | `/api/groups/:id` | Admin | Get group by ID |
| POST | `/api/groups` | Admin | Create group |
| PUT | `/api/groups/:id` | Admin | Update group |
| DELETE | `/api/groups/:id` | Admin | Delete group |

### Query Parameters

Most list endpoints support pagination and filtering:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | integer | Page number | `1` |
| `limit` | integer | Items per page (max 100) | `10` |
| `sortBy` | string | Field to sort by | varies |
| `sortOrder` | string | `asc` or `desc` | `desc` |
| `search` | string | Search query | - |
| `startDate` | date | Filter by start date | - |
| `endDate` | date | Filter by end date | - |
| `isRead` | boolean | Filter read/unread (notices) | - |

## Common API Examples

### 1. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aspa-sanvicente.com",
    "password": "Admin123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@aspa-sanvicente.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Get News (with pagination)

```bash
curl -X GET "http://localhost:3000/api/news?page=1&limit=10&sortOrder=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Important Announcement",
      "content": "Full content here...",
      "summary": "Brief summary",
      "author": {
        "id": "uuid",
        "firstName": "Admin",
        "lastName": "User"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3. Create a Notice

```bash
curl -X POST http://localhost:3000/api/notices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "content": "Please review the attached document",
    "recipients": [
      { "type": "user", "id": "user-uuid-1" },
      { "type": "group", "id": "group-uuid-1" }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "created": 5,
    "message": "Notice sent to 5 recipients"
  }
}
```

### 4. Get Unread Notice Count

```bash
curl -X GET http://localhost:3000/api/notices/unread-count \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### 5. Create Calendar Event (Admin)

```bash
curl -X POST http://localhost:3000/api/calendar/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Parent-Teacher Meeting",
    "description": "Annual parent-teacher conference",
    "date": "2024-03-15T10:00:00.000Z"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Parent-Teacher Meeting",
    "description": "Annual parent-teacher conference",
    "date": "2024-03-15T10:00:00.000Z",
    "authorId": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 6. Create User (Admin)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "password": "SecurePass123",
    "role": "user"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Jane",
    "lastName": "Smith",
    "email": "jane.smith@example.com",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 7. Password Reset Flow

**Step 1: Request password reset**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**Step 2: Reset password with token (from email)**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset-token-from-email",
    "newPassword": "NewSecurePass123"
  }'
```

### Error Response Example

```json
{
  "success": false,
  "message": "Invalid email or password",
  "code": "AUTH_1001",
  "status": 401
}
```

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Tests with Coverage

```bash
npm run test:coverage
```

Coverage report will be generated in the `coverage/` directory.

### Test Structure

```
tests/
├── unit/              # Unit tests for services, utilities
└── integration/       # Integration tests for API endpoints
```

## Deployment

### Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Generate strong `JWT_SECRET` (min 32 characters)
- [ ] Use secure database password
- [ ] Configure proper `CORS_ORIGIN` for your domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure email service (SMTP)
- [ ] Set up automated database backups
- [ ] Configure log rotation
- [ ] Set up monitoring and health checks
- [ ] Review and adjust rate limiting settings
- [ ] Enable firewall rules

### Deployment Options

#### Option 1: Docker Deployment (Recommended)

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment instructions.

Quick start:
```bash
# Set production environment variables
cp .env.docker .env
# Edit .env with production values

# Build and start
docker-compose up -d --build

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

#### Option 2: Traditional Deployment

1. **Build the application**:
```bash
npm run build
```

2. **Set up PostgreSQL database**

3. **Configure environment variables**

4. **Run migrations**:
```bash
npx prisma migrate deploy
```

5. **Start the server**:
```bash
npm start
```

#### Option 3: Platform as a Service (PaaS)

Deploy to platforms like:
- **Heroku**: Use Heroku Postgres add-on
- **Railway**: Automatic PostgreSQL provisioning
- **Render**: Built-in PostgreSQL support
- **DigitalOcean App Platform**: Managed databases

### Environment-Specific Configuration

**Development**:
```env
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

**Production**:
```env
NODE_ENV=production
LOG_LEVEL=info
CORS_ORIGIN=https://yourdomain.com
API_BASE_URL=https://api.yourdomain.com
```

### Database Backups

**Manual backup**:
```bash
pg_dump -U username -d aspa_db > backup_$(date +%Y%m%d).sql
```

**Automated backup** (add to crontab):
```bash
0 2 * * * pg_dump -U username -d aspa_db > /backups/aspa_$(date +\%Y\%m\%d).sql
```

**Docker backup**:
```bash
docker-compose exec postgres pg_dump -U aspa_user aspa_db > backup.sql
```

### Monitoring

Monitor the health endpoint:
```bash
curl https://api.yourdomain.com/health
```

Set up monitoring with tools like:
- **Uptime monitoring**: UptimeRobot, Pingdom
- **Application monitoring**: New Relic, Datadog
- **Log aggregation**: Loggly, Papertrail
- **Error tracking**: Sentry

## Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database connection
│   │   ├── index.ts         # Config exports
│   │   └── swagger.ts       # Swagger/OpenAPI config
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── news.controller.ts
│   │   ├── notice.controller.ts
│   │   ├── calendar.controller.ts
│   │   ├── group.controller.ts
│   │   └── index.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── news.service.ts
│   │   ├── notice.service.ts
│   │   ├── calendar.service.ts
│   │   ├── group.service.ts
│   │   ├── email.service.ts
│   │   └── index.ts
│   ├── repositories/        # Data access layer
│   │   ├── user.repository.ts
│   │   ├── news.repository.ts
│   │   ├── notice.repository.ts
│   │   ├── calendar.repository.ts
│   │   ├── group.repository.ts
│   │   ├── password-reset.repository.ts
│   │   └── index.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   ├── pagination.util.ts
│   │   ├── response.util.ts
│   │   └── index.ts
│   ├── validators/          # Zod validation schemas
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── news.validator.ts
│   │   ├── notice.validator.ts
│   │   ├── calendar.validator.ts
│   │   ├── group.validator.ts
│   │   └── index.ts
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── news.routes.ts
│   │   ├── notice.routes.ts
│   │   ├── calendar.routes.ts
│   │   ├── group.routes.ts
│   │   └── index.ts
│   ├── docs/                # API documentation (YAML)
│   │   ├── auth.yaml
│   │   ├── users.yaml
│   │   ├── news.yaml
│   │   ├── notices.yaml
│   │   ├── calendar.yaml
│   │   └── groups.yaml
│   ├── app.ts               # Express app setup
│   ├── server.ts            # Server entry point
│   └── index.ts             # Main entry point
├── prisma/                  # Prisma ORM
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Database seeding script
│   └── migrations/          # Database migrations
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   └── integration/         # Integration tests
├── dist/                    # Build output (generated)
├── node_modules/            # Dependencies (generated)
├── .env                     # Environment variables (not in git)
├── .env.example             # Environment template
├── .env.docker              # Docker environment template
├── .env.production.example  # Production environment template
├── .gitignore               # Git ignore rules
├── .dockerignore            # Docker ignore rules
├── Dockerfile               # Docker image definition
├── docker-compose.yml       # Docker services configuration
├── package.json             # NPM dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── jest.config.js           # Jest test configuration
├── nodemon.json             # Nodemon configuration
├── README.md                # This file
└── DOCKER.md                # Docker deployment guide
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Error**: `Can't reach database server`

**Solutions**:
- Check if PostgreSQL is running: `pg_isready`
- Verify `DATABASE_URL` in `.env`
- Check PostgreSQL logs
- Ensure database exists: `createdb aspa_db`

#### 2. Migration Errors

**Error**: `Migration failed`

**Solutions**:
```bash
# Check migration status
npx prisma migrate status

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Apply migrations manually
npx prisma migrate deploy
```

#### 3. JWT Token Errors

**Error**: `Token expired or invalid`

**Solutions**:
- Check if `JWT_SECRET` is set correctly
- Verify token hasn't expired
- Ensure token is sent in `Authorization: Bearer <token>` header
- Generate new token by logging in again

#### 4. Email Not Sending

**Error**: `Email service error`

**Solutions**:
- Verify SMTP credentials in `.env`
- For Gmail: Use App Password, not regular password
- Check SMTP port and security settings
- Test SMTP connection manually

#### 5. Port Already in Use

**Error**: `Port 3000 is already in use`

**Solutions**:
```bash
# Find process using port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### 6. Prisma Client Not Generated

**Error**: `Cannot find module '@prisma/client'`

**Solution**:
```bash
npm run prisma:generate
```

#### 7. CORS Errors

**Error**: `CORS policy blocked`

**Solutions**:
- Add frontend URL to `CORS_ORIGIN` in `.env`
- Ensure `CORS_CREDENTIALS=true` if using cookies
- Check that frontend sends correct origin header

### Docker-Specific Issues

See [DOCKER.md](./DOCKER.md) for Docker troubleshooting.

### Getting Help

1. Check the logs: `npm run dev` or `docker-compose logs -f backend`
2. Review environment variables in `.env`
3. Check API documentation at `/api/docs`
4. Review Prisma schema and migrations
5. Check database connection and data

## License

MIT

---

**Documentation Version**: 1.0.0  
**Last Updated**: 2024-01-01  
**API Version**: 1.0.0
