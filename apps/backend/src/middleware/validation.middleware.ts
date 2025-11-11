import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../utils/response.util';

/**
 * Middleware factory to validate request body against Zod schema
 * Returns 400 with field-level validation errors if validation fails
 * @param schema - Zod schema to validate against
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate request body against schema
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod validation errors into field-level details
        const fieldErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        errorResponse(
          res,
          'Validation failed',
          'VAL_3001',
          400,
          { errors: fieldErrors }
        );
        return;
      }

      // Handle unexpected errors
      errorResponse(
        res,
        'Validation error',
        'VAL_3001',
        400
      );
    }
  };
}
