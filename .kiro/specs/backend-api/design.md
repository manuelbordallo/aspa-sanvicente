# Design Document - Backend API

## Overview

La API backend será construida como una aplicación Node.js con Express, utilizando TypeScript para type safety. Implementará una arquitectura en capas (Controller → Service → Repository) con PostgreSQL como base de datos principal. La autenticación se manejará mediante JWT tokens y bcrypt para hashing de contraseñas.

### Technology Stack

- **Runtime**: Node.js 18+ con TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest
- **Email**: Nodemailer
- **Environment**: dotenv

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         HTTP Layer (Express)        │
│  - CORS, Body Parser, Error Handler │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Middleware Layer               │
│  - Authentication                   │
│  - Authorization (Role-based)       │
│  - Request Validation               │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Controller Layer               │
│  - Request/Response handling        │
│  - Input validation                 │
│  - HTTP status codes                │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Service Layer                  │
│  - Business logic                   │
│  - Data transformation              │
│  - Transaction management           │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Repository Layer               │
│  - Database operations (Prisma)     │
│  - Query building                   │
│  - Data access                      │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│      Database (PostgreSQL)          │
└─────────────────────────────────────┘
```

### Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # Database connection
│   │   ├── jwt.ts           # JWT configuration
│   │   └── email.ts         # Email configuration
│   ├── controllers/         # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── news.controller.ts
│   │   ├── notice.controller.ts
│   │   ├── calendar.controller.ts
│   │   └── group.controller.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── news.service.ts
│   │   ├── notice.service.ts
│   │   ├── calendar.service.ts
│   │   ├── group.service.ts
│   │   └── email.service.ts
│   ├── repositories/        # Data access
│   │   ├── user.repository.ts
│   │   ├── news.repository.ts
│   │   ├── notice.repository.ts
│   │   ├── calendar.repository.ts
│   │   └── group.repository.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── models/              # TypeScript interfaces/types
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   ├── pagination.util.ts
│   │   └── response.util.ts
│   ├── validators/          # Zod schemas
│   │   ├── auth.validator.ts
│   │   ├── user.validator.ts
│   │   ├── news.validator.ts
│   │   ├── notice.validator.ts
│   │   └── calendar.validator.ts
│   ├── routes/              # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   ├── news.routes.ts
│   │   ├── notice.routes.ts
│   │   ├── calendar.routes.ts
│   │   ├── group.routes.ts
│   │   └── index.ts
│   ├── prisma/              # Prisma ORM
│   │   └── schema.prisma    # Database schema
│   ├── docs/                # API documentation
│   │   └── swagger.ts       # Swagger configuration
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Test files
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Components and Interfaces

### 1. Authentication System

#### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  iat: number;  // Issued at
  exp: number;  // Expiration
}
```

#### Auth Middleware
```typescript
// Validates JWT token and attaches user to request
interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
}
```

#### Password Reset Token
```typescript
interface PasswordResetToken {
  userId: string;
  token: string;  // Random UUID
  expiresAt: Date;
  used: boolean;
}
```

### 2. API Response Format

#### Success Response
```typescript
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}
```

#### Error Response
```typescript
interface ApiError {
  success: false;
  message: string;
  code: string;
  status: number;
  details?: any;
}
```

#### Paginated Response
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### 3. Core Entities

