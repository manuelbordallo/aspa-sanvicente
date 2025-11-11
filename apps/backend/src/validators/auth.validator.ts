import { z } from 'zod';

/**
 * Login validation schema
 * Requirements: 2.1, 2.2
 */
export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

/**
 * Change password validation schema
 * Requirements: 4.3, 4.4
 */
export const changePasswordSchema = z.object({
    currentPassword: z
        .string()
        .min(1, 'Current password is required'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

/**
 * Forgot password validation schema
 * Requirements: 11.1
 */
export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email format'),
});

/**
 * Reset password validation schema
 * Requirements: 11.3
 */
export const resetPasswordSchema = z.object({
    token: z
        .string()
        .min(1, 'Reset token is required')
        .uuid('Invalid reset token format'),
    newPassword: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
