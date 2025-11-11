import { Response, NextFunction } from 'express';
import userService from '../services/user.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { buildPaginationParams } from '../utils/pagination.util';
import { AuthenticatedRequest } from './auth.controller';

class UserController {
  /**
   * Get users handler with pagination query params
   * GET /api/users
   */
  async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Parse pagination parameters
      const pagination = buildPaginationParams(req.query);

      // Parse filters
      const filters: any = {};
      if (req.query.role) {
        filters.role = req.query.role as 'admin' | 'user';
      }
      if (req.query.isActive !== undefined) {
        filters.isActive = req.query.isActive === 'true';
      }
      if (req.query.search) {
        filters.search = req.query.search as string;
      }

      const result = await userService.getUsers(pagination, filters);

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
   * Get user by ID handler
   * GET /api/users/:id
   */
  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await userService.getUserById(id);

      return successResponse(res, user);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      next(error);
    }
  }

  /**
   * Create user handler
   * POST /api/users
   */
  async createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { firstName, lastName, email, password, role } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        return errorResponse(
          res,
          'First name, last name, email, and password are required',
          'VAL_3001',
          400
        );
      }

      const userData = {
        firstName,
        lastName,
        email,
        password,
        role: role || 'user',
      };

      const user = await userService.createUser(userData);

      return successResponse(res, user, 'User created successfully', 201);
    } catch (error: any) {
      if (error.message === 'Email already exists') {
        return errorResponse(res, error.message, 'VAL_3004', 400);
      }
      if (error.message.includes('Password must be')) {
        return errorResponse(res, error.message, 'VAL_3003', 400);
      }
      next(error);
    }
  }

  /**
   * Update user handler
   * PUT /api/users/:id
   */
  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, role, isActive } = req.body;

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;
      if (role !== undefined) updateData.role = role;
      if (isActive !== undefined) updateData.isActive = isActive;

      const user = await userService.updateUser(id, updateData);

      return successResponse(res, user, 'User updated successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message === 'Email already exists') {
        return errorResponse(res, error.message, 'VAL_3004', 400);
      }
      if (error.message.includes('Password must be')) {
        return errorResponse(res, error.message, 'VAL_3003', 400);
      }
      next(error);
    }
  }

  /**
   * Delete user handler (deactivate)
   * DELETE /api/users/:id
   */
  async deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const user = await userService.deactivateUser(id);

      return successResponse(res, user, 'User deactivated successfully');
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      next(error);
    }
  }
}

export default new UserController();
