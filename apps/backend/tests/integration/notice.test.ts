import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';

const app = createApp();

describe('Notice Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;
  let testGroup: any;
  let thirdUser: any;

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

    // Create a third user for group testing
    thirdUser = await prisma.user.create({
      data: {
        email: 'third@test.com',
        password: 'hashedpassword',
        firstName: 'Third',
        lastName: 'User',
        role: 'USER',
      },
    });

    // Create a test group
    testGroup = await prisma.userGroup.create({
      data: {
        name: 'Test Group',
        members: {
          create: [
            { userId: regularUser.id },
            { userId: thirdUser.id },
          ],
        },
      },
    });
  });

  afterEach(async () => {
    // Clean up notices after each test
    await prisma.notice.deleteMany();
  });

  describe('POST /api/notices', () => {
    it('should create notice for individual recipient', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Test notice content',
          recipients: [regularUser.id],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify notice was created
      const notices = await prisma.notice.findMany({
        where: { recipientId: regularUser.id },
      });
      expect(notices.length).toBe(1);
      expect(notices[0].content).toBe('Test notice content');
    });

    it('should create notices for multiple individual recipients', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Multi-recipient notice',
          recipients: [regularUser.id, thirdUser.id],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify notices were created for both users
      const notices = await prisma.notice.findMany({
        where: {
          recipientId: { in: [regularUser.id, thirdUser.id] },
        },
      });
      expect(notices.length).toBe(2);
    });

    it('should create notices for group members', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Group notice',
          recipients: [`group:${testGroup.id}`],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify notices were created for all group members
      const notices = await prisma.notice.findMany({
        where: {
          recipientId: { in: [regularUser.id, thirdUser.id] },
        },
      });
      expect(notices.length).toBe(2);
      expect(notices.every(n => n.content === 'Group notice')).toBe(true);
    });

    it('should create notices for mixed recipients (users and groups)', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          content: 'Mixed recipients notice',
          recipients: [adminUser.id, `group:${testGroup.id}`],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verify notices were created for admin and group members
      const notices = await prisma.notice.findMany();
      expect(notices.length).toBe(3); // admin + 2 group members
    });

    it('should return 400 for missing content', async () => {
      const response = await request(app)
        .post('/api/notices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          recipients: [regularUser.id],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/notices')
        .send({
          content: 'Unauthorized notice',
          recipients: [regularUser.id],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notices', () => {
    beforeEach(async () => {
      // Create test notices
      await prisma.notice.createMany({
        data: [
          {
            content: 'Unread notice 1',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
          {
            content: 'Read notice',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: true,
            readAt: new Date(),
          },
          {
            content: 'Another unread notice',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
        ],
      });
    });

    it('should return paginated notices for recipient', async () => {
      const response = await request(app)
        .get('/api/notices')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(3);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/notices?page=1&limit=2')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should filter by read status', async () => {
      const response = await request(app)
        .get('/api/notices?isRead=false')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.every((n: any) => !n.isRead)).toBe(true);
      expect(response.body.data.length).toBe(2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/notices');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notices/sent', () => {
    beforeEach(async () => {
      await prisma.notice.create({
        data: {
          content: 'Sent by admin',
          authorId: adminUser.id,
          recipientId: regularUser.id,
        },
      });
    });

    it('should return notices sent by authenticated user', async () => {
      const response = await request(app)
        .get('/api/notices/sent')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.every((n: any) => n.authorId === adminUser.id)).toBe(true);
    });

    it('should return empty array if no sent notices', async () => {
      const response = await request(app)
        .get('/api/notices/sent')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(0);
    });
  });

  describe('GET /api/notices/unread-count', () => {
    beforeEach(async () => {
      await prisma.notice.createMany({
        data: [
          {
            content: 'Unread 1',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
          {
            content: 'Unread 2',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
          {
            content: 'Read',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: true,
          },
        ],
      });
    });

    it('should return unread count for authenticated user', async () => {
      const response = await request(app)
        .get('/api/notices/unread-count')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });
  });

  describe('PATCH /api/notices/:id/read', () => {
    let testNotice: any;

    beforeEach(async () => {
      testNotice = await prisma.notice.create({
        data: {
          content: 'Test notice',
          authorId: adminUser.id,
          recipientId: regularUser.id,
          isRead: false,
        },
      });
    });

    it('should mark notice as read', async () => {
      const response = await request(app)
        .patch(`/api/notices/${testNotice.id}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isRead).toBe(true);
      expect(response.body.data.readAt).toBeTruthy();
    });

    it('should return 404 for non-existent notice', async () => {
      const response = await request(app)
        .patch('/api/notices/00000000-0000-0000-0000-000000000000/read')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/notices/:id/unread', () => {
    let testNotice: any;

    beforeEach(async () => {
      testNotice = await prisma.notice.create({
        data: {
          content: 'Test notice',
          authorId: adminUser.id,
          recipientId: regularUser.id,
          isRead: true,
          readAt: new Date(),
        },
      });
    });

    it('should mark notice as unread', async () => {
      const response = await request(app)
        .patch(`/api/notices/${testNotice.id}/unread`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.isRead).toBe(false);
      expect(response.body.data.readAt).toBeNull();
    });
  });

  describe('PATCH /api/notices/mark-all-read', () => {
    beforeEach(async () => {
      await prisma.notice.createMany({
        data: [
          {
            content: 'Unread 1',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
          {
            content: 'Unread 2',
            authorId: adminUser.id,
            recipientId: regularUser.id,
            isRead: false,
          },
        ],
      });
    });

    it('should mark all notices as read for authenticated user', async () => {
      const response = await request(app)
        .patch('/api/notices/mark-all-read')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify all notices are marked as read
      const notices = await prisma.notice.findMany({
        where: { recipientId: regularUser.id },
      });
      expect(notices.every(n => n.isRead)).toBe(true);
    });
  });

  describe('DELETE /api/notices/:id', () => {
    let testNotice: any;

    beforeEach(async () => {
      testNotice = await prisma.notice.create({
        data: {
          content: 'Test notice',
          authorId: adminUser.id,
          recipientId: regularUser.id,
        },
      });
    });

    it('should delete notice by author', async () => {
      const response = await request(app)
        .delete(`/api/notices/${testNotice.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify notice was deleted
      const notice = await prisma.notice.findUnique({
        where: { id: testNotice.id },
      });
      expect(notice).toBeNull();
    });

    it('should allow admin to delete any notice', async () => {
      const userNotice = await prisma.notice.create({
        data: {
          content: 'User notice',
          authorId: regularUser.id,
          recipientId: adminUser.id,
        },
      });

      const response = await request(app)
        .delete(`/api/notices/${userNotice.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 when non-author tries to delete', async () => {
      const response = await request(app)
        .delete(`/api/notices/${testNotice.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent notice', async () => {
      const response = await request(app)
        .delete('/api/notices/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});