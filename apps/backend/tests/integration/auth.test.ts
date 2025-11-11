import request from 'supertest';
import createApp from '../../src/app';
import { prisma, createTestUsers, setupTestDatabase } from '../setup';
import { generateToken } from '../../src/utils/jwt.util';
import { hashPassword } from '../../src/utils/password.util';

const app = createApp();

describe('Auth Integration Tests', () => {
  let adminUser: any;
  let regularUser: any;
  let testPassword: string;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    const users = await createTestUsers();
    adminUser = users.adminUser;
    regularUser = users.regularUser;
    testPassword = users.password;
    
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
    // Clean up password reset tokens after each test
    await prisma.passwordResetToken.deleteMany();
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials and return token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe('admin@test.com');
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 401 for invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 401 for invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should return 400 for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/validate', () => {
    it('should validate valid token and return user data', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('admin@test.com');
    });

    it('should return 401 for missing token', async () => {
      const response = await request(app)
        .get('/api/auth/validate');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/validate')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh token for authenticated user', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset email for valid email', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'admin@test.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');

      // Verify token was created
      const resetToken = await prisma.passwordResetToken.findFirst({
        where: { userId: adminUser.id },
      });
      expect(resetToken).toBeTruthy();
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('should reset password with valid token', async () => {
      // Create a reset token
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: regularUser.id,
          token: 'test-reset-token-123',
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          used: false,
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken.token,
          newPassword: 'NewPassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify token was marked as used
      const updatedToken = await prisma.passwordResetToken.findUnique({
        where: { id: resetToken.id },
      });
      expect(updatedToken?.used).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: regularUser.email,
          password: 'NewPassword123',
        });

      expect(loginResponse.status).toBe(200);
    });

    it('should return 400 for expired token', async () => {
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: regularUser.id,
          token: 'expired-token-123',
          expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
          used: false,
        },
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken.token,
          newPassword: 'NewPassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/reset-password')
        .send({
          token: 'invalid-token',
          newPassword: 'NewPassword123',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/change-password', () => {
    it('should change password with correct current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: testPassword,
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: regularUser.email,
          password: 'NewPassword456',
        });

      expect(loginResponse.status).toBe(200);

      // Reset password back for other tests
      await prisma.user.update({
        where: { id: regularUser.id },
        data: { password: await hashPassword(testPassword) },
      });
    });

    it('should return 400 for incorrect current password', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'WrongPassword123',
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/auth/change-password')
        .send({
          currentPassword: testPassword,
          newPassword: 'NewPassword456',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return current user profile', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe('admin@test.com');
      expect(response.body.data).not.toHaveProperty('password');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'Updated',
          lastName: 'Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          firstName: 'Updated',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
