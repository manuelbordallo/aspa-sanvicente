import { Response, NextFunction } from 'express';
import calendarService from '../services/calendar.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { buildPaginationParams } from '../utils/pagination.util';
import { AuthenticatedRequest } from './auth.controller';

class CalendarController {
    /**
     * Get events handler with pagination and filter query params
     * GET /api/calendar/events
     */
    async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            // Parse pagination parameters
            const pagination = buildPaginationParams(req.query);

            // Parse filters
            const filters: any = {};
            if (req.query.search) {
                filters.search = req.query.search as string;
            }
            if (req.query.startDate) {
                filters.startDate = new Date(req.query.startDate as string);
            }
            if (req.query.endDate) {
                filters.endDate = new Date(req.query.endDate as string);
            }
            if (req.query.date) {
                filters.date = new Date(req.query.date as string);
            }

            const result = await calendarService.getEvents(pagination, filters);

            return paginatedResponse(res, result.data, {
                total: result.total,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev,
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get event by ID handler
     * GET /api/calendar/events/:id
     */
    async getEventById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;

            const event = await calendarService.getEventById(id);

            return successResponse(res, event);
        } catch (error: any) {
            if (error.message === 'Event not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            next(error);
        }
    }

    /**
     * Create event handler
     * POST /api/calendar/events
     */
    async createEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { title, description, date } = req.body;
            const authorId = req.user?.id;

            if (!authorId) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            if (!title || !description || !date) {
                return errorResponse(res, 'Title, description, and date are required', 'VAL_3001', 400);
            }

            // Parse date
            const eventDate = new Date(date);
            if (isNaN(eventDate.getTime())) {
                return errorResponse(res, 'Invalid date format', 'VAL_3001', 400);
            }

            const eventData = {
                title,
                description,
                date: eventDate,
                authorId,
            };

            const event = await calendarService.createEvent(eventData);

            return successResponse(res, event, 'Event created successfully', 201);
        } catch (error: any) {
            if (error.message.includes('required') || error.message.includes('Invalid date')) {
                return errorResponse(res, error.message, 'VAL_3001', 400);
            }
            next(error);
        }
    }

    /**
     * Update event handler
     * PUT /api/calendar/events/:id
     */
    async updateEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { title, description, date } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (date !== undefined) {
                const eventDate = new Date(date);
                if (isNaN(eventDate.getTime())) {
                    return errorResponse(res, 'Invalid date format', 'VAL_3001', 400);
                }
                updateData.date = eventDate;
            }

            const event = await calendarService.updateEvent(id, updateData, userId, userRole);

            return successResponse(res, event, 'Event updated successfully');
        } catch (error: any) {
            if (error.message === 'Event not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            if (error.message.includes('permission')) {
                return errorResponse(res, error.message, 'AUTHZ_2001', 403);
            }
            if (error.message.includes('Invalid date')) {
                return errorResponse(res, error.message, 'VAL_3001', 400);
            }
            next(error);
        }
    }

    /**
     * Delete event handler
     * DELETE /api/calendar/events/:id
     */
    async deleteEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            await calendarService.deleteEvent(id, userId, userRole);

            return successResponse(res, null, 'Event deleted successfully');
        } catch (error: any) {
            if (error.message === 'Event not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            if (error.message.includes('permission')) {
                return errorResponse(res, error.message, 'AUTHZ_2001', 403);
            }
            next(error);
        }
    }
}

export default new CalendarController();
