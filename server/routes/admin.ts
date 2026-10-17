import { Router, Request, Response } from 'express';
import { subscriptionStore } from '../db/subscriptionStore';

const router = Router();

/**
 * ============================================================================
 * Admin Management Routes (/api/admin)
 * ============================================================================
 */

/**
 * GET /api/admin/subscriptions
 * View all user subscriptions with full details.
 */
router.get('/subscriptions', (_req: Request, res: Response) => {
  const subscriptions = subscriptionStore.getAllSubscriptions();
  res.json({
    success: true,
    data: subscriptions,
  });
});

/**
 * GET /api/admin/payments
 * View all payments, Slick-Pay invoice IDs, references, statuses, and audit events.
 */
router.get('/payments', (_req: Request, res: Response) => {
  const payments = subscriptionStore.getPayments();
  const events = subscriptionStore.getEvents();
  res.json({
    success: true,
    data: {
      payments,
      events,
    },
  });
});

/**
 * GET /api/admin/plans
 * View all subscription plans (both active and inactive).
 */
router.get('/plans', (_req: Request, res: Response) => {
  const plans = subscriptionStore.getPlans();
  res.json({
    success: true,
    data: plans,
  });
});

/**
 * PUT /api/admin/plans/:id
 * Update a plan's price, active status, features, etc.
 * Keeps prices database-driven and editable by administrators.
 */
router.put('/plans/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  const updatedPlan = subscriptionStore.updatePlan(id, updates);
  if (!updatedPlan) {
    return res.status(404).json({
      success: false,
      error: { message: 'الخطة غير موجودة.' },
    });
  }

  return res.json({
    success: true,
    message: 'تم تحديث بيانات الخطة بنجاح في قاعدة البيانات.',
    data: updatedPlan,
  });
});

export default router;
