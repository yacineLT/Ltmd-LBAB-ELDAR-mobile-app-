import { Router, Request, Response } from 'express';
import { slickpayService } from '../services/slickpay';
import { subscriptionStore, PaymentRecord } from '../db/subscriptionStore';

const router = Router();

/**
 * ============================================================================
 * Slick-Pay V2 Payment Routes (/api/payments)
 * ============================================================================
 */

/**
 * GET /api/payments/status
 * Informs frontend of gateway status without exposing secret keys.
 */
router.get('/status', (_req: Request, res: Response) => {
  const status = slickpayService.getStatus();
  res.json({
    success: true,
    data: {
      gateway: 'slick_pay_v2',
      isConfigured: status.isConfigured,
      mode: status.mode,
      apiBaseUrl: status.apiBaseUrl,
      currency: 'DZD',
      supportedMethods: ['EDAHABIA', 'CIB', 'SATIM'],
    },
  });
});

/**
 * POST /api/payments/slickpay/create (and /slickpay/create-invoice)
 *
 * 1. Authenticate / validate user.
 * 2. Retrieve subscription plan from server database.
 * 3. Retrieve price strictly from database.
 * 4. Generate unique internal order ID.
 * 5. Create pending payment record.
 * 6. Call Slick-Pay invoice API from backend.
 * 7. Store Slick-Pay invoice ID.
 * 8. Store returned payment URL.
 * 9. Return payment URL to redirect customer to Slick-Pay / SATIM payment page.
 */
router.post(['/slickpay/create', '/slickpay/create-invoice'], async (req: Request, res: Response) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userRole,
      planId,
      customerPhone,
      customerAddress,
      returnUrl,
    } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        error: { message: 'معرف المستخدم (userId) ومعرف الخطة (planId) مطلوبان.' },
      });
    }

    // 2. Retrieve the subscription plan from the database
    const plan = subscriptionStore.getPlanById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: { message: 'خطة الاشتراك غير متوفرة أو غير نشطة حالياً.' },
      });
    }

    // 3. Retrieve the price from the database (NEVER trust amount from browser)
    const amount = plan.price;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'الخطط المجانية يتم تفعيلها مباشرة عبر مسار تفعيل الباقة المجانية.' },
      });
    }

    // 4. Generate a unique internal order ID
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 5. Create a pending payment record
    const now = new Date().toISOString();
    const paymentRecord: PaymentRecord = {
      id: `pay_${orderId}`,
      orderId,
      userId,
      userEmail: userEmail || 'user@lbabeldar.dz',
      userName: userName || 'مشترك لباب الدار',
      userRole: userRole || 'MERCHANT',
      planId: plan.id,
      planTier: plan.tier,
      planName: plan.name,
      amount,
      currency: 'DZD',
      paymentMethod: 'SLICK_PAY_SATIM',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      metadata: {
        billingPeriod: plan.billingPeriod,
        durationDays: plan.durationDays,
      },
    };

    subscriptionStore.createPaymentRecord(paymentRecord);

    subscriptionStore.logPaymentEvent({
      orderId,
      eventType: 'INVOICE_INITIALIZED',
      status: 'pending',
      details: {
        userId,
        planId: plan.id,
        amount,
      },
    });

    // Determine return URL on customer redirect back
    const effectiveReturnUrl =
      returnUrl ||
      `${req.protocol}://${req.get('host')}/payment/verify?orderId=${encodeURIComponent(orderId)}`;

    // 6. Call the Slick-Pay invoice API from the backend
    const [firstname = 'المشترك', ...restName] = (userName || 'المشترك').split(' ');
    const lastname = restName.join(' ') || 'الجزائري';

    const slickInvoice = await slickpayService.createInvoice({
      orderId,
      userId,
      planId: plan.id,
      planName: plan.name,
      amount,
      customer: {
        firstname,
        lastname,
        phone: customerPhone || '0550000000',
        email: userEmail || 'customer@lbabeldar.dz',
        address: customerAddress || 'الجزائر العاصمة',
      },
      returnUrl: effectiveReturnUrl,
    });

    // 7. Store the Slick-Pay invoice ID
    // 8. Store the returned payment URL
    subscriptionStore.updatePaymentStatus(orderId, 'pending', {
      slickpayInvoiceId: slickInvoice.invoiceId,
      slickpayPaymentUrl: slickInvoice.paymentUrl,
    });

    subscriptionStore.logPaymentEvent({
      orderId,
      invoiceId: slickInvoice.invoiceId,
      eventType: 'INVOICE_CREATED_SLICKPAY',
      status: 'pending',
      details: {
        invoiceId: slickInvoice.invoiceId,
        paymentUrl: slickInvoice.paymentUrl,
        isSimulated: slickInvoice.isSimulated,
      },
    });

    // 9. Send payment URL back to frontend for redirect
    return res.status(200).json({
      success: true,
      message: 'تم إنشاء فاتورة الدفع Slick-Pay بنجاح.',
      data: {
        orderId,
        invoiceId: slickInvoice.invoiceId,
        paymentUrl: slickInvoice.paymentUrl,
        amount,
        currency: 'DZD',
        planName: plan.name,
        isSimulated: slickInvoice.isSimulated,
      },
    });
  } catch (err: any) {
    console.error('[Payments API] Error creating Slick-Pay invoice:', err);
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'حدث خطأ في الخادم أثناء الاتصال ببوابة Slick-Pay.',
      },
    });
  }
});

