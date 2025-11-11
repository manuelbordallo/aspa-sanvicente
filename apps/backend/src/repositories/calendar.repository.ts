import prisma from '../config/database';
import { CalendarEvent } from '@prisma/client';
import { PaginationParams } from '../utils/pagination.util';

export interface CalendarFilters {
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateEventData {
  title: string;
  description: string;
  date: Date;
  authorId: string;
}

export interface UpdateEventData {
  title?: string;
  description?: string;
  date?: Date;
}

class CalendarRepository {
  /**
   * Find all events with pagination, date range filtering, search, and sorting
   */
  async findAll(
    pagination: PaginationParams,
    filters?: CalendarFilters
  ): Promise<{ events: CalendarEvent[]; total: number }> {
    const where: any = {};

    // Apply search filter
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Apply date range filters
    if (filters?.startDate || filters?.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (pagination.sortBy) {
      orderBy[pagination.sortBy] = pagination.sortOrder;
    } else {
      orderBy.date = pagination.sortOrder;
    }

    // Execute queries
    const [events, total] = await Promise.all([
      prisma.calendarEvent.findMany({
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
      prisma.calendarEvent.count({ where }),
    ]);

    return { events, total };
  }

  /**
   * Find event by ID with author relation
   */
  async findById(id: string): Promise<CalendarEvent | null> {
    return prisma.calendarEvent.findUnique({
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
    }) as Promise<CalendarEvent | null>;
  }

  /**
   * Find events by date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    return prisma.calendarEvent.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: 'asc',
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
    }) as Promise<CalendarEvent[]>;
  }

  /**
   * Create new event with authorId
   */
  async create(data: CreateEventData): Promise<CalendarEvent> {
    return prisma.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description,
        date: data.date,
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
    }) as Promise<CalendarEvent>;
  }

  /**
   * Update event data
   */
  async update(id: string, data: UpdateEventData): Promise<CalendarEvent> {
    return prisma.calendarEvent.update({
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
    }) as Promise<CalendarEvent>;
  }

  /**
   * Delete event record
   */
  async delete(id: string): Promise<CalendarEvent> {
    return prisma.calendarEvent.delete({
      where: { id },
    });
  }
}

export default new CalendarRepository();
