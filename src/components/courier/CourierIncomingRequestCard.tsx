import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Clock, ChevronUp } from 'lucide-react';
import { Order } from '../../types';

interface CourierIncomingRequestCardProps {
  order: Order;
  onAccept: (order: Order) => void;
  onReject: (order: Order) => void;
  onExpire: (order: Order) => void;
  onOpenDetails?: () => void;
  acceptanceWindowSeconds?: number;
}

export const CourierIncomingRequestCard: React.FC<CourierIncomingRequestCardProps> = ({
  order,
  onAccept,
  onReject,
  onExpire,
  onOpenDetails,
  acceptanceWindowSeconds = 15,
}) => {
  const totalDurationMs = acceptanceWindowSeconds * 1000;

  // Track the authoritative deadline via timestamp to prevent delays / backgrounding bypass
  const deadlineMsRef = useRef<number>(Date.now() + totalDurationMs);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(totalDurationMs);
  const [isExpired, setIsExpired] = useState(false);
  const hasExpiredFiredRef = useRef(false);

  // Check language direction for layout alignment
  const isRtl =
    typeof document !== 'undefined'
      ? document.documentElement.dir === 'rtl'
      : true;

  useEffect(() => {
    // Reset deadline when order changes
    deadlineMsRef.current = Date.now() + totalDurationMs;
    hasExpiredFiredRef.current = false;
    setIsExpired(false);
    setTimeLeftMs(totalDurationMs);

    const interval = setInterval(() => {
      const remaining = deadlineMsRef.current - Date.now();
      if (remaining <= 0) {
        setTimeLeftMs(0);
        setIsExpired(true);
        if (!hasExpiredFiredRef.current) {
          hasExpiredFiredRef.current = true;
          onExpire(order);
        }
        clearInterval(interval);
      } else {
        setTimeLeftMs(remaining);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [order.id, totalDurationMs, onExpire]);

  // Authoritative check on click
  const handleAcceptClick = () => {
    if (Date.now() > deadlineMsRef.current || isExpired) {
      if (!hasExpiredFiredRef.current) {
        hasExpiredFiredRef.current = true;
        onExpire(order);
      }
      return;
    }
    onAccept(order);
  };

  const handleRejectClick = () => {
    onReject(order);
  };

  // Calculate progress percentage: 1 -> 0
  const progressRatio = Math.max(0, Math.min(1, timeLeftMs / totalDurationMs));
  const secondsLeft = Math.ceil(timeLeftMs / 1000);

  // SVG perimeter calculation for rounded rectangle border animation
  // Approximate perimeter of card (w=380, h=100, rx=24): ~ 2*(380-48) + 2*(100-48) + 2*PI*24 = 664 + 104 + 150.8 = 918.8
  const strokeDashoffset = 1000 * (1 - progressRatio);

  return (
    <>
      {/* 
        Reject Button:
        Frosted red glass button in the upper corner of the map.
        RTL: top-left (start)
        LTR: top-right (start)
      */}
      <div className={`fixed top-20 sm:top-24 ${isRtl ? 'left-4' : 'right-4'} z-40 p-1 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-lg`}>
        <button
          type="button"
          id="courier-reject-request-btn"
          onClick={handleRejectClick}
          title={isRtl ? 'رفض الطلب والتخطي' : 'Reject delivery request'}
          className="w-10 h-10 rounded-full bg-red-600/90 hover:bg-red-600 text-white shadow-md flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 cursor-pointer focus:outline-none focus:ring-4 focus:ring-red-400/40"
          aria-label="رفض الطلب"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 
        New Delivery Request Card:
        Frosted Glass panel near the bottom of the map containing essential info:
        - Courier earning amount
        - Accept Delivery button
        - Animated border countdown indicator surrounding the card
      */}
      <div
        id="courier-incoming-request-card"
        className="fixed bottom-4 sm:bottom-6 left-3 right-3 sm:left-auto sm:right-auto sm:w-[430px] sm:inset-x-0 sm:mx-auto z-40 pointer-events-auto select-none"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Animated Drag Handle */}
        <button
          type="button"
          onClick={onOpenDetails}
          title={isRtl ? 'اسحب أو انقر لعرض تفاصيل الطلب' : 'Swipe or tap for order details'}
          className="w-full flex flex-col items-center justify-center mb-1 group cursor-pointer focus:outline-none"
        >
          <div className="w-14 h-1.5 bg-neutral-400/80 rounded-full group-hover:bg-[#FF6600] group-hover:w-16 transition-all duration-300 shadow-xs animate-pulse" />
          <span className="text-[10px] font-bold text-neutral-600 drop-shadow-sm mt-0.5 group-hover:text-neutral-900 transition-colors flex items-center gap-1 bg-white/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/70 shadow-xs">
            <span>{isRtl ? 'اسحب للأعلى للتفاصيل' : 'Swipe up for details'}</span>
            <ChevronUp className="w-3 h-3 text-[#FF6600]" />
          </span>
        </button>

        {/* Card Body with Frosted Glass & Animated SVG Border surrounding it */}
        <div className="relative rounded-3xl bg-white/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(15,23,42,0.18)] p-4 sm:p-5 border border-white/90 overflow-hidden">
          {/* Animated countdown border surrounding the card */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl"
            style={{ width: '100%', height: '100%' }}
          >
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="22"
              ry="22"
              fill="none"
              stroke="rgba(243, 244, 246, 0.7)"
              strokeWidth="4"
            />
            <rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              rx="22"
              ry="22"
              fill="none"
              stroke={progressRatio < 0.25 ? '#EF4444' : progressRatio < 0.5 ? '#F59E0B' : '#FF6600'}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 80ms linear, stroke 300ms ease',
              }}
            />
          </svg>

          {/* Content inside the card */}
          <div className="relative z-10 flex items-center justify-between gap-4">
            {/* Courier Earning Amount (High visibility) */}
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                <span>{isRtl ? 'الأجرة المقدرة' : 'Earnings'}</span>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-orange-500/12 text-[#FF6600] border border-orange-500/20">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{secondsLeft}s</span>
                </span>
              </span>

              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-3xl sm:text-4xl font-black text-[#18181B] tracking-tight">
                  {order.deliveryFee}
                </span>
                <span className="text-sm sm:text-base font-black text-[#FF6600]">
                  {isRtl ? 'دج' : 'DZD'}
                </span>
              </div>

              {/* Minimal Trip glance (Distance / Store) */}
              <span className="text-xs text-gray-600 font-bold truncate max-w-[150px] sm:max-w-[190px]">
                {order.storeName}
              </span>
            </div>

            {/* Accept Delivery Button */}
            <button
              type="button"
              id="courier-accept-delivery-btn"
              disabled={isExpired}
              onClick={handleAcceptClick}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-tr from-[#EA580C] to-[#FF7711] hover:from-[#d84e06] hover:to-[#ea6c0e] active:scale-95 disabled:bg-gray-300 disabled:pointer-events-none text-white font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-orange-500/30 border border-white/25 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer focus:outline-none focus:ring-4 focus:ring-orange-400/40 shrink-0"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>{isRtl ? 'قبول التوصيل' : 'ACCEPT'}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
