import { Router } from 'express';
import { userController } from '../controllers';
import { authenticateToken, requireAdmin } from '../middleware';
import { validateRequest } from '../middleware';
import { createUserSchema, updateUserSchema } from '../validators';

const router = Router();

/**
 * GET /api/users
 * List all users with pagination
 * Requirements: 3.1, 3.5
 */
router.get('/', authenticateToken, requireAdmin, userController.getUsers);

/**
 * GET /api/users/:id
 * Get user by ID
 * Requirements: 3.1, 3.5
 */
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

/**
 * POST /api/users
 * Create new user
 * Requirements: 3.2, 3.5
 */
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    validateRequest(createUserSchema),
    userController.createUser
);

/**
 * PUT /api/users/:id
 * Update user
 * Requirements: 3.3, 3.5
 */
router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    validateRequest(updateUserSchema),
    userController.updateUser
);

/**
 * DELETE /api/users/:id
 * Deactivate user
 * Requirements: 3.4, 3.5
 */
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router;
