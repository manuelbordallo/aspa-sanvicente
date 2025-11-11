# Implementation Plan

- [x] 1. Initialize project structure and dependencies
  - Create backend directory with TypeScript configuration
  - Install core dependencies: express, typescript, prisma, bcrypt, jsonwebtoken, zod, cors, helmet, dotenv
  - Install dev dependencies: jest, supertest, ts-node, nodemon, @types packages
  - Configure tsconfig.json with strict mode and ES modules
  - Create .env.example with all required environment variables
  - Set up package.json scripts for dev, build, test, and prisma commands
  - _Requirements: 1.1, 1.5_

- [-] 2. Set up Prisma and database schema
  - Initialize Prisma with PostgreSQL provider
  - Create complete Prisma schema with User, News, Notice, CalendarEvent, UserGroup, UserGroupMember, and PasswordResetToken models
  - Define all relationships, indexes, and constraints in schema
  - Create initial migration for database schema
  - Generate Prisma Client
  - _Requirements: 1.1, 3.6, 5.6, 6.7, 7.6, 10.5_

- [ ] 3. Implement core utilities and helpers
- [ ] 3.1 Create JWT utility functions
  - Write generateToken function to create JWT with user payload
  - Write verifyToken function to validate and decode JWT
  - Write generateRefreshToken function for refresh tokens
  - _Requirements: 2.1, 2.4, 2.6_

- [ ] 3.2 Create password utility functions
  - Write hashPassword function using bcrypt with 12 salt rounds
  - Write comparePassword function to verify passwords
  - Write validatePasswordStrength function requiring 8+ chars with letters and numbers
  - _Requirements: 3.2, 4.5_

- [ ] 3.3 Create pagination utility
  - Write buildPaginationParams function to parse page, limit, sortBy, sortOrder from query
  - Write buildPaginationResponse function to format paginated results with metadata
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 3.4 Create response utility functions
  - Write successResponse function to format success responses
  - Write errorResponse function to format error responses
  - Write paginatedResponse function to format paginated responses
  - _Requirements: 1.2, 1.3, 8.1_

- [ ] 4. Implement validation schemas with Zod
- [ ] 4.1 Create auth validation schemas
  - Write loginSchema for email and password validation
  - Write changePasswordSchema for current and new password validation
  - Write forgotPasswordSchema for email validation
  - Write resetPasswordSchema for token and new password validation
  - _Requirements: 2.1, 2.2, 4.3, 4.4, 11.1, 11.3_

- [ ] 4.2 Create user validation schemas
  - Write createUserSchema with firstName, lastName, email, password, role validation
  - Write updateUserSchema with optional fields validation
  - Write email uniqueness validation
  - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [ ] 4.3 Create news validation schemas
  - Write createNewsSchema with title, content, summary validation
  - Write updateNewsSchema with optional fields validation
  - _Requirements: 5.2, 5.3_

- [ ] 4.4 Create notice validation schemas
  - Write createNoticeSchema with content and recipients array validation
  - Validate recipients are valid user or group IDs
  - _Requirements: 6.2_

- [ ] 4.5 Create calendar validation schemas
  - Write createEventSchema with title, description, date validation
  - Write updateEventSchema with optional fields validation
  - Validate date is valid Date object
  - _Requirements: 7.2, 7.3_

- [ ] 4.6 Create group validation schemas
  - Write createGroupSchema with name and userIds array validation
  - Write updateGroupSchema with optional fields validation
  - _Requirements: 10.1, 10.3_

- [ ] 5. Implement middleware components
- [ ] 5.1 Create authentication middleware
  - Write authenticateToken middleware to extract and verify JWT from Authorization header
  - Attach decoded user information to request object
  - Return 401 error for missing, expired, or invalid tokens
  - _Requirements: 2.3, 2.4, 2.5_

- [ ] 5.2 Create role-based authorization middleware
  - Write requireAdmin middleware to check if user has admin role
  - Return 403 error for non-admin users
  - _Requirements: 3.5, 5.5, 7.5_

- [ ] 5.3 Create validation middleware
  - Write validateRequest middleware to validate request body against Zod schema
  - Return 400 error with field-level validation errors
  - _Requirements: 8.2, 9.5_

