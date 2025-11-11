import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

/**
 * Swagger/OpenAPI configuration
 * Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
 */

const swaggerDefinition: SwaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'ASPA San Vicente Backend API',
        version: '1.0.0',
        description:
            'REST API backend for ASPA San Vicente school management application. Provides authentication, user management, news, notices, and calendar events.',
        contact: {
            name: 'API Support',
            email: 'support@aspa-sanvicente.com',
        },
        license: {
            name: 'MIT',
            url: 'https://opensource.org/licenses/MIT',
        },
    },
    servers: [
        {
            url: process.env.API_BASE_URL || 'http://localhost:3000',
            description: 'Development server',
        },
        {
            url: 'https://api.aspa-sanvicente.com',
            description: 'Production server',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token obtained from /api/auth/login endpoint',
            },
        },
        schemas: {
            // Common schemas
            Error: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        example: 'Error message',
                    },
                    code: {
                        type: 'string',
                        example: 'ERROR_CODE',
                    },
                    status: {
                        type: 'integer',
                        example: 400,
                    },
                },
            },
            ValidationError: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: false,
                    },
                    message: {
                        type: 'string',
                        example: 'Validation failed',
                    },
                    code: {
                        type: 'string',
                        example: 'VAL_3001',
                    },
                    status: {
                        type: 'integer',
                        example: 400,
                    },
                    details: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                field: {
                                    type: 'string',
                                },
                                message: {
                                    type: 'string',
                                },
                            },
                        },
                    },
                },
            },
            PaginationMeta: {
                type: 'object',
                properties: {
                    total: {
                        type: 'integer',
                        example: 100,
                    },
                    page: {
                        type: 'integer',
                        example: 1,
                    },
                    limit: {
                        type: 'integer',
                        example: 10,
                    },
                    totalPages: {
                        type: 'integer',
                        example: 10,
                    },
                    hasNext: {
                        type: 'boolean',
                        example: true,
                    },
                    hasPrev: {
                        type: 'boolean',
                        example: false,
                    },
                },
            },
            // User schemas
            User: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    firstName: {
                        type: 'string',
                        example: 'John',
                    },
                    lastName: {
                        type: 'string',
                        example: 'Doe',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'john.doe@example.com',
                    },
                    role: {
                        type: 'string',
                        enum: ['user', 'admin'],
                        example: 'user',
                    },
                    isActive: {
                        type: 'boolean',
                        example: true,
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
            LoginRequest: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'admin@example.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        example: 'password123',
                    },
                },
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    success: {
                        type: 'boolean',
                        example: true,
                    },
                    data: {
                        type: 'object',
                        properties: {
                            user: {
                                $ref: '#/components/schemas/User',
                            },
                            token: {
                                type: 'string',
                                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            },
                        },
                    },
                },
            },
            CreateUserRequest: {
                type: 'object',
                required: ['firstName', 'lastName', 'email', 'password', 'role'],
                properties: {
                    firstName: {
                        type: 'string',
                        example: 'Jane',
                    },
                    lastName: {
                        type: 'string',
                        example: 'Smith',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'jane.smith@example.com',
                    },
                    password: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'securePass123',
                    },
                    role: {
                        type: 'string',
                        enum: ['user', 'admin'],
                        example: 'user',
                    },
                },
            },
            UpdateUserRequest: {
                type: 'object',
                properties: {
                    firstName: {
                        type: 'string',
                        example: 'Jane',
                    },
                    lastName: {
                        type: 'string',
                        example: 'Smith',
                    },
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'jane.smith@example.com',
                    },
                    role: {
                        type: 'string',
                        enum: ['user', 'admin'],
                        example: 'user',
                    },
                    isActive: {
                        type: 'boolean',
                        example: true,
                    },
                },
            },
            // News schemas
            News: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174001',
                    },
                    title: {
                        type: 'string',
                        example: 'Important School Announcement',
                    },
                    content: {
                        type: 'string',
                        example: 'Full content of the news article...',
                    },
                    summary: {
                        type: 'string',
                        example: 'Brief summary of the news',
                    },
                    authorId: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    author: {
                        $ref: '#/components/schemas/User',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
            CreateNewsRequest: {
                type: 'object',
                required: ['title', 'content', 'summary'],
                properties: {
                    title: {
                        type: 'string',
                        example: 'New School Policy',
                    },
                    content: {
                        type: 'string',
                        example: 'Detailed content about the new policy...',
                    },
                    summary: {
                        type: 'string',
                        example: 'Brief summary of the policy',
                    },
                },
            },
            UpdateNewsRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        example: 'Updated School Policy',
                    },
                    content: {
                        type: 'string',
                        example: 'Updated content...',
                    },
                    summary: {
                        type: 'string',
                        example: 'Updated summary',
                    },
                },
            },
            // Notice schemas
            Notice: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174002',
                    },
                    content: {
                        type: 'string',
                        example: 'Please review the attached document',
                    },
                    authorId: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    author: {
                        $ref: '#/components/schemas/User',
                    },
                    recipientId: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174003',
                    },
                    recipient: {
                        $ref: '#/components/schemas/User',
                    },
                    isRead: {
                        type: 'boolean',
                        example: false,
                    },
                    readAt: {
                        type: 'string',
                        format: 'date-time',
                        nullable: true,
                        example: null,
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
            CreateNoticeRequest: {
                type: 'object',
                required: ['content', 'recipients'],
                properties: {
                    content: {
                        type: 'string',
                        example: 'Important notice for selected users',
                    },
                    recipients: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                    enum: ['user', 'group'],
                                    example: 'user',
                                },
                                id: {
                                    type: 'string',
                                    format: 'uuid',
                                    example: '123e4567-e89b-12d3-a456-426614174003',
                                },
                            },
                        },
                        example: [
                            { type: 'user', id: '123e4567-e89b-12d3-a456-426614174003' },
                            { type: 'group', id: '123e4567-e89b-12d3-a456-426614174004' },
                        ],
                    },
                },
            },
            // Calendar Event schemas
            CalendarEvent: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174005',
                    },
                    title: {
                        type: 'string',
                        example: 'Parent-Teacher Meeting',
                    },
                    description: {
                        type: 'string',
                        example: 'Annual parent-teacher conference',
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-03-15T10:00:00.000Z',
                    },
                    authorId: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    author: {
                        $ref: '#/components/schemas/User',
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
            CreateEventRequest: {
                type: 'object',
                required: ['title', 'description', 'date'],
                properties: {
                    title: {
                        type: 'string',
                        example: 'School Assembly',
                    },
                    description: {
                        type: 'string',
                        example: 'Monthly school assembly',
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-04-01T09:00:00.000Z',
                    },
                },
            },
            UpdateEventRequest: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        example: 'Updated School Assembly',
                    },
                    description: {
                        type: 'string',
                        example: 'Updated description',
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-04-01T10:00:00.000Z',
                    },
                },
            },
            // User Group schemas
            UserGroup: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174006',
                    },
                    name: {
                        type: 'string',
                        example: 'Teachers',
                    },
                    members: {
                        type: 'array',
                        items: {
                            $ref: '#/components/schemas/User',
                        },
                    },
                    createdAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                    updatedAt: {
                        type: 'string',
                        format: 'date-time',
                        example: '2024-01-01T00:00:00.000Z',
                    },
                },
            },
            CreateGroupRequest: {
                type: 'object',
                required: ['name', 'userIds'],
                properties: {
                    name: {
                        type: 'string',
                        example: 'Grade 5 Parents',
                    },
                    userIds: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'uuid',
                        },
                        example: [
                            '123e4567-e89b-12d3-a456-426614174007',
                            '123e4567-e89b-12d3-a456-426614174008',
                        ],
                    },
                },
            },
            UpdateGroupRequest: {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        example: 'Updated Group Name',
                    },
                    userIds: {
                        type: 'array',
                        items: {
                            type: 'string',
                            format: 'uuid',
                        },
                        example: [
                            '123e4567-e89b-12d3-a456-426614174007',
                            '123e4567-e89b-12d3-a456-426614174009',
                        ],
                    },
                },
            },
            ChangePasswordRequest: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                    currentPassword: {
                        type: 'string',
                        format: 'password',
                        example: 'oldPassword123',
                    },
                    newPassword: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'newSecurePass456',
                    },
                },
            },
            ForgotPasswordRequest: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: {
                        type: 'string',
                        format: 'email',
                        example: 'user@example.com',
                    },
                },
            },
            ResetPasswordRequest: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                    token: {
                        type: 'string',
                        example: 'reset-token-uuid',
                    },
                    newPassword: {
                        type: 'string',
                        format: 'password',
                        minLength: 8,
                        example: 'newPassword123',
                    },
                },
            },
        },
        responses: {
            UnauthorizedError: {
                description: 'Authentication token is missing or invalid',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                        example: {
                            success: false,
                            message: 'Token expired or invalid',
                            code: 'AUTH_1002',
                            status: 401,
                        },
                    },
                },
            },
            ForbiddenError: {
                description: 'User does not have permission to access this resource',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                        example: {
                            success: false,
                            message: 'Insufficient permissions',
                            code: 'AUTHZ_2002',
                            status: 403,
                        },
                    },
                },
            },
            NotFoundError: {
                description: 'Resource not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                        example: {
                            success: false,
                            message: 'Resource not found',
                            code: 'RES_4001',
                            status: 404,
                        },
                    },
                },
            },
            ValidationError: {
                description: 'Request validation failed',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/ValidationError',
                        },
                    },
                },
            },
            ServerError: {
                description: 'Internal server error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error',
                        },
                        example: {
                            success: false,
                            message: 'Internal server error',
                            code: 'SRV_5001',
                            status: 500,
                        },
                    },
                },
            },
        },
        parameters: {
            PageParam: {
                in: 'query',
                name: 'page',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    default: 1,
                },
                description: 'Page number for pagination',
            },
            LimitParam: {
                in: 'query',
                name: 'limit',
                schema: {
                    type: 'integer',
                    minimum: 1,
                    maximum: 100,
                    default: 10,
                },
                description: 'Number of items per page',
            },
            SortByParam: {
                in: 'query',
                name: 'sortBy',
                schema: {
                    type: 'string',
                },
                description: 'Field to sort by',
            },
            SortOrderParam: {
                in: 'query',
                name: 'sortOrder',
                schema: {
                    type: 'string',
                    enum: ['asc', 'desc'],
                    default: 'desc',
                },
                description: 'Sort order (ascending or descending)',
            },
        },
    },
    tags: [
        {
            name: 'Authentication',
            description: 'Authentication and authorization endpoints',
        },
        {
            name: 'Users',
            description: 'User management endpoints (admin only)',
        },
        {
            name: 'News',
            description: 'News article management endpoints',
        },
        {
            name: 'Notices',
            description: 'Notice/message management endpoints',
        },
        {
            name: 'Calendar',
            description: 'Calendar event management endpoints',
        },
        {
            name: 'Groups',
            description: 'User group management endpoints (admin only)',
        },
    ],
};

const options = {
    definition: swaggerDefinition,
    apis: ['./src/docs/*.yaml'], // Path to API documentation files
};

export const swaggerSpec = swaggerJsdoc(options);
