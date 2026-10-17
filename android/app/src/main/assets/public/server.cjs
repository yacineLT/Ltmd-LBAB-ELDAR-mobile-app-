var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express6 = __toESM(require("express"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_vite = require("vite");

// server/app.ts
var import_express5 = __toESM(require("express"), 1);

// server/middleware/cors.ts
var import_cors = __toESM(require("cors"), 1);

// server/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var nodeEnv = process.env.NODE_ENV || "development";
var port = parseInt(process.env.PORT || "3000", 10);
var appUrl = process.env.APP_URL || `http://localhost:${port}`;
var slickpayApiKey = process.env.SLICKPAY_API_KEY || "";
var rawMode = (process.env.SLICKPAY_MODE || "sandbox").toLowerCase();
var slickpayMode = rawMode === "live" ? "live" : "sandbox";
var slickpayWebhookSecret = process.env.SLICKPAY_WEBHOOK_SECRET || "";
var slickpayAccountId = process.env.SLICKPAY_ACCOUNT_ID || "";
var SLICKPAY_LIVE_URL = "https://prodapi.slick-pay.com/api/v2";
var SLICKPAY_DEV_URL = "https://devapi.slick-pay.com/api/v2";
var config = {
  port,
  nodeEnv,
  appUrl,
  slickpay: {
    apiKey: slickpayApiKey,
    mode: slickpayMode,
    webhookSecret: slickpayWebhookSecret,
    accountId: slickpayAccountId || void 0,
    apiBaseUrl: slickpayMode === "live" ? SLICKPAY_LIVE_URL : SLICKPAY_DEV_URL,
    isConfigured: Boolean(slickpayApiKey && slickpayApiKey.trim().length > 0)
  }
};
function validateServerConfig() {
  if (!config.slickpay.isConfigured) {
    console.warn(
      "[LBAB ELDAR Server] Notice: SLICKPAY_API_KEY is not set. Payments will operate in simulated Sandbox mode with instant verification test options."
    );
  } else {
    console.log(
      `[LBAB ELDAR Server] Slick-Pay initialized in [${config.slickpay.mode.toUpperCase()}] mode (${config.slickpay.apiBaseUrl}).`
    );
  }
}

// server/middleware/cors.ts
var corsMiddleware = (0, import_cors.default)({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      config.appUrl
    ].filter(Boolean);
    const isCloudRun = /\.run\.app$/.test(origin);
    const isAllowed = allowedOrigins.includes(origin) || isCloudRun;
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "signature"],
  credentials: true
});
function securityHeadersMiddleware(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
}

// server/middleware/errorHandler.ts
function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...process.env.NODE_ENV !== "production" && { stack: err.stack }
    }
  });
}

// server/routes/health.ts
var import_express = require("express");
var router = (0, import_express.Router)();
router.get("/", (_req, res) => {
  res.json({
    status: "ok"
  });
});
var health_default = router;

// server/routes/payments.ts
var import_express2 = require("express");

