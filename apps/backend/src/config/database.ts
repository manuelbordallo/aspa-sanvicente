import { PrismaClient } from '@prisma/client';
import config, { isDevelopment } from './index';

/**
 * Database configuration with connection pooling
 * Requirements: 1.1, 1.4
 */

// Create a singleton instance of PrismaClient with connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
  log: isDevelopment() ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * Test database connection
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await prisma.$disconnect();
    console.log('✓ Database disconnected successfully');
  } catch (error) {
    console.error('✗ Database disconnection failed:', error);
    throw error;
  }
};

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await disconnectDatabase();
});

process.on('SIGINT', async () => {
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDatabase();
  process.exit(0);
});

export default prisma;
