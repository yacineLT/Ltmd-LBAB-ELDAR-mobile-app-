import fs from 'fs';
import path from 'path';

/**
 * Server-Side Persistent Storage for Subscriptions & Payments.
 *
 * Keeps subscription plans, active user subscriptions, payment records,
 * and audit event logs safely on the backend server.
 * Does NOT store any card details, CIB/EDAHABIA credentials, PIN, or OTP.
 */

export type SubscriptionTier = 'FREE' | 'PRO' | 'BUSINESS';
export type BillingPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number; // in DZD
  billingPeriod: BillingPeriod;
  durationDays: number;
  features: string[];
  isActive: boolean;
  orderLimitPerMonth: number | 'UNLIMITED';
  commissionDiscountPercent: number;
  badge?: string;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type SubscriptionStatus =
  | 'active'
  | 'expired'
  | 'trial'
  | 'cancelled';

export interface PaymentRecord {
  id: string; // internal payment record ID (e.g. 'pay_ord_1789...')
  orderId: string; // unique internal order identifier
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  planId: string;
  planTier: SubscriptionTier;
  planName: string;
  amount: number; // verified DZD amount from server DB plan
  currency: 'DZD';
  paymentMethod: 'SLICK_PAY_SATIM' | 'FREE';
  status: PaymentStatus;
  slickpayInvoiceId?: number | string;
  slickpayPaymentUrl?: string;
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  verifiedAt?: string;
  verificationSource?: 'webhook' | 'return_url' | 'manual_admin';
  failureReason?: string;
  metadata?: Record<string, unknown>;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  planId: string;
  planTier: SubscriptionTier;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  price: number;
  paymentMethod: 'SLICK_PAY_SATIM' | 'FREE';
  lastPaymentId?: string;
  lastInvoiceId?: string | number;
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
  history: {
    action: 'CREATED' | 'RENEWED' | 'UPGRADED' | 'EXPIRED' | 'CANCELLED';
    timestamp: string;
    note: string;
    paymentId?: string;
  }[];
}

export interface PaymentEventLog {
  id: string;
  orderId: string;
  eventType: string;
  status: PaymentStatus;
  invoiceId?: string | number;
  timestamp: string;
  details: Record<string, unknown>;
}

interface ServerState {
  plans: SubscriptionPlan[];
  payments: PaymentRecord[];
  subscriptions: Record<string, UserSubscription>; // key: userId
  events: PaymentEventLog[];
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_free',
    tier: 'FREE',
    name: 'الخطة المجانية (FREE)',
    description: 'الباقة المبدئية لاستكشاف منصة لباب الدار وبدء العمل التجاري',
    price: 0,
    billingPeriod: 'MONTHLY',
    durationDays: 30,
    features: [
      'حتى 20 طلباً شهرياً',
      'متجر إلكتروني أساسي مع قائمة المنتجات',
      'إشعارات الطلبات الفورية',
      'دعم فني عبر البريد الإلكتروني',
    ],
    isActive: true,
    orderLimitPerMonth: 20,
    commissionDiscountPercent: 0,
  },
  {
    id: 'plan_pro',
    tier: 'PRO',
    name: 'الخطة الاحترافية (PRO)',
    description: 'الخيار الأكثر شعبية للمتاجر والكباتن الباحثين عن النمو السريع',
    price: 999,
    billingPeriod: 'MONTHLY',
    durationDays: 30,
    features: [
      'طلبات غير محدودة شهرياً',
      'خصم 25% على عمولة المنصة',
      'شارة متجر موثّق ومرخّص (Verified)',
      'أولوية ظهور في نتائج البحث وتوصيات الصفحة الرئيسية',
      'دعم فني متميز ومباشر على مدار الساعة',
    ],
    isActive: true,
    orderLimitPerMonth: 'UNLIMITED',
    commissionDiscountPercent: 25,
    badge: 'الأكثر طلباً',
  },
  {
    id: 'plan_business',
    tier: 'BUSINESS',
    name: 'خطة الأعمال (BUSINESS)',
    description: 'للمتاجر الكبرى، السلاسل التجارية وشركاء التوصيل الحصريين',
    price: 1999,
    billingPeriod: 'MONTHLY',
    durationDays: 30,
    features: [
      'كافة مميزات باقة PRO',
      'خصم 50% على عمولة المنصة للمبيعات والتوصيل',
      'واجهة بنر إعلاني مخصص وشهري للمتجر في أعلى التطبيق',
      'تقارير مالية وتصدير تحليلي متقدم للإكسل',
      'مدير حساب خاص لخدمة المتجر',
    ],
    isActive: true,
    orderLimitPerMonth: 'UNLIMITED',
    commissionDiscountPercent: 50,
    badge: 'أقصى توفير',
  },
];

// Persistent file storage on server
const DB_FILE_PATH = path.join(process.cwd(), '.server_subscription_db.json');

class SubscriptionStore {
  private state: ServerState;

  constructor() {
    this.state = this.loadFromDisk();
  }

