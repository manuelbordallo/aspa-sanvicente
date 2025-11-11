import prisma from '../config/database';
import { Notice } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.util';

export interface NoticeFilters {
  isRead?: boolean;
}

export interface CreateNoticeData {
  content: string;
  authorId: string;
  recipientId: string;
}

class NoticeRepository {
  /**
   * Find notices by recipient with pagination and read/unread filtering
   */
  async findByRecipient(
    recipientId: string,
    pagination: PaginationParams,
    filters?: NoticeFilters
  ): Promise<{ notices: Notice[]; total: number }> {
    const where: any = {
      recipientId,
    };

    // Apply read/unread filter
    if (filters?.isRead !== undefined) {
      where.isRead = filters.isRead;
    }

    // Build orderBy
    const orderBy: any = {};
    if (pagination.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder;
    } else {
      orderBy.createdAt = pagination.sortOrder;
    }

    // Execute queries
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
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
      prisma.notice.count({ where }),
    ]);

    return { notices, total };
  }

  /**
   * Find notices by author (sent notices)
   */
  async findByAuthor(
    authorId: string,
    pagination: PaginationParams
  ): Promise<{ notices: Notice[]; total: number }> {
    const where = { authorId };

    // Build orderBy
    const orderBy: any = {};
    if (pagination.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder;
    } else {
      orderBy.createdAt = pagination.sortOrder;
    }

    // Execute queries
    const [notices, total] = await Promise.all([
      prisma.notice.findMany({
        where,
        skip: pagination.skip,
        take: pagination.limit,
        orderBy,
        include: {
          recipient: {
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
      prisma.notice.count({ where }),
    ]);

    return { notices, total };
  }

  /**
   * Find notice by ID
   */
  async findById(id: string): Promise<Notice | null> {
    return prisma.notice.findUnique({
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
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }) as Promise<Notice | null>;
  }

  /**
   * Create notice record for a recipient
   */
  async create(data: CreateNoticeData): Promise<Notice> {
    return prisma.notice.create({
      data: {
        content: data.content,
        authorId: data.authorId,
        recipientId: data.recipientId,
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
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    }) as Promise<Notice>;
  }

  /**
   * Create multiple notice records (for multiple recipients)
   */
  async createMany(notices: CreateNoticeData[]): Promise<number> {
    const result = await prisma.notice.createMany({
      data: notices,
    });
    return result.count;
  }

  /**
   * Mark notice as read
   */
  async markAsRead(id: string): Promise<Notice> {
    return prisma.notice.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark notice as unread
   */
  async markAsUnread(id: string): Promise<Notice> {
    return prisma.notice.update({
      where: { id },
      data: {
        isRead: false,
        readAt: null,
      },
    });
  }

  /**
   * Mark all notices as read for a specific user
   */
  async markAllAsRead(recipientId: string): Promise<number> {
    const result = await prisma.notice.updateMany({
      where: {
        recipientId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }

  /**
   * Count unread notices for a specific user
   */
  async countUnread(recipientId: string): Promise<number> {
    return prisma.notice.count({
      where: {
        recipientId,
        isRead: false,
      },
    });
  }

  /**
   * Delete notice
   */
  async delete(id: string): Promise<Notice> {
    return prisma.notice.delete({
      where: { id },
    });
  }
}

export default new NoticeRepository();
