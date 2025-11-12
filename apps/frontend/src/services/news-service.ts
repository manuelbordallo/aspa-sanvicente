import { apiClient } from './api-client.js';
import type {
  News,
  NewsFormData,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';

export interface NewsFilters {
  search?: string;
  authorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface NewsPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export class NewsService {
  /**
   * Get all news with optional pagination and filters
   */
  async getNews(
    options: NewsPaginationOptions = {},
    filters: NewsFilters = {}
  ): Promise<PaginatedResponse<News>> {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    // Add filters
    if (filters.search) params.append('search', filters.search);
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate)
      params.append('endDate', filters.endDate.toISOString());

    const queryString = params.toString();
    const endpoint = queryString ? `/api/news?${queryString}` : '/api/news';

    const response: any = await apiClient.get(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener las noticias');
    }

    // Backend returns: { success, data: T[], pagination }
    // Convert to frontend format: { data: T[], total, page, ... }
    const newsItems = response.data.map((news: any) => ({
      ...news,
      createdAt: new Date(news.createdAt),
      updatedAt: new Date(news.updatedAt),
      author: {
        ...news.author,
        createdAt: new Date(news.author.createdAt),
        updatedAt: new Date(news.author.updatedAt),
      },
    }));

    return {
      data: newsItems,
      total: response.pagination.total,
      page: response.pagination.page,
      limit: response.pagination.limit,
      totalPages: response.pagination.totalPages,
      hasNext: response.pagination.hasNext,
      hasPrev: response.pagination.hasPrev,
    };
  }

  /**
   * Get a single news item by ID
   */
  async getNewsById(id: string): Promise<News> {
    const response: ApiResponse<News> = await apiClient.get(`/api/news/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Noticia no encontrada');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Create a new news item (admin only)
   */
  async createNews(newsData: NewsFormData): Promise<News> {
    const response: ApiResponse<News> = await apiClient.post('/api/news', newsData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear la noticia');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Update an existing news item (admin only)
   */
  async updateNews(id: string, newsData: Partial<NewsFormData>): Promise<News> {
    const response: ApiResponse<News> = await apiClient.put(
      `/api/news/${id}`,
      newsData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al actualizar la noticia');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      updatedAt: new Date(response.data.updatedAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Delete a news item (admin only)
   */
  async deleteNews(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(`/api/news/${id}`);

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar la noticia');
    }
  }

  /**
   * Get recent news (for dashboard/home page)
   */
  async getRecentNews(limit: number = 5): Promise<News[]> {
    const response = await this.getNews({
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    return response.data;
  }

  /**
   * Search news by title or content
   */
  async searchNews(query: string, limit: number = 10): Promise<News[]> {
    const response = await this.getNews(
      { limit, sortBy: 'createdAt', sortOrder: 'desc' },
      { search: query }
    );

    return response.data;
  }

  /**
   * Get news by author
   */
  async getNewsByAuthor(
    authorId: string,
    options: NewsPaginationOptions = {}
  ): Promise<PaginatedResponse<News>> {
    return this.getNews(options, { authorId });
  }
}

// Create and export default instance
export const newsService = new NewsService();