  private loadFromDisk(): ServerState {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          plans: parsed.plans && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
          payments: parsed.payments || [],
          subscriptions: parsed.subscriptions || {},
          events: parsed.events || [],
        };
      }
    } catch (err) {
      console.error('[SubscriptionStore] Error reading state file, using defaults:', err);
    }

    return {
      plans: DEFAULT_PLANS,
      payments: [],
      subscriptions: {},
      events: [],
    };
  }

  private saveToDisk(): void {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[SubscriptionStore] Error saving state to disk:', err);
    }
  }

  // --- PLANS ---
  public getPlans(): SubscriptionPlan[] {
    return this.state.plans;
  }

  public getPlanById(planId: string): SubscriptionPlan | undefined {
    return this.state.plans.find((p) => p.id === planId);
  }

  public updatePlan(planId: string, updates: Partial<SubscriptionPlan>): SubscriptionPlan | null {
    const idx = this.state.plans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;

    this.state.plans[idx] = {
      ...this.state.plans[idx],
      ...updates,
    };
    this.saveToDisk();
    return this.state.plans[idx];
  }

  // --- PAYMENTS ---
  public createPaymentRecord(record: PaymentRecord): PaymentRecord {
    // Check if orderId already exists
    const existing = this.state.payments.find((p) => p.orderId === record.orderId);
    if (existing) {
      return existing;
    }

    this.state.payments.unshift(record);
    this.saveToDisk();
    return record;
  }

  public getPaymentByOrderId(orderId: string): PaymentRecord | undefined {
    return this.state.payments.find((p) => p.orderId === orderId);
  }

  public getPaymentByInvoiceId(invoiceId: string | number): PaymentRecord | undefined {
    return this.state.payments.find(
      (p) => String(p.slickpayInvoiceId) === String(invoiceId)
    );
  }

  public getPayments(): PaymentRecord[] {
    return this.state.payments;
  }

  public getPaymentsByUser(userId: string): PaymentRecord[] {
    return this.state.payments.filter((p) => p.userId === userId);
  }

  public updatePaymentStatus(
    orderId: string,
    status: PaymentStatus,
    extra: Partial<PaymentRecord> = {}
  ): PaymentRecord | null {
    const payment = this.state.payments.find((p) => p.orderId === orderId);
    if (!payment) return null;

    payment.status = status;
    payment.updatedAt = new Date().toISOString();
    Object.assign(payment, extra);

    if (status === 'paid' && !payment.paidAt) {
      payment.paidAt = new Date().toISOString();
    }

    this.saveToDisk();
    return payment;
  }

  // --- USER SUBSCRIPTIONS ---
  public getUserSubscription(userId: string): UserSubscription | null {
    const sub = this.state.subscriptions[userId];
    if (!sub) return null;

    // Check expiration dynamically
    const now = new Date();
    const expiry = new Date(sub.endDate);
    if (sub.status === 'active' && now > expiry && sub.planTier !== 'FREE') {
      sub.status = 'expired';
      this.saveToDisk();
    }

    return sub;
  }

  public getAllSubscriptions(): UserSubscription[] {
    return Object.values(this.state.subscriptions);
  }

  /**
   * Idempotently activate or renew a subscription upon confirmed payment.
   */
  public activateSubscription(params: {
    userId: string;
    userEmail?: string;
    userName?: string;
    plan: SubscriptionPlan;
    paymentRecord?: PaymentRecord;
  }): UserSubscription {
    const { userId, userEmail, userName, plan, paymentRecord } = params;

    const existing = this.state.subscriptions[userId];
    const now = new Date();

    // Calculate dates
    let startDate = now.toISOString();
    let endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();

    // If renewing an active subscription of the same tier, extend the current endDate
    if (existing && existing.status === 'active' && existing.planTier === plan.tier) {
      const currentExpiry = new Date(existing.endDate);
      if (currentExpiry > now) {
        startDate = existing.startDate;
        endDate = new Date(currentExpiry.getTime() + plan.durationDays * 24 * 60 * 60 * 1000).toISOString();
      }
    }

    const actionType = existing
      ? existing.planTier !== plan.tier
        ? 'UPGRADED'
        : 'RENEWED'
      : 'CREATED';

    const historyEntry = {
      action: actionType as 'CREATED' | 'RENEWED' | 'UPGRADED',
      timestamp: now.toISOString(),
      note: `تفعيل باقة [${plan.name}] بنجاح عبر بوابة Slick-Pay SATIM بقيمة ${plan.price} دج`,
      paymentId: paymentRecord?.id,
    };

    const updatedSub: UserSubscription = {
      id: existing?.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail: userEmail || existing?.userEmail,
      userName: userName || existing?.userName,
      planId: plan.id,
      planTier: plan.tier,
      planName: plan.name,
      status: 'active',
      startDate,
      endDate,
      price: plan.price,
      paymentMethod: plan.price === 0 ? 'FREE' : 'SLICK_PAY_SATIM',
      lastPaymentId: paymentRecord?.id,
      lastInvoiceId: paymentRecord?.slickpayInvoiceId,
      transactionReference: paymentRecord?.transactionReference,
      createdAt: existing?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      history: existing ? [...existing.history, historyEntry] : [historyEntry],
    };

    this.state.subscriptions[userId] = updatedSub;
    this.saveToDisk();

    return updatedSub;
  }

  // --- AUDIT EVENTS ---
  public logPaymentEvent(event: Omit<PaymentEventLog, 'id' | 'timestamp'>): PaymentEventLog {
    const entry: PaymentEventLog = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
    };

    this.state.events.unshift(entry);
    if (this.state.events.length > 500) {
      this.state.events = this.state.events.slice(0, 500); // retain last 500 events
    }

    this.saveToDisk();
    return entry;
  }

  public getEvents(limit = 100): PaymentEventLog[] {
    return this.state.events.slice(0, limit);
  }
}

export const subscriptionStore = new SubscriptionStore();
