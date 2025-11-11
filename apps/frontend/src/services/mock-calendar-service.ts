import type {
  CalendarEvent,
  EventFormData,
  PaginatedResponse,
  User,
} from '../types/index.js';
import type {
  CalendarFilters,
  CalendarPaginationOptions,
} from './calendar-service.js';

const STORAGE_KEY = 'mock_calendar_data';

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

// Initial mock calendar events
const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Reunión de Bienvenida',
    description: 'Evento de demostración en el calendario',
    date: new Date('2024-11-15T10:00:00'),
    author: MOCK_AUTHOR,
    createdAt: new Date('2024-11-01'),
  },
  {
    id: '2',
    title: 'Presentación de Proyectos',
    description: 'Evento de ejemplo para probar el calendario',
    date: new Date('2024-11-20T14:00:00'),
    author: MOCK_AUTHOR,
    createdAt: new Date('2024-11-01'),
  },
  {
    id: '3',
    title: 'Evaluación Final',
    description: 'Evento futuro de demostración',
    date: new Date('2024-12-01T09:00:00'),
    author: MOCK_AUTHOR,
    createdAt: new Date('2024-11-01'),
  },
];

export class MockCalendarService {
  constructor() {
    console.log('[Mock Calendar] Mock calendar service initialized');
    this.initializeData();
  }

  /**
   * Initialize mock data from localStorage or use defaults
   */
  private initializeData(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      this.saveData(INITIAL_EVENTS);
    }
  }

  /**
   * Get data from localStorage
   */
  private getData(): CalendarEvent[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_EVENTS;

    try {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      return data.map((event: any) => ({
        ...event,
        date: new Date(event.date),
        createdAt: new Date(event.createdAt),
        author: {
          ...event.author,
          createdAt: new Date(event.author.createdAt),
          updatedAt: new Date(event.author.updatedAt),
        },
      }));
    } catch (error) {
      console.error('[Mock Calendar] Error parsing stored data:', error);
      return INITIAL_EVENTS;
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData(data: CalendarEvent[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Apply filters to events array
   */
  private applyFilters(
    events: CalendarEvent[],
    filters: CalendarFilters
  ): CalendarEvent[] {
    let filtered = [...events];

    if (filters.startDate) {
      filtered = filtered.filter((e) => e.date >= filters.startDate!);
    }

    if (filters.endDate) {
      filtered = filtered.filter((e) => e.date <= filters.endDate!);
    }

    if (filters.authorId) {
      filtered = filtered.filter((e) => e.author.id === filters.authorId);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          e.description.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  /**
   * Apply pagination and sorting
   */
  private applyPagination(
    events: CalendarEvent[],
    options: CalendarPaginationOptions
  ): PaginatedResponse<CalendarEvent> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const sortBy = options.sortBy || 'date';
    const sortOrder = options.sortOrder || 'asc';

    // Sort
    const sorted = [...events].sort((a, b) => {
      let aVal: any, bVal: any;

      if (sortBy === 'date') {
        aVal = a.date.getTime();
        bVal = b.date.getTime();
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
   * Get calendar events with optional pagination and filters
   */
  async getEvents(
    options: CalendarPaginationOptions = {},
    filters: CalendarFilters = {}
  ): Promise<PaginatedResponse<CalendarEvent>> {
    console.log(
      '[Mock Calendar] Getting events with options:',
      options,
      filters
    );
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allEvents = this.getData();
    const filtered = this.applyFilters(allEvents, filters);
    return this.applyPagination(filtered, options);
  }

  /**
   * Get events for a specific month
   */
  async getEventsForMonth(
    year: number,
    month: number
  ): Promise<CalendarEvent[]> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const response = await this.getEvents(
      { sortBy: 'date', sortOrder: 'asc' },
      { startDate, endDate }
    );

    return response.data;
  }

  /**
   * Get events for a specific date
   */
  async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);

    const response = await this.getEvents(
      { sortBy: 'date', sortOrder: 'asc' },
      { startDate, endDate }
    );

    return response.data;
  }

  /**
   * Get upcoming events (next 30 days)
   */
  async getUpcomingEvents(limit: number = 10): Promise<CalendarEvent[]> {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const response = await this.getEvents(
      { limit, sortBy: 'date', sortOrder: 'asc' },
      { startDate, endDate }
    );

    return response.data;
  }

  /**
   * Get a single event by ID
   */
  async getEventById(id: string): Promise<CalendarEvent> {
    console.log('[Mock Calendar] Getting event by ID:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allEvents = this.getData();
    const event = allEvents.find((e) => e.id === id);

    if (!event) {
      throw new Error('Evento no encontrado');
    }

    return event;
  }

  /**
   * Create a new calendar event
   */
  async createEvent(eventData: EventFormData): Promise<CalendarEvent> {
    console.log('[Mock Calendar] Creating event:', eventData);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allEvents = this.getData();

    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}`,
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      author: MOCK_AUTHOR,
      createdAt: new Date(),
    };

    allEvents.push(newEvent);
    this.saveData(allEvents);

    return newEvent;
  }

  /**
   * Update an existing calendar event
   */
  async updateEvent(
    id: string,
    eventData: Partial<EventFormData>
  ): Promise<CalendarEvent> {
    console.log('[Mock Calendar] Updating event:', id, eventData);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const allEvents = this.getData();
    const index = allEvents.findIndex((e) => e.id === id);

    if (index === -1) {
      throw new Error('Evento no encontrado');
    }

    const updatedEvent: CalendarEvent = {
      ...allEvents[index],
      ...eventData,
    };

    allEvents[index] = updatedEvent;
    this.saveData(allEvents);

    return updatedEvent;
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(id: string): Promise<void> {
    console.log('[Mock Calendar] Deleting event:', id);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const allEvents = this.getData();
    const filtered = allEvents.filter((e) => e.id !== id);

    if (filtered.length === allEvents.length) {
      throw new Error('Evento no encontrado');
    }

    this.saveData(filtered);
  }

  /**
   * Search events by title or description
   */
  async searchEvents(
    query: string,
    limit: number = 10
  ): Promise<CalendarEvent[]> {
    const response = await this.getEvents(
      { limit, sortBy: 'date', sortOrder: 'asc' },
      { search: query }
    );

    return response.data;
  }

  /**
   * Get events by author
   */
  async getEventsByAuthor(
    authorId: string,
    options: CalendarPaginationOptions = {}
  ): Promise<PaginatedResponse<CalendarEvent>> {
    return this.getEvents(options, { authorId });
  }

  /**
   * Get events for a date range
   */
  async getEventsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    const response = await this.getEvents(
      { sortBy: 'date', sortOrder: 'asc' },
      { startDate, endDate }
    );

    return response.data;
  }

  /**
   * Get calendar data for a specific month (organized by days)
   */
  async getMonthCalendarData(
    year: number,
    month: number
  ): Promise<{ [day: number]: CalendarEvent[] }> {
    const events = await this.getEventsForMonth(year, month);
    const calendarData: { [day: number]: CalendarEvent[] } = {};

    events.forEach((event) => {
      const day = event.date.getDate();
      if (!calendarData[day]) {
        calendarData[day] = [];
      }
      calendarData[day].push(event);
    });

    return calendarData;
  }

  /**
   * Check if a date has events
   */
  async hasEventsOnDate(date: Date): Promise<boolean> {
    const events = await this.getEventsForDate(date);
    return events.length > 0;
  }
}

export const mockCalendarService = new MockCalendarService();
