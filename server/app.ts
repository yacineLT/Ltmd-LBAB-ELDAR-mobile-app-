import express, { Express } from 'express';
import { corsMiddleware, securityHeadersMiddleware } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health';
import paymentsRouter from './routes/payments';
import subscriptionsRouter from './routes/subscriptions';
import adminRouter from './routes/admin';

/**
 * Creates and configures the Express application instance.
 */
export function createApp(): Express {
  const app = express();

  // Basic security and parsing middlewares
  app.use(corsMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.use('/api/health', healthRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/subscriptions', subscriptionsRouter);
  app.use('/api/admin', adminRouter);

  // Global Error Handler for API routes
  app.use(errorHandler);

  return app;
}
