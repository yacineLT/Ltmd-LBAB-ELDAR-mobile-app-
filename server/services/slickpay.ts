import crypto from 'crypto';
import { config } from '../config';
import { PaymentStatus } from '../db/subscriptionStore';

/**
 * ============================================================================
 * LBAB ELDAR - Official Slick-Pay V2 Service Integration
 * Reference: https://developers.slick-pay.com/
 * ============================================================================
 *
 * This service handles all direct communication with Slick-Pay V2 API.
 * All Slick-Pay credentials (SLICKPAY_API_KEY, SLICKPAY_WEBHOOK_SECRET) are
 * strictly server-side and never exposed to the frontend.
 */

export interface SlickPayCustomerInfo {
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  address: string;
}

export interface SlickPayCreateInvoiceParams {
  orderId: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number; // in DZD (retrieved strictly from server database)
  customer: SlickPayCustomerInfo;
  returnUrl: string;
  note?: string;
  metadata?: Record<string, unknown>;
}

export interface SlickPayInvoiceResponse {
  invoiceId: string | number;
  paymentUrl: string; // The official SATIM payment page URL
  status: 'pending' | 'completed' | 'paid' | 'unpaid';
  amount: number;
  isSimulated: boolean;
  rawResponse?: unknown;
}

export interface SlickPayInvoiceDetails {
  id: string | number;
  amount: number;
  status: string;
  payment_status?: string; // 'paid' | 'unpaid' | 'failed'
  url?: string;
  details?: {
    completed?: number | boolean;
    reference?: string;
    transaction_id?: string;
    [key: string]: unknown;
  };
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface SlickPayVerificationResult {
  isPaid: boolean;
  status: PaymentStatus;
  invoiceId: string | number;
  orderId?: string;
  transactionReference?: string;
  amount?: number;
  rawInvoice?: unknown;
}

export interface SlickPayWebhookResult {
  isValid: boolean;
  orderId?: string;
  invoiceId?: string | number;
  isPaid: boolean;
  status: PaymentStatus;
  transactionReference?: string;
  error?: string;
  rawPayload: unknown;
}

// In-memory simulation cache for sandbox testing when no live Slick-Pay API key is provided
const simulatedInvoices = new Map<string, { status: PaymentStatus; transactionReference?: string; amount: number }>();

class SlickPayService {
  /**
   * Returns gateway status without exposing private keys.
   */
  public getStatus(): { isConfigured: boolean; mode: 'sandbox' | 'live'; apiBaseUrl: string } {
    return {
      isConfigured: config.slickpay.isConfigured,
      mode: config.slickpay.mode,
      apiBaseUrl: config.slickpay.apiBaseUrl,
    };
  }

  /**
   * 1. CREATE INVOICE
   * Sends POST request to official Slick-Pay V2:
   * Sandbox: https://devapi.slick-pay.com/api/v2/users/invoices
   * Production: https://prodapi.slick-pay.com/api/v2/users/invoices
   */
  public async createInvoice(params: SlickPayCreateInvoiceParams): Promise<SlickPayInvoiceResponse> {
    if (!params.amount || params.amount <= 0) {
      throw new Error('Slick-Pay invoice amount must be a positive number in DZD.');
    }

    const webhookUrl = `${config.appUrl}/api/payments/slickpay/webhook`;

    // Format request payload strictly matching official Slick-Pay docs
    const payload: Record<string, unknown> = {
      amount: params.amount,
      url: params.returnUrl,
      firstname: params.customer.firstname || 'العميل',
      lastname: params.customer.lastname || 'المشترك',
      phone: params.customer.phone || '0550000000',
      email: params.customer.email || 'customer@lbabeldar.dz',
      address: params.customer.address || 'Alger, Algérie',
      webhook_url: webhookUrl,
      note: params.note || `اشتراك منصة لباب الدار - ${params.planName} (طلب: ${params.orderId})`,
      items: [
        {
          name: params.planName,
          price: params.amount,
          quantity: 1,
        },
      ],
      webhook_meta_data: {
        orderId: params.orderId,
        userId: params.userId,
        planId: params.planId,
      },
    };

    if (config.slickpay.accountId) {
      payload.account = config.slickpay.accountId;
    }

    if (config.slickpay.webhookSecret) {
      payload.webhook_signature = config.slickpay.webhookSecret;
    }

    // When API Key is configured, make real API request to Slick-Pay
    if (config.slickpay.isConfigured) {
      const endpoint = `${config.slickpay.apiBaseUrl}/users/invoices`;
      console.log(`[Slick-Pay] Calling real API: POST ${endpoint} for order ${params.orderId}`);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.slickpay.apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const resData = await response.json().catch(() => ({}));

        if (!response.ok) {
          console.error('[Slick-Pay] Error response from API:', response.status, resData);
          throw new Error(
            resData?.message || `Slick-Pay API error: HTTP ${response.status}`
          );
        }

        // Slick-Pay returns invoice id and payment url
        const invoiceId = resData.id || resData.invoice_id || resData.data?.id;
        const paymentUrl = resData.url || resData.data?.url;

        if (!paymentUrl) {
          throw new Error('Slick-Pay API did not return a valid SATIM payment URL.');
        }

        return {
          invoiceId: invoiceId || `inv_${Date.now()}`,
          paymentUrl,
          status: 'pending',
          amount: params.amount,
          isSimulated: false,
          rawResponse: resData,
        };
      } catch (err: any) {
        console.error('[Slick-Pay] Failed to call Slick-Pay API:', err);
        throw err;
      }
    }

