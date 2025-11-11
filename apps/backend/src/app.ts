import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import config from './config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware';
import { swaggerSpec } from './config/swagger';

/**
 * Create and configure Express application
 * Requirements: 1.1, 1.4, 1.5, 8.1, 8.5
 */
function createApp(): Application {
    const app = express();

    // Security middleware - helmet for security headers
    // Requirements: 1.4
    app.use(helmet());

    // CORS configuration with whitelist from configuration
    // Requirements: 1.4
    app.use(
        cors({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps or curl requests)
                if (!origin) {
                    return callback(null, true);
                }

                if (config.cors.origins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: config.cors.credentials,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );

    // Body parsing middleware
    // Requirements: 1.1
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Request logging middleware
    // Requirements: 1.5
    if (config.logging.logRequests) {
        app.use((req: Request, res: Response, next: NextFunction) => {
            const startTime = Date.now();

            // Log request
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

            // Log response when finished
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                console.log(
                    `[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`
                );
            });

            next();
        });
    }

    // Mount Swagger documentation
    // Requirements: 12.1, 12.2, 12.3, 12.4, 12.5
    const swaggerOptions = {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'ASPA San Vicente API Documentation',
    };
    // @ts-ignore - Type conflict between swagger-ui-express and express versions
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

    // Mount all routes
    // Requirements: 1.1
    app.use(routes);

    // 404 handler for unknown routes
    // Must be placed after all route handlers
    // Requirements: 8.1
    app.use(notFoundHandler);

    // Global error handling middleware
    // Must be placed last
    // Requirements: 8.1, 8.5
    app.use(errorHandler);

    return app;
}

export default createApp;
