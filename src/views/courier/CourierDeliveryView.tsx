import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  Package,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { dbService } from '../../services/store';
import { DeliveryTrackingMap } from '../../components/map/DeliveryTrackingMap';
import { CourierBottomSheet } from '../../components/courier/CourierBottomSheet';
import { CourierMapHeader } from '../../components/courier/CourierMapHeader';
import { DeliveryOtpModal } from '../../components/delivery/DeliveryOtpModal';

interface CourierDeliveryViewProps {
  deliveryId?: string;
  onNavigate?: (path: string) => void;
}

export const CourierDeliveryView: React.FC<CourierDeliveryViewProps> = ({
  deliveryId,
  onNavigate,
}) => {
  // If deliveryId not passed via props, extract from pathname
  const currentId =
    deliveryId ||
    window.location.pathname.split('/courier/deliveries/')[1] ||
    'del_order_1001';

  // Normalize orderId (strip del_ if present)
  const orderId = currentId.startsWith('del_') ? currentId.substring(4) : currentId;

  const [order, setOrder] = useState<Order | undefined>(() =>
    dbService.getOrderById(orderId)
  );
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [completionNotice, setCompletionNotice] = useState(false);
  const [courierCoords, setCourierCoords] = useState<[number, number]>([36.7525, 3.042]);

  // Subscribe to real-time database updates
  useEffect(() => {
    const syncOrder = () => {
      const updated = dbService.getOrderById(orderId);
      setOrder(updated);
      if (updated?.courierLatitude && updated?.courierLongitude) {
        setCourierCoords([updated.courierLatitude, updated.courierLongitude]);
      }
    };

    syncOrder();
    const unsubscribe = dbService.subscribe(syncOrder);
    return () => unsubscribe();
  }, [orderId]);

  // Handle location update from map Geolocation watcher
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
      if (!order) return;
      dbService.updateCourierLocation(order.id, latitude, longitude, {
        routeDistance: metrics?.distanceMeters,
        estimatedDuration: metrics?.durationSeconds,
        routeDistanceFormatted: metrics?.distanceFormatted,
        estimatedDurationFormatted: metrics?.durationFormatted,
      });
    },
    [order]
  );

  // Handle status update
  const handleStatusUpdate = (newStatus: OrderStatus, note?: string) => {
    if (!order) return;
    const currentCourierId = order.courierId || 'user_courier_1';
    dbService.updateOrderStatus(order.id, newStatus, currentCourierId, 'COURIER', note);
  };

  const handleOtpSuccess = (updatedOrder: Order) => {
    setOrder(updatedOrder);
    setCompletionNotice(true);
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">الطلب غير موجود</h2>
        <p className="text-sm text-gray-500 mb-6">
          تعذر العثور على مهمة التوصيل رقم {currentId}
        </p>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/courier/dashboard')}
          className="px-6 py-2.5 bg-[#FF6600] text-white rounded-xl font-bold text-sm shadow-md"
        >
          العودة للوحة تحكم الكابتن
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100 select-none">
      {/* Full-screen Leaflet navigation map */}
      <div className="absolute inset-0 w-full h-full z-0">
        <DeliveryTrackingMap
          order={order}
          courierCoordinates={courierCoords}
          isCourierView={true}
          minimalUi={true}
          onLocationUpdate={handleLocationUpdate}
          className="h-full w-full rounded-none border-none shadow-none"
          enableSimulation={true}
        />
      </div>

      {/* Top Floating Map Header with driving HUD */}
      <CourierMapHeader
        isOnline={true}
        onToggleOnline={() => {}}
        vehicleType="MOTORCYCLE"
        onToggleVehicle={() => {}}
        walletBalance={12600}
        onOpenWallet={() => onNavigate && onNavigate('/courier/dashboard')}
        activeOrder={order}
        onRecenter={() => setCourierCoords((prev) => [prev[0], prev[1]])}
      />

      {/* Completion Success Notice Banner */}
      {completionNotice && (
        <div className="absolute top-20 inset-x-4 max-w-lg mx-auto z-30 p-4 bg-emerald-50/95 backdrop-blur-md border border-emerald-200 rounded-2xl shadow-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-800">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">تم تأكيد التوصيل وتسليم الطلب بنجاح!</p>
              <p className="text-xs text-emerald-600">
                أُضيفت أجر التوصيل ({order.deliveryFee} دج) إلى رصيدك. شكراً لجهودك كابتن!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/courier/dashboard')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow hover:bg-emerald-700 transition"
          >
            المهام التالية
          </button>
        </div>
      )}

      {/* Swipeable Bottom Sheet for Active Delivery Mode */}
      <CourierBottomSheet
        order={order}
        mode="ACTIVE_DELIVERY"
        onUpdateStatus={handleStatusUpdate}
        onOpenOtpModal={() => setIsOtpModalOpen(true)}
      />

      {/* OTP Delivery Verification Modal */}
      <DeliveryOtpModal
        order={order}
        courierId={order.courierId || 'user_courier_1'}
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={handleOtpSuccess}
      />
    </div>
  );
};
