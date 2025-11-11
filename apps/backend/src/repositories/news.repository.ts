import prisma from '../config/database';
import { News } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.util';

export interface NewsFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateNewsData {
  title: string;
  content: string;
  summary: string;
  authorId: string;
}

export interface UpdateNewsData {
  title?: string;
  content?: string;
  summary?: string;
}

class NewsRepository {
  /**
   * Find all news with pagination, date filtering, search, and sorting
   */
  async findAll(
    pagination: PaginationParams,
    filters?: NewsFilters
  ): Promise<{ news: News[]; total: number }> {
    const where: any = {};

    // Apply search filter
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Apply date range filters
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (pagination.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder;
    } else {
      orderBy.createdAt = pagination.sortOrder;
    }

    // Execute queries
    const [news, total] = await Promise.all([
      prisma.news.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      }),
      prisma.news.count({ where }),
    ]);

    return { news, total };
  }

  /**
   * Find news by ID with author relation
   */
  async findById(id: string): Promise<News | null> {
    return prisma.news.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }) as Promise<News | null>;
  }

  /**
   * Create new news with authorId
   */
  async create(data: CreateNewsData): Promise<News> {
    return prisma.news.create({
      data: {
        title: data.title,
        content: data.content,
        summary: data.summary,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }) as Promise<News>;
  }

  /**
   * Update news data
   */
  async update(id: string, data: UpdateNewsData): Promise<News> {
    return prisma.news.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }) as Promise<News>;
  }

  /**
   * Delete news record
   */
  async delete(id: string): Promise<News> {
    return prisma.news.delete({
      where: { id },
    });
  }
}

export default new NewsRepository();
