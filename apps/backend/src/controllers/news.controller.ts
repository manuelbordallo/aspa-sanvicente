import { Response, NextFunction } from 'express';
import newsService from '../services/news.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { buildPaginationParams } from '../utils/pagination.util';
import { AuthenticatedRequest } from './auth.controller';

class NewsController {
    /**
     * Get news handler with pagination and filter query params
     * GET /api/news
     */
    async getNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
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
            if (req.query.authorId) {
                filters.authorId = req.query.authorId as string;
            }

            const result = await newsService.getNews(pagination, filters);

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
     * Get news by ID handler
     * GET /api/news/:id
     */
    async getNewsById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;

            const news = await newsService.getNewsById(id);

            return successResponse(res, news);
        } catch (error: any) {
            if (error.message === 'News not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            next(error);
        }
    }

    /**
     * Create news handler
     * POST /api/news
     */
    async createNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { title, content, summary } = req.body;
            const authorId = req.user?.id;

            if (!authorId) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            if (!title || !content || !summary) {
                return errorResponse(res, 'Title, content, and summary are required', 'VAL_3001', 400);
            }

            const newsData = {
                title,
                content,
                summary,
                authorId,
            };

            const news = await newsService.createNews(newsData);

            return successResponse(res, news, 'News created successfully', 201);
        } catch (error: any) {
            if (error.message.includes('required')) {
                return errorResponse(res, error.message, 'VAL_3001', 400);
            }
            next(error);
        }
    }

    /**
     * Update news handler
     * PUT /api/news/:id
     */
    async updateNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const { title, content, summary } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (content !== undefined) updateData.content = content;
            if (summary !== undefined) updateData.summary = summary;

            const news = await newsService.updateNews(id, updateData, userId, userRole);

            return successResponse(res, news, 'News updated successfully');
        } catch (error: any) {
            if (error.message === 'News not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            if (error.message.includes('permission')) {
                return errorResponse(res, error.message, 'AUTHZ_2001', 403);
            }
            next(error);
        }
    }

    /**
     * Delete news handler
     * DELETE /api/news/:id
     */
    async deleteNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
            }

            await newsService.deleteNews(id, userId, userRole);

            return successResponse(res, null, 'News deleted successfully');
        } catch (error: any) {
            if (error.message === 'News not found') {
                return errorResponse(res, error.message, 'RES_4001', 404);
            }
            if (error.message.includes('permission')) {
                return errorResponse(res, error.message, 'AUTHZ_2001', 403);
            }
            next(error);
        }
    }
}

export default new NewsController();
