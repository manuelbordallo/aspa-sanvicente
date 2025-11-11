# Requirements Document

## Introduction

Este documento define los requisitos para una API REST backend que gestione la información necesaria para la aplicación frontend aspa-sanvicente. El sistema debe proporcionar autenticación segura, gestión de usuarios, noticias, avisos y eventos de calendario, con soporte para diferentes roles de usuario y operaciones CRUD completas.

## Glossary

- **Backend API**: Sistema servidor que expone endpoints REST para gestionar datos de la aplicación
- **JWT**: JSON Web Token, mecanismo de autenticación basado en tokens
- **CRUD**: Create, Read, Update, Delete - operaciones básicas de gestión de datos
- **Admin**: Usuario con permisos administrativos completos
- **User**: Usuario estándar con permisos limitados
- **Notice**: Aviso o comunicado dirigido a usuarios específicos o grupos
- **News**: Noticia o artículo informativo visible para todos los usuarios
- **Calendar Event**: Evento programado en el calendario escolar
- **User Group**: Agrupación de usuarios para facilitar el envío de avisos
- **Pagination**: Sistema de división de resultados en páginas
- **Authentication Middleware**: Componente que valida tokens JWT en cada petición protegida

## Requirements

### Requirement 1

**User Story:** Como desarrollador del frontend, quiero una API REST completa para gestionar todos los datos de la aplicación, para que el frontend pueda funcionar sin servicios mock.

#### Acceptance Criteria

1. THE Backend API SHALL expose RESTful endpoints for authentication, users, news, notices, and calendar events
2. THE Backend API SHALL return responses in JSON format with consistent structure including data, success flag, and optional message fields
3. THE Backend API SHALL implement proper HTTP status codes for all responses (200 for success, 201 for creation, 400 for bad request, 401 for unauthorized, 404 for not found, 500 for server errors)
4. THE Backend API SHALL support CORS configuration to allow requests from the frontend application
5. THE Backend API SHALL log all incoming requests with timestamp, method, endpoint, and response status

### Requirement 2

**User Story:** Como usuario de la aplicación, quiero poder autenticarme de forma segura, para que solo yo pueda acceder a mi cuenta y datos personales.

#### Acceptance Criteria

1. WHEN a user submits valid email and password credentials, THE Backend API SHALL return a JWT token with user information and expiration time
2. WHEN a user submits invalid credentials, THE Backend API SHALL return a 401 status with an error message
3. THE Backend API SHALL validate JWT tokens on all protected endpoints using Authentication Middleware
4. WHEN a valid JWT token is provided in the Authorization header, THE Backend API SHALL extract user information and attach it to the request context
5. WHEN an expired or invalid token is provided, THE Backend API SHALL return a 401 status with token expired message
6. THE Backend API SHALL provide an endpoint to refresh JWT tokens before expiration
7. THE Backend API SHALL provide an endpoint to validate current token and return updated user information

### Requirement 3

**User Story:** Como administrador, quiero gestionar usuarios del sistema, para que pueda crear, modificar y desactivar cuentas según sea necesario.

#### Acceptance Criteria

1. WHEN an Admin requests the user list, THE Backend API SHALL return paginated users with filtering and sorting options
2. WHEN an Admin creates a new user with valid data, THE Backend API SHALL generate a unique ID, hash the password, and return the created user
3. WHEN an Admin updates user information, THE Backend API SHALL validate the data and return the updated user
4. WHEN an Admin deactivates a user, THE Backend API SHALL set the isActive flag to false without deleting the record
5. THE Backend API SHALL prevent non-admin users from accessing user management endpoints by returning 403 status
6. THE Backend API SHALL validate email uniqueness when creating or updating users

### Requirement 4

**User Story:** Como usuario autenticado, quiero gestionar mi perfil personal, para que pueda actualizar mi información y cambiar mi contraseña.

#### Acceptance Criteria

1. WHEN a user requests their profile, THE Backend API SHALL return complete user information excluding password hash
2. WHEN a user updates their profile with valid data, THE Backend API SHALL save changes and return updated information
3. WHEN a user changes password with correct current password, THE Backend API SHALL hash the new password and update the record
4. WHEN a user provides incorrect current password, THE Backend API SHALL return a 400 status with error message
5. THE Backend API SHALL validate password strength requiring minimum 8 characters with letters and numbers

### Requirement 5

**User Story:** Como administrador, quiero gestionar noticias del sistema, para que pueda publicar, editar y eliminar información relevante para todos los usuarios.

#### Acceptance Criteria

1. WHEN any authenticated user requests news, THE Backend API SHALL return paginated news with author information, filtering by date range and search query
2. WHEN an Admin creates news with valid data, THE Backend API SHALL associate it with the authenticated user as author and return the created news
3. WHEN an Admin updates news, THE Backend API SHALL validate ownership or admin role and return updated news
4. WHEN an Admin deletes news, THE Backend API SHALL remove the record and return success confirmation
5. THE Backend API SHALL prevent non-admin users from creating, updating, or deleting news by returning 403 status
6. THE Backend API SHALL automatically set createdAt and updatedAt timestamps for news records

