# Design Document

## Overview

Este diseño soluciona el problema de inconsistencia de roles entre backend y frontend. El backend usa roles en mayúsculas (`USER`, `ADMIN`) según el schema de Prisma, mientras que el frontend espera roles en minúsculas (`user`, `admin`). La solución consiste en crear una capa de normalización en el backend que transforme los roles a minúsculas antes de enviarlos al frontend, sin modificar la base de datos.

## Architecture

### Current State

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Prisma    │ ──────> │   Backend   │ ──────> │  Frontend   │
│   Schema    │  USER   │   Service   │  USER   │  RouteGuard │
│             │  ADMIN  │             │  ADMIN  │             │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       ❌ Fails
                                                    (expects user/admin)
```

### Proposed State

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Prisma    │ ──────> │   Backend   │ ──────> │ Normalizer  │ ──────> │  Frontend   │
│   Schema    │  USER   │   Service   │  USER   │  Function   │  user   │  RouteGuard │
│             │  ADMIN  │             │  ADMIN  │             │  admin  │             │
└─────────────┘         └─────────────┘         └─────────────┘         └─────────────┘
                                                                               ✅ Works
```

## Components and Interfaces

### 1. User Type Normalization Utility

**File:** `apps/backend/src/utils/user.util.ts`

**Purpose:** Provide utility functions to normalize user data from Prisma format to API format.

**Functions:**

```typescript
// Type for normalized user role (lowercase)
export type NormalizedRole = 'user' | 'admin';

// Type for user without password and with normalized role
export interface NormalizedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: NormalizedRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Normalize Prisma Role enum to lowercase string
 */
export function normalizeRole(role: Role): NormalizedRole {
  return role.toLowerCase() as NormalizedRole;
}

/**
 * Remove password and normalize role from Prisma User
 */
export function normalizeUser(user: User): NormalizedUser {
  const { password, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    role: normalizeRole(user.role),
  };
}

/**
 * Normalize multiple users
 */
export function normalizeUsers(users: User[]): NormalizedUser[] {
  return users.map(normalizeUser);
}
```

### 2. Auth Service Updates

**File:** `apps/backend/src/services/auth.service.ts`

**Changes:**
- Import `normalizeUser` utility
- Replace manual password removal with `normalizeUser` function
- Ensure all user objects returned are normalized

**Affected Methods:**
- `login()` - Returns user in LoginResult
- `validateToken()` - Returns user in ValidateTokenResult
- `refreshToken()` - Could optionally return user data

### 3. User Service Updates

**File:** `apps/backend/src/services/user.service.ts`

**Changes:**
- Import `normalizeUser` and `normalizeUsers` utilities
- Apply normalization to all methods that return user data

**Affected Methods:**
- `getAllUsers()` - Returns array of users
- `getUserById()` - Returns single user
- `createUser()` - Returns created user
- `updateUser()` - Returns updated user
- Any other method returning user data

### 4. Notice Service Updates

**File:** `apps/backend/src/services/notice.service.ts`

**Changes:**
- Apply role normalization when including user data in notice responses
- Update the `getRecipientOptions()` method to normalize user roles

### 5. Type Definitions

**File:** `apps/backend/src/types/index.ts` (if exists) or create it

**Purpose:** Centralize type definitions for normalized data structures.

```typescript
export type { NormalizedUser, NormalizedRole } from '../utils/user.util';
```

## Data Models

### Prisma Schema (No Changes)

```prisma
enum Role {
  USER
  ADMIN
}

model User {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  email     String   @unique
  password  String
  role      Role     @default(USER)
  isActive  Boolean  @default(true)
  // ... other fields
}
```

### API Response Format (After Normalization)

```typescript
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "user",  // lowercase
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### JWT Payload (Already Normalized)

```typescript
{
  "userId": "uuid",
  "email": "john@example.com",
  "role": "user",  // already lowercase
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Error Handling

### Backend Error Handling

No changes needed. The normalization is a pure transformation that doesn't introduce new error cases.

### Frontend Error Handling

The frontend already has error handling in place:

1. **RouteGuard** - Checks authentication and role permissions
2. **route:unauthorized event** - Dispatched when user lacks permissions
3. **SchoolApp component** - Listens for unauthorized events and shows notifications

**Improvements:**
- Add more detailed logging in RouteGuard to help debug authorization issues
- Ensure error messages clearly indicate the required roles

## Testing Strategy

### Unit Tests

**Backend:**

1. **user.util.ts**
   - Test `normalizeRole()` with USER → user
   - Test `normalizeRole()` with ADMIN → admin
   - Test `normalizeUser()` removes password
   - Test `normalizeUser()` normalizes role
   - Test `normalizeUsers()` handles arrays

2. **auth.service.ts**
   - Test login returns normalized user
   - Test validateToken returns normalized user
   - Test JWT payload contains lowercase role

3. **user.service.ts**
   - Test all methods return normalized users
   - Test array methods return normalized user arrays

**Frontend:**

1. **RouteGuard**
   - Test canActivate with user role
   - Test canActivate with admin role
   - Test role checking logic

### Integration Tests

1. **Login Flow**
   - Login with USER role → verify frontend receives "user"
   - Login with ADMIN role → verify frontend receives "admin"
   - Verify JWT contains lowercase role
   - Verify user object in response has lowercase role

2. **Token Validation**
   - Validate token → verify user object has lowercase role

3. **User Management**
   - Get users → verify all users have lowercase roles
   - Create user → verify created user has lowercase role
   - Update user → verify updated user has lowercase role

### Manual Testing

1. Login with regular user (juan.garcia@example.com / User123)
   - Verify access to news, notices, calendar, settings, profile
   - Verify no access to users view
   - Verify no "Acceso Denegado" error

2. Login with admin (admin@aspa-sanvicente.com / Admin123)
   - Verify access to all views including users
   - Verify no "Acceso Denegado" error

3. Check browser console
   - Verify no role-related errors
   - Verify auth state shows correct lowercase role

## Implementation Notes

### Order of Implementation

1. Create `user.util.ts` with normalization functions
2. Update `auth.service.ts` to use normalization
3. Update `user.service.ts` to use normalization
4. Update `notice.service.ts` to use normalization
5. Add logging to frontend RouteGuard for debugging
6. Test login flow end-to-end
7. Test all protected routes

### Backward Compatibility

This change is backward compatible because:
- Database schema remains unchanged
- JWT already uses lowercase roles
- Frontend already expects lowercase roles
- Only the API response format changes (which frontend already expects)

### Performance Considerations

- Normalization is a simple string transformation (O(1))
- No database queries added
- Minimal CPU overhead
- No memory overhead (same object size)

### Security Considerations

- No security implications
- Role checking logic remains the same
- JWT signing/verification unchanged
- Password removal still enforced

## Rollback Plan

If issues arise:

1. Revert changes to service files
2. Keep `user.util.ts` for future use
3. Investigate why frontend isn't handling roles correctly
4. Consider alternative: normalize roles in frontend instead

## Future Enhancements

1. **Type Safety:** Use branded types to distinguish Prisma roles from API roles at compile time
2. **Validation:** Add runtime validation to ensure roles are always normalized before sending to frontend
3. **Middleware:** Create Express middleware to automatically normalize all user objects in responses
4. **Documentation:** Add API documentation noting that roles are returned in lowercase