#### User Entity
```typescript
interface User {
  id: string;              // UUID
  firstName: string;
  lastName: string;
  email: string;           // Unique
  password: string;        // Bcrypt hash
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### News Entity
```typescript
interface News {
  id: string;              // UUID
  title: string;
  content: string;         // Rich text/HTML
  summary: string;
  authorId: string;        // Foreign key to User
  createdAt: Date;
  updatedAt: Date;
}
```

#### Notice Entity
```typescript
interface Notice {
  id: string;              // UUID
  content: string;
  authorId: string;        // Foreign key to User
  recipientId: string;     // Foreign key to User
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}
```

#### Calendar Event Entity
```typescript
interface CalendarEvent {
  id: string;              // UUID
  title: string;
  description: string;
  date: Date;
  authorId: string;        // Foreign key to User
  createdAt: Date;
}
```

#### User Group Entity
```typescript
interface UserGroup {
  id: string;              // UUID
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserGroupMember {
  groupId: string;         // Foreign key to UserGroup
  userId: string;          // Foreign key to User
  addedAt: Date;
}
```

## Data Models

### Database Schema (Prisma)

```prisma
model User {
  id            String   @id @default(uuid())
  firstName     String
  lastName      String
  email         String   @unique
  password      String
  role          Role     @default(USER)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  // Relations
  newsCreated       News[]
  noticesSent       Notice[]  @relation("NoticeAuthor")
  noticesReceived   Notice[]  @relation("NoticeRecipient")
  eventsCreated     CalendarEvent[]
  groupMemberships  UserGroupMember[]
  passwordResets    PasswordResetToken[]
}

model News {
  id        String   @id @default(uuid())
  title     String
  content   String   @db.Text
  summary   String
  authorId  String
  author    User     @relation(fields: [authorId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([authorId])
  @@index([createdAt])
}

model Notice {
  id          String   @id @default(uuid())
  content     String   @db.Text
  authorId    String
  author      User     @relation("NoticeAuthor", fields: [authorId], references: [id])
  recipientId String
  recipient   User     @relation("NoticeRecipient", fields: [recipientId], references: [id])
  isRead      Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())
  
  @@index([recipientId, isRead])
  @@index([authorId])
  @@index([createdAt])
}

model CalendarEvent {
  id          String   @id @default(uuid())
  title       String
  description String   @db.Text
  date        DateTime
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  createdAt   DateTime @default(now())
  
  @@index([date])
  @@index([authorId])
}

model UserGroup {
  id        String   @id @default(uuid())
  name      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  members   UserGroupMember[]
}

model UserGroupMember {
  groupId String
  group   UserGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  userId  String
  user    User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  addedAt DateTime  @default(now())
  
  @@id([groupId, userId])
  @@index([userId])
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
  
  @@index([token])
  @@index([userId])
}

enum Role {
  USER
  ADMIN
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login with email/password |
| POST | `/api/auth/logout` | Yes | Logout (optional server-side tracking) |
| POST | `/api/auth/refresh` | Yes | Refresh JWT token |
| GET | `/api/auth/validate` | Yes | Validate current token |
| POST | `/api/auth/forgot-password` | No | Request password reset |
| POST | `/api/auth/reset-password` | No | Reset password with token |
| POST | `/api/auth/change-password` | Yes | Change password (authenticated) |
| GET | `/api/auth/profile` | Yes | Get current user profile |
| PUT | `/api/auth/profile` | Yes | Update current user profile |

### User Management Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/users` | Yes | Admin | List all users (paginated) |
| GET | `/api/users/:id` | Yes | Admin | Get user by ID |
| POST | `/api/users` | Yes | Admin | Create new user |
| PUT | `/api/users/:id` | Yes | Admin | Update user |
| DELETE | `/api/users/:id` | Yes | Admin | Deactivate user |

### News Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/news` | Yes | All | List news (paginated, filtered) |
| GET | `/api/news/:id` | Yes | All | Get news by ID |
| POST | `/api/news` | Yes | Admin | Create news |
| PUT | `/api/news/:id` | Yes | Admin | Update news |
| DELETE | `/api/news/:id` | Yes | Admin | Delete news |

### Notice Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/notices` | Yes | All | List received notices (paginated) |
| GET | `/api/notices/sent` | Yes | All | List sent notices |
| GET | `/api/notices/unread-count` | Yes | All | Get unread count |
| GET | `/api/notices/recipients` | Yes | All | Get available recipients |
| GET | `/api/notices/:id` | Yes | All | Get notice by ID |
| POST | `/api/notices` | Yes | All | Create notice |
| PATCH | `/api/notices/:id/read` | Yes | All | Mark as read |
| PATCH | `/api/notices/:id/unread` | Yes | All | Mark as unread |
| PATCH | `/api/notices/mark-all-read` | Yes | All | Mark all as read |
| DELETE | `/api/notices/:id` | Yes | All | Delete notice (author only) |

### Calendar Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/calendar/events` | Yes | All | List events (paginated, filtered) |
| GET | `/api/calendar/events/:id` | Yes | All | Get event by ID |
| POST | `/api/calendar/events` | Yes | Admin | Create event |
| PUT | `/api/calendar/events/:id` | Yes | Admin | Update event |
| DELETE | `/api/calendar/events/:id` | Yes | Admin | Delete event |

### User Group Endpoints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/groups` | Yes | Admin | List all groups |
| GET | `/api/groups/:id` | Yes | Admin | Get group by ID |
| POST | `/api/groups` | Yes | Admin | Create group |
| PUT | `/api/groups/:id` | Yes | Admin | Update group |
| DELETE | `/api/groups/:id` | Yes | Admin | Delete group |

## Error Handling

### Error Codes

```typescript
enum ErrorCode {
  // Authentication errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  TOKEN_INVALID = 'AUTH_1003',
  UNAUTHORIZED = 'AUTH_1004',
  
  // Authorization errors (2xxx)
  FORBIDDEN = 'AUTHZ_2001',
  INSUFFICIENT_PERMISSIONS = 'AUTHZ_2002',
  
  // Validation errors (3xxx)
  VALIDATION_ERROR = 'VAL_3001',
  INVALID_EMAIL = 'VAL_3002',
  WEAK_PASSWORD = 'VAL_3003',
  DUPLICATE_EMAIL = 'VAL_3004',
  
  // Resource errors (4xxx)
  NOT_FOUND = 'RES_4001',
  ALREADY_EXISTS = 'RES_4002',
  
  // Server errors (5xxx)
  INTERNAL_ERROR = 'SRV_5001',
  DATABASE_ERROR = 'SRV_5002',
  EMAIL_ERROR = 'SRV_5003',
}
```

### Error Handler Middleware

```typescript
// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error
  logger.error(err);
  
  // Determine status code
  const status = err.statusCode || 500;
  
  // Send error response
  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    code: err.code || ErrorCode.INTERNAL_ERROR,
    status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

## Testing Strategy

### Unit Tests
- Test individual functions in services and utilities
- Mock database calls using Prisma mock
- Test password hashing, JWT generation, validation logic
- Target: 80% code coverage

### Integration Tests
- Test complete API endpoints with real database (test DB)
- Test authentication flow
- Test CRUD operations for all entities
- Test pagination and filtering
- Test error scenarios

### Test Structure
```typescript
describe('Auth Service', () => {
  describe('login', () => {
    it('should return JWT token for valid credentials', async () => {
      // Test implementation
    });
    
    it('should throw error for invalid credentials', async () => {
      // Test implementation
    });
  });
});
```

## Security Considerations

### Password Security
- Use bcrypt with salt rounds of 12
- Enforce minimum password length of 8 characters
- Require mix of letters and numbers

### JWT Security
- Use strong secret key (minimum 256 bits)
- Set reasonable expiration (1 hour for access token)
- Implement refresh token mechanism
- Store tokens securely on client (httpOnly cookies or localStorage with XSS protection)

### API Security
- Implement rate limiting (express-rate-limit)
- Use helmet.js for security headers
- Validate and sanitize all inputs
- Use parameterized queries (Prisma handles this)
- Implement CORS with whitelist

### Database Security
- Use environment variables for credentials
- Implement connection pooling
- Use prepared statements (Prisma)
- Regular backups

## Performance Optimization

### Database Optimization
- Add indexes on frequently queried fields (userId, createdAt, date)
- Use pagination for all list endpoints
- Implement database connection pooling
- Use SELECT only needed fields

### Caching Strategy
- Cache user sessions in Redis (optional)
- Cache frequently accessed data (user profiles)
- Implement ETags for conditional requests

### Query Optimization
- Use Prisma's include/select for efficient joins
- Implement cursor-based pagination for large datasets
- Batch database operations where possible

## Deployment Considerations

### Environment Variables
```env
# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/aspa_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@aspa-sanvicente.com

# CORS
CORS_ORIGIN=http://localhost:3000,https://your-frontend-domain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Docker Support
- Create Dockerfile for Node.js application
- Use docker-compose for local development with PostgreSQL
- Multi-stage build for production

### Health Checks
- Implement `/health` endpoint for monitoring
- Check database connectivity
- Return service status and version

## Documentation

### Swagger/OpenAPI
- Auto-generate API documentation
- Include request/response examples
- Document authentication requirements
- Provide interactive API testing interface

### README
- Setup instructions
- Environment variable documentation
- Development workflow
- Deployment guide
- API endpoint summary
