import { Response, NextFunction } from 'express';
import groupService from '../services/group.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { AuthenticatedRequest } from './auth.controller';

class GroupController {
  /**
   * Get groups handler
   * GET /api/groups
   */
  async getGroups(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const groups = await groupService.getGroups();

      return successResponse(res, groups);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get group by ID handler
   * GET /api/groups/:id
   */
  async getGroupById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      const group = await groupService.getGroupById(id);

      return successResponse(res, group);
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      next(error);
    }
  }

  /**
   * Create group handler
   * POST /api/groups
   */
  async createGroup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { name, userIds } = req.body;

      if (!name) {
        return errorResponse(res, 'Group name is required', 'VAL_3001', 400);
      }

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return errorResponse(res, 'At least one member is required', 'VAL_3001', 400);
      }

      const groupData = {
        name,
        userIds,
      };

      const group = await groupService.createGroup(groupData);

      return successResponse(res, group, 'Group created successfully', 201);
    } catch (error: any) {
      if (error.message.includes('required')) {
        return errorResponse(res, error.message, 'VAL_3001', 400);
      }
      next(error);
    }
  }

  /**
   * Update group handler
   * PUT /api/groups/:id
   */
  async updateGroup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;
      const { name, userIds } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (userIds !== undefined) {
        if (!Array.isArray(userIds) || userIds.length === 0) {
          return errorResponse(res, 'At least one member is required', 'VAL_3001', 400);
        }
        updateData.userIds = userIds;
      }

      const group = await groupService.updateGroup(id, updateData);

      return successResponse(res, group, 'Group updated successfully');
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message.includes('required')) {
        return errorResponse(res, error.message, 'VAL_3001', 400);
      }
      next(error);
    }
  }

  /**
   * Delete group handler
   * DELETE /api/groups/:id
   */
  async deleteGroup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { id } = req.params;

      await groupService.deleteGroup(id);

      return successResponse(res, null, 'Group deleted successfully');
    } catch (error: any) {
      if (error.message === 'Group not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      next(error);
    }
  }
}

export default new GroupController();
