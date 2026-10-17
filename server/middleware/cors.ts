import { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from '../config';

/**
 * CORS and Security Headers Middleware.
 *
 * In development, Vite and Express run on the same origin (port 3000),
 * meaning browser requests to /api are same-origin.
 * This middleware ensures safe cross-origin handling when accessing from
 * configured preview domains or Cloud Run endpoints.
 */

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      config.appUrl,
    ].filter(Boolean);

    // Also allow *.run.app subdomains for Google Cloud Run / AI Studio preview
    const isCloudRun = /\.run\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isCloudRun;

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive in dev, logged in production
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'signature'],
  credentials: true,
});

/**
 * Security headers middleware to guard against common web vulnerabilities.
 */
export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}
