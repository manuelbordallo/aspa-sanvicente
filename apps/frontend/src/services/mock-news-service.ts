import type {
  News,
  NewsFormData,
  PaginatedResponse,
  User,
} from '../types/index.js';
import type { NewsFilters, NewsPaginationOptions } from './news-service.js';

const STORAGE_KEY = 'mock_news_data';

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

// Initial mock news data
const INITIAL_NEWS: News[] = [
  {
    id: '1',
    title: 'Bienvenido al Sistema de Gestión Escolar',
    content:
      'Este es un sistema de demostración que funciona en modo mock. Puedes crear, editar y eliminar noticias para probar la funcionalidad.',
    summary: 'Sistema de demostración en modo mock',
    author: MOCK_AUTHOR,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
  {
    id: '2',
    title: 'Modo de Desarrollo Activo',
    content:
      'Estás usando el modo de desarrollo sin backend. Todos los datos se almacenan localmente en tu navegador.',
    summary: 'Información sobre el modo de desarrollo',
    author: MOCK_AUTHOR,
    createdAt: new Date('2024-11-05'),
    updatedAt: new Date('2024-11-05'),
  },
];

export class MockNewsService {
  constructor() {
    console.log('[Mock News] Mock news service initialized');
    this.initializeData();
  }

  /**
   * Initialize mock data from localStorage or use defaults
   */
  private initializeData(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveData(INITIAL_NEWS);
    }
  }

  /**
   * Get data from localStorage
   */
  private getData(): News[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_NEWS;

    try {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      return data.map((news: any) => ({
        ...news,
        createdAt: new Date(news.createdAt),
        updatedAt: new Date(news.updatedAt),
        author: {
          ...news.author,
          createdAt: new Date(news.author.createdAt),
          updatedAt: new Date(news.author.updatedAt),
        },
      }));
    } catch (error) {
      console.error('[Mock News] Error parsing stored data:', error);
      return INITIAL_NEWS;
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData(data: News[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Apply filters to news array
   */
  private applyFilters(news: News[], filters: NewsFilters): News[] {
    let filtered = [...news];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search) ||
          n.summary.toLowerCase().includes(search)
      );
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
    news: News[],
    options: NewsPaginationOptions
  ): PaginatedResponse<News> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';

    // Sort
    const sorted = [...news].sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === 'createdAt') {
        aVal = a.createdAt.getTime();
        bVal = b.createdAt.getTime();
      } else if (sortBy === 'title') {
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
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
   * Get all news with optional pagination and filters
   */
  async getNews(
    options: NewsPaginationOptions = {},
    filters: NewsFilters = {}
  ): Promise<PaginatedResponse<News>> {
    console.log('[Mock News] Getting news with options:', options, filters);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNews = this.getData();
    const filtered = this.applyFilters(allNews, filters);
    return this.applyPagination(filtered, options);
  }

  /**
   * Get a single news item by ID
   */
  async getNewsById(id: string): Promise<News> {
    console.log('[Mock News] Getting news by ID:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNews = this.getData();
    const news = allNews.find((n) => n.id === id);

    if (!news) {
      throw new Error('Noticia no encontrada');
    }

    return news;
  }

  /**
   * Create a new news item
   */
  async createNews(newsData: NewsFormData): Promise<News> {
    console.log('[Mock News] Creating news:', newsData);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNews = this.getData();
    const now = new Date();

    const newNews: News = {
      id: `news_${Date.now()}`,
      ...newsData,
      author: MOCK_AUTHOR,
      createdAt: now,
      updatedAt: now,
    };

    allNews.push(newNews);
    this.saveData(allNews);

    return newNews;
  }

  /**
   * Update an existing news item
   */
  async updateNews(id: string, newsData: Partial<NewsFormData>): Promise<News> {
    console.log('[Mock News] Updating news:', id, newsData);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allNews = this.getData();
    const index = allNews.findIndex((n) => n.id === id);

    if (index === -1) {
      throw new Error('Noticia no encontrada');
    }

    const updatedNews: News = {
      ...allNews[index],
      ...newsData,
      updatedAt: new Date(),
    };

    allNews[index] = updatedNews;
    this.saveData(allNews);

    return updatedNews;
  }

  /**
   * Delete a news item
   */
  async deleteNews(id: string): Promise<void> {
    console.log('[Mock News] Deleting news:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allNews = this.getData();
    const filtered = allNews.filter((n) => n.id !== id);

    if (filtered.length === allNews.length) {
      throw new Error('Noticia no encontrada');
    }

    this.saveData(filtered);
  }

  /**
   * Get recent news
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

export const mockNewsService = new MockNewsService();
