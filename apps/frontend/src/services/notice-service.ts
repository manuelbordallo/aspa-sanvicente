import { apiClient } from './api-client.js';
import type {
  Notice,
  NoticeFormData,
  ApiResponse,
  PaginatedResponse,
  User,
} from '../types/index.js';

export interface NoticeFilters {
  isRead?: boolean;
  authorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface NoticePaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export class NoticeService {
  /**
   * Get notices for current user with optional pagination and filters
   */
  async getNotices(
    options: NoticePaginationOptions = {},
    filters: NoticeFilters = {}
  ): Promise<PaginatedResponse<Notice>> {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    // Add filters
    if (filters.isRead !== undefined)
      params.append('isRead', filters.isRead.toString());
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate)
      params.append('endDate', filters.endDate.toISOString());

    const queryString = params.toString();
    const endpoint = queryString ? `/notices?${queryString}` : '/notices';

    const response: ApiResponse<PaginatedResponse<Notice>> =
      await apiClient.get(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener los avisos');
    }

    // Convert date strings to Date objects
    response.data.data = response.data.data.map((notice) => ({
      ...notice,
      createdAt: new Date(notice.createdAt),
      readAt: notice.readAt ? new Date(notice.readAt) : undefined,
      author: {
        ...notice.author,
        createdAt: new Date(notice.author.createdAt),
        updatedAt: new Date(notice.author.updatedAt),
      },
    }));

    return response.data;
  }

  /**
   * Get unread notices for current user
   */
  async getUnreadNotices(): Promise<Notice[]> {
    const response = await this.getNotices(
      { sortBy: 'createdAt', sortOrder: 'desc' },
      { isRead: false }
    );

    return response.data;
  }

  /**
   * Get unread notices count
   */
  async getUnreadCount(): Promise<number> {
    const response: ApiResponse<{ count: number }> = await apiClient.get(
      '/notices/unread-count'
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al obtener el conteo de avisos'
      );
    }

    return response.data.count;
  }

  /**
   * Get a single notice by ID
   */
  async getNoticeById(id: string): Promise<Notice> {
    const response: ApiResponse<Notice> = await apiClient.get(`/notices/${id}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Aviso no encontrado');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      readAt: response.data.readAt ? new Date(response.data.readAt) : undefined,
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Create a new notice
   */
  async createNotice(noticeData: NoticeFormData): Promise<Notice> {
    const response: ApiResponse<Notice> = await apiClient.post(
      '/notices',
      noticeData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear el aviso');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      readAt: response.data.readAt ? new Date(response.data.readAt) : undefined,
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Mark a notice as read
   */
  async markAsRead(id: string): Promise<Notice> {
    const response: ApiResponse<Notice> = await apiClient.patch(
      `/notices/${id}/read`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al marcar el aviso como leído'
      );
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      readAt: response.data.readAt ? new Date(response.data.readAt) : undefined,
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Mark a notice as unread
   */
  async markAsUnread(id: string): Promise<Notice> {
    const response: ApiResponse<Notice> = await apiClient.patch(
      `/notices/${id}/unread`
    );

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al marcar el aviso como no leído'
      );
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      createdAt: new Date(response.data.createdAt),
      readAt: response.data.readAt ? new Date(response.data.readAt) : undefined,
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Mark all notices as read
   */
  async markAllAsRead(): Promise<void> {
    const response: ApiResponse<void> = await apiClient.patch(
      '/notices/mark-all-read'
    );

    if (!response.success) {
      throw new Error(
        response.message || 'Error al marcar todos los avisos como leídos'
      );
    }
  }

  /**
   * Delete a notice (author or admin only)
   */
  async deleteNotice(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(
      `/notices/${id}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar el aviso');
    }
  }

  /**
   * Get notices sent by current user
   */
  async getSentNotices(
    options: NoticePaginationOptions = {}
  ): Promise<PaginatedResponse<Notice>> {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/notices/sent?${queryString}`
      : '/notices/sent';

    const response: ApiResponse<PaginatedResponse<Notice>> =
      await apiClient.get(endpoint);

    if (!response.success || !response.data) {
      throw new Error(
        response.message || 'Error al obtener los avisos enviados'
      );
    }

    // Convert date strings to Date objects
    response.data.data = response.data.data.map((notice) => ({
      ...notice,
      createdAt: new Date(notice.createdAt),
      readAt: notice.readAt ? new Date(notice.readAt) : undefined,
      author: {
        ...notice.author,
        createdAt: new Date(notice.author.createdAt),
        updatedAt: new Date(notice.author.updatedAt),
      },
    }));

    return response.data;
  }

  /**
   * Get available recipients for notices (users and groups)
   */
  async getRecipients(): Promise<{ users: User[]; groups: any[] }> {
    const response: ApiResponse<{ users: User[]; groups: any[] }> =
      await apiClient.get('/notices/recipients');

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener los destinatarios');
    }

    // Convert date strings to Date objects for users
    response.data.users = response.data.users.map((user) => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));

    return response.data;
  }
}

// Create and export default instance
export const noticeService = new NoticeService();
