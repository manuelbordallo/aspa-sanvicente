import { Request, Response, NextFunction } from 'express';
import authService from '../services/auth.service';
import userService from '../services/user.service';
import emailService from '../services/email.service';
import { successResponse, errorResponse } from '../utils/response.util';

// Extend Request to include authenticated user
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'admin' | 'user';
  };
}

class AuthController {
  /**
   * Login handler
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return errorResponse(res, 'Email and password are required', 'VAL_3001', 400);
      }

      const result = await authService.login(email, password);

      return successResponse(res, result, 'Login successful', 200);
    } catch (error: any) {
      if (error.message === 'Invalid credentials' || error.message === 'Account is deactivated') {
        return errorResponse(res, error.message, 'AUTH_1001', 401);
      }
      next(error);
    }
  }

  /**
   * Logout handler (optional tracking)
   * POST /api/auth/logout
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Optional: Implement token blacklisting or session tracking here
      return successResponse(res, null, 'Logout successful', 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Validate token handler
   * GET /api/auth/validate
   */
  async validateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return errorResponse(res, 'Token is required', 'AUTH_1003', 401);
      }

      const result = await authService.validateToken(token);

      return successResponse(res, result, 'Token is valid', 200);
    } catch (error: any) {
      if (error.message === 'User not found' || error.message === 'Account is deactivated') {
        return errorResponse(res, error.message, 'AUTH_1003', 401);
      }
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Invalid or expired token', 'AUTH_1002', 401);
      }
      next(error);
    }
  }

  /**
   * Refresh token handler
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token is required', 'AUTH_1003', 400);
      }

      const result = await authService.refreshToken(refreshToken);

      return successResponse(res, result, 'Token refreshed successfully', 200);
    } catch (error: any) {
      if (error.message === 'User not found' || error.message === 'Account is deactivated') {
        return errorResponse(res, error.message, 'AUTH_1003', 401);
      }
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return errorResponse(res, 'Invalid or expired refresh token', 'AUTH_1002', 401);
      }
      next(error);
    }
  }

  /**
   * Change password handler
   * POST /api/auth/change-password
   */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Current password and new password are required', 'VAL_3001', 400);
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      return successResponse(res, null, 'Password changed successfully', 200);
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        return errorResponse(res, error.message, 'AUTH_1001', 400);
      }
      if (error.message.includes('Password must be')) {
        return errorResponse(res, error.message, 'VAL_3003', 400);
      }
      next(error);
    }
  }

  /**
   * Get profile handler
   * GET /api/auth/profile
   */
  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const user = await userService.getUserById(userId);

      return successResponse(res, user, undefined, 200);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      next(error);
    }
  }

  /**
   * Update profile handler
   * PUT /api/auth/profile
   */
  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return errorResponse(res, 'Unauthorized', 'AUTH_1004', 401);
      }

      const { firstName, lastName, email } = req.body;

      // Don't allow role or password changes through profile update
      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (email !== undefined) updateData.email = email;

      const user = await userService.updateUser(userId, updateData);

      return successResponse(res, user, 'Profile updated successfully', 200);
    } catch (error: any) {
      if (error.message === 'User not found') {
        return errorResponse(res, error.message, 'RES_4001', 404);
      }
      if (error.message === 'Email already exists') {
        return errorResponse(res, error.message, 'VAL_3004', 400);
      }
      next(error);
    }
  }

  /**
   * Forgot password handler
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, 'Email is required', 'VAL_3001', 400);
      }

      const { token, userId } = await authService.requestPasswordReset(email);

      // Get user info for email
      const user = await userService.getUserById(userId);
      const userName = `${user.firstName} ${user.lastName}`;

      // Send password reset email
      await emailService.sendPasswordResetEmail(email, token, userName);

      return successResponse(
        res,
        null,
        'If the email exists, a password reset link has been sent',
        200
      );
    } catch (error: any) {
      // Don't reveal if email exists or not
      if (error.message.includes('email exists')) {
        return successResponse(
          res,
          null,
          'If the email exists, a password reset link has been sent',
          200
        );
      }
      next(error);
    }
  }

  /**
   * Reset password handler
   * POST /api/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return errorResponse(res, 'Token and new password are required', 'VAL_3001', 400);
      }

      await authService.resetPassword(token, newPassword);

      return successResponse(res, null, 'Password reset successfully', 200);
    } catch (error: any) {
      if (
        error.message.includes('Invalid or expired') ||
        error.message.includes('already been used')
      ) {
        return errorResponse(res, error.message, 'AUTH_1003', 400);
      }
      if (error.message.includes('Password must be')) {
        return errorResponse(res, error.message, 'VAL_3003', 400);
      }
      next(error);
    }
  }
}

export default new AuthController();
