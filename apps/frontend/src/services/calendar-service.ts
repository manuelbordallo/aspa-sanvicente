import { apiClient } from './api-client.js';
import type {
  CalendarEvent,
  EventFormData,
  ApiResponse,
  PaginatedResponse,
} from '../types/index.js';

export interface CalendarFilters {
  startDate?: Date;
  endDate?: Date;
  authorId?: string;
  search?: string;
}

export interface CalendarPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export class CalendarService {
  /**
   * Get calendar events with optional pagination and filters
   */
  async getEvents(
    options: CalendarPaginationOptions = {},
    filters: CalendarFilters = {}
  ): Promise<PaginatedResponse<CalendarEvent>> {
    const params = new URLSearchParams();

    // Add pagination options
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    // Add filters
    if (filters.startDate)
      params.append('startDate', filters.startDate.toISOString());
    if (filters.endDate)
      params.append('endDate', filters.endDate.toISOString());
    if (filters.authorId) params.append('authorId', filters.authorId);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString
      ? `/calendar/events?${queryString}`
      : '/calendar/events';

    const response: ApiResponse<PaginatedResponse<CalendarEvent>> =
      await apiClient.get(endpoint);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al obtener los eventos');
    }

    // Convert date strings to Date objects
    response.data.data = response.data.data.map((event) => ({
      ...event,
      date: new Date(event.date),
      createdAt: new Date(event.createdAt),
      author: {
        ...event.author,
        createdAt: new Date(event.author.createdAt),
        updatedAt: new Date(event.author.updatedAt),
      },
    }));

    return response.data;
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
    const response: ApiResponse<CalendarEvent> = await apiClient.get(
      `/calendar/events/${id}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Evento no encontrado');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Create a new calendar event (admin only)
   */
  async createEvent(eventData: EventFormData): Promise<CalendarEvent> {
    const response: ApiResponse<CalendarEvent> = await apiClient.post(
      '/calendar/events',
      {
        ...eventData,
        date: eventData.date.toISOString(),
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al crear el evento');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Update an existing calendar event (admin only)
   */
  async updateEvent(
    id: string,
    eventData: Partial<EventFormData>
  ): Promise<CalendarEvent> {
    const updateData = {
      ...eventData,
      ...(eventData.date && { date: eventData.date.toISOString() }),
    };

    const response: ApiResponse<CalendarEvent> = await apiClient.put(
      `/calendar/events/${id}`,
      updateData
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al actualizar el evento');
    }

    // Convert date strings to Date objects
    return {
      ...response.data,
      date: new Date(response.data.date),
      createdAt: new Date(response.data.createdAt),
      author: {
        ...response.data.author,
        createdAt: new Date(response.data.author.createdAt),
        updatedAt: new Date(response.data.author.updatedAt),
      },
    };
  }

  /**
   * Delete a calendar event (admin only)
   */
  async deleteEvent(id: string): Promise<void> {
    const response: ApiResponse<void> = await apiClient.delete(
      `/calendar/events/${id}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Error al eliminar el evento');
    }
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

// Create and export default instance
export const calendarService = new CalendarService();