    // SANDBOX SIMULATION (when running in test mode without live credentials)
    // Generates a mock invoice and redirects to internal SATIM test page
    const simulatedInvoiceId = `SP_INV_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const satimMockUrl = `${config.appUrl}/payment/satim-mock?orderId=${encodeURIComponent(
      params.orderId
    )}&invoiceId=${encodeURIComponent(simulatedInvoiceId)}&amount=${params.amount}&planName=${encodeURIComponent(
      params.planName
    )}`;

    simulatedInvoices.set(simulatedInvoiceId, {
      status: 'pending',
      amount: params.amount,
    });

    console.log(
      `[Slick-Pay] Sandbox invoice created: ${simulatedInvoiceId} for order ${params.orderId} (Amount: ${params.amount} DZD)`
    );

    return {
      invoiceId: simulatedInvoiceId,
      paymentUrl: satimMockUrl,
      status: 'pending',
      amount: params.amount,
      isSimulated: true,
    };
  }

  /**
   * 2. GET INVOICE
   * Fetches invoice document from Slick-Pay API:
   * GET https://devapi.slick-pay.com/api/v2/users/invoices/:id
   */
  public async getInvoice(invoiceId: string | number): Promise<SlickPayInvoiceDetails> {
    const invIdStr = String(invoiceId);

    if (config.slickpay.isConfigured) {
      const endpoint = `${config.slickpay.apiBaseUrl}/users/invoices/${invoiceId}`;
      console.log(`[Slick-Pay] Querying invoice: GET ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${config.slickpay.apiKey}`,
          Accept: 'application/json',
        },
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          resData?.message || `Slick-Pay getInvoice error: HTTP ${response.status}`
        );
      }

      return (resData.data || resData) as SlickPayInvoiceDetails;
    }

    // Sandbox Simulation fallback
    const simulated = simulatedInvoices.get(invIdStr);
    const isPaid = simulated?.status === 'paid';

    return {
      id: invoiceId,
      amount: simulated?.amount || 999,
      status: isPaid ? 'completed' : simulated?.status || 'pending',
      payment_status: isPaid ? 'paid' : 'unpaid',
      details: {
        completed: isPaid ? 1 : 0,
        reference: simulated?.transactionReference || `SATIM_REF_${invIdStr}`,
      },
    };
  }

  /**
   * 3. VERIFY PAYMENT
   * Server-side authoritative verification with Slick-Pay.
   * Maps Slick-Pay invoice response to internal PaymentStatus.
   */
  public async verifyPayment(
    invoiceId: string | number,
    orderId?: string
  ): Promise<SlickPayVerificationResult> {
    const invoice = await this.getInvoice(invoiceId);

    // According to Slick-Pay documentation:
    // - payment_status can be 'paid' or 'unpaid'
    // - details.completed == 1 indicates completed payment
    // - status can be 'completed' or 'paid'
    const paymentStatusRaw = String(invoice.payment_status || '').toLowerCase();
    const statusRaw = String(invoice.status || '').toLowerCase();
    const isCompletedFlag =
      invoice.details?.completed === 1 ||
      invoice.details?.completed === true ||
      invoice.completed === 1 ||
      invoice.completed === true;

    const isPaid =
      paymentStatusRaw === 'paid' ||
      statusRaw === 'completed' ||
      statusRaw === 'paid' ||
      isCompletedFlag;

    let mappedStatus: PaymentStatus = 'pending';
    if (isPaid) {
      mappedStatus = 'paid';
    } else if (
      paymentStatusRaw === 'failed' ||
      statusRaw === 'failed' ||
      statusRaw === 'cancelled' ||
      statusRaw === 'canceled'
    ) {
      mappedStatus = statusRaw === 'cancelled' || statusRaw === 'canceled' ? 'cancelled' : 'failed';
    } else if (statusRaw === 'processing') {
      mappedStatus = 'processing';
    }

    const transactionReference =
      (invoice.details?.reference as string) ||
      (invoice.details?.transaction_id as string) ||
      `SATIM_${invoiceId}`;

    return {
      isPaid,
      status: mappedStatus,
      invoiceId,
      orderId,
      transactionReference,
      amount: Number(invoice.amount),
      rawInvoice: invoice,
    };
  }

  /**
   * 4. HANDLE WEBHOOK
   * Validates webhook signature and parses payload.
   */
  public async handleWebhook(
    payload: any,
    signatureHeader?: string,
    rawBody?: string
  ): Promise<SlickPayWebhookResult> {
    // 1. Signature validation when configured
    if (config.slickpay.webhookSecret) {
      const receivedSig =
        signatureHeader ||
        payload?.webhook_signature ||
        payload?.signature ||
        '';

      // Check HMAC or direct token match
      let isValidSig = false;
      if (receivedSig === config.slickpay.webhookSecret) {
        isValidSig = true;
      } else if (rawBody) {
        try {
          const computed = crypto
            .createHmac('sha256', config.slickpay.webhookSecret)
            .update(rawBody)
            .digest('hex');
          isValidSig = crypto.timingSafeEqual(
            Buffer.from(computed, 'utf8'),
            Buffer.from(receivedSig, 'utf8')
          );
        } catch {
          isValidSig = false;
        }
      }

      if (!isValidSig) {
        return {
          isValid: false,
          isPaid: false,
          status: 'failed',
          error: 'Invalid webhook signature',
          rawPayload: payload,
        };
      }
    }

    // 2. Extract invoice and order identifiers from payload
    const invoiceId =
      payload.invoice_id ||
      payload.id ||
      payload.data?.id ||
      payload.data?.invoice_id;

    const orderId =
      payload.orderId ||
      payload.order_id ||
      payload.webhook_meta_data?.orderId ||
      payload.data?.webhook_meta_data?.orderId;

    if (!invoiceId && !orderId) {
      return {
        isValid: false,
        isPaid: false,
        status: 'pending',
        error: 'Missing invoiceId or orderId in webhook payload',
        rawPayload: payload,
      };
    }

    // 3. Verify status with Slick-Pay
    let isPaid = false;
    let status: PaymentStatus = 'pending';
    let transactionRef: string | undefined;

    if (invoiceId) {
      try {
        const verifyRes = await this.verifyPayment(invoiceId, orderId);
        isPaid = verifyRes.isPaid;
        status = verifyRes.status;
        transactionRef = verifyRes.transactionReference;

        // If webhook payload itself carries payment confirmation
        const pStatus = String(
          payload.payment_status || payload.status || payload.event || payload.type || ''
        ).toLowerCase();
        if (!isPaid && (pStatus === 'paid' || pStatus === 'completed' || pStatus === 'invoice.paid')) {
          isPaid = true;
          status = 'paid';
          this.setSimulatedInvoiceStatus(String(invoiceId), 'paid', transactionRef);
        }
      } catch (err: any) {
        console.warn('[Slick-Pay Webhook] Fallback to payload status evaluation:', err.message);
        // Fallback to payload fields if direct invoice query fails
        const pStatus = String(
          payload.payment_status || payload.status || payload.event || payload.type || ''
        ).toLowerCase();
        isPaid = pStatus === 'paid' || pStatus === 'completed' || pStatus === 'invoice.paid';
        status = isPaid ? 'paid' : 'failed';
      }
    }

    return {
      isValid: true,
      orderId,
      invoiceId,
      isPaid,
      status,
      transactionReference: transactionRef,
      rawPayload: payload,
    };
  }

  /**
   * SIMULATION HELPER: Update status in sandbox (for testing 21 scenarios).
   */
  public setSimulatedInvoiceStatus(
    invoiceId: string,
    status: PaymentStatus,
    reference?: string
  ): void {
    simulatedInvoices.set(invoiceId, {
      status,
      amount: simulatedInvoices.get(invoiceId)?.amount || 999,
      transactionReference: reference || `SATIM_TEST_${Date.now()}`,
    });
  }
}

export const slickpayService = new SlickPayService();
