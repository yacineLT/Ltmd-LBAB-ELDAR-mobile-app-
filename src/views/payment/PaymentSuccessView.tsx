import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { subscriptionService, VerificationResult } from '../../services/subscriptionService';
import { CheckCircle2, ShieldCheck, ArrowRight, CreditCard, Calendar, Sparkles, Loader2, AlertTriangle } from 'lucide-react';

export const PaymentSuccessView: React.FC = () => {
  const { searchParams, navigate } = useRouter();
  const orderId = searchParams.get('orderId') || '';

  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('معرف الطلب غير متوفر');
      setLoading(false);
      return;
    }

    const checkRealStatus = async () => {
      try {
        setLoading(true);
        // Authoritatively check with backend - DO NOT trust URL blindly!
        const res = await subscriptionService.verifyPayment(orderId);
        setVerification(res);

        if (!res.isPaid && res.status !== 'paid') {
          // If not actually paid, do not display success
          setError('لم يتم تأكيد دفع هذه الفاتورة بعد من طرف بنك SATIM.');
        }
      } catch (err: any) {
        setError(err.message || 'فشل التحقق من حالة الفاتورة.');
      } finally {
        setLoading(false);
      }
    };

    checkRealStatus();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-3xl border border-neutral-200 max-w-sm w-full">
          <Loader2 className="w-10 h-10 text-[#FF6600] animate-spin mx-auto mb-4" />
          <h3 className="font-bold text-neutral-800">جاري تأكيد نجاح الدفع مع الخادم...</h3>
          <p className="text-xs text-neutral-500 mt-2">لحظات من فضلك</p>
        </div>
      </div>
    );
  }

  if (error || !verification || (!verification.isPaid && verification.status !== 'paid')) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-amber-200 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">تنبيه التحقق من الدفع</h2>
          <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
            {error || 'لم يتم تأكيد استلام الدفع البنكي لهذه المعاملة.'}
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/payment/verify?orderId=${encodeURIComponent(orderId)}`)}
              className="w-full py-3 bg-[#FF6600] text-white font-bold rounded-xl hover:bg-[#E65C00] transition text-sm"
            >
              إعادة التحقق من الدفع
            </button>
            <button
              onClick={() => navigate('/my-subscription')}
              className="w-full py-2.5 bg-neutral-100 text-neutral-700 font-bold rounded-xl hover:bg-neutral-200 transition text-sm"
            >
              الذهاب إلى صفحة اشتراكي
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sub = verification.subscription;

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-white/10">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-500/40 text-emerald-100 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> تم التفعيل بنجاح في قاعدة البيانات
          </span>
          <h1 className="text-2xl font-black mb-1">تم تأكيد الدفع وتفعيل الاشتراك!</h1>
          <p className="text-emerald-100 text-xs">شكراً لاختيارك منصة لباب الدار (LBAB ELDAR)</p>
        </div>

        {/* Payment & Subscription Details */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 text-sm">
              <span className="text-neutral-500">الباقة المفعلة:</span>
              <span className="font-black text-neutral-900 bg-white px-2.5 py-1 rounded-lg border border-neutral-200">
                {verification.planName || 'الخطة الاحترافية'}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 text-sm">
              <span className="text-neutral-500">المبلغ المدفوع:</span>
              <span className="font-black text-emerald-600 text-base" dir="ltr">
                {verification.amount} DZD
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 text-xs">
              <span className="text-neutral-500">طريقة الدفع:</span>
              <span className="font-bold text-neutral-800 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Slick-Pay (SATIM - الذهبية / CIB)</span>
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-200 text-xs">
              <span className="text-neutral-500">المرجع البنكي SATIM:</span>
              <span className="font-mono font-bold text-neutral-700">
                {verification.transactionReference || `SATIM_${orderId}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-neutral-500">رقم الطلب:</span>
              <span className="font-mono text-neutral-600">{orderId}</span>
            </div>

            {sub?.endDate && (
              <div className="pt-3 border-t border-neutral-200 flex justify-between items-center text-xs">
                <span className="text-neutral-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  صلاحية الاشتراك حتى:
                </span>
                <span className="font-bold text-neutral-900">
                  {new Date(sub.endDate).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <button
              id="btn-goto-my-subscription"
              onClick={() => navigate('/my-subscription')}
              className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-black rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>إدارة اشتراكي والميزات الجديدة</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition text-xs"
            >
              العودة للصفحة الرئيسية
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>معاملة موثقة ومحفوظة في سجل الفواتير</span>
          </div>
        </div>
      </div>
    </div>
  );
};
