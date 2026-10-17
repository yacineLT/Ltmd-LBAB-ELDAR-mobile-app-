import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/store';
import { Order, CourierProfile, OrderStatus } from '../../types';
import { DeliveryTrackingMap } from '../../components/map/DeliveryTrackingMap';
import { DeliveryOtpModal } from '../../components/delivery/DeliveryOtpModal';
import { CourierFinancialWallet } from '../../components/courier/CourierFinancialWallet';
import { CourierIncomingRequestCard } from '../../components/courier/CourierIncomingRequestCard';
import { CourierBottomSheet } from '../../components/courier/CourierBottomSheet';
import { CourierMapHeader } from '../../components/courier/CourierMapHeader';
import { Modal } from '../../components/common/Modal';
import {
  Radar,
  Sparkles,
  CheckCircle2,
  X,
  Compass,
} from 'lucide-react';

interface CourierDashboardViewProps {
  onNavigate?: (path: string) => void;
}

export const CourierDashboardView: React.FC<CourierDashboardViewProps> = ({
  onNavigate,
}) => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<CourierProfile | undefined>(undefined);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [incomingRequest, setIncomingRequest] = useState<Order | null>(null);
  const [dismissedOrderIds, setDismissedOrderIds] = useState<string[]>([]);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [courierCoords, setCourierCoords] = useState<[number, number]>([36.7525, 3.042]);
  const [heading, setHeading] = useState<number>(0);

  // Authoritative language direction check
  const isRtl =
    typeof document !== 'undefined'
      ? document.documentElement.dir === 'rtl'
      : true;

  // Load and subscribe to database
  const loadData = useCallback(() => {
    let p = currentUser ? dbService.getCourierProfile(currentUser.id) : undefined;
    if (!p && currentUser) {
      p = {
        id: 'courier_' + currentUser.id,
        userId: currentUser.id,
        fullName: currentUser.fullName,
        phone: currentUser.phone,
        vehicleType: 'MOTORCYCLE',
        isOnline: true,
        wilaya: 'الجزائر العاصمة',
        rating: 4.9,
        totalDeliveries: 42,
        earningsBalance: 12600,
        cashCollected: 4500,
        isApproved: true,
        createdAt: new Date().toISOString(),
      };
      dbService.updateCourierProfile(p);
    }
    setProfile(p);

    const allOrders = dbService.getOrders();
    // 1. Check if courier currently has an assigned active delivery
    const myActive = allOrders.find(
      (o) =>
        o.courierId === currentUser?.id &&
        o.status !== 'DELIVERED' &&
        o.status !== 'CANCELLED'
    );
    setActiveOrder(myActive || null);

    // 2. Fetch available pending orders
    const available = allOrders.filter(
      (o) =>
        !o.courierId &&
        (o.status === 'READY_FOR_PICKUP' ||
          o.status === 'ACCEPTED' ||
          o.status === 'PREPARING')
    );
    setAvailableOrders(available);

    // Sync courier coordinate if available
    if (myActive && myActive.courierLatitude && myActive.courierLongitude) {
      setCourierCoords([myActive.courierLatitude, myActive.courierLongitude]);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, [loadData]);

  // Determine incoming request presentation
  useEffect(() => {
    // If courier already has an active delivery or is offline, do not present incoming requests
    if (activeOrder || !profile?.isOnline) {
      setIncomingRequest(null);
      return;
    }

    // Find first available order that hasn't been dismissed by courier in this session
    const nextCandidate = availableOrders.find(
      (o) => !dismissedOrderIds.includes(o.id)
    );

    if (nextCandidate) {
      setIncomingRequest(nextCandidate);
    } else {
      setIncomingRequest(null);
    }
  }, [activeOrder, availableOrders, dismissedOrderIds, profile?.isOnline]);

  // Toggle Online/Offline status
  const handleToggleOnline = () => {
    if (!profile) return;
    const newStatus = !profile.isOnline;
    dbService.updateCourierProfile({
      ...profile,
      isOnline: newStatus,
    });
    if (!newStatus) {
      setIncomingRequest(null);
    }
  };

  // Switch Vehicle Type
  const handleToggleVehicle = () => {
    if (!profile) return;
    const nextVehicle: 'MOTORCYCLE' | 'CAR' =
      profile.vehicleType === 'CAR' ? 'MOTORCYCLE' : 'CAR';
    dbService.updateCourierProfile({
      ...profile,
      vehicleType: nextVehicle,
    });
  };

  // Accept incoming delivery request (Requirement #2 & #3)
  const handleAcceptDelivery = (order: Order) => {
    if (!currentUser || !profile) return;
    // Assign courier in database and advance status to COURIER_ASSIGNED
    dbService.assignCourierToOrder(
      order.id,
      currentUser.id,
      currentUser.fullName,
      currentUser.phone
    );
    dbService.updateOrderStatus(
      order.id,
      'COURIER_ASSIGNED',
      currentUser.id,
      'COURIER',
      `تم قبول مهمة التوصيل بواسطة الكابتن ${currentUser.fullName}`
    );

    // Remove incoming request card and transform to Active Delivery mode
    setIncomingRequest(null);
    setIsBottomSheetOpen(false);
  };

  // Reject / Dismiss incoming delivery request (Requirement #4)
  const handleRejectDelivery = (order: Order) => {
    setDismissedOrderIds((prev) => [...prev, order.id]);
    setIncomingRequest(null);
    setIsBottomSheetOpen(false);
  };

  // Expiration of incoming delivery request (Requirement #3)
  const handleExpireDelivery = (order: Order) => {
    setDismissedOrderIds((prev) => [...prev, order.id]);
    setIncomingRequest(null);
    setIsBottomSheetOpen(false);
  };

  // Advance delivery workflow (Requirement #6: 6-step lifecycle)
  const handleAdvanceStatus = (nextStatus: OrderStatus, note?: string) => {
    if (!currentUser || !activeOrder) return;
    dbService.updateOrderStatus(
      activeOrder.id,
      nextStatus,
      currentUser.id,
      'COURIER',
      note
    );
  };

  // Location update from map
  const handleLocationUpdate = useCallback(
    (
      latitude: number,
      longitude: number,
      metrics?: {
        distanceMeters: number;
        durationSeconds: number;
        distanceFormatted: string;
        durationFormatted: string;
      }
    ) => {
      setCourierCoords([latitude, longitude]);
      if (!activeOrder) return;
      dbService.updateCourierLocation(activeOrder.id, latitude, longitude, {
        routeDistance: metrics?.distanceMeters,
        estimatedDuration: metrics?.durationSeconds,
        routeDistanceFormatted: metrics?.distanceFormatted,
        estimatedDurationFormatted: metrics?.durationFormatted,
      });
    },
    [activeOrder]
  );

  // OTP delivery confirmation callback
  const handleOtpSuccess = (updatedOrder: Order) => {
    setActiveOrder(null);
    setIsOtpModalOpen(false);
    setIsBottomSheetOpen(false);
    // Reload finances
    if (currentUser) {
      dbService.calculateCourierFinances(currentUser.id);
    }
  };

  // Demo tool: simulate receiving a new delivery request
  const handleSimulateNewOrder = () => {
    const demoOrderId = 'demo_' + Date.now();
    const demoOrder: Order = {
      id: demoOrderId,
      customerId: 'user_cust_demo',
      customerName: 'أمين بلقاسم (زبون تجريبي)',
      customerPhone: '0555123456',
      storeId: 'store_demo',
      storeName: 'بيتزا باراديس (حيدرة)',
      storePhone: '023456789',
      storeAddress: 'شارع العربي بن مهيدي، حيدرة، الجزائر العاصمة',
      pickupLatitude: 36.755,
      pickupLongitude: 3.038,
      customerLatitude: 36.762,
      customerLongitude: 3.049,
      deliveryAddress: {
        formattedAddress: 'حي البدر، الجزائر العاصمة',
        street: 'شارع 14 رقم 28',
        commune: 'القبة',
        wilaya: 'الجزائر العاصمة',
        latitude: 36.762,
        longitude: 3.049,
      },
      items: [
        {
          productId: 'prod_1',
          productName: 'بيتزا فور سيزونز ملكية عائلية',
          price: 1400,
          quantity: 2,
          imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80',
        },
        {
          productId: 'prod_2',
          productName: 'مشروب غازي كوكاكولا 1 لتر',
          price: 250,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
        },
      ],
      subtotal: 3050,
      deliveryFee: 400,
      discount: 0,
      total: 3450,
      status: 'READY_FOR_PICKUP',
      paymentMethod: 'CASH_ON_DELIVERY',
      paymentStatus: 'PENDING',
      notes: 'الرجاء الاتصال قبل الوصول بـ 5 دقائق، الطابق الثاني شقة 4',
      routeDistanceFormatted: '2.4 كم',
      estimatedDurationFormatted: '8 دقائق',
      deliveryOtp: '4892',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'READY_FOR_PICKUP',
          timestamp: new Date().toISOString(),
          note: 'الطلب جاهز للاستلام والتوصيل',
          actorId: 'store_demo',
          actorRole: 'MERCHANT',
        },
      ],
    };

    dbService.createOrder(demoOrder);
    setDismissedOrderIds((prev) => prev.filter((id) => id !== demoOrderId));
    setIncomingRequest(demoOrder);
  };

  return (
    <div
      id="courier-main-experience"
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100 select-none"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* 
        1. COURIER HOME SCREEN — MAP FIRST (Requirement #1)
        The map occupies ~100% of the screen.
      */}
      <div className="absolute inset-0 w-full h-full z-0">
        <DeliveryTrackingMap
          order={activeOrder}
          incomingOrder={incomingRequest}
          courierCoordinates={courierCoords}
          heading={heading}
          isCourierView={true}
          minimalUi={true}
          onLocationUpdate={handleLocationUpdate}
          className="h-full w-full rounded-none border-none shadow-none"
          enableSimulation={false}
        />
      </div>

      {/* 
        Top Floating HUD & Controls Header
        Shows: Online status, Vehicle, Wallet pill with balance, and Driving stage HUD
      */}
      <CourierMapHeader
        isOnline={profile?.isOnline ?? true}
        onToggleOnline={handleToggleOnline}
        vehicleType={profile?.vehicleType ?? 'MOTORCYCLE'}
        onToggleVehicle={handleToggleVehicle}
        walletBalance={profile?.earningsBalance ?? 0}
        onOpenWallet={() => setIsWalletModalOpen(true)}
        activeOrder={activeOrder}
        onRecenter={() => {
          // Trigger smooth recenter
          setCourierCoords((prev) => [prev[0], prev[1]]);
        }}
      />

      {/* 
        Idle Searching Beacon Overlay (when online and no incoming or active orders)
      */}
      {!activeOrder && !incomingRequest && profile?.isOnline && (
        <div className="absolute bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2">
          {/* Pulsing Searching Beacon Card */}
          <div className="bg-white/80 backdrop-blur-xl px-5 py-3 rounded-2xl shadow-[0_12px_32px_rgba(15,23,42,0.1)] border border-white/80 flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-4 h-4 rounded-full bg-[#FF6600] animate-ping" />
              <span className="absolute w-3 h-3 rounded-full bg-[#FF6600]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-[#1A1A1B]">
                {isRtl ? 'أنت متصل بالخدمة' : 'You are Online'}
              </span>
              <span className="text-[11px] text-gray-500 font-semibold">
                {isRtl ? 'جاري البحث عن طلبات توصيل قريبة منك...' : 'Searching for nearby orders...'}
              </span>
            </div>
          </div>

          {/* Quick Simulation Trigger Button (for easy testing of the incoming request card & timer) */}
          <button
            type="button"
            id="courier-simulate-order-btn"
            onClick={handleSimulateNewOrder}
            className="px-4 py-2 bg-neutral-900/85 hover:bg-neutral-900 text-white rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 backdrop-blur-xl transition active:scale-95 cursor-pointer border border-white/15"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{isRtl ? 'محاكاة طلب توصيل تجريبي (15 ثانية)' : 'Simulate incoming delivery (15s)'}</span>
          </button>
        </div>
      )}

      {/* 
        2. NEW DELIVERY REQUEST & 3. ACCEPTANCE TIMER & 4. REJECT BUTTON (Requirement #2, #3, #4)
      */}
      {incomingRequest && !activeOrder && profile?.isOnline && (
        <CourierIncomingRequestCard
          order={incomingRequest}
          onAccept={handleAcceptDelivery}
          onReject={handleRejectDelivery}
          onExpire={handleExpireDelivery}
          onOpenDetails={() => setIsBottomSheetOpen(true)}
          acceptanceWindowSeconds={15}
        />
      )}

      {/* 
        5. BOTTOM SHEET / SLIDE-UP INFORMATION & 6. ACTIVE DELIVERY MODE
        (Requirement #5 & #6)
      */}
      {(activeOrder || (incomingRequest && isBottomSheetOpen)) && (
        <CourierBottomSheet
          order={activeOrder || incomingRequest!}
          mode={activeOrder ? 'ACTIVE_DELIVERY' : 'INCOMING_PREVIEW'}
          onUpdateStatus={handleAdvanceStatus}
          onOpenOtpModal={() => setIsOtpModalOpen(true)}
          isOpen={isBottomSheetOpen ? true : undefined}
          onClose={() => setIsBottomSheetOpen(false)}
        />
      )}

      {/* 
        OTP Delivery Confirmation Modal (Preserving existing authoritative OTP security)
      */}
      {activeOrder && (
        <DeliveryOtpModal
          order={activeOrder}
          courierId={currentUser?.id || ''}
          isOpen={isOtpModalOpen}
          onClose={() => setIsOtpModalOpen(false)}
          onSuccess={handleOtpSuccess}
        />
      )}

      {/* 
        Courier Financial Wallet Slide-Over Modal
        Preserves existing financial logic, withdrawals, and bank profiles without cluttering map while driving
      */}
      {isWalletModalOpen && currentUser && profile && (
        <Modal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          title={isRtl ? 'المحفظة المالية للكابتن' : 'Courier Financial Wallet'}
          maxWidth="max-w-4xl"
        >
          <div className="p-2 sm:p-4 max-h-[75vh] overflow-y-auto">
            <CourierFinancialWallet
              user={currentUser}
              courierProfile={profile}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
