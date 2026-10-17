import React from 'react';
import {
  Navigation,
  Phone,
  Store,
  MapPin,
  CheckCircle2,
  Clock,
  Gauge,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { getNavigationUrl } from '../../services/routing';

interface CourierDeliveryPanelProps {
  order: Order;
  onUpdateStatus: (newStatus: OrderStatus, note?: string) => void;
  onOpenOtpModal: () => void;
}

export const CourierDeliveryPanel: React.FC<CourierDeliveryPanelProps> = ({
  order,
  onUpdateStatus,
  onOpenOtpModal,
}) => {
  // Before pickup (COURIER_ASSIGNED or READY_FOR_PICKUP) -> focus is Store
  const isBeforePickup =
    order.status === 'COURIER_ASSIGNED' ||
    order.status === 'READY_FOR_PICKUP' ||
    order.status === 'ACCEPTED' ||
    order.status === 'PREPARING';

  // Target coordinates for external navigation
  const targetCoords: [number, number] = isBeforePickup
    ? [order.pickupLatitude || 36.7695, order.pickupLongitude || 3.0558]
    : [
        order.customerLatitude || order.deliveryAddress?.latitude || 36.7580,
        order.customerLongitude || order.deliveryAddress?.longitude || 3.0510,
      ];

  const courierCoords: [number, number] = [
    order.courierLatitude || 36.7640,
    order.courierLongitude || 3.0535,
  ];

  const externalNavUrl = getNavigationUrl(targetCoords, courierCoords);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'COURIER_ASSIGNED':
        return { text: 'في الطريق إلى المتجر', color: 'bg-amber-100 text-amber-800' };
      case 'READY_FOR_PICKUP':
        return { text: 'جاهز للاستلام من المتجر', color: 'bg-orange-100 text-orange-800' };
      case 'PICKED_UP':
        return { text: 'تم الاستلام - جاهز للانطلاق', color: 'bg-blue-100 text-blue-800' };
      case 'ON_THE_WAY':
        return { text: 'في الطريق إلى الزبون', color: 'bg-emerald-100 text-emerald-800' };
      case 'ARRIVED':
        return { text: 'وصلت إلى عنوان الزبون', color: 'bg-purple-100 text-purple-800' };
      case 'DELIVERED':
        return { text: 'تم التوصيل بنجاح', color: 'bg-gray-100 text-gray-700' };
      default:
        return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-5 transition-all">
      {/* Target Header Info */}
      <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isBeforePickup
                ? 'bg-amber-100 text-amber-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isBeforePickup ? <Store className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 block mb-0.5">
              {isBeforePickup ? 'الاستلام من المتجر:' : 'التوصيل إلى الزبون:'}
            </span>
            <h4 className="text-base font-extrabold text-[#1A1A1B] leading-snug">
              {isBeforePickup ? order.storeName : order.customerName}
            </h4>
            <p className="text-xs text-gray-600 mt-1 line-clamp-1">
              {isBeforePickup
                ? order.storeAddress
                : order.deliveryAddress?.formattedAddress ||
                  `${order.deliveryAddress?.street || ''}، ${order.deliveryAddress?.commune || ''}`}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${statusBadge.color}`}
        >
          {statusBadge.text}
        </span>
      </div>

      {/* Metrics Row: Distance & ETA */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#FF6600] flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 block">المسافة المتبقية</span>
            <span className="text-sm font-extrabold text-[#1A1A1B]">
              {order.routeDistanceFormatted || '1.6 كم'}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-3 flex items-center gap-3 border border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-gray-500 block">الوقت المتوقع</span>
            <span className="text-sm font-extrabold text-[#1A1A1B]">
              {order.estimatedDurationFormatted || '6 دقائق'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2.5">
        {/* Primary Progressive Action Button */}
        {order.status === 'COURIER_ASSIGNED' && (
          <button
            type="button"
            onClick={() => onUpdateStatus('READY_FOR_PICKUP', 'وصل الكابتن إلى المتجر')}
            className="w-full py-3.5 px-5 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Store className="w-5 h-5" />
            <span>وصلت إلى المتجر</span>
          </button>
        )}

        {(order.status === 'READY_FOR_PICKUP' || order.status === 'PREPARING') && (
          <button
            type="button"
            onClick={() => onUpdateStatus('PICKED_UP', 'استلم الكابتن الطلب وهو جاهز للانطلاق')}
            className="w-full py-3.5 px-5 bg-[#FF6600] hover:bg-[#E55C00] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>تم استلام الطلب من المتجر (PICKED UP)</span>
          </button>
        )}

        {order.status === 'PICKED_UP' && (
          <button
            type="button"
            onClick={() => onUpdateStatus('ON_THE_WAY', 'الكابتن في الطريق إلى الزبون')}
            className="w-full py-3.5 px-5 bg-[#FF6600] hover:bg-[#E55C00] text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Navigation className="w-5 h-5" />
            <span>الانطلاق إلى الزبون (في الطريق)</span>
          </button>
        )}

        {order.status === 'ON_THE_WAY' && (
          <button
            type="button"
            onClick={() => onUpdateStatus('ARRIVED', 'وصل الكابتن إلى عنوان الزبون')}
            className="w-full py-3.5 px-5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            <span>وصلت إلى عنوان الزبون (ARRIVED)</span>
          </button>
        )}

        {order.status === 'ARRIVED' && (
          <button
            type="button"
            onClick={onOpenOtpModal}
            className="w-full py-3.5 px-5 bg-[#059669] hover:bg-[#047857] text-white rounded-2xl font-extrabold text-base shadow-md hover:shadow-lg transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>إدخال رمز الاستلام وتأكيد التسليم (OTP)</span>
          </button>
        )}

        {/* Secondary Auxiliary Tools (Navigation & Call) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* Open Navigation Button */}
          <a
            href={externalNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition border border-gray-200"
          >
            <Navigation className="w-4 h-4 text-[#FF6600]" />
            <span>فتح الملاحة الخارجية</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          {/* Call Customer/Store Button */}
          <a
            href={`tel:${isBeforePickup ? order.storePhone : order.customerPhone}`}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition border border-gray-200"
          >
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>{isBeforePickup ? 'اتصل بالمتجر' : 'اتصل بالزبون'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};
