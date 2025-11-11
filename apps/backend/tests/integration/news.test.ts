import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';

const app = createApp();

describe('News Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testNews: any;

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

    // Create test news
    testNews = await prisma.news.create({
      data: {
        title: 'Test News Article',
        content: 'This is test news content',
        summary: 'Test summary',
        authorId: adminUser.id,
      },
    });
  });

  afterEach(async () => {
    // Clean up news created during tests (except the initial test news)
    await prisma.news.deleteMany({
      where: {
        id: { not: testNews.id },
      },
    });
  });

  describe('GET /api/news', () => {
    it('should return paginated news for authenticated users', async () => {
      const response = await request(app)
        .get('/api/news')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should support pagination parameters', async () => {
      // Create additional news
      await prisma.news.create({
        data: {
          title: 'Second News',
          content: 'Content 2',
          summary: 'Summary 2',
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .get('/api/news?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should support search query', async () => {
      await prisma.news.create({
        data: {
          title: 'Unique Search Term Article',
          content: 'Content with unique term',
          summary: 'Summary',
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .get('/api/news?search=Unique')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.some((n: any) => n.title.includes('Unique'))).toBe(true);
    });

    it('should support date filtering', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const response = await request(app)
        .get(`/api/news?startDate=${new Date().toISOString()}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeInstanceOf(Array);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/news?sortBy=createdAt&sortOrder=desc')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/news');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/news/:id', () => {
    it('should return news by ID with author information', async () => {
      const response = await request(app)
        .get(`/api/news/${testNews.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testNews.id);
      expect(response.body.data.title).toBe(testNews.title);
      expect(response.body.data.author).toBeDefined();
      expect(response.body.data.author.email).toBe(adminUser.email);
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .get('/api/news/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/news/${testNews.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/news', () => {
    it('should create news with admin role', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New News Article',
          content: 'This is new content',
          summary: 'New summary',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New News Article');
      expect(response.body.data.authorId).toBe(adminUser.id);

      // Verify news was created in database
      const news = await prisma.news.findUnique({
        where: { id: response.body.data.id },
      });
      expect(news).toBeTruthy();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Incomplete News',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden News',
          content: 'Content',
          summary: 'Summary',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/news')
        .send({
          title: 'Unauthorized News',
          content: 'Content',
          summary: 'Summary',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/news/:id', () => {
    it('should update news with admin role', async () => {
      const response = await request(app)
        .put(`/api/news/${testNews.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated News Title',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated News Title');
      expect(response.body.data.content).toBe('Updated content');
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .put('/api/news/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/news/${testNews.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Forbidden Update',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/news/:id', () => {
    it('should delete news with admin role', async () => {
      // Create news to delete
      const newsToDelete = await prisma.news.create({
        data: {
          title: 'News to Delete',
          content: 'Content',
          summary: 'Summary',
          authorId: adminUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/news/${newsToDelete.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify news was deleted
      const news = await prisma.news.findUnique({
        where: { id: newsToDelete.id },
      });
      expect(news).toBeNull();
    });

    it('should return 404 for non-existent news', async () => {
      const response = await request(app)
        .delete('/api/news/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/news/${testNews.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
