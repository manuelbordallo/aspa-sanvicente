# API Documentation

This directory contains the OpenAPI/Swagger documentation for the ASPA San Vicente Backend API.

## Overview

The API documentation is automatically generated using Swagger/OpenAPI 3.0 specification and is accessible at `/api/docs` when the server is running.

## Documentation Files

- `auth.yaml` - Authentication and authorization endpoints
- `users.yaml` - User management endpoints (admin only)
- `news.yaml` - News article management endpoints
- `calendar.yaml` - Calendar event management endpoints
- `notices.yaml` - Notice/message management endpoints
- `groups.yaml` - User group management endpoints (admin only)

## Accessing the Documentation

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/api/docs
   ```

3. You will see an interactive Swagger UI where you can:
   - Browse all available endpoints
   - View request/response schemas
   - Test API endpoints directly from the browser
   - See authentication requirements
   - View example requests and responses

## Authentication

Most endpoints require authentication using JWT Bearer tokens. To test authenticated endpoints:

1. First, call the `/api/auth/login` endpoint with valid credentials
2. Copy the JWT token from the response
3. Click the "Authorize" button at the top of the Swagger UI
4. Enter `Bearer <your-token>` in the value field
5. Click "Authorize" to save the token
6. Now you can test authenticated endpoints

## Features

The documentation includes:

- **Complete endpoint documentation** - All REST endpoints with descriptions
- **Request/response schemas** - Detailed schemas for all data models
- **Authentication requirements** - Clear indication of which endpoints require auth
- **Example requests and responses** - Sample data for testing
- **Error responses** - Documentation of all possible error codes
- **Pagination parameters** - Standard pagination query parameters
- **Interactive testing** - Try out API calls directly from the browser

## Updating Documentation

When adding new endpoints or modifying existing ones:

1. Update the corresponding YAML file in this directory
2. Follow the OpenAPI 3.0 specification format
3. Include request/response schemas
4. Add example values
5. Document all query parameters and path parameters
6. Specify authentication requirements using `security: - bearerAuth: []`

The documentation will be automatically reloaded when the server restarts.

## Requirements Covered

This implementation satisfies the following requirements:

- **12.1** - OpenAPI/Swagger documentation accessible at /api/docs endpoint
- **12.2** - All endpoints documented with request parameters, body schemas, and response formats
- **12.3** - Authentication requirements included in endpoint documentation
- **12.4** - Example requests and responses provided for each endpoint
- **12.5** - All error codes and their meanings documented
