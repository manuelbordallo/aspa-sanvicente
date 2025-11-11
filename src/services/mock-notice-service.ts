import type {
  Notice,
  NoticeFormData,
  PaginatedResponse,
  User,
} from '../types/index.js';
import type {
  NoticeFilters,
  NoticePaginationOptions,
} from './notice-service.js';

const STORAGE_KEY = 'mock_notices_data';

// Mock author user
const MOCK_AUTHOR: User = {
  id: '1',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Mock recipient user
const MOCK_USER: User = {
  id: '2',
  email: 'user@example.com',
  firstName: 'Regular',
  lastName: 'User',
  role: 'user',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

// Initial mock notices data
const INITIAL_NOTICES: Notice[] = [
  {
    id: '1',
    content:
      'Bienvenido al sistema de avisos. Este es un aviso de demostración.',
    author: MOCK_AUTHOR,
    recipients: [MOCK_USER],
    isRead: false,
    createdAt: new Date('2024-11-08'),
  },
  {
    id: '2',
    content:
      'Recuerda que estás en modo de desarrollo. Los datos se guardan localmente.',
    author: MOCK_AUTHOR,
    recipients: [MOCK_USER],
    isRead: false,
    createdAt: new Date('2024-11-09'),
  },
];

export class MockNoticeService {
  constructor() {
    console.log('[Mock Notices] Mock notice service initialized');
    this.initializeData();
  }

  /**
   * Initialize mock data from localStorage or use defaults
   */
  private initializeData(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveData(INITIAL_NOTICES);
    }
  }

  /**
   * Get data from localStorage
   */
  private getData(): Notice[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_NOTICES;

    try {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      return data.map((notice: any) => ({
        ...notice,
        createdAt: new Date(notice.createdAt),
        readAt: notice.readAt ? new Date(notice.readAt) : undefined,
        author: {
          ...notice.author,
          createdAt: new Date(notice.author.createdAt),
          updatedAt: new Date(notice.author.updatedAt),
        },
        recipients: notice.recipients.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
        })),
      }));
    } catch (error) {
      console.error('[Mock Notices] Error parsing stored data:', error);
      return INITIAL_NOTICES;
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData(data: Notice[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Apply filters to notices array
   */
  private applyFilters(notices: Notice[], filters: NoticeFilters): Notice[] {
    let filtered = [...notices];

    if (filters.isRead !== undefined) {
      filtered = filtered.filter((n) => n.isRead === filters.isRead);
    }

    if (filters.authorId) {
      filtered = filtered.filter((n) => n.author.id === filters.authorId);
    }

    if (filters.startDate) {
      filtered = filtered.filter((n) => n.createdAt >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((n) => n.createdAt <= filters.endDate!);
    }

    return filtered;
  }

  /**
   * Apply pagination and sorting
   */
  private applyPagination(
    notices: Notice[],
    options: NoticePaginationOptions
  ): PaginatedResponse<Notice> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    // Sort
    const sorted = [...notices].sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === 'createdAt') {
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
      } else if (sortBy === 'author') {
        aVal = `${a.author.firstName} ${a.author.lastName}`.toLowerCase();
        bVal = `${b.author.firstName} ${b.author.lastName}`.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = sorted.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total: sorted.length,
      page,
      limit,
      hasNext: endIndex < sorted.length,
      hasPrev: page > 1,
    };
  }

  /**
   * Get notices for current user with optional pagination and filters
   */
  async getNotices(
    options: NoticePaginationOptions = {},
    filters: NoticeFilters = {}
  ): Promise<PaginatedResponse<Notice>> {
    console.log(
      '[Mock Notices] Getting notices with options:',
      options,
      filters
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotices = this.getData();
    console.log(
      '[Mock Notices] All notices from storage:',
      allNotices.length,
      'items'
    );
    const filtered = this.applyFilters(allNotices, filters);
    console.log('[Mock Notices] Filtered notices:', filtered.length, 'items');
    const result = this.applyPagination(filtered, options);
    console.log('[Mock Notices] Returning paginated result:', result);
    return result;
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
    console.log('[Mock Notices] Getting unread count');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const allNotices = this.getData();
    return allNotices.filter((n) => !n.isRead).length;
  }

  /**
   * Get a single notice by ID
   */
  async getNoticeById(id: string): Promise<Notice> {
    console.log('[Mock Notices] Getting notice by ID:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNotices = this.getData();
    const notice = allNotices.find((n) => n.id === id);

    if (!notice) {
      throw new Error('Aviso no encontrado');
    }

    return notice;
  }

  /**
   * Create a new notice
   */
  async createNotice(noticeData: NoticeFormData): Promise<Notice> {
    console.log('[Mock Notices] Creating notice:', noticeData);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotices = this.getData();

    const newNotice: Notice = {
      id: `notice_${Date.now()}`,
      content: noticeData.content,
      author: MOCK_AUTHOR,
      recipients: [MOCK_USER], // In mock mode, always send to mock user
      isRead: false,
      createdAt: new Date(),
    };

    allNotices.push(newNotice);
    this.saveData(allNotices);

    return newNotice;
  }

  /**
   * Mark a notice as read
   */
  async markAsRead(id: string): Promise<Notice> {
    console.log('[Mock Notices] Marking notice as read:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNotices = this.getData();
    const index = allNotices.findIndex((n) => n.id === id);

    if (index === -1) {
      throw new Error('Aviso no encontrado');
    }

    allNotices[index].isRead = true;
    allNotices[index].readAt = new Date();

    this.saveData(allNotices);
    return allNotices[index];
  }

  /**
   * Mark a notice as unread
   */
  async markAsUnread(id: string): Promise<Notice> {
    console.log('[Mock Notices] Marking notice as unread:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNotices = this.getData();
    const index = allNotices.findIndex((n) => n.id === id);

    if (index === -1) {
      throw new Error('Aviso no encontrado');
    }

    allNotices[index].isRead = false;
    allNotices[index].readAt = undefined;

    this.saveData(allNotices);
    return allNotices[index];
  }

  /**
   * Mark all notices as read
   */
  async markAllAsRead(): Promise<void> {
    console.log('[Mock Notices] Marking all notices as read');
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNotices = this.getData();
    const now = new Date();

    allNotices.forEach((notice) => {
      if (!notice.isRead) {
        notice.isRead = true;
        notice.readAt = now;
      }
    });

    this.saveData(allNotices);
  }

  /**
   * Delete a notice
   */
  async deleteNotice(id: string): Promise<void> {
    console.log('[Mock Notices] Deleting notice:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNotices = this.getData();
    const filtered = allNotices.filter((n) => n.id !== id);

    if (filtered.length === allNotices.length) {
      throw new Error('Aviso no encontrado');
    }

    this.saveData(filtered);
  }

  /**
   * Get notices sent by current user
   */
  async getSentNotices(
    options: NoticePaginationOptions = {}
  ): Promise<PaginatedResponse<Notice>> {
    // In mock mode, return all notices as if sent by current user
    return this.getNotices(options);
  }

  /**
   * Get available recipients for notices
   */
  async getRecipients(): Promise<{ users: User[]; groups: any[] }> {
    console.log('[Mock Notices] Getting recipients');
    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      users: [MOCK_AUTHOR, MOCK_USER],
      groups: [],
    };
  }
}

export const mockNoticeService = new MockNoticeService();