// server/services/slickpay.ts
var import_crypto = __toESM(require("crypto"), 1);
var simulatedInvoices = /* @__PURE__ */ new Map();
var SlickPayService = class {
  /**
   * Returns gateway status without exposing private keys.
   */
  getStatus() {
    return {
      isConfigured: config.slickpay.isConfigured,
      mode: config.slickpay.mode,
      apiBaseUrl: config.slickpay.apiBaseUrl
    };
  }
  /**
   * 1. CREATE INVOICE
   * Sends POST request to official Slick-Pay V2:
   * Sandbox: https://devapi.slick-pay.com/api/v2/users/invoices
   * Production: https://prodapi.slick-pay.com/api/v2/users/invoices
   */
  async createInvoice(params) {
    if (!params.amount || params.amount <= 0) {
      throw new Error("Slick-Pay invoice amount must be a positive number in DZD.");
    }
    const webhookUrl = `${config.appUrl}/api/payments/slickpay/webhook`;
    const payload = {
      amount: params.amount,
      url: params.returnUrl,
      firstname: params.customer.firstname || "\u0627\u0644\u0639\u0645\u064A\u0644",
      lastname: params.customer.lastname || "\u0627\u0644\u0645\u0634\u062A\u0631\u0643",
      phone: params.customer.phone || "0550000000",
      email: params.customer.email || "customer@lbabeldar.dz",
      address: params.customer.address || "Alger, Alg\xE9rie",
      webhook_url: webhookUrl,
      note: params.note || `\u0627\u0634\u062A\u0631\u0627\u0643 \u0645\u0646\u0635\u0629 \u0644\u0628\u0627\u0628 \u0627\u0644\u062F\u0627\u0631 - ${params.planName} (\u0637\u0644\u0628: ${params.orderId})`,
      items: [
        {
          name: params.planName,
          price: params.amount,
          quantity: 1
        }
      ],
      webhook_meta_data: {
        orderId: params.orderId,
        userId: params.userId,
        planId: params.planId
      }
    };
    if (config.slickpay.accountId) {
      payload.account = config.slickpay.accountId;
    }
    if (config.slickpay.webhookSecret) {
      payload.webhook_signature = config.slickpay.webhookSecret;
    }
    if (config.slickpay.isConfigured) {
      const endpoint = `${config.slickpay.apiBaseUrl}/users/invoices`;
      console.log(`[Slick-Pay] Calling real API: POST ${endpoint} for order ${params.orderId}`);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.slickpay.apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const resData = await response.json().catch(() => ({}));
        if (!response.ok) {
          console.error("[Slick-Pay] Error response from API:", response.status, resData);
          throw new Error(
            resData?.message || `Slick-Pay API error: HTTP ${response.status}`
          );
        }
        const invoiceId = resData.id || resData.invoice_id || resData.data?.id;
        const paymentUrl = resData.url || resData.data?.url;
        if (!paymentUrl) {
          throw new Error("Slick-Pay API did not return a valid SATIM payment URL.");
        }
        return {
          invoiceId: invoiceId || `inv_${Date.now()}`,
          paymentUrl,
          status: "pending",
          amount: params.amount,
          isSimulated: false,
          rawResponse: resData
        };
      } catch (err) {
        console.error("[Slick-Pay] Failed to call Slick-Pay API:", err);
        throw err;
      }
    }
    const simulatedInvoiceId = `SP_INV_${Date.now()}_${Math.floor(Math.random() * 1e4)}`;
    const satimMockUrl = `${config.appUrl}/payment/satim-mock?orderId=${encodeURIComponent(
      params.orderId
    )}&invoiceId=${encodeURIComponent(simulatedInvoiceId)}&amount=${params.amount}&planName=${encodeURIComponent(
      params.planName
    )}`;
    simulatedInvoices.set(simulatedInvoiceId, {
      status: "pending",
      amount: params.amount
    });
    console.log(
      `[Slick-Pay] Sandbox invoice created: ${simulatedInvoiceId} for order ${params.orderId} (Amount: ${params.amount} DZD)`
    );
    return {
      invoiceId: simulatedInvoiceId,
      paymentUrl: satimMockUrl,
      status: "pending",
      amount: params.amount,
      isSimulated: true
    };
  }
  /**
   * 2. GET INVOICE
   * Fetches invoice document from Slick-Pay API:
   * GET https://devapi.slick-pay.com/api/v2/users/invoices/:id
   */
  async getInvoice(invoiceId) {
    const invIdStr = String(invoiceId);
    if (config.slickpay.isConfigured) {
      const endpoint = `${config.slickpay.apiBaseUrl}/users/invoices/${invoiceId}`;
      console.log(`[Slick-Pay] Querying invoice: GET ${endpoint}`);
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.slickpay.apiKey}`,
          Accept: "application/json"
        }
      });
      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          resData?.message || `Slick-Pay getInvoice error: HTTP ${response.status}`
        );
      }
      return resData.data || resData;
    }
    const simulated = simulatedInvoices.get(invIdStr);
    const isPaid = simulated?.status === "paid";
    return {
      id: invoiceId,
      amount: simulated?.amount || 999,
      status: isPaid ? "completed" : simulated?.status || "pending",
      payment_status: isPaid ? "paid" : "unpaid",
      details: {
        completed: isPaid ? 1 : 0,
        reference: simulated?.transactionReference || `SATIM_REF_${invIdStr}`
      }
    };
  }
  /**
   * 3. VERIFY PAYMENT
   * Server-side authoritative verification with Slick-Pay.
   * Maps Slick-Pay invoice response to internal PaymentStatus.
   */
  async verifyPayment(invoiceId, orderId) {
    const invoice = await this.getInvoice(invoiceId);
    const paymentStatusRaw = String(invoice.payment_status || "").toLowerCase();
    const statusRaw = String(invoice.status || "").toLowerCase();
    const isCompletedFlag = invoice.details?.completed === 1 || invoice.details?.completed === true || invoice.completed === 1 || invoice.completed === true;
    const isPaid = paymentStatusRaw === "paid" || statusRaw === "completed" || statusRaw === "paid" || isCompletedFlag;
    let mappedStatus = "pending";
    if (isPaid) {
      mappedStatus = "paid";
    } else if (paymentStatusRaw === "failed" || statusRaw === "failed" || statusRaw === "cancelled" || statusRaw === "canceled") {
      mappedStatus = statusRaw === "cancelled" || statusRaw === "canceled" ? "cancelled" : "failed";
    } else if (statusRaw === "processing") {
      mappedStatus = "processing";
    }
    const transactionReference = invoice.details?.reference || invoice.details?.transaction_id || `SATIM_${invoiceId}`;
    return {
      isPaid,
      status: mappedStatus,
      invoiceId,
      orderId,
      transactionReference,
      amount: Number(invoice.amount),
      rawInvoice: invoice
    };
  }
  /**
   * 4. HANDLE WEBHOOK
   * Validates webhook signature and parses payload.
   */
  async handleWebhook(payload, signatureHeader, rawBody) {
    if (config.slickpay.webhookSecret) {
      const receivedSig = signatureHeader || payload?.webhook_signature || payload?.signature || "";
      let isValidSig = false;
      if (receivedSig === config.slickpay.webhookSecret) {
        isValidSig = true;
      } else if (rawBody) {
        try {
          const computed = import_crypto.default.createHmac("sha256", config.slickpay.webhookSecret).update(rawBody).digest("hex");
          isValidSig = import_crypto.default.timingSafeEqual(
            Buffer.from(computed, "utf8"),
            Buffer.from(receivedSig, "utf8")
          );
        } catch {
          isValidSig = false;
        }
      }
      if (!isValidSig) {
        return {
          isValid: false,
          isPaid: false,
          status: "failed",
          error: "Invalid webhook signature",
          rawPayload: payload
        };
      }
    }
    const invoiceId = payload.invoice_id || payload.id || payload.data?.id || payload.data?.invoice_id;
    const orderId = payload.orderId || payload.order_id || payload.webhook_meta_data?.orderId || payload.data?.webhook_meta_data?.orderId;
    if (!invoiceId && !orderId) {
      return {
        isValid: false,
        isPaid: false,
        status: "pending",
        error: "Missing invoiceId or orderId in webhook payload",
        rawPayload: payload
      };
    }
    let isPaid = false;
    let status = "pending";
    let transactionRef;
    if (invoiceId) {
      try {
        const verifyRes = await this.verifyPayment(invoiceId, orderId);
        isPaid = verifyRes.isPaid;
        status = verifyRes.status;
        transactionRef = verifyRes.transactionReference;
        const pStatus = String(
          payload.payment_status || payload.status || payload.event || payload.type || ""
        ).toLowerCase();
        if (!isPaid && (pStatus === "paid" || pStatus === "completed" || pStatus === "invoice.paid")) {
          isPaid = true;
          status = "paid";
          this.setSimulatedInvoiceStatus(String(invoiceId), "paid", transactionRef);
        }
      } catch (err) {
        console.warn("[Slick-Pay Webhook] Fallback to payload status evaluation:", err.message);
        const pStatus = String(
          payload.payment_status || payload.status || payload.event || payload.type || ""
        ).toLowerCase();
        isPaid = pStatus === "paid" || pStatus === "completed" || pStatus === "invoice.paid";
        status = isPaid ? "paid" : "failed";
      }
    }
    return {
      isValid: true,
      orderId,
      invoiceId,
      isPaid,
      status,
      transactionReference: transactionRef,
      rawPayload: payload
    };
  }
  /**
   * SIMULATION HELPER: Update status in sandbox (for testing 21 scenarios).
   */
  setSimulatedInvoiceStatus(invoiceId, status, reference) {
    simulatedInvoices.set(invoiceId, {
      status,
      amount: simulatedInvoices.get(invoiceId)?.amount || 999,
      transactionReference: reference || `SATIM_TEST_${Date.now()}`
    });
  }
};
var slickpayService = new SlickPayService();

// server/db/subscriptionStore.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DEFAULT_PLANS = [
  {
    id: "plan_free",
    tier: "FREE",
    name: "\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 (FREE)",
    description: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u0628\u062F\u0626\u064A\u0629 \u0644\u0627\u0633\u062A\u0643\u0634\u0627\u0641 \u0645\u0646\u0635\u0629 \u0644\u0628\u0627\u0628 \u0627\u0644\u062F\u0627\u0631 \u0648\u0628\u062F\u0621 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A",
    price: 0,
    billingPeriod: "MONTHLY",
    durationDays: 30,
    features: [
      "\u062D\u062A\u0649 20 \u0637\u0644\u0628\u0627\u064B \u0634\u0647\u0631\u064A\u0627\u064B",
      "\u0645\u062A\u062C\u0631 \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0623\u0633\u0627\u0633\u064A \u0645\u0639 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A",
      "\u0625\u0634\u0639\u0627\u0631\u0627\u062A \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0641\u0648\u0631\u064A\u0629",
      "\u062F\u0639\u0645 \u0641\u0646\u064A \u0639\u0628\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"
    ],
    isActive: true,
    orderLimitPerMonth: 20,
    commissionDiscountPercent: 0
  },
  {
    id: "plan_pro",
    tier: "PRO",
    name: "\u0627\u0644\u062E\u0637\u0629 \u0627\u0644\u0627\u062D\u062A\u0631\u0627\u0641\u064A\u0629 (PRO)",
    description: "\u0627\u0644\u062E\u064A\u0627\u0631 \u0627\u0644\u0623\u0643\u062B\u0631 \u0634\u0639\u0628\u064A\u0629 \u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0643\u0628\u0627\u062A\u0646 \u0627\u0644\u0628\u0627\u062D\u062B\u064A\u0646 \u0639\u0646 \u0627\u0644\u0646\u0645\u0648 \u0627\u0644\u0633\u0631\u064A\u0639",
    price: 999,
    billingPeriod: "MONTHLY",
    durationDays: 30,
    features: [
      "\u0637\u0644\u0628\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629 \u0634\u0647\u0631\u064A\u0627\u064B",
      "\u062E\u0635\u0645 25% \u0639\u0644\u0649 \u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u0635\u0629",
      "\u0634\u0627\u0631\u0629 \u0645\u062A\u062C\u0631 \u0645\u0648\u062B\u0651\u0642 \u0648\u0645\u0631\u062E\u0651\u0635 (Verified)",
      "\u0623\u0648\u0644\u0648\u064A\u0629 \u0638\u0647\u0648\u0631 \u0641\u064A \u0646\u062A\u0627\u0626\u062C \u0627\u0644\u0628\u062D\u062B \u0648\u062A\u0648\u0635\u064A\u0627\u062A \u0627\u0644\u0635\u0641\u062D\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629",
      "\u062F\u0639\u0645 \u0641\u0646\u064A \u0645\u062A\u0645\u064A\u0632 \u0648\u0645\u0628\u0627\u0634\u0631 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0633\u0627\u0639\u0629"
    ],
    isActive: true,
    orderLimitPerMonth: "UNLIMITED",
    commissionDiscountPercent: 25,
    badge: "\u0627\u0644\u0623\u0643\u062B\u0631 \u0637\u0644\u0628\u0627\u064B"
  },
  {
    id: "plan_business",
    tier: "BUSINESS",
    name: "\u062E\u0637\u0629 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 (BUSINESS)",
    description: "\u0644\u0644\u0645\u062A\u0627\u062C\u0631 \u0627\u0644\u0643\u0628\u0631\u0649\u060C \u0627\u0644\u0633\u0644\u0627\u0633\u0644 \u0627\u0644\u062A\u062C\u0627\u0631\u064A\u0629 \u0648\u0634\u0631\u0643\u0627\u0621 \u0627\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u062D\u0635\u0631\u064A\u064A\u0646",
    price: 1999,
    billingPeriod: "MONTHLY",
    durationDays: 30,
    features: [
      "\u0643\u0627\u0641\u0629 \u0645\u0645\u064A\u0632\u0627\u062A \u0628\u0627\u0642\u0629 PRO",
      "\u062E\u0635\u0645 50% \u0639\u0644\u0649 \u0639\u0645\u0648\u0644\u0629 \u0627\u0644\u0645\u0646\u0635\u0629 \u0644\u0644\u0645\u0628\u064A\u0639\u0627\u062A \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644",
      "\u0648\u0627\u062C\u0647\u0629 \u0628\u0646\u0631 \u0625\u0639\u0644\u0627\u0646\u064A \u0645\u062E\u0635\u0635 \u0648\u0634\u0647\u0631\u064A \u0644\u0644\u0645\u062A\u062C\u0631 \u0641\u064A \u0623\u0639\u0644\u0649 \u0627\u0644\u062A\u0637\u0628\u064A\u0642",
      "\u062A\u0642\u0627\u0631\u064A\u0631 \u0645\u0627\u0644\u064A\u0629 \u0648\u062A\u0635\u062F\u064A\u0631 \u062A\u062D\u0644\u064A\u0644\u064A \u0645\u062A\u0642\u062F\u0645 \u0644\u0644\u0625\u0643\u0633\u0644",
      "\u0645\u062F\u064A\u0631 \u062D\u0633\u0627\u0628 \u062E\u0627\u0635 \u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u062A\u062C\u0631"
    ],
    isActive: true,
    orderLimitPerMonth: "UNLIMITED",
    commissionDiscountPercent: 50,
    badge: "\u0623\u0642\u0635\u0649 \u062A\u0648\u0641\u064A\u0631"
  }
];
var DB_FILE_PATH = import_path.default.join(process.cwd(), ".server_subscription_db.json");
var SubscriptionStore = class {
  constructor() {
    this.state = this.loadFromDisk();
  }
  loadFromDisk() {
    try {
      if (import_fs.default.existsSync(DB_FILE_PATH)) {
        const raw = import_fs.default.readFileSync(DB_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        return {
          plans: parsed.plans && parsed.plans.length > 0 ? parsed.plans : DEFAULT_PLANS,
          payments: parsed.payments || [],
          subscriptions: parsed.subscriptions || {},
          events: parsed.events || []
        };
      }
    } catch (err) {
      console.error("[SubscriptionStore] Error reading state file, using defaults:", err);
    }
    return {
      plans: DEFAULT_PLANS,
      payments: [],
      subscriptions: {},
      events: []
    };
  }
  saveToDisk() {
    try {
      import_fs.default.writeFileSync(DB_FILE_PATH, JSON.stringify(this.state, null, 2), "utf-8");
    } catch (err) {
      console.error("[SubscriptionStore] Error saving state to disk:", err);
    }
  }
  // --- PLANS ---
  getPlans() {
    return this.state.plans;
  }
  getPlanById(planId) {
    return this.state.plans.find((p) => p.id === planId);
  }
  updatePlan(planId, updates) {
    const idx = this.state.plans.findIndex((p) => p.id === planId);
    if (idx === -1) return null;
    this.state.plans[idx] = {
      ...this.state.plans[idx],
      ...updates
    };
    this.saveToDisk();
    return this.state.plans[idx];
  }
  // --- PAYMENTS ---
  createPaymentRecord(record) {
    const existing = this.state.payments.find((p) => p.orderId === record.orderId);
    if (existing) {
      return existing;
    }
    this.state.payments.unshift(record);
    this.saveToDisk();
    return record;
  }
  getPaymentByOrderId(orderId) {
    return this.state.payments.find((p) => p.orderId === orderId);
  }
  getPaymentByInvoiceId(invoiceId) {
    return this.state.payments.find(
      (p) => String(p.slickpayInvoiceId) === String(invoiceId)
    );
  }
  getPayments() {
    return this.state.payments;
  }
  getPaymentsByUser(userId) {
    return this.state.payments.filter((p) => p.userId === userId);
  }
  updatePaymentStatus(orderId, status, extra = {}) {
    const payment = this.state.payments.find((p) => p.orderId === orderId);
    if (!payment) return null;
    payment.status = status;
    payment.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    Object.assign(payment, extra);
    if (status === "paid" && !payment.paidAt) {
      payment.paidAt = (/* @__PURE__ */ new Date()).toISOString();
    }
    this.saveToDisk();
    return payment;
  }
  // --- USER SUBSCRIPTIONS ---
  getUserSubscription(userId) {
    const sub = this.state.subscriptions[userId];
    if (!sub) return null;
    const now = /* @__PURE__ */ new Date();
    const expiry = new Date(sub.endDate);
    if (sub.status === "active" && now > expiry && sub.planTier !== "FREE") {
      sub.status = "expired";
      this.saveToDisk();
    }
    return sub;
  }
  getAllSubscriptions() {
    return Object.values(this.state.subscriptions);
  }
  /**
   * Idempotently activate or renew a subscription upon confirmed payment.
   */
  activateSubscription(params) {
    const { userId, userEmail, userName, plan, paymentRecord } = params;
    const existing = this.state.subscriptions[userId];
    const now = /* @__PURE__ */ new Date();
    let startDate = now.toISOString();
    let endDate = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1e3).toISOString();
    if (existing && existing.status === "active" && existing.planTier === plan.tier) {
      const currentExpiry = new Date(existing.endDate);
      if (currentExpiry > now) {
        startDate = existing.startDate;
        endDate = new Date(currentExpiry.getTime() + plan.durationDays * 24 * 60 * 60 * 1e3).toISOString();
      }
    }
    const actionType = existing ? existing.planTier !== plan.tier ? "UPGRADED" : "RENEWED" : "CREATED";
    const historyEntry = {
      action: actionType,
      timestamp: now.toISOString(),
      note: `\u062A\u0641\u0639\u064A\u0644 \u0628\u0627\u0642\u0629 [${plan.name}] \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0628\u0648\u0627\u0628\u0629 Slick-Pay SATIM \u0628\u0642\u064A\u0645\u0629 ${plan.price} \u062F\u062C`,
      paymentId: paymentRecord?.id
    };
    const updatedSub = {
      id: existing?.id || `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      userEmail: userEmail || existing?.userEmail,
      userName: userName || existing?.userName,
      planId: plan.id,
      planTier: plan.tier,
      planName: plan.name,
      status: "active",
      startDate,
      endDate,
      price: plan.price,
      paymentMethod: plan.price === 0 ? "FREE" : "SLICK_PAY_SATIM",
      lastPaymentId: paymentRecord?.id,
      lastInvoiceId: paymentRecord?.slickpayInvoiceId,
      transactionReference: paymentRecord?.transactionReference,
      createdAt: existing?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      history: existing ? [...existing.history, historyEntry] : [historyEntry]
    };
    this.state.subscriptions[userId] = updatedSub;
    this.saveToDisk();
    return updatedSub;
  }
  // --- AUDIT EVENTS ---
  logPaymentEvent(event) {
    const entry = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.state.events.unshift(entry);
    if (this.state.events.length > 500) {
      this.state.events = this.state.events.slice(0, 500);
    }
    this.saveToDisk();
    return entry;
  }
  getEvents(limit = 100) {
    return this.state.events.slice(0, limit);
  }
};
var subscriptionStore = new SubscriptionStore();

