import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Navigation,
  Phone,
  Store,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Package,
  FileText,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getNavigationUrl } from '../../services/routing';
import { dbService } from '../../services/store';

interface CourierBottomSheetProps {
  order: Order;
  mode: 'INCOMING_PREVIEW' | 'ACTIVE_DELIVERY';
  onUpdateStatus?: (newStatus: OrderStatus, note?: string) => void;
  onOpenOtpModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CourierBottomSheet: React.FC<CourierBottomSheetProps> = ({
  order,
  mode,
  onUpdateStatus,
  onOpenOtpModal,
  isOpen: controlledIsOpen,
  onClose,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalExpanded;

  const setExpanded = useCallback(
    (val: boolean) => {
      setInternalExpanded(val);
      if (!val && onClose) {
        onClose();
      }
    },
    [onClose]
  );

  const isRtl =
    typeof document !== 'undefined'
      ? document.documentElement.dir === 'rtl'
      : true;

  // Gesture State & Dimensions
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // Offset in pixels from current state position

  const dragStartYRef = useRef<number | null>(null);
  const dragStartTimeRef = useRef<number>(0);
  const lastYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const isScrollInitiatedRef = useRef<boolean>(false);

  // Measure natural expanded travel height
  const getTravelDistance = useCallback(() => {
    if (typeof window === 'undefined') return 360;
    const vh = window.innerHeight;
    // Difference between expanded target (~82vh) and collapsed target (~200px)
    const expandedHeight = Math.min(vh * 0.85, 650);
    const collapsedHeight = 210;
    return Math.max(expandedHeight - collapsedHeight, 220);
  }, []);

  // Handle Drag Start
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary pointer (left mouse button or touch)
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    // Check if target is a clickable interactive control inside sheet
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('input')
    ) {
      return;
    }

    // If touching inside the scrollable content when expanded, check if scroll position is at the very top
    if (isExpanded && scrollContainerRef.current && scrollContainerRef.current.contains(target)) {
      if (scrollContainerRef.current.scrollTop > 5) {
        // Content is scrolled down; allow natural scrolling, do not initiate sheet collapse drag
        isScrollInitiatedRef.current = true;
        return;
      }
    }

    isScrollInitiatedRef.current = false;
    dragStartYRef.current = e.clientY;
    lastYRef.current = e.clientY;
    dragStartTimeRef.current = performance.now();
    isDraggingRef.current = true;
    setIsDragging(true);
    setDragOffset(0);

    // Capture pointer
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if setPointerCapture fails on certain embedded environments
    }
  };

  // Handle Drag Move
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || dragStartYRef.current === null) return;

    const currentY = e.clientY;
    const deltaY = currentY - dragStartYRef.current;
    lastYRef.current = currentY;

    // If initiated in scroll area, allow dragging down to collapse only if still at top and pulling downward
    if (isScrollInitiatedRef.current) {
      if (scrollContainerRef.current && scrollContainerRef.current.scrollTop > 0) {
        return;
      }
    }

    const travelDist = getTravelDistance();

    if (!isExpanded) {
      // In collapsed state: pulling upward (negative deltaY) moves it towards expanded
      // Disallow dragging further down than collapsed resting position with resistance
      if (deltaY > 0) {
        setDragOffset(deltaY * 0.2); // slight resistance downwards
      } else {
        // Upwards: clamp between -travelDist and 0
        const clamped = Math.max(-travelDist - 30, deltaY);
        setDragOffset(clamped);
      }
    } else {
      // In expanded state: pulling downward (positive deltaY) moves it towards collapsed
      if (deltaY < 0) {
        setDragOffset(deltaY * 0.2); // slight rubber band upwards
      } else {
        // Downwards: clamp between 0 and travelDist
        const clamped = Math.min(travelDist + 30, deltaY);
        setDragOffset(clamped);
      }
    }
  };

  // Handle Drag End / Snap
  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;
    setIsDragging(false);

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }

    if (dragStartYRef.current === null) {
      setDragOffset(0);
      return;
    }

    const totalDeltaY = lastYRef.current - dragStartYRef.current;
    const duration = performance.now() - dragStartTimeRef.current;
    const velocity = totalDeltaY / (duration || 1); // px per ms

    const travelDist = getTravelDistance();
    const thresholdDistance = Math.min(travelDist * 0.3, 80);

    if (!isExpanded) {
      // Moving up: negative deltaY or negative velocity
      const isFastFlickUp = velocity < -0.45;
      const isDraggedEnoughUp = totalDeltaY < -thresholdDistance;

      if (isFastFlickUp || isDraggedEnoughUp) {
        setExpanded(true);
      }
    } else {
      // Moving down: positive deltaY or positive velocity
      const isFastFlickDown = velocity > 0.45;
      const isDraggedEnoughDown = totalDeltaY > thresholdDistance;

      if (isFastFlickDown || isDraggedEnoughDown) {
        setExpanded(false);
      }
    }

    dragStartYRef.current = null;
    setDragOffset(0);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    setIsDragging(false);
    dragStartYRef.current = null;
    setDragOffset(0);
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignore
    }
  };

  // Calculate dynamic transform based on state and current drag offset
  // When collapsed, offset is <= 0 (lifting up towards expanded).
  // When expanded, offset is >= 0 (dropping down towards collapsed).
  const currentTransform = isDragging
    ? `translate3d(0, ${dragOffset}px, 0)`
    : 'translate3d(0, 0, 0)';

  // Determine stage in active delivery mode
  const isBeforePickup =
    order.status === 'COURIER_ASSIGNED' ||
    order.status === 'READY_FOR_PICKUP' ||
    order.status === 'ACCEPTED' ||
    order.status === 'PREPARING';

  // Helper to validate geographic coordinates (real numbers, bounded, non-zero)
  const isValidCoordinate = (lat?: number | null, lng?: number | null): boolean => {
    return (
      typeof lat === 'number' &&
      typeof lng === 'number' &&
      !Number.isNaN(lat) &&
      !Number.isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180 &&
      (lat !== 0 || lng !== 0)
    );
  };

  // State for destination coordinates warning
  const [geoError, setGeoError] = useState<string | null>(null);

  // Auto-dismiss geo error after 4 seconds
  useEffect(() => {
    if (!geoError) return;
    const timer = window.setTimeout(() => setGeoError(null), 4000);
    return () => window.clearTimeout(timer);
  }, [geoError]);

  // Destination coordinates based strictly on stored data without fabricating fake coordinates
  const destinationCoords: [number, number] | null = (() => {
    if (isBeforePickup) {
      if (isValidCoordinate(order.pickupLatitude, order.pickupLongitude)) {
        return [order.pickupLatitude!, order.pickupLongitude!];
      }
      try {
        const store = dbService.getStoreById(order.storeId);
        if (store && isValidCoordinate(store.latitude, store.longitude)) {
          return [store.latitude!, store.longitude!];
        }
      } catch {
        // Ignore store lookup error
      }
      return null;
    } else {
      // After pickup: customer coordinates
      if (isValidCoordinate(order.customerLatitude, order.customerLongitude)) {
        return [order.customerLatitude!, order.customerLongitude!];
      }
      if (
        isValidCoordinate(
          order.deliveryAddress?.latitude,
          order.deliveryAddress?.longitude
        )
      ) {
        return [
          order.deliveryAddress.latitude!,
          order.deliveryAddress.longitude!,
        ];
      }
      return null;
    }
  })();

  const courierCoords: [number, number] | undefined = isValidCoordinate(
    order.courierLatitude,
    order.courierLongitude
  )
    ? [order.courierLatitude!, order.courierLongitude!]
    : undefined;

  const externalNavUrl = destinationCoords
    ? getNavigationUrl(destinationCoords, courierCoords)
    : '';

  const storeNavUrl = (() => {
    if (isValidCoordinate(order.pickupLatitude, order.pickupLongitude)) {
      return getNavigationUrl([order.pickupLatitude!, order.pickupLongitude!], courierCoords);
    }
    try {
      const store = dbService.getStoreById(order.storeId);
      if (store && isValidCoordinate(store.latitude, store.longitude)) {
        return getNavigationUrl([store.latitude!, store.longitude!], courierCoords);
      }
    } catch {
      // Ignore
    }
    return '';
  })();

  const customerNavUrl = (() => {
    if (isValidCoordinate(order.customerLatitude, order.customerLongitude)) {
      return getNavigationUrl([order.customerLatitude!, order.customerLongitude!], courierCoords);
    }
    if (
      isValidCoordinate(
        order.deliveryAddress?.latitude,
        order.deliveryAddress?.longitude
      )
    ) {
      return getNavigationUrl(
        [order.deliveryAddress.latitude!, order.deliveryAddress.longitude!],
        courierCoords
      );
    }
    return '';
  })();

  const handleOpenExternalMaps = (e: React.MouseEvent) => {
    if (!destinationCoords || !externalNavUrl) {
      e.preventDefault();
      const message = isRtl
        ? isBeforePickup
          ? 'إحداثيات المتجر غير متوفرة لهذا الطلب'
          : 'إحداثيات عنوان الزبون غير متوفرة لهذا الطلب'
        : isBeforePickup
        ? 'Store coordinates are unavailable for this order'
        : 'Customer delivery coordinates are unavailable for this order';
      setGeoError(message);
    }
  };

  // Workflow steps definition
  const steps = [
    {
      id: 'step_1',
      title: isRtl ? 'الذهاب إلى المتجر' : 'Go to store',
      status: 'COURIER_ASSIGNED',
      isDone: [
        'READY_FOR_PICKUP',
        'PICKED_UP',
        'ON_THE_WAY',
        'ARRIVED',
        'DELIVERED',
      ].includes(order.status),
      isActive: order.status === 'COURIER_ASSIGNED',
    },
    {
      id: 'step_2',
      title: isRtl ? 'الوصول للمتجر' : 'Arrive at store',
      status: 'READY_FOR_PICKUP',
      isDone: [
        'PICKED_UP',
        'ON_THE_WAY',
        'ARRIVED',
        'DELIVERED',
      ].includes(order.status),
      isActive: order.status === 'READY_FOR_PICKUP' || order.status === 'PREPARING',
    },
    {
      id: 'step_3',
      title: isRtl ? 'استلام الطلب' : 'Pick up order',
      status: 'PICKED_UP',
      isDone: ['ON_THE_WAY', 'ARRIVED', 'DELIVERED'].includes(order.status),
      isActive: order.status === 'PICKED_UP',
    },
    {
      id: 'step_4',
      title: isRtl ? 'الانطلاق للزبون' : 'Go to customer',
      status: 'ON_THE_WAY',
      isDone: ['ARRIVED', 'DELIVERED'].includes(order.status),
      isActive: order.status === 'ON_THE_WAY',
    },
    {
      id: 'step_5',
      title: isRtl ? 'الوصول للزبون' : 'Arrive at customer',
      status: 'ARRIVED',
      isDone: ['DELIVERED'].includes(order.status),
      isActive: order.status === 'ARRIVED',
    },
    {
      id: 'step_6',
      title: isRtl ? 'تأكيد التسليم (OTP)' : 'Complete with OTP',
      status: 'DELIVERED',
      isDone: order.status === 'DELIVERED',
      isActive: false,
    },
  ];

  // Current primary action button in collapsed or expanded state
  const renderPrimaryAction = () => {
    if (mode === 'INCOMING_PREVIEW') return null;
    if (!onUpdateStatus) return null;

    if (order.status === 'COURIER_ASSIGNED') {
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus('READY_FOR_PICKUP', 'وصل الكابتن إلى المتجر')}
          className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2"
        >
          <Store className="w-5 h-5 shrink-0" />
          <span>{isRtl ? 'وصلت إلى المتجر (ARRIVE)' : 'ARRIVE AT STORE'}</span>
        </button>
      );
    }

    if (order.status === 'READY_FOR_PICKUP' || order.status === 'PREPARING') {
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus('PICKED_UP', 'استلم الكابتن الطلب وهو جاهز للانطلاق')}
          className="w-full py-3.5 px-4 bg-[#FF6600] hover:bg-[#E55C00] active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{isRtl ? 'استلمت الطلب من المتجر (PICK UP)' : 'PICK UP ORDER'}</span>
        </button>
      );
    }

    if (order.status === 'PICKED_UP') {
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus('ON_THE_WAY', 'الكابتن في الطريق إلى الزبون')}
          className="w-full py-3.5 px-4 bg-[#FF6600] hover:bg-[#E55C00] active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2"
        >
          <Navigation className="w-5 h-5 shrink-0" />
          <span>{isRtl ? 'الانطلاق إلى الزبون (ON THE WAY)' : 'GO TO CUSTOMER'}</span>
        </button>
      );
    }

    if (order.status === 'ON_THE_WAY') {
      return (
        <button
          type="button"
          onClick={() => onUpdateStatus('ARRIVED', 'وصل الكابتن إلى عنوان الزبون')}
          className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base shadow-md transition flex items-center justify-center gap-2"
        >
          <MapPin className="w-5 h-5 shrink-0" />
          <span>{isRtl ? 'وصلت إلى عنوان الزبون (ARRIVED)' : 'ARRIVE AT CUSTOMER'}</span>
        </button>
      );
    }

    if (order.status === 'ARRIVED') {
      return (
        <button
          type="button"
          onClick={onOpenOtpModal}
          className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-2xl font-black text-sm sm:text-base shadow-lg transition flex items-center justify-center gap-2 animate-pulse"
        >
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span>{isRtl ? 'تأكيد التسليم برمز OTP' : 'CONFIRM WITH OTP'}</span>
        </button>
      );
    }

    if (order.status === 'DELIVERED') {
      return (
        <div className="w-full py-3 px-4 bg-emerald-50 text-emerald-800 rounded-2xl font-black text-sm text-center border border-emerald-200 flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{isRtl ? 'تم توصيل الطلب بنجاح!' : 'Order Delivered Successfully'}</span>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* Dimmed backdrop when fully expanded on mobile */}
      {isExpanded && (
        <div
          onClick={() => setExpanded(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-Up Bottom Sheet Container with Frosted Glass */}
      <div
        ref={sheetRef}
        id="courier-bottom-sheet"
        dir={isRtl ? 'rtl' : 'ltr'}
        style={{
          transform: currentTransform,
          touchAction: 'none',
        }}
        className={`fixed left-0 right-0 bottom-0 z-50 bg-white/95 backdrop-blur-2xl rounded-t-3xl shadow-[0_-12px_45px_rgba(15,23,42,0.18)] border-t border-white/90 flex flex-col will-change-transform pb-[env(safe-area-inset-bottom,0px)] ${
          isDragging ? 'transition-none select-none' : 'transition-all duration-300 ease-out'
        } ${isExpanded ? 'h-[85vh] max-h-[85vh]' : 'h-auto max-h-[260px]'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
      >
        {/* Animated Drag Handle Area */}
        <div
          onClick={(e) => {
            // Only trigger click toggle if not an actual drag gesture
            if (Math.abs(dragOffset) < 5) {
              setExpanded(!isExpanded);
            }
          }}
          className="w-full pt-3 pb-2.5 px-4 flex flex-col items-center justify-center cursor-pointer select-none group touch-none"
          role="button"
          tabIndex={0}
          aria-label={isExpanded ? 'طي تفاصيل الطلب' : 'توسيع تفاصيل الطلب'}
        >
          <div className="w-12 sm:w-16 h-1.5 bg-neutral-300 group-hover:bg-[#FF6600] rounded-full transition-all duration-200" />
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 group-hover:text-gray-800 mt-1.5 transition-colors">
            <span>
              {isExpanded
                ? isRtl
                  ? 'اسحب للأسفل لتصغير الشاشة'
                  : 'Swipe down to collapse'
                : isRtl
                ? 'اسحب للأعلى لتفاصيل الطلب'
                : 'Swipe up for order details'}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Non-blocking Geo Error Notification */}
        {geoError && (
          <div
            role="alert"
            className="mx-4 sm:mx-6 mb-2 p-2.5 bg-amber-500/15 border border-amber-500/40 text-amber-950 rounded-xl text-xs font-bold flex items-center justify-between gap-2 shadow-xs animate-in fade-in"
          >
            <div className="flex items-center gap-2 min-w-0">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="truncate">{geoError}</span>
            </div>
            <button
              type="button"
              onClick={() => setGeoError(null)}
              className="text-amber-800 hover:text-amber-950 p-1 rounded-md"
              aria-label="إغلاق التنبيه"
            >
              ✕
            </button>
          </div>
        )}

        {/* Collapsed Glance Header (always visible) */}
        <div className="px-4 sm:px-6 pb-3 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isBeforePickup
                    ? 'bg-amber-500/15 text-amber-800 border-amber-300/40'
                    : 'bg-emerald-500/15 text-emerald-800 border-emerald-300/40'
                }`}
              >
                {isBeforePickup ? (
                  <Store className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-gray-500 block truncate">
                  {isBeforePickup
                    ? isRtl
                      ? 'الاستلام من المتجر'
                      : 'Pick up from store'
                    : isRtl
                    ? 'التوصيل للزبون'
                    : 'Deliver to customer'}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-base font-extrabold text-[#1A1A1B] truncate">
                    {isBeforePickup ? order.storeName : order.customerName}
                  </h3>
                  <a
                    href={externalNavUrl || '#'}
                    target={externalNavUrl ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    onClick={handleOpenExternalMaps}
                    title={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                    aria-label={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                    className="p-1 rounded-lg text-gray-400 hover:text-[#FF6600] hover:bg-orange-50 active:scale-90 transition-all shrink-0 cursor-pointer inline-flex items-center"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Glance Metrics: Earnings & Distance */}
            <div className="text-end shrink-0">
              <span className="text-lg font-black text-[#FF6600] block leading-tight">
                {order.deliveryFee} {isRtl ? 'دج' : 'DZD'}
              </span>
              <span className="text-xs font-semibold text-gray-500">
                {order.routeDistanceFormatted || '1.8 كم'} • {order.estimatedDurationFormatted || '6 د'}
              </span>
            </div>
          </div>

          {/* Collapsed Active Action Button & External Maps Button */}
          {mode === 'ACTIVE_DELIVERY' && !isExpanded && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 min-w-0">{renderPrimaryAction()}</div>
              <a
                href={externalNavUrl || '#'}
                target={externalNavUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={handleOpenExternalMaps}
                title={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                aria-label={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                className="h-[50px] px-3.5 bg-neutral-100 hover:bg-orange-50 active:scale-95 text-neutral-800 hover:text-[#FF6600] border border-neutral-200/80 hover:border-[#FF6600]/40 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer select-none"
              >
                <Navigation className="w-4 h-4 text-[#FF6600] shrink-0" />
                <span className="text-xs font-bold whitespace-nowrap">
                  {isRtl ? 'الخرائط' : 'Maps'}
                </span>
              </a>
            </div>
          )}
        </div>

        {/* Scrollable Expanded Details Area */}
        {isExpanded && (
          <div
            ref={scrollContainerRef}
            style={{ touchAction: 'pan-y' }}
            className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 pb-6 pt-2 space-y-4 text-sm"
          >
            {/* Expanded Primary Action button if in active mode */}
            {mode === 'ACTIVE_DELIVERY' && (
              <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md pb-2 pt-1 flex items-center gap-2">
                <div className="flex-1 min-w-0">{renderPrimaryAction()}</div>
                <a
                  href={externalNavUrl || '#'}
                  target={externalNavUrl ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={handleOpenExternalMaps}
                  title={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                  aria-label={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                  className="h-[50px] px-3.5 bg-neutral-100 hover:bg-orange-50 active:scale-95 text-neutral-800 hover:text-[#FF6600] border border-neutral-200/80 hover:border-[#FF6600]/40 rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer select-none"
                >
                  <Navigation className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <span className="text-xs font-bold whitespace-nowrap">
                    {isRtl ? 'الخرائط' : 'Maps'}
                  </span>
                </a>
              </div>
            )}

            {/* Quick Action Navigation & Phone Call Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={externalNavUrl || '#'}
                target={externalNavUrl ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={handleOpenExternalMaps}
                title={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                aria-label={isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}
                className="py-3 px-3.5 bg-white/70 hover:bg-white/90 backdrop-blur-md active:scale-[0.98] text-[#1A1A1B] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-white/80 shadow-xs cursor-pointer"
              >
                <Navigation className="w-4 h-4 text-[#FF6600]" />
                <span>{isRtl ? 'فتح في تطبيق الخرائط' : 'Open in Maps app'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              </a>

              <a
                href={`tel:${isBeforePickup ? order.storePhone : order.customerPhone}`}
                className="py-3 px-3.5 bg-emerald-500/12 hover:bg-emerald-500/20 backdrop-blur-md active:scale-[0.98] text-emerald-800 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition border border-emerald-400/30 shadow-xs"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>
                  {isBeforePickup
                    ? isRtl
                      ? 'اتصال بالمتجر'
                      : 'Call Store'
                    : isRtl
                    ? 'اتصال بالزبون'
                    : 'Call Customer'}
                </span>
              </a>
            </div>

            {/* Workflow Timeline */}
            {mode === 'ACTIVE_DELIVERY' && (
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-xs">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">
                  {isRtl ? 'مراحل المشوار (الخطوات الست)' : 'Trip Stages (6 Steps)'}
                </span>

                <div className="space-y-2.5">
                  {steps.map((st, idx) => (
                    <div key={st.id} className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                          st.isDone
                            ? 'bg-emerald-500 text-white'
                            : st.isActive
                            ? 'bg-[#FF6600] text-white ring-4 ring-orange-200 animate-pulse'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {st.isDone ? '✓' : idx + 1}
                      </div>
                      <span
                        className={`text-xs ${
                          st.isActive
                            ? 'font-black text-[#1A1A1B]'
                            : st.isDone
                            ? 'font-bold text-gray-700'
                            : 'text-gray-400'
                        }`}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Addresses & Contacts */}
            <div className="space-y-3">
              {/* Store Details */}
              <div className="p-3.5 bg-amber-500/10 backdrop-blur-md rounded-2xl border border-amber-300/40 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span>{order.storeName}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">{order.storePhone}</span>
                    {storeNavUrl && (
                      <a
                        href={storeNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isRtl ? 'فتح موقع المتجر في تطبيق الخرائط' : 'Open store location in Maps'}
                        aria-label={isRtl ? 'فتح موقع المتجر في تطبيق الخرائط' : 'Open store location in Maps'}
                        className="p-1 rounded-md text-amber-800 hover:text-[#FF6600] hover:bg-amber-100 transition inline-flex items-center cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-amber-800/90 pr-5">
                  {order.storeAddress}
                </p>
              </div>

              {/* Customer Details */}
              <div className="p-3.5 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-300/40 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>{order.customerName}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono">{order.customerPhone}</span>
                    {customerNavUrl && (
                      <a
                        href={customerNavUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={isRtl ? 'فتح موقع الزبون في تطبيق الخرائط' : 'Open customer location in Maps'}
                        aria-label={isRtl ? 'فتح موقع الزبون في تطبيق الخرائط' : 'Open customer location in Maps'}
                        className="p-1 rounded-md text-emerald-800 hover:text-emerald-600 hover:bg-emerald-100 transition inline-flex items-center cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs text-emerald-800/90 pr-5">
                  {order.deliveryAddress?.street}, {order.deliveryAddress?.commune} (
                  {order.deliveryAddress?.wilaya})
                </p>
                {order.deliveryNotes && (
                  <p className="text-[11px] text-emerald-700 font-medium pr-5 pt-1 border-t border-emerald-200/50 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>ملاحظة: {order.deliveryNotes}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Products / Items in Order */}
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gray-600" />
                  <span>
                    {isRtl ? 'تفاصيل السلعة والمنتجات' : 'Products & Items'} (
                    {order.items?.length || 0})
                  </span>
                </span>
                <span className="font-mono text-gray-400">#{order.id}</span>
              </div>

              <div className="divide-y divide-gray-200/60 pt-1">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gray-200/80 text-gray-700 font-bold flex items-center justify-center text-[10px]">
                        {item.quantity}x
                      </span>
                      <span className="font-medium text-gray-800">
                        {item.productName}
                      </span>
                    </div>
                    <span className="font-mono text-gray-500">
                      {item.price * item.quantity} {isRtl ? 'دج' : 'DZD'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financials & Cash Collection Note */}
            <div className="p-4 bg-neutral-900/90 backdrop-blur-xl text-white rounded-2xl space-y-2 border border-white/10 shadow-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">
                  {isRtl ? 'أجرة التوصيل الصافية للكابتن:' : 'Courier Delivery Fee:'}
                </span>
                <span className="text-lg font-black text-[#FF6600]">
                  {order.deliveryFee} {isRtl ? 'دج' : 'DZD'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-gray-800/80 pt-2">
                <span className="text-gray-400">
                  {order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? isRtl
                      ? 'الدفع عند الاستلام (COD واجب التحصيل):'
                      : 'Cash on Delivery to collect:'
                    : isRtl
                    ? 'طريقة الدفع:'
                    : 'Payment:'}
                </span>
                <span className="font-mono font-bold text-emerald-400">
                  {order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? `${order.total} ${isRtl ? 'دج' : 'DZD'}`
                    : isRtl
                    ? 'مدفوع إلكترونياً (SATIM)'
                    : 'Paid Online'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

