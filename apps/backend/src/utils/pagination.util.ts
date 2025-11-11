export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
    sortBy?: string;
    sortOrder: 'asc' | 'desc';
}

export interface PaginationMetadata {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Parse and validate pagination parameters from query string
 * @param query - Query object from request
 * @returns Validated pagination parameters
 */
export function buildPaginationParams(query: any): PaginationParams {
    // Parse page number (default: 1, min: 1)
    let page = parseInt(query.page as string, 10);
    if (isNaN(page) || page < 1) {
        page = 1;
    }

    // Parse limit (default: 10, min: 1, max: 100)
    let limit = parseInt(query.limit as string, 10);
    if (isNaN(limit) || limit < 1) {
        limit = 10;
    }
    if (limit > 100) {
        limit = 100;
    }

    // Calculate skip for database query
    const skip = (page - 1) * limit;

    // Parse sort order (default: 'desc')
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    // Parse sortBy field (optional)
    const sortBy = query.sortBy as string | undefined;

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    };
}

/**
 * Build pagination metadata for response
 * @param total - Total number of records
 * @param page - Current page number
 * @param limit - Records per page
 * @returns Pagination metadata object
 */
export function buildPaginationResponse(
    total: number,
    page: number,
    limit: number
): PaginationMetadata {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        total,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrev,
    };
}
