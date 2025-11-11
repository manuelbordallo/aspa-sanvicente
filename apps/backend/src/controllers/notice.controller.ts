import { Response, NextFunction } from 'express';
import noticeService from '../services/notice.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { buildPaginationParams } from '../utils/pagination.util';
import { AuthenticatedRequest } from './auth.controller';

class NoticeController {
  /**
   * Get notices handler with pagination and filter query params
   * GET /api/notices
   */
  async getNotices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      // Parse pagination parameters
      const pagination = buildPaginationParams(req.query);

      // Parse filters
      const filters: any = {};
      if (req.query.isRead !== undefined) {
        filters.isRead = req.query.isRead === 'true';
      }

      const result = await noticeService.getNotices(userId, pagination, filters);

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
   * Get sent notices handler
   * GET /api/notices/sent
   */
  async getSentNotices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      // Parse pagination parameters
      const pagination = buildPaginationParams(req.query);

      const result = await noticeService.getSentNotices(userId, pagination);

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
   * Get unread count handler
   * GET /api/notices/unread-count
   */
  async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const count = await noticeService.getUnreadCount(userId);

      return successResponse(res, { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recipients handler
   * GET /api/notices/recipients
   */
  async getRecipients(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const recipients = await noticeService.getRecipients();

      return successResponse(res, recipients);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get notice by ID handler
   * GET /api/notices/:id
   */
  async getNoticeById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      // This would need to be implemented in the service/repository
      // For now, we'll return an error
      return errorResponse(res, 'Not implemented', 'SRV_5001', 501);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create notice handler
   * POST /api/notices
   */
  async createNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { content, recipients } = req.body;
      const authorId = req.user?.id;

      if (!authorId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      if (!content || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return errorResponse(
          res,
          'Content and recipients array are required',
          'VAL_3001',
          400
        );
      }

      const result = await noticeService.createNotice(authorId, { content, recipients });

      return successResponse(res, result, 'Notice created successfully', 201);
    } catch (error: any) {
      if (error.message.includes('required') || error.message.includes('No valid recipients')) {
        return errorResponse(res, error.message, 'VAL_3001', 400);
      }
      next(error);
    }
  }

  /**
   * Mark as read handler
   * PATCH /api/notices/:id/read
   */
  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const notice = await noticeService.markAsRead(id, userId);

      return successResponse(res, notice, 'Notice marked as read');
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message.includes('permission')) {
        return errorResponse(res, error.message, 'AUTHZ_2001', 403);
      }
      next(error);
    }
  }

  /**
   * Mark as unread handler
   * PATCH /api/notices/:id/unread
   */
  async markAsUnread(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const notice = await noticeService.markAsUnread(id, userId);

      return successResponse(res, notice, 'Notice marked as unread');
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message.includes('permission')) {
        return errorResponse(res, error.message, 'AUTHZ_2001', 403);
      }
      next(error);
    }
  }

  /**
   * Mark all as read handler
   * PATCH /api/notices/mark-all-read
   */
  async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const result = await noticeService.markAllAsRead(userId);

      return successResponse(res, result, 'All notices marked as read');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete notice handler
   * DELETE /api/notices/:id
   */
  async deleteNotice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const userRole = req.user?.role;

      if (!userId || !userRole) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      await noticeService.deleteNotice(id, userId, userRole);

      return successResponse(res, null, 'Notice deleted successfully');
    } catch (error: any) {
      if (error.message === 'Notice not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message.includes('permission')) {
        return errorResponse(res, error.message, 'AUTHZ_2001', 403);
      }
      next(error);
    }
  }
}

export default new NoticeController();
