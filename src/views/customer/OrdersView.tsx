import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Order, OrderReview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRouter, Link } from '../../router/Router';
import { OrderStatusBadge } from '../../components/common/Badge';
import { OrderReviewModal } from '../../components/reviews/OrderReviewModal';
import {
  Package,
  Clock,
  ArrowLeft,
  ChevronLeft,
  Store,
  RotateCcw,
  Star,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToCart, clearCart, store: cartStore } = useCart();
  const cartStoreId = cartStore?.id;
  const { navigate } = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'DELIVERED' | 'CANCELLED'>('ALL');
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [reorderWarning, setReorderWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = () => {
      const userOrders = dbService.getOrders({
        customerId: currentUser?.id,
      });
      if (userOrders.length === 0) {
        setOrders(dbService.getOrders());
      } else {
        setOrders(userOrders);
      }
    };

    fetchOrders();
    const unsubscribe = dbService.subscribe(fetchOrders);
    return () => unsubscribe();
  }, [currentUser]);

  const activeStatuses = [
    'PENDING',
    'ACCEPTED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'COURIER_ASSIGNED',
    'PICKED_UP',
    'ON_THE_WAY',
    'ARRIVED',
  ];

  const filteredOrders = orders.filter((o) => {
    if (filterTab === 'ACTIVE') return activeStatuses.includes(o.status);
    if (filterTab === 'DELIVERED') return o.status === 'DELIVERED';
    if (filterTab === 'CANCELLED') return o.status === 'CANCELLED';
    return true;
  });

  const handleReorder = (order: Order) => {
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

    // Clear cart if reordering from a different store
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
          `${currentProduct.name} (السعر الحالي: ${currentProduct.price} دج بدل ${item.price} دج)`
        );
      }

      addToCart(currentProduct, item.quantity);
      addedItems.push(currentProduct.name);
    }

    if (addedItems.length === 0) {
      setReorderWarning('عذراً، جميع منتجات هذا الطلب غير متوفرة حالياً.');
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
      }, 3500);
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Reorder Warnings */}
      {reorderWarning && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-amber-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold max-w-md animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{reorderWarning}</span>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <OrderReviewModal
          isOpen={!!reviewModalOrder}
          onClose={() => setReviewModalOrder(null)}
          order={reviewModalOrder}
          onReviewSubmitted={() => {
            setReviewModalOrder(null);
          }}
        />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1B]">طلباتي وتتبّع التوصيل</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            تابع حالة وجباتك وطلباتك الجارية والسابقة لحظة بلحظة
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl w-fit overflow-x-auto text-xs font-bold border border-white/80 shadow-xs">
          <button
            type="button"
            onClick={() => setFilterTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'ALL'
                ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الكل ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'ACTIVE'
                ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الجارية ({orders.filter((o) => activeStatuses.includes(o.status)).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('DELIVERED')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'DELIVERED'
                ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            المستلمة ({orders.filter((o) => o.status === 'DELIVERED').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('CANCELLED')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterTab === 'CANCELLED'
                ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الملغاة ({orders.filter((o) => o.status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] max-w-md mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/12 text-[#FF6600] flex items-center justify-center mx-auto mb-4 border border-orange-500/20">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1B] mb-1">لا توجد طلبات في هذا القسم</h3>
          <p className="text-gray-500 text-xs mb-6">
            سجل طلبك الأول من أي متجر وسيظهر هنا مع خريطة وتتبع الكابتن المباشر
          </p>
          <Link
            to="/stores"
            className="px-6 py-3 bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white text-xs font-bold rounded-xl hover:from-[#d84e06] hover:to-[#ea6c0e] transition inline-flex items-center gap-2 shadow-lg shadow-orange-500/25 active:scale-95 border border-white/20"
          >
            <span>تصفح المتاجر</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredOrders.map((order) => {
            const isDelivered = order.status === 'DELIVERED';
            const existingReview = dbService.getOrderReview(order.id);

            return (
              <div
                key={order.id}
                className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:shadow-lg hover:border-orange-500/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/12 text-[#FF6600] flex items-center justify-center font-bold border border-orange-500/20 shadow-xs">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#1A1A1B]">{order.storeName}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        <span className="font-mono">#{order.orderNumber || order.id}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(order.createdAt).toLocaleTimeString('ar-DZ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="text-xs text-gray-600 space-y-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {item.quantity}x {item.productName}
                      </span>
                      <span className="font-semibold text-gray-800 font-mono">
                        {item.price * item.quantity} دج
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer row with Action Buttons */}
                <div className="pt-3 border-t border-gray-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    الإجمالي: <span className="text-base font-black text-[#FF6600] font-mono mr-1">{order.total} دج</span>
                    <span className="text-[11px] text-gray-400 mr-2">
                      ({order.paymentMethod === 'CASH_ON_DELIVERY' ? 'دفع عند الاستلام' : 'بطاقة ذهبية'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
                    {/* Reorder Button */}
                    <button
                      type="button"
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-2 bg-orange-500/12 hover:bg-orange-500/20 text-[#FF6600] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border border-orange-500/20 active:scale-95"
                      title="إضافة عناصر هذا الطلب إلى السلة مجدداً"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة الطلب</span>
                    </button>

                    {/* Review Button for Delivered Orders */}
                    {isDelivered && (
                      <button
                        type="button"
                        onClick={() => setReviewModalOrder(order)}
                        className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer border ${
                          existingReview
                            ? 'bg-emerald-500/12 text-emerald-800 border-emerald-300/40 hover:bg-emerald-500/20'
                            : 'bg-amber-500/12 text-amber-800 border-amber-300/40 hover:bg-amber-500/20'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${existingReview ? 'fill-emerald-500' : 'fill-amber-400'}`} />
                        <span>{existingReview ? 'تم التقييم' : 'تقييم الطلب'}</span>
                      </button>
                    )}

                    {/* Tracking details button */}
                    <Link
                      to={`/orders/${order.id}`}
                      className="px-4 py-2 bg-[#18181B] hover:bg-black text-white text-xs font-bold rounded-xl transition flex items-center gap-2 mr-auto sm:mr-0 shadow-xs border border-white/10 active:scale-95"
                    >
                      <span>تتبّع المسار والتفاصيل</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
