import { Router } from 'express';
import { authController } from '../controllers';
import { authenticateToken } from '../middleware';
import { validateRequest } from '../middleware';
import {
    loginSchema,
    changePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../validators';
import { updateProfileSchema } from '../validators';

const router = Router();

/**
 * POST /auth/login
 * Login with email and password
 * Requirements: 2.1, 2.6
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * POST /auth/logout
 * Logout (optional server-side tracking)
 * Requirements: 2.7
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * POST /auth/refresh
 * Refresh JWT token
 * Requirements: 2.6
 * Note: Does not require authenticateToken middleware as it uses refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
 * GET /auth/validate
 * Validate current token and return user info
 * Requirements: 2.7
 */
router.get('/validate', authenticateToken, authController.validateToken);

/**
 * POST /auth/forgot-password
 * Request password reset
 * Requirements: 11.1
 */
router.post(
    '/forgot-password',
    validateRequest(forgotPasswordSchema),
    authController.forgotPassword
);

/**
 * POST /auth/reset-password
 * Reset password with token
 * Requirements: 11.3
 */
router.post(
    '/reset-password',
    validateRequest(resetPasswordSchema),
    authController.resetPassword
);

/**
 * POST /auth/change-password
 * Change password for authenticated user
 * Requirements: 4.3, 4.4
 */
router.post(
    '/change-password',
    authenticateToken,
    validateRequest(changePasswordSchema),
    authController.changePassword
);

/**
 * GET /auth/profile
 * Get current user profile
 * Requirements: 4.1
 */
router.get('/profile', authenticateToken, authController.getProfile);

/**
 * PUT /api/auth/profile
 * Update current user profile
 * Requirements: 4.2
 */
router.put(
    '/profile',
    authenticateToken,
    validateRequest(updateProfileSchema),
    authController.updateProfile
);

export default router;
