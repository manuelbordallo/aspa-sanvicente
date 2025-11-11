import { Router } from 'express';
import { noticeController } from '../controllers';
import { authenticateToken } from '../middleware';
import { validateRequest } from '../middleware';
import { createNoticeSchema } from '../validators';

const router = Router();

/**
 * GET /api/notices
 * List received notices with pagination and filtering
 * Requirements: 6.1
 */
router.get('/', authenticateToken, noticeController.getNotices);

/**
 * GET /api/notices/sent
 * List sent notices
 * Requirements: 6.6
 */
router.get('/sent', authenticateToken, noticeController.getSentNotices);

/**
 * GET /api/notices/unread-count
 * Get unread notice count
 * Requirements: 6.4
 */
router.get('/unread-count', authenticateToken, noticeController.getUnreadCount);

/**
 * GET /api/notices/recipients
 * Get available recipients (users and groups)
 * Requirements: 6.2
 */
router.get('/recipients', authenticateToken, noticeController.getRecipients);

/**
 * GET /api/notices/:id
 * Get notice by ID
 * Requirements: 6.1
 */
router.get('/:id', authenticateToken, noticeController.getNoticeById);

/**
 * POST /api/notices
 * Create notice
 * Requirements: 6.2
 */
router.post(
    '/',
    authenticateToken,
    validateRequest(createNoticeSchema),
    noticeController.createNotice
);

/**
 * PATCH /api/notices/:id/read
 * Mark notice as read
 * Requirements: 6.3
 */
router.patch('/:id/read', authenticateToken, noticeController.markAsRead);

/**
 * PATCH /api/notices/:id/unread
 * Mark notice as unread
 * Requirements: 6.3
 */
router.patch('/:id/unread', authenticateToken, noticeController.markAsUnread);

/**
 * PATCH /api/notices/mark-all-read
 * Mark all notices as read
 * Requirements: 6.5
 */
router.patch('/mark-all-read', authenticateToken, noticeController.markAllAsRead);

/**
 * DELETE /api/notices/:id
 * Delete notice (author only)
 * Requirements: 6.7
 */
router.delete('/:id', authenticateToken, noticeController.deleteNotice);

export default router;