/**
 * GET /api/payments/slickpay/verify/:paymentId
 * (also supports /slickpay/verify/:orderId and /slickpay/verify?orderId=...)
 *
 * Payment Verification Endpoint.
 * DO NOT automatically activate subscription just because customer reached return URL.
 * Backend retrieves actual invoice/payment status from Slick-Pay.
 * Subscription can become ACTIVE only after confirmed successful payment.
 */
router.get(['/slickpay/verify', '/slickpay/verify/:orderId', '/slickpay/verify/:paymentId'], async (req: Request, res: Response) => {
  try {
    const orderId =
      req.params.paymentId ||
      req.params.orderId ||
      (req.query.orderId as string) ||
      (req.query.paymentId as string);

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: { message: 'رقم الطلب (orderId) مطلوب.' },
      });
    }

    const payment = subscriptionStore.getPaymentByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: 'سجل الطلب غير موجود.' },
      });
    }

    // If already verified as paid (IDEMPOTENT check)
    if (payment.status === 'paid') {
      let existingSub = subscriptionStore.getUserSubscription(payment.userId);
      if (!existingSub) {
        const plan = subscriptionStore.getPlanById(payment.planId);
        if (plan) {
          existingSub = subscriptionStore.activateSubscription({
            userId: payment.userId,
            userEmail: payment.userEmail,
            userName: payment.userName,
            plan,
            paymentRecord: payment,
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          orderId: payment.orderId,
          status: 'paid',
          isPaid: true,
          planName: payment.planName,
          planTier: payment.planTier,
          amount: payment.amount,
          transactionReference: payment.transactionReference,
          subscription: existingSub,
          alreadyProcessed: true,
        },
      });
    }

    if (!payment.slickpayInvoiceId) {
      return res.status(400).json({
        success: false,
        error: { message: 'رقم فاتورة Slick-Pay غير مرتبط بهذا الطلب.' },
      });
    }

    // Call Slick-Pay API to verify the actual invoice payment status
    const verification = await slickpayService.verifyPayment(
      payment.slickpayInvoiceId,
      payment.orderId
    );

    // Update payment record with verified status
    const updatedPayment = subscriptionStore.updatePaymentStatus(
      orderId,
      verification.status,
      {
        verifiedAt: new Date().toISOString(),
        verificationSource: 'return_url',
        transactionReference: verification.transactionReference,
      }
    );

    // Log verification event
    subscriptionStore.logPaymentEvent({
      orderId,
      invoiceId: payment.slickpayInvoiceId,
      eventType: 'PAYMENT_VERIFIED_RETURN_URL',
      status: verification.status,
      details: {
        isPaid: verification.isPaid,
        transactionReference: verification.transactionReference,
      },
    });

    let activatedSub = null;

    // ACTIVATE SUBSCRIPTION ONLY IF CONFIRMED PAID
    if (verification.isPaid && updatedPayment) {
      const plan = subscriptionStore.getPlanById(updatedPayment.planId);
      if (plan) {
        activatedSub = subscriptionStore.activateSubscription({
          userId: updatedPayment.userId,
          userEmail: updatedPayment.userEmail,
          userName: updatedPayment.userName,
          plan,
          paymentRecord: updatedPayment,
        });

        subscriptionStore.logPaymentEvent({
          orderId,
          invoiceId: payment.slickpayInvoiceId,
          eventType: 'SUBSCRIPTION_ACTIVATED',
          status: 'paid',
          details: {
            userId: updatedPayment.userId,
            subscriptionId: activatedSub.id,
            planTier: plan.tier,
            endDate: activatedSub.endDate,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: payment.orderId,
        status: verification.status,
        isPaid: verification.isPaid,
        planName: payment.planName,
        planTier: payment.planTier,
        amount: payment.amount,
        transactionReference: verification.transactionReference,
        subscription: activatedSub,
        alreadyProcessed: false,
      },
    });
  } catch (err: any) {
    console.error('[Payments API] Error verifying payment with Slick-Pay:', err);
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || 'فشل التحقق من حالة الفاتورة مع Slick-Pay.',
      },
    });
  }
});

/**
 * POST /api/payments/slickpay/webhook
 *
 * Secure webhook endpoint that receives real-time payment events from Slick-Pay.
 * IDEMPOTENT: Receiving the same webhook multiple times does NOT:
 * - create duplicate subscriptions
 * - extend a subscription multiple times
 * - create duplicate payment records
 */