- [ ] 5.4 Create error handling middleware
  - Write global error handler to catch all errors
  - Format errors with consistent structure (message, code, status)
  - Log errors with stack traces
  - Return appropriate HTTP status codes
  - _Requirements: 1.3, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 6. Implement repository layer for data access
- [ ] 6.1 Create user repository
  - Write findById to get user by ID with Prisma
  - Write findByEmail to get user by email
  - Write findAll with pagination, filtering, and sorting
  - Write create to insert new user
  - Write update to modify user data
  - Write deactivate to set isActive to false
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 6.2 Create news repository
  - Write findAll with pagination, date filtering, search, and sorting
  - Write findById to get news by ID with author relation
  - Write create to insert new news with authorId
  - Write update to modify news data
  - Write delete to remove news record
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.3 Create notice repository
  - Write findByRecipient with pagination and read/unread filtering
  - Write findByAuthor to get sent notices
  - Write findById to get notice by ID
  - Write create to insert notice records for each recipient
  - Write markAsRead to update isRead and readAt
  - Write markAsUnread to reset read status
  - Write markAllAsRead for a specific user
  - Write countUnread for a specific user
  - Write delete to remove notice
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 6.4 Create calendar repository
  - Write findAll with pagination, date range filtering, search, and sorting
  - Write findById to get event by ID with author relation
  - Write findByDateRange to get events between dates
  - Write create to insert new event with authorId
  - Write update to modify event data
  - Write delete to remove event record
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 6.5 Create group repository
  - Write findAll to get all groups with members
  - Write findById to get group by ID with members
  - Write create to insert group and member relations
  - Write update to modify group name and members
  - Write delete to remove group and cascade member relations
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 6.6 Create password reset repository
  - Write create to insert password reset token
  - Write findByToken to get reset token record
  - Write markAsUsed to set used flag to true
  - Write deleteExpired to clean up old tokens
  - _Requirements: 11.1, 11.3, 11.5_

- [ ] 7. Implement service layer with business logic
- [ ] 7.1 Create auth service
  - Write login method to validate credentials, generate JWT, and return user with token
  - Write validateToken method to verify JWT and return user data
  - Write refreshToken method to generate new JWT from valid refresh token
  - Write changePassword method to validate current password and update with new hashed password
  - Write requestPasswordReset method to generate reset token and send email
  - Write resetPassword method to validate token and update password
  - _Requirements: 2.1, 2.2, 2.6, 2.7, 4.3, 4.4, 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 7.2 Create user service
  - Write getUsers method with pagination and filtering
  - Write getUserById method
  - Write createUser method with email uniqueness check and password hashing
  - Write updateUser method with validation
  - Write deactivateUser method
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [ ] 7.3 Create news service
  - Write getNews method with pagination, date filtering, and search
  - Write getNewsById method
  - Write createNews method with authorId from authenticated user
  - Write updateNews method with ownership validation
  - Write deleteNews method
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6_

- [ ] 7.4 Create notice service
  - Write getNotices method for recipient with pagination and filtering
  - Write getSentNotices method for author
  - Write getUnreadCount method
  - Write createNotice method to create individual notices for each recipient (expand groups to users)
  - Write markAsRead method
  - Write markAsUnread method
  - Write markAllAsRead method
  - Write deleteNotice method with ownership check
  - Write getRecipients method to return users and groups
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 10.5_

- [ ] 7.5 Create calendar service
  - Write getEvents method with pagination, date filtering, and search
  - Write getEventById method
  - Write createEvent method with authorId from authenticated user
  - Write updateEvent method with ownership validation
  - Write deleteEvent method
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [ ] 7.6 Create group service
  - Write getGroups method to list all groups with members
  - Write getGroupById method
  - Write createGroup method with name and member user IDs
  - Write updateGroup method to modify name and members
  - Write deleteGroup method
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 7.7 Create email service
  - Write sendPasswordResetEmail method with reset link
  - Configure nodemailer with SMTP settings from environment
  - Create email templates for password reset
  - _Requirements: 11.1_

