# Implementation Plan

- [x] 1. Create user normalization utility
  - Create `apps/backend/src/utils/user.util.ts` with functions to normalize user roles from Prisma format (uppercase) to API format (lowercase)
  - Implement `normalizeRole()` function to convert Role enum to lowercase string
  - Implement `normalizeUser()` function to remove password and normalize role
  - Implement `normalizeUsers()` function for array normalization
  - Export TypeScript types for `NormalizedUser` and `NormalizedRole`
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 1.1 Write unit tests for user normalization utility
  - Create test file for user.util.ts
  - Test normalizeRole with USER and ADMIN inputs
  - Test normalizeUser removes password and normalizes role
  - Test normalizeUsers handles arrays correctly
  - _Requirements: 2.2_

- [x] 2. Update auth service to use normalization
  - Import `normalizeUser` from user.util.ts in auth.service.ts
  - Replace manual password removal in `login()` method with `normalizeUser()`
  - Replace manual password removal in `validateToken()` method with `normalizeUser()`
  - Verify JWT payload already uses lowercase roles (no changes needed)
  - Update return type interfaces to use `NormalizedUser` if needed
  - _Requirements: 1.1, 1.2, 2.3_

- [x] 2.1 Update auth service tests
  - Update existing tests to verify normalized user format
  - Verify login returns user with lowercase role
  - Verify validateToken returns user with lowercase role
  - _Requirements: 1.1, 1.2_

- [x] 3. Update user service to use normalization
  - Import `normalizeUser` and `normalizeUsers` from user.util.ts in user.service.ts
  - Apply `normalizeUser()` to `getUserById()` return value
  - Apply `normalizeUser()` to `createUser()` return value
  - Apply `normalizeUser()` to `updateUser()` return value
  - Apply `normalizeUsers()` to `getAllUsers()` return value
  - Apply normalization to any other methods returning user data
  - _Requirements: 1.2, 2.3_

- [x] 3.1 Update user service tests
  - Update existing tests to verify normalized user format
  - Verify all methods return users with lowercase roles
  - _Requirements: 1.2_

- [x] 4. Update notice service to normalize user roles
  - Import `normalizeRole` from user.util.ts in notice.service.ts
  - Update `getRecipientOptions()` method to normalize user roles in response
  - Apply `normalizeRole(user.role)` where user data is included in responses
  - _Requirements: 1.2, 2.3_

- [x] 5. Add debugging logs to frontend RouteGuard
  - Add console.log statements in RouteGuard.canActivate() to log authentication state
  - Log user role and required roles when checking permissions
  - Log the result of role checks for debugging
  - Ensure logs are helpful for troubleshooting authorization issues
  - _Requirements: 3.4_

- [x] 6. Test complete login and authorization flow
  - Start backend and frontend servers
  - Test login with regular user (juan.garcia@example.com / User123)
  - Verify user can access news, notices, calendar, settings, profile views
  - Verify user cannot access users view (admin only)
  - Verify no "Acceso Denegado" error appears after login
  - Test login with admin user (admin@aspa-sanvicente.com / Admin123)
  - Verify admin can access all views including users view
  - Check browser console for any role-related errors
  - Verify auth state in console shows lowercase roles
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5_
