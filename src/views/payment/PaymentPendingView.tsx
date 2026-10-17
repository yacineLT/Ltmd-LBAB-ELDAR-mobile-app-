import React, { useState } from 'react';
import { useRouter } from '../../router/Router';
import { Clock, RefreshCw, ShieldAlert, ArrowRight } from 'lucide-react';
import { subscriptionService } from '../../services/subscriptionService';

export const PaymentPendingView: React.FC = () => {
  const { searchParams, navigate } = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleRecheck = async () => {
    if (!orderId) return;
    setChecking(true);
    setMessage(null);
    try {
      const res = await subscriptionService.verifyPayment(orderId);
      if (res.isPaid || res.status === 'paid') {
        navigate(`/payment/success?orderId=${encodeURIComponent(orderId)}`);
      } else if (res.status === 'failed' || res.status === 'cancelled') {
        navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}`);
      } else {
        setMessage('المعاملة لا تزال قيد المعالجة من البنك. يرجى الانتظار بضع دقائق ثم التحديث.');
      }
    } catch (err: any) {
      setMessage(err.message || 'تعذر التحقق من البنك في الوقت الحالي.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-amber-100 overflow-hidden text-center">
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-8">
          <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-white/10">
            <Clock className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black mb-1">المعاملة قيد المعالجة البنكية</h1>
          <p className="text-amber-100 text-xs">نحن بانتظار إشعار التأكيد النهائي من شبكة SATIM</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <p className="text-sm text-neutral-600 leading-relaxed">
            قد تستغرق بعض العمليات البنكية عبر البطاقات الذهبية أو CIB دقيقة أو دقيقتين للمصادقة وتأكيد الخصم.
          </p>

          {orderId && (
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-700">
              رقم الطلب: {orderId}
            </div>
          )}

          {message && (
            <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
              {message}
            </div>
          )}

          <div className="space-y-3">
            <button
              id="btn-recheck-status"
              disabled={checking}
              onClick={handleRecheck}
              className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-black rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'جاري الفحص مع البنك...' : 'إعادة التحقق من حالة الدفع'}</span>
            </button>

            <button
              onClick={() => navigate('/my-subscription')}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition text-xs"
            >
              الذهاب إلى اشتراكي
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
