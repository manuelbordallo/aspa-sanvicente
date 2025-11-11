import { Notice } from '@prisma/client';
import noticeRepository, { CreateNoticeData, NoticeFilters } from '../repositories/notice.repository';
import groupRepository from '../repositories/group.repository';
import userRepository from '../repositories/user.repository';
import { PaginationParams, PaginationResult } from '../utils/pagination.util';

export interface CreateNoticeInput {
  content: string;
  recipients: string[]; // Array of user IDs or group IDs (prefixed with 'group:')
}

export interface RecipientInfo {
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  }>;
  groups: Array<{
    id: string;
    name: string;
  }>;
}

class NoticeService {
  /**
   * Get notices for recipient with pagination and filtering
   */
  async getNotices(
    recipientId: string,
    pagination: PaginationParams,
    filters?: NoticeFilters
  ): Promise<PaginationResult<Notice>> {
    const { notices, total } = await noticeRepository.findByRecipient(
      recipientId,
      pagination,
      filters
    );

    return {
      data: notices,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.skip + pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  /**
   * Get sent notices for author
   */
  async getSentNotices(
    authorId: string,
    pagination: PaginationParams
  ): Promise<PaginationResult<Notice>> {
    const { notices, total } = await noticeRepository.findByAuthor(authorId, pagination);

    return {
      data: notices,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.skip + pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: string): Promise<number> {
    return noticeRepository.countUnread(userId);
  }

  /**
   * Create notice for multiple recipients (expand groups to users)
   */
  async createNotice(authorId: string, input: CreateNoticeInput): Promise<{ count: number }> {
    if (!input.content || !input.recipients || input.recipients.length === 0) {
      throw new Error('Content and recipients are required');
    }

    // Separate user IDs and group IDs
    const userIds: string[] = [];
    const groupIds: string[] = [];

    for (const recipient of input.recipients) {
      if (recipient.startsWith('group:')) {
        groupIds.push(recipient.replace('group:', ''));
      } else {
        userIds.push(recipient);
      }
    }

    // Expand groups to user IDs
    const groupUserIds: string[] = [];
    for (const groupId of groupIds) {
      const members = await groupRepository.getUserIds(groupId);
      groupUserIds.push(...members);
    }

    // Combine and deduplicate user IDs
    const allUserIds = [...new Set([...userIds, ...groupUserIds])];

    if (allUserIds.length === 0) {
      throw new Error('No valid recipients found');
    }

    // Create notice records for each recipient
    const noticeData: CreateNoticeData[] = allUserIds.map((recipientId) => ({
      content: input.content,
      authorId,
      recipientId,
    }));

    const count = await noticeRepository.createMany(noticeData);

    return { count };
  }

  /**
   * Mark notice as read
   */
  async markAsRead(noticeId: string, userId: string): Promise<Notice> {
    // Check if notice exists and belongs to user
    const notice = await noticeRepository.findById(noticeId);

    if (!notice) {
      throw new Error('Notice not found');
    }

    if (notice.recipientId !== userId) {
      throw new Error('You do not have permission to mark this notice as read');
    }

    return noticeRepository.markAsRead(noticeId);
  }

  /**
   * Mark notice as unread
   */
  async markAsUnread(noticeId: string, userId: string): Promise<Notice> {
    // Check if notice exists and belongs to user
    const notice = await noticeRepository.findById(noticeId);

    if (!notice) {
      throw new Error('Notice not found');
    }

    if (notice.recipientId !== userId) {
      throw new Error('You do not have permission to mark this notice as unread');
    }

    return noticeRepository.markAsUnread(noticeId);
  }

  /**
   * Mark all notices as read for user
   */
  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const count = await noticeRepository.markAllAsRead(userId);
    return { count };
  }

  /**
   * Delete notice with ownership check
   */
  async deleteNotice(noticeId: string, userId: string, userRole: 'admin' | 'user'): Promise<void> {
    // Check if notice exists
    const notice = await noticeRepository.findById(noticeId);

    if (!notice) {
      throw new Error('Notice not found');
    }

    // Only author or admin can delete
    if (notice.authorId !== userId && userRole !== 'admin') {
      throw new Error('You do not have permission to delete this notice');
    }

    await noticeRepository.delete(noticeId);
  }

  /**
   * Get available recipients (users and groups)
   */
  async getRecipients(): Promise<RecipientInfo> {
    // Get all active users
    const { users } = await userRepository.findAll(
      { page: 1, limit: 1000, skip: 0, sortOrder: 'asc' },
      { isActive: true }
    );

    // Get all groups
    const groups = await groupRepository.findAll();

    return {
      users: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      })),
      groups: groups.map((group) => ({
        id: group.id,
        name: group.name,
      })),
    };
  }
}

export default new NoticeService();
