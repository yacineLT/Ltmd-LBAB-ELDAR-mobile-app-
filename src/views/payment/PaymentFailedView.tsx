import React from 'react';
import { useRouter } from '../../router/Router';
import { XCircle, RefreshCw, HelpCircle, ShieldAlert, ArrowRight } from 'lucide-react';

export const PaymentFailedView: React.FC = () => {
  const { searchParams, navigate } = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const reason = searchParams.get('reason') || 'DECLINED_OR_TIMEOUT';

  const getReasonMessage = (r: string) => {
    switch (r) {
      case 'DECLINED_BY_SATIM':
        return 'تم رفض العملية من طرف بنك البطاقة (رصيد غير كافٍ أو خطأ في بيانات المصادقة 3D-Secure).';
      case 'USER_CANCELLED':
        return 'تم إلغاء عملية الدفع بناءً على طلبك.';
      default:
        return 'لم تكتمل عملية الدفع أو انتهت المهلة المحددة للمعاملة على بوابة SATIM.';
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4" dir="rtl">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-lg border border-rose-100 overflow-hidden">
        {/* Failed Header */}
        <div className="bg-gradient-to-br from-rose-600 to-rose-800 text-white p-8 text-center">
          <div className="w-18 h-18 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-white/10">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black mb-1">تعذر إتمام عملية الدفع</h1>
          <p className="text-rose-100 text-xs">لم يتم خصم أي مبلغ من بطاقتك البنكية</p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/80 text-rose-800 text-sm leading-relaxed">
            <div className="font-bold flex items-center gap-2 mb-1 text-rose-900">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>سبب عدم الاكتمال:</span>
            </div>
            <p className="text-xs text-rose-700">{getReasonMessage(reason)}</p>
          </div>

          {orderId && (
            <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-600 text-center">
              رقم الطلب: {orderId}
            </div>
          )}

          <div className="space-y-3">
            <button
              id="btn-retry-payment"
              onClick={() => navigate('/pricing')}
              className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-black rounded-xl transition shadow-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>إعادة محاولة الدفع (بطاقة ذهبية / CIB)</span>
            </button>

            <button
              onClick={() => navigate('/my-subscription')}
              className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition text-xs"
            >
              العودة إلى صفحة اشتراكي
            </button>
          </div>

          <div className="pt-4 border-t border-neutral-200 text-center">
            <p className="text-xs text-neutral-400 flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>هل تواجه مشكلة متكررة؟ تواصل مع الدعم الفني للبوابة</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