### Requirement 6

**User Story:** Como usuario autenticado, quiero gestionar avisos personales, para que pueda enviar comunicados a usuarios específicos o grupos y ver los avisos que he recibido.

#### Acceptance Criteria

1. WHEN a user requests their notices, THE Backend API SHALL return only notices where the user is a recipient, with pagination and read/unread filtering
2. WHEN a user creates a notice with valid recipients, THE Backend API SHALL create individual notice records for each recipient and return confirmation
3. WHEN a user marks a notice as read, THE Backend API SHALL set isRead to true and record readAt timestamp
4. WHEN a user requests unread count, THE Backend API SHALL return the number of unread notices for that user
5. THE Backend API SHALL provide an endpoint to mark all notices as read for the authenticated user
6. WHEN a user requests sent notices, THE Backend API SHALL return notices where the user is the author
7. THE Backend API SHALL allow notice deletion only by the author or admin users

### Requirement 7

**User Story:** Como administrador, quiero gestionar eventos del calendario escolar, para que pueda programar y comunicar fechas importantes a todos los usuarios.

#### Acceptance Criteria

1. WHEN any authenticated user requests calendar events, THE Backend API SHALL return paginated events with filtering by date range and search query
2. WHEN an Admin creates an event with valid data, THE Backend API SHALL associate it with the authenticated user as author and return the created event
3. WHEN an Admin updates an event, THE Backend API SHALL validate ownership or admin role and return updated event
4. WHEN an Admin deletes an event, THE Backend API SHALL remove the record and return success confirmation
5. THE Backend API SHALL prevent non-admin users from creating, updating, or deleting events by returning 403 status
6. THE Backend API SHALL support querying events by specific date, date range, and month

### Requirement 8

**User Story:** Como desarrollador, quiero que la API maneje errores de forma consistente, para que el frontend pueda mostrar mensajes apropiados a los usuarios.

#### Acceptance Criteria

1. WHEN any error occurs during request processing, THE Backend API SHALL return a JSON response with error message, code, and status
2. WHEN validation fails on input data, THE Backend API SHALL return a 400 status with detailed field-level error information
3. WHEN a database operation fails, THE Backend API SHALL return a 500 status with generic error message without exposing internal details
4. WHEN a requested resource is not found, THE Backend API SHALL return a 404 status with descriptive message
5. THE Backend API SHALL log all errors with stack traces for debugging purposes

### Requirement 9

**User Story:** Como desarrollador, quiero que la API soporte paginación en todas las listas, para que el frontend pueda manejar grandes volúmenes de datos eficientemente.

#### Acceptance Criteria

1. WHEN a paginated endpoint receives page and limit parameters, THE Backend API SHALL return results for the specified page with the requested limit
2. THE Backend API SHALL include pagination metadata in responses with total count, current page, limit, hasNext, and hasPrev flags
3. THE Backend API SHALL default to page 1 and limit 10 when pagination parameters are not provided
4. THE Backend API SHALL support sortBy and sortOrder parameters for customizable result ordering
5. THE Backend API SHALL validate pagination parameters and return 400 status for invalid values

### Requirement 10

**User Story:** Como administrador del sistema, quiero gestionar grupos de usuarios, para que pueda enviar avisos a múltiples usuarios simultáneamente.

#### Acceptance Criteria

1. WHEN an Admin creates a user group with name and user IDs, THE Backend API SHALL create the group and return confirmation
2. WHEN an Admin requests user groups, THE Backend API SHALL return all groups with member information
3. WHEN an Admin updates a group, THE Backend API SHALL modify membership and return updated group
4. WHEN an Admin deletes a group, THE Backend API SHALL remove the group without affecting member users
5. THE Backend API SHALL support using group IDs as recipients when creating notices

### Requirement 11

**User Story:** Como usuario, quiero recuperar mi contraseña si la olvido, para que pueda volver a acceder a mi cuenta de forma segura.

#### Acceptance Criteria

1. WHEN a user requests password reset with valid email, THE Backend API SHALL generate a unique reset token and send it via email
2. THE Backend API SHALL set reset token expiration to 1 hour from generation time
3. WHEN a user submits reset token with new password, THE Backend API SHALL validate token expiration and update password
4. WHEN an expired or invalid token is provided, THE Backend API SHALL return a 400 status with error message
5. THE Backend API SHALL invalidate reset token after successful password change

### Requirement 12

**User Story:** Como desarrollador, quiero que la API tenga documentación clara de todos los endpoints, para que pueda integrar el frontend correctamente.

#### Acceptance Criteria

1. THE Backend API SHALL provide OpenAPI/Swagger documentation accessible at /api/docs endpoint
2. THE Backend API SHALL document all endpoints with request parameters, body schemas, and response formats
3. THE Backend API SHALL include authentication requirements in endpoint documentation
4. THE Backend API SHALL provide example requests and responses for each endpoint
5. THE Backend API SHALL document all error codes and their meanings
