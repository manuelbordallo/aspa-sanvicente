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
 * POST /api/auth/login
 * Login with email and password
 * Requirements: 2.1, 2.6
 */
router.post('/login', validateRequest(loginSchema), authController.login);

/**
 * POST /api/auth/logout
 * Logout (optional server-side tracking)
 * Requirements: 2.7
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * POST /api/auth/refresh
 * Refresh JWT token
 * Requirements: 2.6
 * Note: Does not require authenticateToken middleware as it uses refresh token
 */
router.post('/refresh', authController.refreshToken);

/**
 * GET /api/auth/validate
 * Validate current token and return user info
 * Requirements: 2.7
 */
router.get('/validate', authenticateToken, authController.validateToken);

/**
 * POST /api/auth/forgot-password
 * Request password reset
 * Requirements: 11.1
 */
router.post(
    '/forgot-password',
    validateRequest(forgotPasswordSchema),
    authController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 * Reset password with token
 * Requirements: 11.3
 */
router.post(
    '/reset-password',
    validateRequest(resetPasswordSchema),
    authController.resetPassword
);

/**
 * POST /api/auth/change-password
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
 * GET /api/auth/profile
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