- [ ] 8. Implement controller layer for request handling
- [ ] 8.1 Create auth controller
  - Write login handler to call auth service and return token
  - Write logout handler (optional tracking)
  - Write validateToken handler
  - Write refreshToken handler
  - Write changePassword handler
  - Write getProfile handler to return current user
  - Write updateProfile handler to update current user
  - Write forgotPassword handler
  - Write resetPassword handler
  - Handle errors and return appropriate status codes
  - _Requirements: 2.1, 2.2, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 11.1, 11.3_

- [ ] 8.2 Create user controller
  - Write getUsers handler with pagination query params
  - Write getUserById handler
  - Write createUser handler
  - Write updateUser handler
  - Write deleteUser handler (deactivate)
  - Handle errors and return appropriate status codes
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 8.3 Create news controller
  - Write getNews handler with pagination and filter query params
  - Write getNewsById handler
  - Write createNews handler
  - Write updateNews handler
  - Write deleteNews handler
  - Handle errors and return appropriate status codes
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 8.4 Create notice controller
  - Write getNotices handler with pagination and filter query params
  - Write getSentNotices handler
  - Write getUnreadCount handler
  - Write getRecipients handler
  - Write getNoticeById handler
  - Write createNotice handler
  - Write markAsRead handler
  - Write markAsUnread handler
  - Write markAllAsRead handler
  - Write deleteNotice handler
  - Handle errors and return appropriate status codes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 8.5 Create calendar controller
  - Write getEvents handler with pagination and filter query params
  - Write getEventById handler
  - Write createEvent handler
  - Write updateEvent handler
  - Write deleteEvent handler
  - Handle errors and return appropriate status codes
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 8.6 Create group controller
  - Write getGroups handler
  - Write getGroupById handler
  - Write createGroup handler
  - Write updateGroup handler
  - Write deleteGroup handler
  - Handle errors and return appropriate status codes
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9. Set up routing and API structure
- [ ] 9.1 Create auth routes
  - Define POST /api/auth/login route with validation middleware
  - Define POST /api/auth/logout route with auth middleware
  - Define POST /api/auth/refresh route with auth middleware
  - Define GET /api/auth/validate route with auth middleware
  - Define POST /api/auth/forgot-password route with validation middleware
  - Define POST /api/auth/reset-password route with validation middleware
  - Define POST /api/auth/change-password route with auth and validation middleware
  - Define GET /api/auth/profile route with auth middleware
  - Define PUT /api/auth/profile route with auth and validation middleware
  - _Requirements: 2.1, 2.6, 2.7, 4.1, 4.2, 4.3, 4.4, 11.1, 11.3_

- [ ] 9.2 Create user routes
  - Define GET /api/users route with auth and requireAdmin middleware
  - Define GET /api/users/:id route with auth and requireAdmin middleware
  - Define POST /api/users route with auth, requireAdmin, and validation middleware
  - Define PUT /api/users/:id route with auth, requireAdmin, and validation middleware
  - Define DELETE /api/users/:id route with auth and requireAdmin middleware
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 9.3 Create news routes
  - Define GET /api/news route with auth middleware
  - Define GET /api/news/:id route with auth middleware
  - Define POST /api/news route with auth, requireAdmin, and validation middleware
  - Define PUT /api/news/:id route with auth, requireAdmin, and validation middleware
  - Define DELETE /api/news/:id route with auth and requireAdmin middleware
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 9.4 Create notice routes
  - Define GET /api/notices route with auth middleware
  - Define GET /api/notices/sent route with auth middleware
  - Define GET /api/notices/unread-count route with auth middleware
  - Define GET /api/notices/recipients route with auth middleware
  - Define GET /api/notices/:id route with auth middleware
  - Define POST /api/notices route with auth and validation middleware
  - Define PATCH /api/notices/:id/read route with auth middleware
  - Define PATCH /api/notices/:id/unread route with auth middleware
  - Define PATCH /api/notices/mark-all-read route with auth middleware
  - Define DELETE /api/notices/:id route with auth middleware
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 9.5 Create calendar routes
  - Define GET /api/calendar/events route with auth middleware
  - Define GET /api/calendar/events/:id route with auth middleware
  - Define POST /api/calendar/events route with auth, requireAdmin, and validation middleware
  - Define PUT /api/calendar/events/:id route with auth, requireAdmin, and validation middleware
  - Define DELETE /api/calendar/events/:id route with auth and requireAdmin middleware
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 9.6 Create group routes
  - Define GET /api/groups route with auth and requireAdmin middleware
  - Define GET /api/groups/:id route with auth and requireAdmin middleware
  - Define POST /api/groups route with auth, requireAdmin, and validation middleware
  - Define PUT /api/groups/:id route with auth, requireAdmin, and validation middleware
  - Define DELETE /api/groups/:id route with auth and requireAdmin middleware
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9.7 Create main router
  - Import and mount all route modules under /api prefix
  - Create health check endpoint at /health
  - _Requirements: 1.1_

