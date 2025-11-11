import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../utils/response.util';

/**
 * Custom error class with additional properties
 */
export class AppError extends Error {
    statusCode: number;
    code: string;
    details?: any;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'SRV_5001',
        details?: any
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handling middleware
 * Catches all errors, formats them consistently, and logs them
 * Returns appropriate HTTP status codes
 */
export function errorHandler(
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void {
    // Log error with stack trace
    console.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
    });

    // Determine status code and error code
    let statusCode = 500;
    let errorCode = 'SRV_5001';
    let details: any = undefined;

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        errorCode = err.code;
        details = err.details;
    }

    // Build error response
    const response: ApiErrorResponse = {
        success: false,
        message: err.message || 'Internal server error',
        code: errorCode,
        status: statusCode,
    };

    // Include details if available
    if (details) {
        response.details = details;
    }

    // Include stack trace in development mode
    if (process.env.NODE_ENV === 'development') {
        response.details = {
            ...response.details,
            stack: err.stack,
        };
    }

    res.status(statusCode).json(response);
}

/**
 * Middleware to handle 404 Not Found errors
 * Should be placed after all route handlers
 */
export function notFoundHandler(
    req: Request,
    _res: Response,
    next: NextFunction
): void {
    const error = new AppError(
        `Route not found: ${req.method} ${req.url}`,
        404,
        'RES_4001'
    );
    next(error);
}
