import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';

const app = createApp();

describe('Calendar Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testEvent: any;

  beforeAll(async () => {
    await setupTestDatabase();
    const users = await createTestUsers();
    adminUser = users.adminUser;
    regularUser = users.regularUser;
    
    adminToken = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
    
    userToken = generateToken({
      userId: regularUser.id,
      email: regularUser.email,
      role: regularUser.role,
    });

    // Create test event
    testEvent = await prisma.calendarEvent.create({
      data: {
        title: 'Test Event',
        description: 'This is a test event',
        date: new Date('2025-12-25'),
        authorId: adminUser.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up events created during tests (except the initial test event)
    await prisma.calendarEvent.deleteMany({
      where: {
        id: { not: testEvent.id },
      },
    });
  });

  describe('GET /api/calendar/events', () => {
    it('should return paginated events for authenticated users', async () => {
      const response = await request(app)
        .get('/api/calendar/events')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination parameters', async () => {
      // Create additional events
      await prisma.calendarEvent.create({
        data: {
          title: 'Second Event',
          description: 'Description 2',
          date: new Date('2025-12-26'),
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .get('/api/calendar/events?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should support search query', async () => {
      await prisma.calendarEvent.create({
        data: {
          title: 'Unique Search Event',
          description: 'Event with unique term',
          date: new Date('2025-12-27'),
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .get('/api/calendar/events?search=Unique')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.some((e: any) => e.title.includes('Unique'))).toBe(true);
    });

    it('should support date range filtering', async () => {
      // Create events with different dates
      await prisma.calendarEvent.create({
        data: {
          title: 'Past Event',
          description: 'Event in the past',
          date: new Date('2025-01-01'),
          authorId: adminUser.id,
        },
      });

      await prisma.calendarEvent.create({
        data: {
          title: 'Future Event',
          description: 'Event in the future',
          date: new Date('2026-01-01'),
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .get('/api/calendar/events?startDate=2025-12-01&endDate=2025-12-31')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
      // Should include events within the date range
      const eventDates = response.body.data.map((e: any) => new Date(e.date));
      eventDates.forEach((date: Date) => {
        expect(date.getTime()).toBeGreaterThanOrEqual(new Date('2025-12-01').getTime());
        expect(date.getTime()).toBeLessThanOrEqual(new Date('2025-12-31').getTime());
      });
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/calendar/events?sortBy=date&sortOrder=asc')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/calendar/events');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/calendar/events/:id', () => {
    it('should return event by ID with author information', async () => {
      const response = await request(app)
        .get(`/api/calendar/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testEvent.id);
      expect(response.body.data.title).toBe(testEvent.title);
      expect(response.body.data.author).toBeDefined();
      expect(response.body.data.author.email).toBe(adminUser.email);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/calendar/events/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/calendar/events/${testEvent.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/calendar/events', () => {
    it('should create event with admin role', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New Event',
          description: 'This is a new event',
          date: '2025-12-30',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Event');
      expect(response.body.data.authorId).toBe(adminUser.id);

      // Verify event was created in database
      const event = await prisma.calendarEvent.findUnique({
        where: { id: response.body.data.id },
      });
      expect(event).toBeTruthy();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Incomplete Event',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden Event',
          description: 'Description',
          date: '2025-12-30',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/calendar/events')
        .send({
          title: 'Unauthorized Event',
          description: 'Description',
          date: '2025-12-30',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/calendar/events/:id', () => {
    it('should update event with admin role', async () => {
      const response = await request(app)
        .put(`/api/calendar/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Event Title',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Event Title');
      expect(response.body.data.description).toBe('Updated description');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/calendar/events/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/calendar/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden Update',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/calendar/events/:id', () => {
    it('should delete event with admin role', async () => {
      // Create event to delete
      const eventToDelete = await prisma.calendarEvent.create({
        data: {
          title: 'Event to Delete',
          description: 'Description',
          date: new Date('2025-12-31'),
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/calendar/events/${eventToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify event was deleted
      const event = await prisma.calendarEvent.findUnique({
        where: { id: eventToDelete.id },
      });
      expect(event).toBeNull();
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/calendar/events/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/calendar/events/${testEvent.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
