import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import newsRoutes from './news.routes';
import noticeRoutes from './notice.routes';
import calendarRoutes from './calendar.routes';
import groupRoutes from './group.routes';

const router = Router();

/**
 * Health check endpoint
 * Requirements: 1.1
 */
router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

/**
 * Mount all route modules under /api prefix
 * Requirements: 1.1
 */
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/news', newsRoutes);
router.use('/api/notices', noticeRoutes);
router.use('/api/calendar', calendarRoutes);
router.use('/api/groups', groupRoutes);

export default router;
