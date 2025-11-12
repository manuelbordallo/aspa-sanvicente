import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';

const app = createApp();

describe('User Management Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    const users = await createTestUsers();
    adminUser = users.adminUser;
    regularUser = users.regularUser;
    
    // Generate tokens with normalized (lowercase) roles
    adminToken = generateToken({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role.toLowerCase(),
    });
    
    userToken = generateToken({
      userId: regularUser.id,
      email: regularUser.email,
      role: regularUser.role.toLowerCase(),
    });
  });

  describe('GET /api/users', () => {
    it('should return paginated users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBeGreaterThanOrEqual(2);
      
      // Verify roles are normalized to lowercase
      response.body.data.forEach((user: any) => {
        expect(['user', 'admin']).toContain(user.role);
      });
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should support filtering by role', async () => {
      const response = await request(app)
        .get('/api/users?role=ADMIN')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      // Verify roles are normalized to lowercase
      expect(response.body.data.every((u: any) => u.role === 'admin')).toBe(true);
    });

    it('should support sorting', async () => {
      const response = await request(app)
        .get('/api/users?sortBy=email&sortOrder=asc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by ID for admin', async () => {
      const response = await request(app)
        .get(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(regularUser.id);
      expect(response.body.data.email).toBe(regularUser.email);
      expect(response.body.data).not.toHaveProperty('password');
      
      // Verify role is normalized to lowercase
      expect(['user', 'admin']).toContain(response.body.data.role);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .get(`/api/users/${adminUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users', () => {
    it('should create new user with valid data', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'newuser@test.com',
          password: 'Password123',
          firstName: 'New',
          lastName: 'User',
          role: 'USER',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('newuser@test.com');
      expect(response.body.data).not.toHaveProperty('password');
      
      // Verify role is normalized to lowercase
      expect(response.body.data.role).toBe('user');

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: 'newuser@test.com' },
      });
      expect(user).toBeTruthy();
    });

    it('should return 400 for duplicate email', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'admin@test.com', // Already exists
          password: 'Password123',
          firstName: 'Duplicate',
          lastName: 'User',
          role: 'USER',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalid-email',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for weak password', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'weakpass@test.com',
          password: 'weak',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'forbidden@test.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User',
          role: 'USER',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user with valid data', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'User',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('User');
      
      // Verify role is normalized to lowercase
      expect(['user', 'admin']).toContain(response.body.data.role);
    });

    it('should update user role', async () => {
      // Create a test user to update
      const testUser = await prisma.user.create({
        data: {
          email: 'roletest@test.com',
          password: 'hashedpassword',
          firstName: 'Role',
          lastName: 'Test',
          role: 'USER',
        },
      });

      const response = await request(app)
        .put(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'ADMIN',
        });

      expect(response.status).toBe(200);
      // Verify role is normalized to lowercase
      expect(response.body.data.role).toBe('admin');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .put('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Updated',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .put(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Forbidden',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should deactivate user', async () => {
      // Create a test user to delete
      const testUser = await prisma.user.create({
        data: {
          email: 'deletetest@test.com',
          password: 'hashedpassword',
          firstName: 'Delete',
          lastName: 'Test',
          role: 'USER',
        },
      });

      const response = await request(app)
        .delete(`/api/users/${testUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify user was deactivated, not deleted
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(user).toBeTruthy();
      expect(user?.isActive).toBe(false);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for non-admin users', async () => {
      const response = await request(app)
        .delete(`/api/users/${regularUser.id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });
});
