import dotenv from 'dotenv';

// Load environment variables from .env file if present
dotenv.config();

/**
 * Server-side configuration module for LBAB ELDAR.
 *
 * CRITICAL SECURITY RULE:
 * This file and all files inside /server MUST ONLY execute in a Node.js runtime.
 * Never import this configuration or any server-side files into React/Vite client code.
 * The CHARGILY_API_KEY and CHARGILY_WEBHOOK_SECRET must NEVER reach the browser.
 */

export interface ServerConfig {
  port: number;
  nodeEnv: string;
  appUrl: string;
  slickpay: {
    apiKey: string;
    mode: 'sandbox' | 'live';
    webhookSecret: string;
    accountId?: string;
    apiBaseUrl: string;
    isConfigured: boolean;
  };
}

const nodeEnv = process.env.NODE_ENV || 'development';
const port = parseInt(process.env.PORT || '3000', 10);
const appUrl = process.env.APP_URL || `http://localhost:${port}`;

// Slick-Pay credentials
const slickpayApiKey = process.env.SLICKPAY_API_KEY || '';
const rawMode = (process.env.SLICKPAY_MODE || 'sandbox').toLowerCase();
const slickpayMode: 'sandbox' | 'live' = rawMode === 'live' ? 'live' : 'sandbox';
const slickpayWebhookSecret = process.env.SLICKPAY_WEBHOOK_SECRET || '';
const slickpayAccountId = process.env.SLICKPAY_ACCOUNT_ID || '';

// Official Slick-Pay V2 endpoints
const SLICKPAY_LIVE_URL = 'https://prodapi.slick-pay.com/api/v2';
const SLICKPAY_DEV_URL = 'https://devapi.slick-pay.com/api/v2';

export const config: ServerConfig = {
  port,
  nodeEnv,
  appUrl,
  slickpay: {
    apiKey: slickpayApiKey,
    mode: slickpayMode,
    webhookSecret: slickpayWebhookSecret,
    accountId: slickpayAccountId || undefined,
    apiBaseUrl: slickpayMode === 'live' ? SLICKPAY_LIVE_URL : SLICKPAY_DEV_URL,
    isConfigured: Boolean(slickpayApiKey && slickpayApiKey.trim().length > 0),
  },
};

/**
 * Validates that Slick-Pay configuration is present and logs helpful guidance.
 */
export function validateServerConfig(): void {
  if (!config.slickpay.isConfigured) {
    console.warn(
      '[LBAB ELDAR Server] Notice: SLICKPAY_API_KEY is not set. Payments will operate in simulated Sandbox mode with instant verification test options.'
    );
  } else {
    console.log(
      `[LBAB ELDAR Server] Slick-Pay initialized in [${config.slickpay.mode.toUpperCase()}] mode (${config.slickpay.apiBaseUrl}).`
    );
  }
}
