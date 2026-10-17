import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { dbService } from '../../services/store';
import { useRouter } from '../../router/Router';
import { Order, OrderItem } from '../../types';
import {
  MapPin,
  Map,
  Phone,
  User,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

export const CheckoutView: React.FC = () => {
  const { items, store, subtotal, deliveryFee, discount, total, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { location, openMap } = useLocation();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState(currentUser?.fullName || 'أمين بن علي');
  const [phone, setPhone] = useState(currentUser?.phone || '0560112233');
  const [wilaya, setWilaya] = useState(store?.wilaya || 'الجزائر العاصمة');
  const [commune, setCommune] = useState(store?.commune || 'سيدي امحمد');
  const [street, setStreet] = useState(location?.address || 'شارع ديدوش مراد، عمارة 12');
  const [instructions, setInstructions] = useState('الاتصال بي عند الوصول أمام الباب');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CIB_EDAHABIA'>('CASH_ON_DELIVERY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with map location selection if available
  useEffect(() => {
    if (location) {
      if (location.address) {
        setStreet(location.address);
      }
      if (location.city) {
        // Match known wilayas
        const known = ['الجزائر العاصمة', 'البليدة', 'وهران', 'قسنطينة', 'سطيف'];
        const match = known.find((k) => location.city.includes(k) || k.includes(location.city));
        if (match) setWilaya(match);
      }
      if (location.district) {
        setCommune(location.district);
      }
    }
  }, [location]);

  useEffect(() => {
    if (items.length === 0 || !store) {
      navigate('/cart');
    }
  }, [items.length, store, navigate]);

  if (items.length === 0 || !store) {
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة (الاسم، الهاتف، والعنوان التفصيلي)');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate real short latency
      await new Promise((r) => setTimeout(r, 600));

      // Financial server-side verification: recalculate subtotal from database product prices
      const verifiedSubtotal = items.reduce((sum, item) => {
        const prod = dbService.getProductById(item.product.id);
        const unitPrice = prod ? prod.price : item.product.price;
        return sum + unitPrice * item.quantity;
      }, 0);

      const verifiedDeliveryFee = store.deliveryFee;
      const verifiedTotal = Math.max(0, verifiedSubtotal + verifiedDeliveryFee - discount);

      const orderNumber = Math.floor(10000 + Math.random() * 90000);
      const orderId = `order_${orderNumber}`;
      const customerId = currentUser?.id || 'user_guest_' + Math.random().toString(36).substring(2, 7);

      const orderItems: OrderItem[] = items.map((i) => {
        const prod = dbService.getProductById(i.product.id);
        return {
          productId: i.product.id,
          productName: prod ? prod.name : i.product.name,
          price: prod ? prod.price : i.product.price,
          quantity: i.quantity,
          imageUrl: prod ? prod.imageUrl : i.product.imageUrl,
          notes: i.notes,
        };
      });

      const newOrder: Order = {
        id: orderId,
        orderNumber: `#LBD-${orderNumber}`,
        customerId,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        storeId: store.id,
        storeName: store.name,
        storePhone: store.phone,
        storeAddress: `${store.address}، ${store.commune}`,
        items: orderItems,
        subtotal: verifiedSubtotal,
        deliveryFee: verifiedDeliveryFee,
        discount,
        total: verifiedTotal,
        status: 'PENDING',
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            actorId: customerId,
            actorRole: 'CUSTOMER',
            note: 'تم إرسال الطلب من الزبون وهو بانتظار قبول المتجر',
          },
        ],
        deliveryAddress: {
          wilaya,
          commune,
          street,
          instructions,
          latitude: location?.latitude,
          longitude: location?.longitude,
          formattedAddress: location?.address || `${street}، ${commune}، ${wilaya}`,
        },
        customerLatitude: location?.latitude,
        customerLongitude: location?.longitude,
        paymentMethod,
        paymentStatus: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      dbService.createOrder(newOrder);
      clearCart();
      navigate(`/orders/${orderId}`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ الطلب، يرجى المحاولة ثانية');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">إتمام الطلب والتوصيل</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            حدد معلومات التوصيل في الجزائر وطريقة الدفع المفضلة
          </p>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          {/* Section 1: Customer Contact */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-gray-100/80 pb-3">
              <User className="w-4 h-4 text-[#FF6600]" />
              <span>معلومات المستلم</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  الاسم الكامل: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: أمين بن علي"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  رقم الهاتف الجزائري: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="مثال: 0550 12 34 56"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: موقع التوصيل (Interactive Map Location) */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100/80 pb-3">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF6600]" />
                <span>موقع التوصيل</span>
              </h2>
              <button
                type="button"
                onClick={openMap}
                className="text-xs font-bold text-[#FF6600] hover:text-[#e65c00] flex items-center gap-1.5 hover:underline px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/15 border border-orange-500/20 transition cursor-pointer active:scale-95"
              >
                <Map className="w-3.5 h-3.5" />
                <span>تغيير الموقع</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/10 backdrop-blur-xs border border-orange-300/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/20">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-neutral-900">
                    {location?.address || street || 'تم اختيار العنوان الافتراضي'}
                  </div>
                  {location?.latitude && location?.longitude ? (
                    <div className="text-[11px] text-neutral-600 mt-1 flex flex-wrap items-center gap-2">
                      <span className="font-mono bg-white/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg border border-white/90 text-neutral-800 shadow-xs">
                        {location.latitude.toFixed(4)}° N, {location.longitude.toFixed(4)}° E
                      </span>
                      <span>
                        {location.city} {location.district ? `• ${location.district}` : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-neutral-500 mt-0.5">
                      انقر على تغيير الموقع لتحديد مكانك بدقة على خريطة الجزائر
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={openMap}
                className="shrink-0 self-start sm:self-center px-4 py-2 bg-white/80 backdrop-blur-md border border-white/90 hover:border-[#FF6600] text-xs font-bold text-neutral-800 hover:text-[#FF6600] rounded-xl shadow-xs transition cursor-pointer active:scale-95"
              >
                تغيير الموقع
              </button>
            </div>
          </div>

          {/* Section 3: Algerian Delivery Address Details */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-gray-100/80 pb-3">
              <MapPin className="w-4 h-4 text-[#FF6600]" />
              <span>تفاصيل العنوان لباب الدار</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">الولاية:</label>
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs cursor-pointer"
                >
                  <option value="الجزائر العاصمة">16 - الجزائر العاصمة</option>
                  <option value="البليدة">09 - البليدة</option>
                  <option value="وهران">31 - وهران</option>
                  <option value="قسنطينة">25 - قسنطينة</option>
                  <option value="سطيف">19 - سطيف</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">البلدية / الحي:</label>
                <input
                  type="text"
                  required
                  value={commune}
                  onChange={(e) => setCommune(e.target.value)}
                  placeholder="مثال: سيدي امحمد، حيدرة، باب الزوار..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  العنوان بالتفصيل (الشارع، العمارة، رقم الشقة): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="مثال: شارع ديدوش مراد، عمارة 14، الطابق الثاني شقة 06"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  تعليمات إضافية للموصّل:
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="مثال: مقابل المسجد، بجانب الصيدلية، رنين الجرس مرتين..."
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-neutral-900 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Payment Method */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2 border-b border-gray-100/80 pb-3">
              <Banknote className="w-4 h-4 text-[#FF6600]" />
              <span>طريقة الدفع</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-[#FF6600] bg-orange-500/10 text-neutral-900 shadow-xs'
                    : 'border-white/90 bg-white/60 hover:bg-white/90 text-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CASH_ON_DELIVERY"
                  checked={paymentMethod === 'CASH_ON_DELIVERY'}
                  onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                  className="text-[#FF6600] focus:ring-[#FF6600]"
                />
                <Banknote className="w-5 h-5 text-[#FF6600]" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">الدفع نقداً عند الاستلام</div>
                  <div className="text-[11px] text-neutral-500">ادفع للكابتن بعد استلام طلبك</div>
                </div>
              </label>

              <label
                className={`p-4 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                  paymentMethod === 'CIB_EDAHABIA'
                    ? 'border-[#FF6600] bg-orange-500/10 text-neutral-900 shadow-xs'
                    : 'border-white/90 bg-white/60 hover:bg-white/90 text-neutral-700'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CIB_EDAHABIA"
                  checked={paymentMethod === 'CIB_EDAHABIA'}
                  onChange={() => setPaymentMethod('CIB_EDAHABIA')}
                  className="text-[#FF6600] focus:ring-[#FF6600]"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-bold text-xs sm:text-sm">البطاقة الذهبية / CIB</div>
                  <div className="text-[11px] text-neutral-500">دفع إلكتروني فوري عبر بريد الجزائر</div>
                </div>
              </label>
            </div>
          </div>

          {/* Section 5: Final Total & Place Order */}
          <div className="bg-[#18181B]/95 backdrop-blur-2xl text-white p-6 rounded-3xl shadow-2xl border border-white/10 space-y-4">
            <div className="flex justify-between items-center text-xs text-neutral-300">
              <span>عدد الوجبات / المنتجات:</span>
              <span className="font-bold">{items.reduce((s, i) => s + i.quantity, 0)} قطعة</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-300">
              <span>المجموع الفرعي:</span>
              <span className="font-bold font-mono">{subtotal} دج</span>
            </div>
            <div className="flex justify-between items-center text-xs text-neutral-300">
              <span>رسوم التوصيل:</span>
              <span className="font-bold font-mono">{deliveryFee} دج</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between items-center text-xs text-emerald-400">
                <span>الخصم المطبق:</span>
                <span className="font-bold font-mono">-{discount} دج</span>
              </div>
            )}
            <div className="pt-3 border-t border-neutral-800 flex justify-between items-center">
              <span className="text-sm font-bold">الإجمالي الواجب دفعه:</span>
              <span className="text-xl sm:text-2xl font-black text-[#FF8833] font-mono">{total} دج</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-tr from-[#EA580C] to-[#FF7711] hover:from-[#d84e06] hover:to-[#ea6c0e] text-white font-black text-sm rounded-2xl shadow-xl shadow-orange-500/30 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 border border-white/20"
            >
              {isSubmitting ? (
                <span>جاري إرسال وتثبيت الطلب...</span>
              ) : (
                <>
                  <span>تأكيد الطلب وإرساله للمتجر</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
