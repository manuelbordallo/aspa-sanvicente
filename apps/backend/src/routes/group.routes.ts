import { Router } from 'express';
import { groupController } from '../controllers';
import { authenticateToken, requireAdmin } from '../middleware';
import { validateRequest } from '../middleware';
import { createGroupSchema, updateGroupSchema } from '../validators';

const router = Router();

/**
 * GET /api/groups
 * List all groups (admin only)
 * Requirements: 10.2
 */
router.get('/', authenticateToken, requireAdmin, groupController.getGroups);

/**
 * GET /api/groups/:id
 * Get group by ID (admin only)
 * Requirements: 10.2
 */
router.get('/:id', authenticateToken, requireAdmin, groupController.getGroupById);

/**
 * POST /api/groups
 * Create group (admin only)
 * Requirements: 10.1
 */
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    validateRequest(createGroupSchema),
    groupController.createGroup
);

/**
 * PUT /api/groups/:id
 * Update group (admin only)
 * Requirements: 10.3
 */
router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    validateRequest(updateGroupSchema),
    groupController.updateGroup
);

/**
 * DELETE /api/groups/:id
 * Delete group (admin only)
 * Requirements: 10.4
 */
router.delete('/:id', authenticateToken, requireAdmin, groupController.deleteGroup);

export default router;
