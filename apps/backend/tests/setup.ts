import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

export const prisma = new PrismaClient();

/**
 * Test database setup and teardown utilities
 */

export async function setupTestDatabase() {
  // Clean up all tables before tests
  await prisma.passwordResetToken.deleteMany();
  await prisma.userGroupMember.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardownTestDatabase() {
  // Clean up after tests
  await prisma.passwordResetToken.deleteMany();
  await prisma.userGroupMember.deleteMany();
  await prisma.userGroup.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.news.deleteMany();
  await prisma.user.deleteMany();
  
  await prisma.$disconnect();
}

/**
 * Create test users
 */
export async function createTestUsers() {
  const hashedPassword = await hashPassword('Password123');
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@test.com',
      password: hashedPassword,
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      isActive: true,
    },
  });

  return { adminUser, regularUser, password: 'Password123' };
}

/**
 * Global test setup
 */
beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Global test teardown
 */
afterAll(async () => {
  await teardownTestDatabase();
});
