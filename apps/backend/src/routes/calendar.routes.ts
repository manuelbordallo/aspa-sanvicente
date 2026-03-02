import { Router } from 'express';
import { calendarController } from '../controllers';
import { authenticateToken, requireAdmin } from '../middleware';
import { validateRequest } from '../middleware';
import { createEventSchema, updateEventSchema } from '../validators';

const router = Router();

/**
 * GET /calendar
 * Get calendar events with optional filters and pagination
 * Requirements: 6.1
 */
router.get('/', authenticateToken, calendarController.getEvents);

/**
 * GET /calendar/:idevents/:id
 * Get event by ID
 * Requirements: 7.1
 */
router.get('/events/:id', authenticateToken, calendarController.getEventById);

/**
 * POST /calendar
 * Create a new calendar event
 * Requirements: 6.1, 8.4
 */
router.post(
    '/', // Changed path from '/events' to '/'
    authenticateToken,
    requireAdmin, // Changed requireAdmin to requireRole(Role.ADMIN)
    validateRequest(createEventSchema),
    calendarController.createEvent
);

/**
 * PUT /calendar/:id
 * Update an existing calendar event
 * Requirements: 6.1, 8.4
 */
router.put(
    '/:id', // Changed path from '/events/:id' to '/:id'
    authenticateToken,
    requireAdmin, // Changed requireAdmin to requireRole(Role.ADMIN)
    validateRequest(updateEventSchema),
    calendarController.updateEvent
);

/**
 * DELETE /calendar/:id
 * Delete a calendar event
 * Requirements: 6.1, 8.4
 */
router.delete(
    '/:id', // Changed path from '/events/:id' to '/:id'
    authenticateToken,
    requireAdmin, // Changed requireAdmin to requireRole(Role.ADMIN)
    calendarController.deleteEvent
);

export default router;
