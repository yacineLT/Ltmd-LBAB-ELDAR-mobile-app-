import {
  SubscriptionPlan,
  UserSubscription,
  PaymentRecord,
  PaymentEventLog,
} from '../types';

/**
 * Client-side Subscription & Slick-Pay Service.
 * Communicates exclusively with LBAB ELDAR server API routes.
 * Never handles or receives secret API keys.
 */

export interface CreateInvoiceResult {
  orderId: string;
  invoiceId: string | number;
  paymentUrl: string;
  amount: number;
  currency: string;
  planName: string;
  isSimulated: boolean;
}

export interface VerificationResult {
  orderId: string;
  status: string;
  isPaid: boolean;
  planName: string;
  planTier: string;
  amount: number;
  transactionReference?: string;
  subscription?: UserSubscription | null;
  alreadyProcessed: boolean;
}

class SubscriptionService {
  /**
   * Fetch all subscription plans (database-driven).
   */
  public async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const res = await fetch('/api/subscriptions/plans');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || [];
    } catch (err) {
      console.warn('[SubscriptionService] Error fetching plans from backend, using fallback:', err);
      return [];
    }
  }

  /**
   * Fetch user's current subscription.
   */
  public async getMySubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const res = await fetch(`/api/subscriptions/my-subscription?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.data || null;
    } catch (err) {
      console.error('[SubscriptionService] Error fetching user subscription:', err);
      return null;
    }
  }

  /**
   * Subscribe directly to the FREE plan (0 DZD).
   */
  public async subscribeFree(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
  }): Promise<UserSubscription> {
    const res = await fetch('/api/subscriptions/subscribe-free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'فشل تفعيل الباقة المجانية.');
    }

    return data.data;
  }

  /**
   * Initialize a Slick-Pay invoice for a paid plan.
   * NOTE: Amount is NEVER passed from the browser. The server retrieves price from database!
   */
  public async createSlickPayInvoice(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    userRole?: string;
    planId: string;
    customerPhone?: string;
    customerAddress?: string;
    returnUrl?: string;
  }): Promise<CreateInvoiceResult> {
    const res = await fetch('/api/payments/slickpay/create-invoice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'فشل إنشاء فاتورة الدفع Slick-Pay.');
    }

    return data.data;
  }

  /**
   * Verify payment status with the server (which queries Slick-Pay API).
   */
  public async verifyPayment(orderId: string): Promise<VerificationResult> {
    const res = await fetch(`/api/payments/slickpay/verify/${encodeURIComponent(orderId)}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'فشل التحقق من حالة الدفع.');
    }

    return data.data;
  }

  /**
   * Fetch payment and subscription history for a user.
   */
  public async getUserHistory(userId: string): Promise<{
    payments: PaymentRecord[];
    subscription: UserSubscription | null;
  }> {
    try {
      const res = await fetch(`/api/subscriptions/user-history?userId=${encodeURIComponent(userId)}`);
      const data = await res.json();
      return data.data || { payments: [], subscription: null };
    } catch {
      return { payments: [], subscription: null };
    }
  }

  /**
   * Sandbox simulator helper for SATIM testing.
   */
  public async simulateSatimAction(params: {
    invoiceId: string;
    orderId?: string;
    action: 'pay' | 'fail' | 'cancel';
  }): Promise<void> {
    await fetch('/api/payments/slickpay/simulate-satim-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
  }

  // --- ADMIN METHODS ---
  public async getAdminSubscriptions(): Promise<UserSubscription[]> {
    const res = await fetch('/api/admin/subscriptions');
    const data = await res.json();
    return data.data || [];
  }

  public async getAdminPayments(): Promise<{
    payments: PaymentRecord[];
    events: PaymentEventLog[];
  }> {
    const res = await fetch('/api/admin/payments');
    const data = await res.json();
    return data.data || { payments: [], events: [] };
  }

  public async getAdminPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch('/api/admin/plans');
    const data = await res.json();
    return data.data || [];
  }

  public async updateAdminPlan(
    planId: string,
    updates: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    const res = await fetch(`/api/admin/plans/${encodeURIComponent(planId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error?.message || 'فشل تحديث بيانات الخطة.');
    }
    return data.data;
  }
}

export const subscriptionService = new SubscriptionService();
