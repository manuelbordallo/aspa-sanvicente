import { z } from 'zod';

/**
 * User role enum
 */
export const userRoleSchema = z.enum(['admin', 'user']);

/**
 * Create user validation schema
 * Requirements: 3.1, 3.2, 3.3, 3.6
 */
export const createUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: userRoleSchema.default('user'),
});

/**
 * Update user validation schema
 * Requirements: 3.1, 3.2, 3.3, 3.6
 * All fields are optional for updates
 */
export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(100, 'First name must be less than 100 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(100, 'Last name must be less than 100 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .optional(),
  role: userRoleSchema.optional(),
  isActive: z
    .boolean()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

/**
 * Update profile validation schema (for authenticated users updating their own profile)
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(100, 'First name must be less than 100 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(100, 'Last name must be less than 100 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .toLowerCase()
    .optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
