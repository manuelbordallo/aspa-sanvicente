# Implementation Plan

- [x] 1. Create Backend Detector Service
  - Create `src/services/backend-detector.ts` with health check functionality
  - Implement availability detection with configurable timeout
  - Add listener pattern for status change notifications
  - Implement retry logic with exponential backoff
  - _Requirements: 1.1, 1.4_

- [x] 2. Create Mock Auth Service
  - [x] 2.1 Implement mock authentication service
    - Create `src/services/mock-auth-service.ts` with same interface as AuthService
    - Define mock user data with admin and regular user credentials
    - Implement login method that validates against mock users
    - Implement logout, isAuthenticated, getCurrentUser methods
    - Store mock session in localStorage with same structure as real auth
    - _Requirements: 1.5, 3.4_

  - [x] 2.2 Create mock data stores for other services
    - Create mock implementations for news, notices, calendar services
    - Use localStorage to persist mock data between sessions
    - _Requirements: 1.2_

- [x] 3. Implement Auth Service Factory
  - [x] 3.1 Create service factory with mode detection
    - Create `src/services/auth-service-factory.ts`
    - Implement logic to check VITE_ENABLE_MOCK_MODE environment variable
    - Integrate with backend detector to determine service mode
    - Return appropriate service instance (real or mock)
    - Add logging to indicate which mode is active
    - _Requirements: 1.2, 3.1, 3.3_

  - [x] 3.2 Update auth service exports
    - Modify `src/services/index.ts` to export from factory instead of direct instance
    - Ensure backward compatibility with existing code
    - _Requirements: 3.1_

- [x] 4. Enhance API Client Error Handling
  - Update `src/services/api-client.ts` with shorter timeout for initial detection
  - Improve error handling for network failures
  - Add better error logging with error types
  - Implement configurable timeout from environment variables
  - Add connection error detection
  - _Requirements: 1.2, 1.3, 2.3_

- [ ] 5. Update School App Component
  - [ ] 5.1 Integrate backend detection on startup
    - Import and initialize backend detector in school-app.ts
    - Call backend detection before auth validation
    - Handle detection results and activate appropriate mode
    - Update initialization flow to handle mock mode
    - _Requirements: 1.1, 1.4_

  - [ ] 5.2 Improve error handling and user feedback
    - Update error rendering to show specific connection errors
    - Add informative messages when backend is unavailable
    - Remove infinite loading state when backend is down
    - Show login view immediately if backend detection fails
    - _Requirements: 2.1, 2.3_

- [ ] 6. Create Connection Status Component
  - Create `src/components/ui/connection-status.ts` component
  - Display badge showing connection state (connected/mock/error)
  - Add visual indicators with appropriate colors
  - Implement retry button for reconnection attempts
  - Subscribe to backend detector status changes
  - _Requirements: 2.1, 2.2, 2.4_

- [ ] 7. Add Environment Configuration
  - Update `.env.development` with mock mode and timeout settings
  - Add VITE_ENABLE_MOCK_MODE variable
  - Add VITE_BACKEND_DETECTION_TIMEOUT variable
  - Add VITE_SHOW_CONNECTION_STATUS variable
  - Update `src/config/env.ts` to read new variables
  - _Requirements: 3.1, 3.2_

- [ ] 8. Update Login View
  - Modify `src/views/login-view.ts` to show mock mode indicator when active
  - Add helper text showing mock credentials when in mock mode
  - Improve error messages for connection issues
  - _Requirements: 2.1, 3.4_

- [ ] 9. Add Development Documentation
  - Create documentation for running app without backend
  - Document mock user credentials
  - Add troubleshooting guide for connection issues
  - _Requirements: 3.4_
