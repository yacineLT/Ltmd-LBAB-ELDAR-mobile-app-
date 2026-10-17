export type UserRole = 'CUSTOMER' | 'MERCHANT' | 'COURIER' | 'ADMIN';

export type OrderStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COURIER_ASSIGNED'
  | 'PICKED_UP'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface DeliveryLocation {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  isVerified?: boolean;
  deliveryLocation?: DeliveryLocation;
  createdAt: string;
  updatedAt: string;
  storeId?: string; // If Merchant
  courierId?: string; // If Courier
}

export interface Store {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  coverUrl: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minimumOrder: number;
  isOpen: boolean;
  isVerified: boolean;
  isFeatured?: boolean;
  isPopular?: boolean;
  openingHours: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  stockQuantity: number;
  calories?: number;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  notes?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  actorId: string;
  actorRole: UserRole;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber?: string; // Human-readable reference e.g. LB-20260907-0001
  customerId: string;
  customerName: string;
  customerPhone: string;
  storeId: string;
  storeName: string;
  storePhone: string;
  storeAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  courierLatitude?: number;
  courierLongitude?: number;
  routeDistance?: number;
  routeDistanceFormatted?: string;
  estimatedDuration?: number;
  estimatedDurationFormatted?: string;
  deliveryOtp?: string; // 4-digit code for delivery confirmation
  deliveryCompletedAt?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  discount: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  deliveryAddress: {
    wilaya: string;
    commune: string;
    street: string;
    building?: string;
    instructions?: string;
    latitude?: number;
    longitude?: number;
    formattedAddress?: string;
  };
  customerLatitude?: number;
  customerLongitude?: number;
  paymentMethod: 'CASH_ON_DELIVERY' | 'CIB_EDAHABIA';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Delivery {
  id?: string;
  deliveryId: string;
  orderId: string;
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  storeId: string;
  storeName: string;
  storeAddress?: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  deliveryAddress: string;
  customerLatitude: number;
  customerLongitude: number;
  courierLatitude?: number;
  courierLongitude?: number;
  status: OrderStatus;
  routeDistance?: number;
  routeDistanceFormatted?: string;
  estimatedDuration?: number;
  estimatedDurationFormatted?: string;
  deliveryOtp: string;
  assignedAt?: string;
  pickedUpAt?: string;
  startedAt?: string;
  arrivedAt?: string;
  completedAt?: string;
  deliveryCompletedAt?: string;
  updatedAt: string;
}

export interface CourierProfile {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  vehicleType: 'MOTORCYCLE' | 'CAR' | 'BICYCLE' | 'VAN';
  vehiclePlate?: string;
  wilaya: string;
  isOnline: boolean;
  currentOrderId?: string;
  totalDeliveries: number;
  rating: number;
  earningsBalance: number;
  cashCollected?: number;
  isApproved: boolean;
  createdAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  wilayaCode: string;
  deliveryFee: number;
  estimatedMinutes: number;
  isActive: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  discountPercentage: number;
  maxDiscount: number;
  minOrderAmount: number;
  isActive: boolean;
  validUntil: string;
  description: string;
}

export interface PlatformSettings {
  appName: string;
  currency: string;
  defaultCommissionRate: number; // e.g. 10%
  supportPhone: string;
  supportEmail: string;
  autoAssignCouriers: boolean;
  systemAlert?: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  label: string; // e.g. 'المنزل', 'العمل', 'عنوان آخر'
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FavoriteItem {
  id: string;
  customerId: string;
  type: 'STORE' | 'PRODUCT';
  targetId: string;
  createdAt: string;
}

export interface OrderReview {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  storeId: string;
  storeRating: number; // 1-5
  deliveryRating?: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface CustomerNotification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  orderId?: string;
  type: 'ORDER_UPDATE' | 'PROMO' | 'SYSTEM';
  isRead: boolean;
  createdAt: string;
}

// --- PHASE 3: FINANCIAL ARCHITECTURE TYPES ---

export interface PaymentMethodConfig {
  enabled: boolean;
  requireAccountHolderName?: boolean;
  requireRib?: boolean;
  requireAccountNumber?: boolean;
  requireBankName?: boolean;
  requireCcp?: boolean;
  requireVerification?: boolean;
  instructions?: string;
}

export interface PaymentSettings {
  merchantWithdrawals: {
    cib: PaymentMethodConfig;
    edahabia: PaymentMethodConfig;
    branch: {
      enabled: boolean;
      instructions?: string;
    };
  };
  courierWithdrawals: {
    cib: PaymentMethodConfig;
    edahabia: PaymentMethodConfig;
    branch: {
      enabled: boolean;
      instructions?: string;
    };
  };
}

export interface CommissionSettings {
  merchant: {
    type: 'percentage' | 'fixed';
    value: number; // e.g. 10 (%)
  };
  courier: {
    type: 'percentage' | 'fixed';
    value: number; // platform share from delivery fee or flat
  };
  deliveryFeeAllocation: {
    courierSharePercentage: number; // e.g. 80%
    platformSharePercentage: number; // e.g. 20%
  };
  withdrawalLimits: {
    minAmountMerchant: number;
    maxAmountMerchant: number;
    minAmountCourier: number;
    maxAmountCourier: number;
    dailyLimitMerchant: number;
    dailyLimitCourier: number;
    weeklyLimitMerchant: number;
    weeklyLimitCourier: number;
    approvalMode: 'MANUAL' | 'AUTOMATIC';
    processingTimeHours: number;
    instructions?: string;
  };
}

export interface Branch {
  id: string;
  name: string;
  wilaya: string;
  municipality: string;
  address: string;
  phone: string;
  openingHours: string;
  isOpen: boolean;
  isActive: boolean;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
}

export type FinancialVerificationStatus =
  | 'UNVERIFIED'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'REJECTED';

export interface UserPaymentProfile {
  id: string;
  userId: string;
  userName: string;
  userRole: 'MERCHANT' | 'COURIER';
  storeId?: string;
  activeMethod: 'CIB' | 'EDAHABIA' | 'BRANCH';
  cib?: {
    accountHolderName: string;
    rib: string;
    accountNumber?: string;
    bankName: string;
  };
  edahabia?: {
    accountHolderName: string;
    ccpNumber: string;
    ripKey?: string;
  };
  branch?: {
    wilaya: string;
    branchId: string;
    branchName: string;
    branchAddress: string;
  };
  verificationStatus: FinancialVerificationStatus;
  rejectionReason?: string;
  lastUpdated: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type WithdrawalStatus =
  | 'PENDING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';

export type WithdrawalMethod = 'CIB' | 'EDAHABIA' | 'BRANCH';

export interface WithdrawalRequest {
  id: string;
  requestId: string;
  userId: string;
  userName: string;
  userRole: 'MERCHANT' | 'COURIER';
  storeId?: string;
  storeName?: string;
  amount: number;
  withdrawalMethod: WithdrawalMethod;
  paymentInformationSnapshot: {
    method: WithdrawalMethod;
    details: Record<string, any>;
    branchDetails?: {
      branchId: string;
      branchName: string;
      branchAddress: string;
      wilaya: string;
    };
  };
  branchId?: string;
  status: WithdrawalStatus;
  createdAt: string;
  reviewedAt?: string;
  processedAt?: string;
  completedAt?: string;
  adminId?: string;
  adminName?: string;
  rejectionReason?: string;
  notes?: string;
  statusHistory?: {
    status: WithdrawalStatus;
    timestamp: string;
    adminId?: string;
    note?: string;
  }[];
}

export type TransactionType =
  | 'ORDER_EARNING'
  | 'COMMISSION'
  | 'DELIVERY_EARNING'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'ADJUSTMENT';

export interface FinancialTransaction {
  id: string;
  transactionId: string;
  userId: string;
  userRole: UserRole;
  type: TransactionType;
  amount: number; // positive for credit, negative for debit
  referenceId: string;
  orderId?: string;
  withdrawalId?: string;
  status: 'COMPLETED' | 'PENDING' | 'CANCELLED';
  createdAt: string;
  description: string;
}

export interface FinancialAuditLog {
  id: string;
  actorId: string;
  actorRole: UserRole;
  actorName?: string;
  action: string;
  targetId: string;
  timestamp: string;
  previousValue?: any;
  newValue?: any;
  details?: string;
}

// ==========================================
// Subscriptions & Slick-Pay Payments
// ==========================================

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
  id: string;
  orderId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  planId: string;
  planTier: SubscriptionTier;
  planName: string;
  amount: number; // DZD
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


