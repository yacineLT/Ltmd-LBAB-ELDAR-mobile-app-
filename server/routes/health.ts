import { Router, Request, Response } from 'express';

const router = Router();

/**
 * Health Check Endpoint
 * GET /api/health
 *
 * Used by container runtime, uptime monitors, and the frontend to verify
 * that the backend server is operational.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
  });
});

export default router;
