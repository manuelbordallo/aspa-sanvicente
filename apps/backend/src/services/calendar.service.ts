import { CalendarEvent } from '@prisma/client';
import calendarRepository, {
  CreateEventData,
  UpdateEventData,
  CalendarFilters,
} from '../repositories/calendar.repository';
import { PaginationParams, PaginationResult } from '../utils/pagination.util';

class CalendarService {
  /**
   * Get events with pagination, date filtering, and search
   */
  async getEvents(
    pagination: PaginationParams,
    filters?: CalendarFilters
  ): Promise<PaginationResult<CalendarEvent>> {
    const { events, total } = await calendarRepository.findAll(pagination, filters);

    return {
      data: events,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
      hasNext: pagination.skip + pagination.limit < total,
      hasPrev: pagination.page > 1,
    };
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<CalendarEvent> {
    const event = await calendarRepository.findById(id);

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  }

  /**
   * Create event with authorId from authenticated user
   */
  async createEvent(data: CreateEventData): Promise<CalendarEvent> {
    // Validate required fields
    if (!data.title || !data.description || !data.date) {
      throw new Error('Title, description, and date are required');
    }

    // Validate date is a valid Date object
    if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
      throw new Error('Invalid date format');
    }

    // Create event
    const event = await calendarRepository.create(data);

    return event;
  }

  /**
   * Update event with ownership validation
   */
  async updateEvent(
    id: string,
    data: UpdateEventData,
    userId: string,
    userRole: 'admin' | 'user'
  ): Promise<CalendarEvent> {
    // Check if event exists
    const existingEvent = await calendarRepository.findById(id);

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Validate ownership (only author or admin can update)
    if (existingEvent.authorId !== userId && userRole !== 'admin') {
      throw new Error('You do not have permission to update this event');
    }

    // Validate date if provided
    if (data.date) {
      if (!(data.date instanceof Date) || isNaN(data.date.getTime())) {
        throw new Error('Invalid date format');
      }
    }

    // Update event
    const event = await calendarRepository.update(id, data);

    return event;
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string, userId: string, userRole: 'admin' | 'user'): Promise<void> {
    // Check if event exists
    const existingEvent = await calendarRepository.findById(id);

    if (!existingEvent) {
      throw new Error('Event not found');
    }

    // Validate ownership (only author or admin can delete)
    if (existingEvent.authorId !== userId && userRole !== 'admin') {
      throw new Error('You do not have permission to delete this event');
    }

    // Delete event
    await calendarRepository.delete(id);
  }
}

export default new CalendarService();
