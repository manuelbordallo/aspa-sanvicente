import { Router } from 'express';
import { newsController } from '../controllers';
import { authenticateToken, requireAdmin } from '../middleware';
import { validateRequest } from '../middleware';
import { createNewsSchema, updateNewsSchema } from '../validators';

const router = Router();

/**
 * GET /api/news
 * List news with pagination and filtering
 * Requirements: 5.1
 */
router.get('/', authenticateToken, newsController.getNews);

/**
 * GET /api/news/:id
 * Get news by ID
 * Requirements: 5.1
 */
router.get('/:id', authenticateToken, newsController.getNewsById);

/**
 * POST /api/news
 * Create news (admin only)
 * Requirements: 5.2, 5.5
 */
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    validateRequest(createNewsSchema),
    newsController.createNews
);

/**
 * PUT /api/news/:id
 * Update news (admin only)
 * Requirements: 5.3, 5.5
 */
router.put(
    '/:id',
    authenticateToken,
    requireAdmin,
    validateRequest(updateNewsSchema),
    newsController.updateNews
);

/**
 * DELETE /api/news/:id
 * Delete news (admin only)
 * Requirements: 5.4, 5.5
 */
router.delete('/:id', authenticateToken, requireAdmin, newsController.deleteNews);

export default router;
