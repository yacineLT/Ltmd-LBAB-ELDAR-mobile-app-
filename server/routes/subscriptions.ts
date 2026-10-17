import { Router, Request, Response } from 'express';
import { subscriptionStore } from '../db/subscriptionStore';

const router = Router();

/**
 * ============================================================================
 * Subscription Routes (/api/subscriptions)
 * ============================================================================
 */

/**
 * GET /api/subscriptions/plans
 * Returns active subscription plans and prices from the server database.
 */
router.get('/plans', (_req: Request, res: Response) => {
  const plans = subscriptionStore.getPlans();
  res.json({
    success: true,
    data: plans,
  });
});

/**
 * GET /api/subscriptions/my-subscription
 * Returns the authenticated user's current subscription.
 */
router.get(['/my-subscription', '/my/:userId'], (req: Request, res: Response) => {
  const userId = req.params.userId || (req.query.userId as string);

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: 'معرف المستخدم (userId) مطلوب.' },
    });
  }

  let sub = subscriptionStore.getUserSubscription(userId);

  // If no subscription exists yet, default to active FREE plan
  if (!sub) {
    const freePlan = subscriptionStore.getPlans().find((p) => p.tier === 'FREE');
    if (freePlan) {
      sub = subscriptionStore.activateSubscription({
        userId,
        plan: freePlan,
      });
    }
  }

  return res.json({
    success: true,
    data: sub,
  });
});

/**
 * POST /api/subscriptions/subscribe-free
 * Activates the 0 DZD FREE tier for a user directly without gateway redirection.
 */
router.post('/subscribe-free', (req: Request, res: Response) => {
  const { userId, userEmail, userName } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: 'معرف المستخدم مطلوب.' },
    });
  }

  const freePlan = subscriptionStore.getPlans().find((p) => p.tier === 'FREE');
  if (!freePlan) {
    return res.status(404).json({
      success: false,
      error: { message: 'الباقة المجانية غير متوفرة.' },
    });
  }

  const sub = subscriptionStore.activateSubscription({
    userId,
    userEmail,
    userName,
    plan: freePlan,
  });

  return res.json({
    success: true,
    message: 'تم تفعيل الباقة المجانية بنجاح.',
    data: sub,
  });
});

/**
 * GET /api/subscriptions/user-history
 * Returns user's payments and subscription events.
 */
router.get('/user-history', (req: Request, res: Response) => {
  const userId = req.query.userId as string;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: 'معرف المستخدم مطلوب.' },
    });
  }

  const payments = subscriptionStore.getPaymentsByUser(userId);
  const sub = subscriptionStore.getUserSubscription(userId);

  return res.json({
    success: true,
    data: {
      payments,
      subscription: sub,
    },
  });
});

export default router;
