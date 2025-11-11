import { Router } from 'express';
import { calendarController } from '../controllers';
import { authenticateToken, requireAdmin } from '../middleware';
import { validateRequest } from '../middleware';
import { createEventSchema, updateEventSchema } from '../validators';

const router = Router();

/**
 * GET /api/calendar/events
 * List calendar events with pagination and filtering
 * Requirements: 7.1
 */
router.get('/events', authenticateToken, calendarController.getEvents);

/**
 * GET /api/calendar/events/:id
 * Get event by ID
 * Requirements: 7.1
 */
router.get('/events/:id', authenticateToken, calendarController.getEventById);

/**
 * POST /api/calendar/events
 * Create calendar event (admin only)
 * Requirements: 7.2, 7.5
 */
router.post(
    '/events',
    authenticateToken,
    requireAdmin,
    validateRequest(createEventSchema),
    calendarController.createEvent
);

/**
 * PUT /api/calendar/events/:id
 * Update calendar event (admin only)
 * Requirements: 7.3, 7.5
 */
router.put(
    '/events/:id',
    authenticateToken,
    requireAdmin,
    validateRequest(updateEventSchema),
    calendarController.updateEvent
);

/**
 * DELETE /api/calendar/events/:id
 * Delete calendar event (admin only)
 * Requirements: 7.4, 7.5
 */
router.delete('/events/:id', authenticateToken, requireAdmin, calendarController.deleteEvent);

export default router;
