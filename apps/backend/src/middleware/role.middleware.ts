import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { errorResponse } from '../utils/response.util';

/**
 * Middleware to require admin role
 * Must be used after authenticateToken middleware
 * Returns 403 for non-admin users
 */
export function requireAdmin(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    // Check if user is attached to request (should be done by auth middleware)
    if (!req.user) {
        errorResponse(
            res,
            'Authentication required',
            'AUTH_1004',
            401
        );
        return;
    }

    // Check if user has admin role
    if (req.user.role !== 'admin') {
        errorResponse(
            res,
            'Insufficient permissions. Admin role required.',
            'AUTHZ_2002',
            403
        );
        return;
    }

    next();
}
