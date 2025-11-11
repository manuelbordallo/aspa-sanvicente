import { News } from '@prisma/client';
import newsRepository, { CreateNewsData, UpdateNewsData, NewsFilters } from '../repositories/news.repository';
import { PaginationParams, PaginationResult } from '../utils/pagination.util';

class NewsService {
  /**
   * Get news with pagination, date filtering, and search
   */
  async getNews(
    pagination: PaginationParams,
    filters?: NewsFilters
  ): Promise<PaginationResult<News>> {
    const { news, total } = await newsRepository.findAll(pagination, filters);

    return {
      data: news,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.skip + pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  /**
   * Get news by ID
   */
  async getNewsById(id: string): Promise<News> {
    const news = await newsRepository.findById(id);

    if (!news) {
      throw new Error('News not found');
    }

    return news;
  }

  /**
   * Create news with authorId from authenticated user
   */
  async createNews(data: CreateNewsData): Promise<News> {
    // Validate required fields
    if (!data.title || !data.content || !data.summary) {
      throw new Error('Title, content, and summary are required');
    }

    // Create news
    const news = await newsRepository.create(data);

    return news;
  }

  /**
   * Update news with ownership validation
   */
  async updateNews(
    id: string,
    data: UpdateNewsData,
    userId: string,
    userRole: 'admin' | 'user'
  ): Promise<News> {
    // Check if news exists
    const existingNews = await newsRepository.findById(id);

    if (!existingNews) {
      throw new Error('News not found');
    }

    // Validate ownership (only author or admin can update)
    if (existingNews.authorId !== userId && userRole !== 'admin') {
      throw new Error('You do not have permission to update this news');
    }

    // Update news
    const news = await newsRepository.update(id, data);

    return news;
  }

  /**
   * Delete news
   */
  async deleteNews(id: string, userId: string, userRole: 'admin' | 'user'): Promise<void> {
    // Check if news exists
    const existingNews = await newsRepository.findById(id);

    if (!existingNews) {
      throw new Error('News not found');
    }

    // Validate ownership (only author or admin can delete)
    if (existingNews.authorId !== userId && userRole !== 'admin') {
      throw new Error('You do not have permission to delete this news');
    }

    // Delete news
    await newsRepository.delete(id);
  }
}

export default new NewsService();
