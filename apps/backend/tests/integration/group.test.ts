import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';

const app = createApp();

describe('Group Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let testUser1: any;
  let testUser2: any;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    const users = await createTestUsers();
    adminUser = users.adminUser;
    regularUser = users.regularUser;
    
    // Create additional test users for group membership
    testUser1 = await prisma.user.create({
      data: {
        email: 'testuser1@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User1',
        role: 'USER',
      },
    });

    testUser2 = await prisma.user.create({
      data: {
        email: 'testuser2@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'User2',
        role: 'USER',
      },
    });
    
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
  });

  afterEach(async () => {
    // Clean up groups after each test
    await prisma.userGroupMember.deleteMany();
    await prisma.userGroup.deleteMany();
  });

  describe('POST /api/groups', () => {
    it('should create group with valid data', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Group',
          userIds: [testUser1.id, testUser2.id],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Group');
      expect(response.body.data.members).toHaveLength(2);
      expect(response.body.message).toContain('created');

      // Verify group was created in database
      const group = await prisma.userGroup.findFirst({
        where: { name: 'Test Group' },
        include: { members: true },
      });
      expect(group).toBeTruthy();
      expect(group?.members).toHaveLength(2);
    });

    it('should create group with single member', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Single Member Group',
          userIds: [testUser1.id],
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.members).toHaveLength(1);
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [testUser1.id],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for empty userIds array', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Empty Group',
          userIds: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for missing userIds', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Members Group',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Forbidden Group',
          userIds: [testUser1.id],
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/groups')
        .send({
          name: 'Unauthorized Group',
          userIds: [testUser1.id],
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/groups', () => {
    beforeEach(async () => {
      // Create test groups
      await prisma.userGroup.create({
        data: {
          name: 'Group 1',
          members: {
            create: [
              { userId: testUser1.id },
              { userId: testUser2.id },
            ],
          },
        },
      });

      await prisma.userGroup.create({
        data: {
          name: 'Group 2',
          members: {
            create: [{ userId: regularUser.id }],
          },
        },
      });
    });

    it('should return all groups for admin', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('members');
    });

    it('should include member information in groups', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const group = response.body.data.find((g: any) => g.name === 'Group 1');
      expect(group).toBeDefined();
      expect(group.members).toHaveLength(2);
      expect(group.members[0]).toHaveProperty('user');
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/groups')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/groups');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/groups/:id', () => {
    let testGroup: any;

    beforeEach(async () => {
      testGroup = await prisma.userGroup.create({
        data: {
          name: 'Test Group',
          members: {
            create: [
              { userId: testUser1.id },
              { userId: testUser2.id },
            ],
          },
        },
      });
    });

    it('should return group by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testGroup.id);
      expect(response.body.data.name).toBe('Test Group');
      expect(response.body.data.members).toHaveLength(2);
    });

    it('should return 404 for non-existent group', async () => {
      const response = await request(app)
        .get('/api/groups/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get(`/api/groups/${testGroup.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/groups/:id', () => {
    let testGroup: any;

    beforeEach(async () => {
      testGroup = await prisma.userGroup.create({
        data: {
          name: 'Original Group',
          members: {
            create: [{ userId: testUser1.id }],
          },
        },
      });
    });

    it('should update group name', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Group Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Group Name');
      expect(response.body.message).toContain('updated');
    });

    it('should update group members', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [testUser1.id, testUser2.id, regularUser.id],
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.members).toHaveLength(3);
    });

    it('should update both name and members', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Completely Updated',
          userIds: [testUser2.id],
        });

      expect(response.status).toBe(200);
      expect(response.body.data.name).toBe('Completely Updated');
      expect(response.body.data.members).toHaveLength(1);
    });

    it('should return 400 for empty userIds array', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 404 for non-existent group', async () => {
      const response = await request(app)
        .put('/api/groups/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Forbidden Update',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put(`/api/groups/${testGroup.id}`)
        .send({
          name: 'Unauthorized Update',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/groups/:id', () => {
    let testGroup: any;

    beforeEach(async () => {
      testGroup = await prisma.userGroup.create({
        data: {
          name: 'Group to Delete',
          members: {
            create: [
              { userId: testUser1.id },
              { userId: testUser2.id },
            ],
          },
        },
      });
    });

    it('should delete group', async () => {
      const response = await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify group was deleted from database
      const group = await prisma.userGroup.findUnique({
        where: { id: testGroup.id },
      });
      expect(group).toBeNull();
    });

    it('should cascade delete group members', async () => {
      await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify members were also deleted
      const members = await prisma.userGroupMember.findMany({
        where: { groupId: testGroup.id },
      });
      expect(members).toHaveLength(0);
    });

    it('should not delete users when deleting group', async () => {
      await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify users still exist
      const user1 = await prisma.user.findUnique({
        where: { id: testUser1.id },
      });
      const user2 = await prisma.user.findUnique({
        where: { id: testUser2.id },
      });
      expect(user1).toBeTruthy();
      expect(user2).toBeTruthy();
    });

    it('should return 404 for non-existent group', async () => {
      const response = await request(app)
        .delete('/api/groups/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/groups/${testGroup.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/groups/${testGroup.id}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
