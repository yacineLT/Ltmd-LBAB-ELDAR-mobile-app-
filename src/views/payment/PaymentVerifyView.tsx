import React, { useEffect, useState } from 'react';
import { useRouter } from '../../router/Router';
import { subscriptionService, VerificationResult } from '../../services/subscriptionService';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

/**
 * ============================================================================
 * Payment Verification View (/payment/verify)
 * ============================================================================
 * When customer returns from Slick-Pay / SATIM, this view triggers authoritative
 * server-side verification with Slick-Pay API.
 * The client does NOT decide if the payment was successful.
 */
export const PaymentVerifyView: React.FC = () => {
  const { searchParams, navigate } = useRouter();
  const orderId = searchParams.get('orderId') || '';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('رقم الطلب غير متوفر للتحقق.');
      setLoading(false);
      return;
    }

    let isMounted = true;

    const runVerification = async () => {
      try {
        setLoading(true);
        // Authoritative server-side verification
        const result: VerificationResult = await subscriptionService.verifyPayment(orderId);

        if (!isMounted) return;

        if (result.isPaid || result.status === 'paid') {
          navigate(`/payment/success?orderId=${encodeURIComponent(orderId)}`);
        } else if (result.status === 'failed' || result.status === 'cancelled') {
          navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}&status=${result.status}`);
        } else {
          navigate(`/payment/pending?orderId=${encodeURIComponent(orderId)}`);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[PaymentVerifyView] Verification error:', err);
        setError(err.message || 'فشل الاتصال بخادم التحقق من الدفع.');
        setLoading(false);
      }
    };

    runVerification();

    return () => {
      isMounted = false;
    };
  }, [orderId, navigate]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4" dir="rtl">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-neutral-200 text-center">
        {loading ? (
          <div>
            <div className="w-16 h-16 bg-orange-50 text-[#FF6600] rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 mb-2">
              جاري التحقق من عملية الدفع...
            </h2>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              يرجى الانتظار بينما نتواصل مع خوادم Slick-Pay و SATIM لتأكيد حالة المعاملة البنكية.
            </p>
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-600">
              رقم المعاملة: {orderId || '...'}
            </div>
            <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>تحقق آمن ومباشر من الخادم</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">خطأ في التحقق</h2>
            <p className="text-sm text-neutral-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/my-subscription')}
                className="px-5 py-2.5 bg-[#FF6600] text-white rounded-xl text-sm font-bold hover:bg-[#E65C00] transition"
              >
                العودة للاشتراكات
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-200 transition"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