- [ ] 10. Configure Express application
  - Create Express app instance
  - Configure CORS with whitelist from environment variable
  - Add helmet middleware for security headers
  - Add express.json() for body parsing
  - Add request logging middleware
  - Mount all routes
  - Add 404 handler for unknown routes
  - Add global error handling middleware
  - _Requirements: 1.1, 1.4, 1.5, 8.1, 8.5_

- [ ] 11. Implement Swagger/OpenAPI documentation
  - Install swagger-ui-express and swagger-jsdoc
  - Create OpenAPI specification with all endpoints documented
  - Document request/response schemas for each endpoint
  - Document authentication requirements
  - Add example requests and responses
  - Mount Swagger UI at /api/docs endpoint
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 12. Create database seeding script
  - Write seed script to create initial admin user
  - Create sample users, news, events for development
  - Add script to package.json as npm run seed
  - _Requirements: 3.2_

- [ ] 13. Set up development and production configurations
  - Create .env.example with all required variables documented
  - Configure different settings for development and production
  - Set up database connection with connection pooling
  - Configure JWT secret and expiration times
  - Configure email SMTP settings
  - Configure CORS origins
  - _Requirements: 1.1, 1.4_

- [ ] 14. Create server entry point
  - Write server.ts to start Express server
  - Connect to database using Prisma
  - Start listening on configured port
  - Add graceful shutdown handling
  - Log server startup information
  - _Requirements: 1.1, 1.5_

- [ ] 15. Add Docker support
  - Create Dockerfile with multi-stage build for Node.js app
  - Create docker-compose.yml with PostgreSQL and app services
  - Configure environment variables for Docker
  - Add docker commands to README
  - _Requirements: 1.1_

- [ ] 16. Write comprehensive README
  - Document project setup and installation steps
  - Document all environment variables
  - Document API endpoints summary with links to Swagger
  - Document development workflow (dev, build, test, migrate)
  - Document deployment instructions
  - Add examples of common API calls
  - _Requirements: 12.1, 12.2, 12.3_

- [ ] 17. Write integration tests
- [ ] 17.1 Write auth integration tests
  - Test login with valid and invalid credentials
  - Test token validation and refresh
  - Test password reset flow
  - Test profile update
  - _Requirements: 2.1, 2.2, 2.6, 2.7, 4.3, 4.4, 11.1, 11.3_

- [ ] 17.2 Write user management integration tests
  - Test user CRUD operations with admin role
  - Test authorization (non-admin cannot access)
  - Test email uniqueness validation
  - Test pagination and filtering
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 17.3 Write news integration tests
  - Test news CRUD operations
  - Test pagination, filtering, and search
  - Test authorization (only admin can create/update/delete)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 17.4 Write notice integration tests
  - Test notice creation with individual recipients and groups
  - Test marking as read/unread
  - Test unread count
  - Test sent notices retrieval
  - Test pagination and filtering
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 17.5 Write calendar integration tests
  - Test event CRUD operations
  - Test date range filtering
  - Test authorization (only admin can create/update/delete)
  - Test pagination and search
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 17.6 Write group integration tests
  - Test group CRUD operations
  - Test member management
  - Test authorization (only admin can manage groups)
  - _Requirements: 10.1, 10.2, 10.3, 10.4_