router.post('/slickpay/webhook', async (req: Request, res: Response) => {
  try {
    const signature = (req.headers['signature'] || req.headers['x-slickpay-signature']) as
      | string
      | undefined;
    const rawBody = JSON.stringify(req.body);

    console.log('[Slick-Pay Webhook] Received webhook notification from Slick-Pay');

    const webhookResult = await slickpayService.handleWebhook(req.body, signature, rawBody);

    if (!webhookResult.isValid) {
      console.warn('[Slick-Pay Webhook] Invalid webhook rejected:', webhookResult.error);
      return res.status(401).json({
        success: false,
        error: webhookResult.error || 'Invalid signature or payload',
      });
    }

    // Find the internal payment record
    let payment: PaymentRecord | undefined;
    if (webhookResult.orderId) {
      payment = subscriptionStore.getPaymentByOrderId(webhookResult.orderId);
    }
    if (!payment && webhookResult.invoiceId) {
      payment = subscriptionStore.getPaymentByInvoiceId(webhookResult.invoiceId);
    }

    if (!payment) {
      console.warn(
        `[Slick-Pay Webhook] Order/Payment record not found for invoice ${webhookResult.invoiceId}`
      );
      // Return 200 to prevent continuous webhook retries if unknown
      return res.status(200).json({
        success: true,
        message: 'Webhook received but order not found in LBAB ELDAR.',
      });
    }

    // IDEMPOTENCY CHECK:
    // If the payment is already confirmed as 'paid', do NOT re-activate or extend
    if (payment.status === 'paid') {
      console.log(
        `[Slick-Pay Webhook] Order ${payment.orderId} is already PAID. Skipping duplicate activation.`
      );
      return res.status(200).json({
        success: true,
        message: 'Payment already processed and subscription active.',
        orderId: payment.orderId,
        alreadyProcessed: true,
      });
    }

    // Update payment record with webhook status
    const updatedPayment = subscriptionStore.updatePaymentStatus(
      payment.orderId,
      webhookResult.status,
      {
        verifiedAt: new Date().toISOString(),
        verificationSource: 'webhook',
        transactionReference: webhookResult.transactionReference,
      }
    );

    subscriptionStore.logPaymentEvent({
      orderId: payment.orderId,
      invoiceId: webhookResult.invoiceId,
      eventType: 'WEBHOOK_RECEIVED',
      status: webhookResult.status,
      details: {
        isPaid: webhookResult.isPaid,
        transactionReference: webhookResult.transactionReference,
      },
    });

    // Activate subscription only after confirmed successful payment
    if (webhookResult.isPaid && updatedPayment) {
      const plan = subscriptionStore.getPlanById(updatedPayment.planId);
      if (plan) {
        const sub = subscriptionStore.activateSubscription({
          userId: updatedPayment.userId,
          userEmail: updatedPayment.userEmail,
          userName: updatedPayment.userName,
          plan,
          paymentRecord: updatedPayment,
        });

        subscriptionStore.logPaymentEvent({
          orderId: payment.orderId,
          invoiceId: webhookResult.invoiceId,
          eventType: 'SUBSCRIPTION_ACTIVATED_WEBHOOK',
          status: 'paid',
          details: {
            subscriptionId: sub.id,
            planTier: plan.tier,
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      received: true,
      status: webhookResult.status,
      orderId: payment.orderId,
    });
  } catch (err: any) {
    console.error('[Slick-Pay Webhook] Error processing webhook:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing webhook',
    });
  }
});

/**
 * POST /api/payments/slickpay/simulate-satim-action
 *
 * Dedicated sandbox simulator endpoint to test SATIM interactions:
 * - Pay successfully
 * - Fail payment
 * - Cancel payment
 */
router.post('/slickpay/simulate-satim-action', (req: Request, res: Response) => {
  const { invoiceId, orderId, action } = req.body;

  let targetInvoiceId = invoiceId;
  if (!targetInvoiceId && orderId) {
    const p = subscriptionStore.getPaymentByOrderId(orderId);
    targetInvoiceId = p?.slickpayInvoiceId;
  }

  if (!targetInvoiceId && !orderId) {
    return res.status(400).json({ success: false, error: 'invoiceId or orderId is required' });
  }

  const statusMap: Record<string, any> = {
    pay: 'paid',
    fail: 'failed',
    cancel: 'cancelled',
  };

  const newStatus = statusMap[action] || 'paid';
  const txRef = `SATIM_TEST_${Date.now()}`;

  if (targetInvoiceId) {
    slickpayService.setSimulatedInvoiceStatus(targetInvoiceId, newStatus, txRef);
  }

  // If orderId is provided, also update payment directly
  if (orderId) {
    subscriptionStore.updatePaymentStatus(orderId, newStatus, {
      transactionReference: txRef,
    });
  }

  return res.json({
    success: true,
    message: `Simulated SATIM payment status set to ${newStatus}`,
    invoiceId: targetInvoiceId,
    status: newStatus,
    transactionReference: txRef,
  });
});

export default router;