// server/routes/payments.ts
var router2 = (0, import_express2.Router)();
router2.get("/status", (_req, res) => {
  const status = slickpayService.getStatus();
  res.json({
    success: true,
    data: {
      gateway: "slick_pay_v2",
      isConfigured: status.isConfigured,
      mode: status.mode,
      apiBaseUrl: status.apiBaseUrl,
      currency: "DZD",
      supportedMethods: ["EDAHABIA", "CIB", "SATIM"]
    }
  });
});
router2.post(["/slickpay/create", "/slickpay/create-invoice"], async (req, res) => {
  try {
    const {
      userId,
      userEmail,
      userName,
      userRole,
      planId,
      customerPhone,
      customerAddress,
      returnUrl
    } = req.body;
    if (!userId || !planId) {
      return res.status(400).json({
        success: false,
        error: { message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 (userId) \u0648\u0645\u0639\u0631\u0641 \u0627\u0644\u062E\u0637\u0629 (planId) \u0645\u0637\u0644\u0648\u0628\u0627\u0646." }
      });
    }
    const plan = subscriptionStore.getPlanById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: { message: "\u062E\u0637\u0629 \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0646\u0634\u0637\u0629 \u062D\u0627\u0644\u064A\u0627\u064B." }
      });
    }
    const amount = plan.price;
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        error: { message: "\u0627\u0644\u062E\u0637\u0637 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u064A\u062A\u0645 \u062A\u0641\u0639\u064A\u0644\u0647\u0627 \u0645\u0628\u0627\u0634\u0631\u0629 \u0639\u0628\u0631 \u0645\u0633\u0627\u0631 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629." }
      });
    }
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const paymentRecord = {
      id: `pay_${orderId}`,
      orderId,
      userId,
      userEmail: userEmail || "user@lbabeldar.dz",
      userName: userName || "\u0645\u0634\u062A\u0631\u0643 \u0644\u0628\u0627\u0628 \u0627\u0644\u062F\u0627\u0631",
      userRole: userRole || "MERCHANT",
      planId: plan.id,
      planTier: plan.tier,
      planName: plan.name,
      amount,
      currency: "DZD",
      paymentMethod: "SLICK_PAY_SATIM",
      status: "pending",
      createdAt: now,
      updatedAt: now,
      metadata: {
        billingPeriod: plan.billingPeriod,
        durationDays: plan.durationDays
      }
    };
    subscriptionStore.createPaymentRecord(paymentRecord);
    subscriptionStore.logPaymentEvent({
      orderId,
      eventType: "INVOICE_INITIALIZED",
      status: "pending",
      details: {
        userId,
        planId: plan.id,
        amount
      }
    });
    const effectiveReturnUrl = returnUrl || `${req.protocol}://${req.get("host")}/payment/verify?orderId=${encodeURIComponent(orderId)}`;
    const [firstname = "\u0627\u0644\u0645\u0634\u062A\u0631\u0643", ...restName] = (userName || "\u0627\u0644\u0645\u0634\u062A\u0631\u0643").split(" ");
    const lastname = restName.join(" ") || "\u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A";
    const slickInvoice = await slickpayService.createInvoice({
      orderId,
      userId,
      planId: plan.id,
      planName: plan.name,
      amount,
      customer: {
        firstname,
        lastname,
        phone: customerPhone || "0550000000",
        email: userEmail || "customer@lbabeldar.dz",
        address: customerAddress || "\u0627\u0644\u062C\u0632\u0627\u0626\u0631 \u0627\u0644\u0639\u0627\u0635\u0645\u0629"
      },
      returnUrl: effectiveReturnUrl
    });
    subscriptionStore.updatePaymentStatus(orderId, "pending", {
      slickpayInvoiceId: slickInvoice.invoiceId,
      slickpayPaymentUrl: slickInvoice.paymentUrl
    });
    subscriptionStore.logPaymentEvent({
      orderId,
      invoiceId: slickInvoice.invoiceId,
      eventType: "INVOICE_CREATED_SLICKPAY",
      status: "pending",
      details: {
        invoiceId: slickInvoice.invoiceId,
        paymentUrl: slickInvoice.paymentUrl,
        isSimulated: slickInvoice.isSimulated
      }
    });
    return res.status(200).json({
      success: true,
      message: "\u062A\u0645 \u0625\u0646\u0634\u0627\u0621 \u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u062F\u0641\u0639 Slick-Pay \u0628\u0646\u062C\u0627\u062D.",
      data: {
        orderId,
        invoiceId: slickInvoice.invoiceId,
        paymentUrl: slickInvoice.paymentUrl,
        amount,
        currency: "DZD",
        planName: plan.name,
        isSimulated: slickInvoice.isSimulated
      }
    });
  } catch (err) {
    console.error("[Payments API] Error creating Slick-Pay invoice:", err);
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0628\u0648\u0627\u0628\u0629 Slick-Pay."
      }
    });
  }
});
router2.get(["/slickpay/verify", "/slickpay/verify/:orderId", "/slickpay/verify/:paymentId"], async (req, res) => {
  try {
    const orderId = req.params.paymentId || req.params.orderId || req.query.orderId || req.query.paymentId;
    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: { message: "\u0631\u0642\u0645 \u0627\u0644\u0637\u0644\u0628 (orderId) \u0645\u0637\u0644\u0648\u0628." }
      });
    }
    const payment = subscriptionStore.getPaymentByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: { message: "\u0633\u062C\u0644 \u0627\u0644\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." }
      });
    }
    if (payment.status === "paid") {
      let existingSub = subscriptionStore.getUserSubscription(payment.userId);
      if (!existingSub) {
        const plan = subscriptionStore.getPlanById(payment.planId);
        if (plan) {
          existingSub = subscriptionStore.activateSubscription({
            userId: payment.userId,
            userEmail: payment.userEmail,
            userName: payment.userName,
            plan,
            paymentRecord: payment
          });
        }
      }
      return res.status(200).json({
        success: true,
        data: {
          orderId: payment.orderId,
          status: "paid",
          isPaid: true,
          planName: payment.planName,
          planTier: payment.planTier,
          amount: payment.amount,
          transactionReference: payment.transactionReference,
          subscription: existingSub,
          alreadyProcessed: true
        }
      });
    }
    if (!payment.slickpayInvoiceId) {
      return res.status(400).json({
        success: false,
        error: { message: "\u0631\u0642\u0645 \u0641\u0627\u062A\u0648\u0631\u0629 Slick-Pay \u063A\u064A\u0631 \u0645\u0631\u062A\u0628\u0637 \u0628\u0647\u0630\u0627 \u0627\u0644\u0637\u0644\u0628." }
      });
    }
    const verification = await slickpayService.verifyPayment(
      payment.slickpayInvoiceId,
      payment.orderId
    );
    const updatedPayment = subscriptionStore.updatePaymentStatus(
      orderId,
      verification.status,
      {
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        verificationSource: "return_url",
        transactionReference: verification.transactionReference
      }
    );
    subscriptionStore.logPaymentEvent({
      orderId,
      invoiceId: payment.slickpayInvoiceId,
      eventType: "PAYMENT_VERIFIED_RETURN_URL",
      status: verification.status,
      details: {
        isPaid: verification.isPaid,
        transactionReference: verification.transactionReference
      }
    });
    let activatedSub = null;
    if (verification.isPaid && updatedPayment) {
      const plan = subscriptionStore.getPlanById(updatedPayment.planId);
      if (plan) {
        activatedSub = subscriptionStore.activateSubscription({
          userId: updatedPayment.userId,
          userEmail: updatedPayment.userEmail,
          userName: updatedPayment.userName,
          plan,
          paymentRecord: updatedPayment
        });
        subscriptionStore.logPaymentEvent({
          orderId,
          invoiceId: payment.slickpayInvoiceId,
          eventType: "SUBSCRIPTION_ACTIVATED",
          status: "paid",
          details: {
            userId: updatedPayment.userId,
            subscriptionId: activatedSub.id,
            planTier: plan.tier,
            endDate: activatedSub.endDate
          }
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
        alreadyProcessed: false
      }
    });
  } catch (err) {
    console.error("[Payments API] Error verifying payment with Slick-Pay:", err);
    return res.status(500).json({
      success: false,
      error: {
        message: err.message || "\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062D\u0627\u0644\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0645\u0639 Slick-Pay."
      }
    });
  }
});
router2.post("/slickpay/webhook", async (req, res) => {
  try {
    const signature = req.headers["signature"] || req.headers["x-slickpay-signature"];
    const rawBody = JSON.stringify(req.body);
    console.log("[Slick-Pay Webhook] Received webhook notification from Slick-Pay");
    const webhookResult = await slickpayService.handleWebhook(req.body, signature, rawBody);
    if (!webhookResult.isValid) {
      console.warn("[Slick-Pay Webhook] Invalid webhook rejected:", webhookResult.error);
      return res.status(401).json({
        success: false,
        error: webhookResult.error || "Invalid signature or payload"
      });
    }
    let payment;
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
      return res.status(200).json({
        success: true,
        message: "Webhook received but order not found in LBAB ELDAR."
      });
    }
    if (payment.status === "paid") {
      console.log(
        `[Slick-Pay Webhook] Order ${payment.orderId} is already PAID. Skipping duplicate activation.`
      );
      return res.status(200).json({
        success: true,
        message: "Payment already processed and subscription active.",
        orderId: payment.orderId,
        alreadyProcessed: true
      });
    }
    const updatedPayment = subscriptionStore.updatePaymentStatus(
      payment.orderId,
      webhookResult.status,
      {
        verifiedAt: (/* @__PURE__ */ new Date()).toISOString(),
        verificationSource: "webhook",
        transactionReference: webhookResult.transactionReference
      }
    );
    subscriptionStore.logPaymentEvent({
      orderId: payment.orderId,
      invoiceId: webhookResult.invoiceId,
      eventType: "WEBHOOK_RECEIVED",
      status: webhookResult.status,
      details: {
        isPaid: webhookResult.isPaid,
        transactionReference: webhookResult.transactionReference
      }
    });
    if (webhookResult.isPaid && updatedPayment) {
      const plan = subscriptionStore.getPlanById(updatedPayment.planId);
      if (plan) {
        const sub = subscriptionStore.activateSubscription({
          userId: updatedPayment.userId,
          userEmail: updatedPayment.userEmail,
          userName: updatedPayment.userName,
          plan,
          paymentRecord: updatedPayment
        });
        subscriptionStore.logPaymentEvent({
          orderId: payment.orderId,
          invoiceId: webhookResult.invoiceId,
          eventType: "SUBSCRIPTION_ACTIVATED_WEBHOOK",
          status: "paid",
          details: {
            subscriptionId: sub.id,
            planTier: plan.tier
          }
        });
      }
    }
    return res.status(200).json({
      success: true,
      received: true,
      status: webhookResult.status,
      orderId: payment.orderId
    });
  } catch (err) {
    console.error("[Slick-Pay Webhook] Error processing webhook:", err);
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error processing webhook"
    });
  }
});
router2.post("/slickpay/simulate-satim-action", (req, res) => {
  const { invoiceId, orderId, action } = req.body;
  let targetInvoiceId = invoiceId;
  if (!targetInvoiceId && orderId) {
    const p = subscriptionStore.getPaymentByOrderId(orderId);
    targetInvoiceId = p?.slickpayInvoiceId;
  }
  if (!targetInvoiceId && !orderId) {
    return res.status(400).json({ success: false, error: "invoiceId or orderId is required" });
  }
  const statusMap = {
    pay: "paid",
    fail: "failed",
    cancel: "cancelled"
  };
  const newStatus = statusMap[action] || "paid";
  const txRef = `SATIM_TEST_${Date.now()}`;
  if (targetInvoiceId) {
    slickpayService.setSimulatedInvoiceStatus(targetInvoiceId, newStatus, txRef);
  }
  if (orderId) {
    subscriptionStore.updatePaymentStatus(orderId, newStatus, {
      transactionReference: txRef
    });
  }
  return res.json({
    success: true,
    message: `Simulated SATIM payment status set to ${newStatus}`,
    invoiceId: targetInvoiceId,
    status: newStatus,
    transactionReference: txRef
  });
});
var payments_default = router2;

