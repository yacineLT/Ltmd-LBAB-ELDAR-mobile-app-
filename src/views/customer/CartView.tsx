import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useRouter, Link } from '../../router/Router';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowLeft,
  Store,
  Clock,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';

export const CartView: React.FC = () => {
  const {
    items,
    store,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryFee,
    discount,
    promoCode,
    applyPromo,
    total,
  } = useCart();
  const { navigate } = useRouter();

  const [promoInput, setPromoInput] = useState('');
  const [promoStatus, setPromoStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromo(promoInput);
    setPromoStatus(res);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto" dir="rtl">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] w-full flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-orange-500/12 text-[#FF6600] flex items-center justify-center mb-4 border border-orange-500/20">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-black text-[#1A1A1B] mb-2">سلة التسوق فارغة</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            لم تقم بإضافة أي وجبة أو منتج إلى سلتك بعد. تصفح المتاجر والمطاعم واختر ما يروق لك!
          </p>
          <Link
            to="/stores"
            className="w-full py-3.5 bg-gradient-to-tr from-[#EA580C] to-[#FF7711] hover:from-[#d84e06] hover:to-[#ea6c0e] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 border border-white/20"
          >
            <span>تصفح المتاجر الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1B]">سلة المشتريات</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            مراجعة الطلب من متجر: <span className="font-bold text-[#1A1A1B]">{store?.name}</span>
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 transition cursor-pointer active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>إفراغ السلة</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity, notes }) => (
            <div
              key={product.id}
              className="bg-white/80 backdrop-blur-xl p-4 sm:p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)] flex items-center gap-4 transition hover:border-orange-500/30"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 shadow-xs"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#1A1A1B] line-clamp-1">{product.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{product.category}</p>
                {notes && (
                  <p className="text-[11px] text-amber-800 bg-amber-500/12 px-2.5 py-0.5 rounded-lg mt-1 line-clamp-1 inline-block border border-amber-300/30 font-medium">
                    ملاحظة: {notes}
                  </p>
                )}
                <div className="text-sm font-black text-[#FF6600] mt-1.5 font-mono">
                  {product.price * quantity} دج
                  <span className="text-[10px] text-gray-400 font-normal mr-1.5">
                    ({product.price} دج للقطعة)
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-gray-400 hover:text-rose-600 p-1.5 transition rounded-lg hover:bg-rose-50"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 bg-white/70 backdrop-blur-md p-1 rounded-2xl border border-white/90 shadow-xs">
                  <button
                    onClick={() => updateQuantity(product.id, -1)}
                    className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#1A1A1B] hover:bg-gray-100 transition active:scale-90"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center font-bold text-xs text-[#1A1A1B] font-mono">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, 1)}
                    className="w-7 h-7 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#1A1A1B] hover:bg-gray-100 transition active:scale-90"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add more items link */}
          <Link
            to={store ? `/store/${store.id}` : '/stores'}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6600] hover:underline pt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة المزيد من الوجبات من هذا المتجر</span>
          </Link>
        </div>

        {/* Order Summary & Checkout Card */}
        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h3 className="font-bold text-base text-[#1A1A1B] border-b border-gray-100/80 pb-3">
              ملخص الحساب
            </h3>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="رمز القسيمة (مثال: MARHABA)"
                  className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-[#1A1A1B] focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] placeholder-gray-400 shadow-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#18181B] text-white font-bold text-xs rounded-2xl hover:bg-black transition shrink-0 active:scale-95 border border-white/10"
                >
                  تطبيق
                </button>
              </div>
              {promoStatus && (
                <p
                  className={`text-[11px] font-semibold ${
                    promoStatus.success ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {promoStatus.message}
                </p>
              )}
            </form>

            {/* Minimum Order Threshold Check & Progress */}
            {store?.minimumOrder && (
              <div className="space-y-1.5">
                {subtotal < store.minimumOrder ? (
                  <div className="p-3 bg-amber-500/10 backdrop-blur-xs rounded-2xl border border-amber-300/40 space-y-2 text-xs text-amber-900">
                    <div className="flex justify-between font-bold text-[11px]">
                      <span>الحد الأدنى للطلب: <strong className="font-mono">{store.minimumOrder} دج</strong></span>
                      <span className="text-amber-700">متبقي: <strong className="font-mono">{store.minimumOrder - subtotal} دج</strong></span>
                    </div>
                    <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#FF6600] h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / store.minimumOrder) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-amber-800">
                      يُرجى إضافة المزيد من الوجبات بقيمة <strong className="font-mono">{store.minimumOrder - subtotal} دج</strong> لتتمكن من متابعة الطلب.
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 bg-emerald-500/10 backdrop-blur-xs rounded-2xl border border-emerald-300/40 flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>تم استيفاء الحد الأدنى للطلب من المتجر ({store.minimumOrder} دج)</span>
                  </div>
                )}
              </div>
            )}

            {/* Financial Rows */}
            <div className="space-y-2.5 text-xs text-gray-600 pt-2 border-t border-gray-100/80">
              <div className="flex justify-between">
                <span>المجموع الفرعي:</span>
                <span className="font-bold text-[#1A1A1B] font-mono">{subtotal} دج</span>
              </div>
              <div className="flex justify-between">
                <span>رسوم التوصيل المقدرة:</span>
                <span className="font-bold text-[#1A1A1B] font-mono">{deliveryFee} دج</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>الخصم الترويجي ({promoCode}):</span>
                  <span className="font-mono">-{discount} دج</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-[#1A1A1B] pt-3 border-t border-gray-100/80">
                <span>المجموع الإجمالي:</span>
                <span className="text-[#FF6600] text-base font-mono">{total} دج</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => navigate('/checkout')}
              disabled={!!(store?.minimumOrder && subtotal < store.minimumOrder)}
              className="w-full py-3.5 bg-gradient-to-tr from-[#EA580C] to-[#FF7711] hover:from-[#d84e06] hover:to-[#ea6c0e] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-95 border border-white/20"
            >
              <span>{store?.minimumOrder && subtotal < store.minimumOrder ? 'أكمل الحد الأدنى للمتابعة' : 'متابعة إتمام الطلب'}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Guarantee info */}
          <div className="bg-white/70 backdrop-blur-xl border border-white/80 p-4 rounded-3xl space-y-2 text-xs text-gray-600 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 font-bold text-[#1A1A1B]">
              <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
              <span>ضمان لباب الدار للتوصيل الآمن</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              الدفع نقداً عند استلام الوجبة والتحقق من التغليف. كباتن معتمدون وسرعة قياسية.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
