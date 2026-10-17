import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Order, OrderStatus } from '../../types';
import { useRouter, Link } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { OrderStatusBadge } from '../../components/common/Badge';
import { DeliveryTrackingMap } from '../../components/map/DeliveryTrackingMap';
import { OrderReviewModal } from '../../components/reviews/OrderReviewModal';
import {
  Clock,
  MapPin,
  Phone,
  Store,
  Bike,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Navigation,
  Map,
  KeyRound,
  Compass,
  Star,
  RotateCcw,
} from 'lucide-react';

export const OrderDetailView: React.FC = () => {
  const { params, navigate } = useRouter();
  const orderId = params.orderId;
  const { currentUser } = useAuth();
  const { addToCart, clearCart, store: cartStore } = useCart();
  const cartStoreId = cartStore?.id;
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reorderWarning, setReorderWarning] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    if (orderId) {
      setOrder(dbService.getOrderById(orderId));
    }

    const unsubscribe = dbService.subscribe(() => {
      if (orderId) {
        setOrder(dbService.getOrderById(orderId));
      }
    });
    return () => unsubscribe();
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <AlertCircle className="w-12 h-12 text-neutral-400 mb-3" />
        <h2 className="text-xl font-bold text-neutral-900 mb-2">الطلب غير موجود</h2>
        <p className="text-neutral-500 text-sm mb-6">تأكد من رقم الطلب أو تصفح طلباتك السابقة</p>
        <button
          onClick={() => navigate('/orders')}
          className="px-6 py-2.5 bg-[#FF6600] text-white text-xs font-bold rounded-xl"
        >
          العودة لقائمة الطلبات
        </button>
      </div>
    );
  }

  // All 10 Ordered pipeline steps (excluding CANCELLED which is handled as alternate terminal state)
  const orderedSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'PENDING', label: 'قيد الانتظار', desc: 'بانتظار مراجعة المتجر للطلب' },
    { key: 'ACCEPTED', label: 'تم القبول', desc: 'وافق المتجر على الطلب' },
    { key: 'PREPARING', label: 'قيد التحضير', desc: 'يجري تحضير وتجهيز الوجبات' },
    { key: 'READY_FOR_PICKUP', label: 'جاهز للاستلام', desc: 'الطلب معبأ وفي انتظار الكابتن' },
    { key: 'COURIER_ASSIGNED', label: 'تم تعيين الموصّل', desc: 'قبل الكابتن مهمة التوصيل' },
    { key: 'PICKED_UP', label: 'تم الاستلام', desc: 'استلم الموصّل الطلب من المحل' },
    { key: 'ON_THE_WAY', label: 'في الطريق إليك', desc: 'الكابتن يتجه نحو عنوانك' },
    { key: 'ARRIVED', label: 'الموصّل عند الباب', desc: 'وصل الكابتن إلى موقع التوصيل' },
    { key: 'DELIVERED', label: 'تم التسليم بنجاح', desc: 'تم تسليم الطلب واستلام الدفع' },
  ];

  const currentStepIndex = orderedSteps.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';

  const handleCancelOrder = () => {
    dbService.updateOrderStatus(
      order.id,
      'CANCELLED',
      currentUser?.id || 'client',
      'CUSTOMER',
      'قام الزبون بإلغاء الطلب وهو في حالة الانتظار'
    );
    setShowCancelConfirm(false);
  };

  const handleReorder = () => {
    if (!order) return;
    const store = dbService.getStoreById(order.storeId);
    if (!store || !store.isOpen) {
      setReorderWarning(`عذراً، متجر "${order.storeName}" مغلق حالياً.`);
      setTimeout(() => setReorderWarning(null), 4000);
      return;
    }

    const availableProducts = dbService.getProducts(order.storeId);
    const addedItems: string[] = [];
    const unavailableItems: string[] = [];
    const priceChangedItems: string[] = [];

    if (cartStoreId && cartStoreId !== order.storeId) {
      clearCart();
    }

    for (const item of order.items) {
      const currentProduct = availableProducts.find((p) => p.id === item.productId);

      if (!currentProduct || !currentProduct.isAvailable || currentProduct.stockQuantity <= 0) {
        unavailableItems.push(item.productName);
        continue;
      }

      if (currentProduct.price !== item.price) {
        priceChangedItems.push(
          `${currentProduct.name} (السعر: ${currentProduct.price} دج)`
        );
      }

      addToCart(currentProduct, item.quantity);
      addedItems.push(currentProduct.name);
    }

    if (addedItems.length === 0) {
      setReorderWarning('عذراً، منتجات هذا الطلب غير متوفرة حالياً في المتجر.');
      setTimeout(() => setReorderWarning(null), 4000);
      return;
    }

    let warningMsg = '';
    if (unavailableItems.length > 0) {
      warningMsg += `تم استثناء: ${unavailableItems.join('، ')} لعدم توفرها. `;
    }
    if (priceChangedItems.length > 0) {
      warningMsg += `تغيرت أسعار بعض المنتجات: ${priceChangedItems.join('، ')}. `;
    }

    if (warningMsg) {
      setReorderWarning(warningMsg);
      setTimeout(() => {
        setReorderWarning(null);
        navigate('/cart');
      }, 3000);
    } else {
      navigate('/cart');
    }
  };

  const existingReview = order ? dbService.getOrderReview(order.id) : undefined;

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Warning toast */}
      {reorderWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold max-w-md animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{reorderWarning}</span>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <OrderReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          order={order}
          onReviewSubmitted={() => setIsReviewModalOpen(false)}
        />
      )}

      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-600 hover:text-[#FF6600] transition"
        >
          <ChevronRight className="w-4 h-4" />
          <span>العودة لجميع الطلبات</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-neutral-900">الطلب #{order.orderNumber || order.id}</h1>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            تم الإنشاء بتاريخ: {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-DZ') : 'الآن'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleReorder}
            className="px-4 py-2 bg-orange-500/12 hover:bg-orange-500/20 text-[#FF6600] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-orange-500/20 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة الطلب</span>
          </button>

          {order.status === 'PENDING' && (
            showCancelConfirm ? (
              <div className="flex items-center gap-1.5 bg-rose-500/10 backdrop-blur-xs p-1.5 rounded-xl border border-rose-300/40">
                <span className="text-[11px] text-rose-700 font-bold px-1">تأكيد الإلغاء؟</span>
                <button
                  onClick={handleCancelOrder}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition cursor-pointer active:scale-95"
                >
                  نعم، إلغاء
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-2.5 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[11px] font-bold rounded-lg border border-gray-200 transition cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50/70 text-xs font-bold rounded-xl transition cursor-pointer active:scale-95"
              >
                إلغاء الطلب
              </button>
            )
          )}
        </div>
      </div>

      {/* DELIVERED State Review Card */}
      {order.status === 'DELIVERED' && (
        <div className="mb-8 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-900 rounded-3xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-emerald-950">
                بالصحة والعافية! تم تسليم طلبك بنجاح
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                {existingReview
                  ? `شكراً لمشاركتنا تقييمك (${existingReview.storeRating}/5 للمتجر)`
                  : 'رأيك يسهم في تطوير جودة خدمات المطاعم ومناديب التوصيل'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{existingReview ? 'تعديل أو عرض التقييم' : 'تقييم تجربة الطلب والتوصيل'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Customer Delivery OTP Security Card (Visible when courier assigned or in delivery) */}
      {(order.status === 'COURIER_ASSIGNED' ||
        order.status === 'READY_FOR_PICKUP' ||
        order.status === 'PICKED_UP' ||
        order.status === 'ON_THE_WAY' ||
        order.status === 'ARRIVED') && (
        <div className="mb-8 p-5 bg-gradient-to-r from-orange-500 to-[#FF6600] text-white rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="text-xs text-orange-100 font-bold block">رمز الأمان لتأكيد الاستلام (OTP)</span>
              <h3 className="text-base font-extrabold text-white">
                أعطِ هذا الرمز للكابتن عند وصوله واستلامك للطلب
              </h3>
              <p className="text-xs text-orange-100 mt-0.5">
                لن يتمكن الكابتن من إنهاء الطلب حتى يدخل هذا الرمز السري
              </p>
            </div>
          </div>

          <div className="bg-white text-[#FF6600] px-6 py-2.5 rounded-2xl shadow-inner text-center font-mono font-black text-3xl tracking-widest shrink-0">
            {order.deliveryOtp || '4821'}
          </div>
        </div>
      )}

      {/* Live Route Navigation Map for Customer (When courier assigned through ARRIVED / DELIVERED) */}
      {(order.status === 'COURIER_ASSIGNED' ||
        order.status === 'READY_FOR_PICKUP' ||
        order.status === 'PICKED_UP' ||
        order.status === 'ON_THE_WAY' ||
        order.status === 'ARRIVED' ||
        order.status === 'DELIVERED') && (
        <div className="bg-white p-5 rounded-3xl border border-neutral-200/80 shadow-md mb-8 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#FF6600]" />
                <span>تتبع الكابتن المباشر ومسار الطريق الفعلي</span>
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              تحديث مباشر لموقع الكابتن عبر شبكة الطرق (OSRM)
            </span>
          </div>

          <DeliveryTrackingMap
            order={order}
            isCourierView={false}
            className="h-[420px] w-full"
            enableSimulation={false}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Timeline & History Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline Visualizer */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
            <h2 className="text-base font-bold text-neutral-900 mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6600]" />
              <span>مراحل مسار وتوصيل الطلب (10 حالات)</span>
            </h2>

            {isCancelled ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">تم إلغاء هذا الطلب</h4>
                  <p className="text-xs text-rose-600 mt-0.5">
                    الطلب ملغي ولم يعد قيد المعالجة. يمكنك إعادة الطلب في أي وقت.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-2 pr-2">
                <div className="space-y-6 relative before:absolute before:inset-0 before:right-3.5 before:w-0.5 before:bg-neutral-200">
                  {orderedSteps.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors ${
                            isCurrent
                              ? 'bg-[#FF6600] text-white ring-4 ring-orange-100'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {isDone && !isCurrent ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <span className="text-[11px] font-black">{idx + 1}</span>
                          )}
                        </div>

                        <div className="flex-1 -mt-0.5">
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-xs font-bold ${
                                isCurrent
                                  ? 'text-[#FF6600]'
                                  : isDone
                                  ? 'text-neutral-900'
                                  : 'text-neutral-400'
                              }`}
                            >
                              {step.label}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-100 text-[#FF6600] animate-pulse">
                                الحالة الحالية
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{step.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Audit Trail History Logs */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
              <FileText className="w-4 h-4 text-neutral-500" />
              <span>سجل التدقيق والتحديثات الرسمية (Audit Trail)</span>
            </h2>

            <div className="space-y-3">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="p-3 bg-neutral-50 rounded-xl text-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{h.status}</span>
                      <span className="px-2 py-0.5 rounded bg-white text-neutral-600 font-medium text-[10px] border border-neutral-200">
                        بواسطة: {h.actorRole}
                      </span>
                    </div>
                    {h.note && <p className="text-neutral-600 text-[11px]">{h.note}</p>}
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 font-medium">
                    {new Date(h.timestamp).toLocaleTimeString('ar-DZ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Details & Courier Card */}
        <div className="space-y-6">
          {/* Courier Card (if assigned) */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Bike className="w-4 h-4 text-[#FF6600]" />
              <span>كابتن التوصيل</span>
            </h3>

            {order.courierName ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-[#FF6600] flex items-center justify-center font-bold text-base">
                    {order.courierName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">{order.courierName}</h4>
                    <p className="text-xs text-neutral-500">كابتن معتمد - دراجة نارية</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <span className="text-neutral-500">رقم الهاتف:</span>
                  <a
                    href={`tel:${order.courierPhone}`}
                    className="font-bold text-[#FF6600] hover:underline flex items-center gap-1"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{order.courierPhone}</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 rounded-xl text-center text-xs text-neutral-500">
                جاري تعيين وتكليف أقرب كابتن توصيل متاح في منطقتك
              </div>
            )}
          </div>

          {/* Store Info */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600" />
              <span>المتجر المصدر</span>
            </h3>
            <p className="font-bold text-neutral-800 text-sm">{order.storeName}</p>
            <p className="text-neutral-500">{order.storeAddress}</p>
            <p className="text-neutral-500">هاتف: {order.storePhone}</p>
          </div>

          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-2 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>عنوان التوصيل لباب الدار</span>
            </h3>
            <p className="font-bold text-neutral-800">
              {order.deliveryAddress.commune}، {order.deliveryAddress.wilaya}
            </p>
            <p className="text-neutral-600">{order.deliveryAddress.street}</p>
            {(order.customerLatitude || order.deliveryAddress.latitude) && (
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded">
                  {(order.customerLatitude || order.deliveryAddress.latitude)?.toFixed(4)}° N,{' '}
                  {(order.customerLongitude || order.deliveryAddress.longitude)?.toFixed(4)}° E
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${order.customerLatitude || order.deliveryAddress.latitude}&mlon=${order.customerLongitude || order.deliveryAddress.longitude}#map=16/${order.customerLatitude || order.deliveryAddress.latitude}/${order.customerLongitude || order.deliveryAddress.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-[#FF6600] hover:underline flex items-center gap-1"
                >
                  <Map className="w-3 h-3" />
                  <span>معاينة على الخريطة</span>
                </a>
              </div>
            )}
            {order.deliveryAddress.instructions && (
              <p className="text-amber-800 bg-amber-50 p-2 rounded-lg text-[11px] mt-2">
                ملاحظة للموصّل: {order.deliveryAddress.instructions}
              </p>
            )}
          </div>

          {/* Items & Payment Receipt */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-neutral-900 border-b border-neutral-100 pb-2">
              تفاصيل الفاتورة
            </h3>

            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-neutral-700">
                  <span>
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-bold text-neutral-900">{item.price * item.quantity} دج</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-neutral-600">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold">{order.subtotal} دج</span>
              </div>
              <div className="flex justify-between">
                <span>رسوم التوصيل:</span>
                <span className="font-bold">{order.deliveryFee} دج</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>الخصم المطبق:</span>
                  <span>-{order.discount} دج</span>
                </div>
              )}
              <div className="pt-2 border-t border-neutral-100 flex justify-between text-sm font-black text-neutral-900">
                <span>المجموع الإجمالي:</span>
                <span className="text-[#FF6600] text-base">{order.total} دج</span>
              </div>
              <div className="text-[11px] text-neutral-400 pt-1">
                طريقة الدفع: {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'دفع عند الاستلام نقداً' : 'البطاقة الذهبية'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
