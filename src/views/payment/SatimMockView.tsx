import React, { useState } from 'react';
import { useRouter } from '../../router/Router';
import { subscriptionService } from '../../services/subscriptionService';
import { CreditCard, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * ============================================================================
 * SATIM / Slick-Pay Interactive Sandbox Payment Simulator
 * ============================================================================
 * In sandbox mode, this mimics the official SATIM E-Payment portal (EDAHABIA / CIB).
 * It allows testing successful payments, card declines, cancellations, and timeouts.
 */
export const SatimMockView: React.FC = () => {
  const { searchParams, navigate } = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const invoiceId = searchParams.get('invoiceId') || '';
  const amount = searchParams.get('amount') || '999';
  const planName = searchParams.get('planName') || 'اشتراك لباب الدار';

  const [cardNumber, setCardNumber] = useState('6280 2600 0000 0000');
  const [expiry, setExpiry] = useState('12/28');
  const [cardHolder, setCardHolder] = useState('MOHAMED AMINE');
  const [cardType, setCardType] = useState<'EDAHABIA' | 'CIB'>('EDAHABIA');
  const [cvv, setCvv] = useState('***');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleSimulate = async (action: 'pay' | 'fail' | 'cancel') => {
    setIsProcessing(true);
    setActionError(null);

    try {
      if (invoiceId) {
        await subscriptionService.simulateSatimAction({
          invoiceId,
          orderId,
          action,
        });
      }

      // Short delay for realistic banking portal feel
      setTimeout(() => {
        setIsProcessing(false);
        if (action === 'pay') {
          navigate(`/payment/verify?orderId=${encodeURIComponent(orderId)}`);
        } else if (action === 'fail') {
          navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}&reason=DECLINED_BY_SATIM`);
        } else {
          navigate(`/payment/failed?orderId=${encodeURIComponent(orderId)}&reason=USER_CANCELLED`);
        }
      }, 1000);
    } catch (err: any) {
      setIsProcessing(false);
      setActionError(err.message || 'حدث خطأ في محاكي الدفع SATIM');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col justify-center items-center py-10 px-4" dir="rtl">
      {/* Sandbox Notice Banner */}
      <div className="w-full max-w-xl bg-amber-500 text-white text-xs font-bold py-2 px-4 rounded-t-2xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>بيئة اختبار Slick-Pay V2 / SATIM Sandbox التجريبية</span>
        </div>
        <span className="bg-amber-700/60 px-2 py-0.5 rounded text-[10px]">وضع المحاكاة الآمن</span>
      </div>

      <div className="w-full max-w-xl bg-white rounded-b-2xl shadow-xl border border-neutral-200 overflow-hidden">
        {/* SATIM & Slick-Pay Official-style Header */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-neutral-400 font-medium block">بوابة الدفع الإلكتروني المعتمدة</span>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <span>SATIM</span>
                <span className="text-xs bg-emerald-500 text-white font-bold px-2 py-0.5 rounded">Slick-Pay V2</span>
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded text-xs font-bold transition ${cardType === 'EDAHABIA' ? 'bg-amber-500 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                الذهبية EDAHABIA
              </span>
              <span className={`px-2.5 py-1 rounded text-xs font-bold transition ${cardType === 'CIB' ? 'bg-blue-600 text-white' : 'bg-neutral-700 text-neutral-300'}`}>
                بنكية CIB
              </span>
            </div>
          </div>

          <div className="bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-700 flex items-center justify-between text-sm">
            <div>
              <div className="text-xs text-neutral-400">التاجر / المنصة:</div>
              <div className="font-bold text-white">منصة لباب الدار (LBAB ELDAR)</div>
              <div className="text-xs text-neutral-400 mt-0.5">{planName}</div>
            </div>
            <div className="text-left" dir="ltr">
              <div className="text-xs text-neutral-400">المبلغ الإجمالي:</div>
              <div className="text-2xl font-black text-emerald-400">{amount} DZD</div>
            </div>
          </div>
        </div>

        {/* Invoice Metadata */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 mb-6">
            <div>
              <span className="text-neutral-500 block">رقم الطلب الداخلي:</span>
              <span className="font-mono font-bold text-neutral-800">{orderId || 'غير متوفر'}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">معرف فاتورة Slick-Pay:</span>
              <span className="font-mono font-bold text-neutral-800">{invoiceId || 'غير متوفر'}</span>
            </div>
          </div>

          {/* Interactive Card Preview */}
          <div className={`rounded-2xl p-5 text-white mb-6 shadow-md transition ${cardType === 'EDAHABIA' ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-amber-500' : 'bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700'}`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest">
                {cardType === 'EDAHABIA' ? 'بريد الجزائر - بطاقة الذهبية' : 'SATIM CIB INTERBANCAIRE'}
              </span>
              <CreditCard className="w-6 h-6 opacity-80" />
            </div>
            <div className="font-mono text-lg sm:text-xl tracking-wider mb-4" dir="ltr">
              {cardNumber}
            </div>
            <div className="flex justify-between items-end text-xs">
              <div>
                <span className="opacity-70 text-[10px] block">CARD HOLDER</span>
                <span className="font-bold">{cardHolder}</span>
              </div>
              <div className="text-left" dir="ltr">
                <span className="opacity-70 text-[10px] block">EXPIRES</span>
                <span className="font-bold">{expiry}</span>
              </div>
            </div>
          </div>

          {/* Card switch */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setCardType('EDAHABIA');
                setCardNumber('6280 2600 1234 5678');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${cardType === 'EDAHABIA' ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-neutral-200 text-neutral-600'}`}
            >
              بطاقة الذهبية (Edahabia)
            </button>
            <button
              type="button"
              onClick={() => {
                setCardType('CIB');
                setCardNumber('1234 5678 9012 3456');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${cardType === 'CIB' ? 'bg-blue-50 border-blue-400 text-blue-900' : 'bg-white border-neutral-200 text-neutral-600'}`}
            >
              بطاقة CIB البنكية
            </button>
          </div>

          {actionError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
              {actionError}
            </div>
          )}

          {/* Test Action Buttons */}
          <div className="space-y-3">
            <button
              id="btn-satim-pay-success"
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulate('pay')}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>تأكيد الدفع بنجاح عبر SATIM (نجاح المعاملة)</span>
                </>
              )}
            </button>

            <button
              id="btn-satim-pay-fail"
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulate('fail')}
              className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              <span>محاكاة فشل الدفع (رصيد غير كافٍ / بطاقة مرفوضة)</span>
            </button>

            <button
              id="btn-satim-pay-cancel"
              type="button"
              disabled={isProcessing}
              onClick={() => handleSimulate('cancel')}
              className="w-full py-2 text-neutral-500 hover:text-neutral-800 font-medium text-xs transition"
            >
              إلغاء العملية والعودة للمتجر
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-200 flex items-center justify-center gap-2 text-[11px] text-neutral-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>معاملة مشفرة 256-bit بمعايير الأمان 3D-Secure لـ SATIM و Slick-Pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};