// server/routes/subscriptions.ts
var import_express3 = require("express");
var router3 = (0, import_express3.Router)();
router3.get("/plans", (_req, res) => {
  const plans = subscriptionStore.getPlans();
  res.json({
    success: true,
    data: plans
  });
});
router3.get(["/my-subscription", "/my/:userId"], (req, res) => {
  const userId = req.params.userId || req.query.userId;
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 (userId) \u0645\u0637\u0644\u0648\u0628." }
    });
  }
  let sub = subscriptionStore.getUserSubscription(userId);
  if (!sub) {
    const freePlan = subscriptionStore.getPlans().find((p) => p.tier === "FREE");
    if (freePlan) {
      sub = subscriptionStore.activateSubscription({
        userId,
        plan: freePlan
      });
    }
  }
  return res.json({
    success: true,
    data: sub
  });
});
router3.post("/subscribe-free", (req, res) => {
  const { userId, userEmail, userName } = req.body;
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628." }
    });
  }
  const freePlan = subscriptionStore.getPlans().find((p) => p.tier === "FREE");
  if (!freePlan) {
    return res.status(404).json({
      success: false,
      error: { message: "\u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631\u0629." }
    });
  }
  const sub = subscriptionStore.activateSubscription({
    userId,
    userEmail,
    userName,
    plan: freePlan
  });
  return res.json({
    success: true,
    message: "\u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0628\u0627\u0642\u0629 \u0627\u0644\u0645\u062C\u0627\u0646\u064A\u0629 \u0628\u0646\u062C\u0627\u062D.",
    data: sub
  });
});
router3.get("/user-history", (req, res) => {
  const userId = req.query.userId;
  if (!userId) {
    return res.status(400).json({
      success: false,
      error: { message: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0637\u0644\u0648\u0628." }
    });
  }
  const payments = subscriptionStore.getPaymentsByUser(userId);
  const sub = subscriptionStore.getUserSubscription(userId);
  return res.json({
    success: true,
    data: {
      payments,
      subscription: sub
    }
  });
});
var subscriptions_default = router3;

// server/routes/admin.ts
var import_express4 = require("express");
var router4 = (0, import_express4.Router)();
router4.get("/subscriptions", (_req, res) => {
  const subscriptions = subscriptionStore.getAllSubscriptions();
  res.json({
    success: true,
    data: subscriptions
  });
});
router4.get("/payments", (_req, res) => {
  const payments = subscriptionStore.getPayments();
  const events = subscriptionStore.getEvents();
  res.json({
    success: true,
    data: {
      payments,
      events
    }
  });
});
router4.get("/plans", (_req, res) => {
  const plans = subscriptionStore.getPlans();
  res.json({
    success: true,
    data: plans
  });
});
router4.put("/plans/:id", (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const updatedPlan = subscriptionStore.updatePlan(id, updates);
  if (!updatedPlan) {
    return res.status(404).json({
      success: false,
      error: { message: "\u0627\u0644\u062E\u0637\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." }
    });
  }
  return res.json({
    success: true,
    message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062E\u0637\u0629 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.",
    data: updatedPlan
  });
});
var admin_default = router4;

// server/app.ts
function createApp() {
  const app = (0, import_express5.default)();
  app.use(corsMiddleware);
  app.use(securityHeadersMiddleware);
  app.use(import_express5.default.json());
  app.use(import_express5.default.urlencoded({ extended: true }));
  app.use("/api/health", health_default);
  app.use("/api/payments", payments_default);
  app.use("/api/subscriptions", subscriptions_default);
  app.use("/api/admin", admin_default);
  app.use(errorHandler);
  return app;
}

// server.ts
async function startServer() {
  const app = createApp();
  const PORT = config.port;
  validateServerConfig();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path2.default.join(process.cwd(), "dist");
    app.use(import_express6.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path2.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[LBAB ELDAR] Full-Stack server running on http://0.0.0.0:${PORT}`);
    console.log(`[LBAB ELDAR] API Health: http://localhost:${PORT}/api/health`);
    console.log(`[LBAB ELDAR] Payment Status: http://localhost:${PORT}/api/payments/status`);
  });
}
startServer().catch((err) => {
  console.error("[LBAB ELDAR] Failed to start server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
