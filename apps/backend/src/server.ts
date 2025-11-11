import createApp from './app';
import config from './config';
import { connectDatabase, disconnectDatabase } from './config/database';
import { Server } from 'http';

/**
 * Server entry point
 * Requirements: 1.1, 1.5
 * 
 * This module:
 * - Creates and configures the Express application
 * - Connects to the PostgreSQL database using Prisma
 * - Starts the HTTP server on the configured port
 * - Implements graceful shutdown handling
 * - Logs server startup information
 */

let server: Server | null = null;

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  try {
    // Log startup information
    console.log('='.repeat(60));
    console.log('ASPA San Vicente Backend API');
    console.log('='.repeat(60));
    console.log(`Environment: ${config.server.env}`);
    console.log(`Node Version: ${process.version}`);
    console.log(`Port: ${config.server.port}`);
    console.log(`API Base URL: ${config.server.apiBaseUrl}`);
    console.log('='.repeat(60));

    // Connect to database
    console.log('Connecting to database...');
    await connectDatabase();

    // Create Express application
    const app = createApp();

    // Start listening on configured port
    server = app.listen(config.server.port, () => {
      console.log('='.repeat(60));
      console.log(`✓ Server is running on port ${config.server.port}`);
      console.log(`✓ API available at: ${config.server.apiBaseUrl}`);
      console.log(`✓ API Documentation: ${config.server.apiBaseUrl}/api/docs`);
      console.log(`✓ Health Check: ${config.server.apiBaseUrl}/health`);
      console.log('='.repeat(60));
      console.log('Server is ready to accept connections');
      console.log('Press CTRL+C to stop the server');
      console.log('='.repeat(60));
    });

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`✗ Port ${config.server.port} is already in use`);
        console.error('Please choose a different port or stop the other process');
      } else {
        console.error('✗ Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown handler
 * Closes server connections and disconnects from database
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Stop accepting new connections
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server!.close((err) => {
          if (err) {
            console.error('✗ Error closing server:', err);
            reject(err);
          } else {
            console.log('✓ Server closed successfully');
            resolve();
          }
        });
      });
    }

    // Disconnect from database
    await disconnectDatabase();

    console.log('✓ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error during graceful shutdown:', error);
    process.exit(1);
  }
}

/**
 * Register shutdown handlers for various signals
 */
function registerShutdownHandlers(): void {
  // Handle SIGTERM (e.g., from Docker, Kubernetes)
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle SIGINT (e.g., Ctrl+C in terminal)
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    console.error('✗ Uncaught Exception:', error);
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('✗ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('UNHANDLED_REJECTION');
  });
}

// Register shutdown handlers
registerShutdownHandlers();

// Start the server
startServer();

// Export for testing purposes
export { startServer, gracefulShutdown };
