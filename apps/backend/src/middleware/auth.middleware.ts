import { Request, Response, NextFunction } from 'express';
import { verifyToken, DecodedToken } from '../utils/jwt.util';
import { errorResponse } from '../utils/response.util';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: 'admin' | 'user';
    };
}

/**
 * Middleware to authenticate JWT token from Authorization header
 * Extracts and verifies JWT, attaches user info to request
 * Returns 401 for missing, expired, or invalid tokens
 */
export function authenticateToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            errorResponse(
                res,
                'Authorization header is missing',
                'AUTH_1004',
                401
            );
            return;
        }

        // Check if header follows "Bearer <token>" format
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            errorResponse(
                res,
                'Authorization header must be in format: Bearer <token>',
                'AUTH_1004',
                401
            );
            return;
        }

        const token = parts[1];

        // Verify token
        const decoded: DecodedToken = verifyToken(token);

        // Attach user information to request
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'Token has expired') {
                errorResponse(
                    res,
                    'Token has expired',
                    'AUTH_1002',
                    401
                );
                return;
            }
            if (error.message === 'Invalid token') {
                errorResponse(
                    res,
                    'Invalid token',
                    'AUTH_1003',
                    401
                );
                return;
            }
        }

        errorResponse(
            res,
            'Authentication failed',
            'AUTH_1004',
            401
        );
    }
}
