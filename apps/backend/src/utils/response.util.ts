import { Response } from 'express';
import { PaginationMetadata } from './pagination.util';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ApiPaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMetadata;
}

/**
 * Send a success response
 * @param res - Express response object
 * @param data - Data to send in response
 * @param message - Optional success message
 * @param statusCode - HTTP status code (default: 200)
 */
export function successResponse<T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param res - Express response object
 * @param message - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code
 * @param details - Optional additional error details
 */
export function errorResponse(
  res: Response,
  message: string,
  code: string,
  statusCode: number,
  details?: any
): Response {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
    status: statusCode,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
}

/**
 * Send a paginated response
 * @param res - Express response object
 * @param data - Array of data items
 * @param pagination - Pagination metadata
 * @param statusCode - HTTP status code (default: 200)
 */
export function paginatedResponse<T>(
  res: Response,
  data: T[],
  pagination: PaginationMetadata,
  statusCode: number = 200
): Response {
  const response: ApiPaginatedResponse<T> = {
    success: true,
    data,
    pagination,
  };

  return res.status(statusCode).json(response);
}
