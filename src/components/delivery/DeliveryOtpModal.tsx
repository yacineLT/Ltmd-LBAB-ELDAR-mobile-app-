import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, X, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { dbService } from '../../services/store';
import { Order } from '../../types';

interface DeliveryOtpModalProps {
  order: Order;
  courierId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const DeliveryOtpModal: React.FC<DeliveryOtpModalProps> = ({
  order,
  courierId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '']);
      setError(null);
      setTimeout(() => {
        inputRefs[0].current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, value: string) => {
    // Only accept numeric digit
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    setError(null);

    // Auto-focus next input
    if (char && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto submit if all 4 digits entered
    if (char && index === 3 && newDigits.every((d) => d !== '')) {
      submitOtp(newDigits.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const submitOtp = async (otpCode?: string) => {
    const code = otpCode || digits.join('');
    if (code.length !== 4) {
      setError('يرجى إدخال رمز التحقق المكون من 4 أرقام بالكامل');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current location if available for delivery completed audit
      let deliveryCoords: { latitude: number; longitude: number } | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
          });
          deliveryCoords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
        } catch {
          // Geolocation optional fallback
        }
      }

      const res = dbService.confirmDeliveryWithOtp(order.id, code, courierId, deliveryCoords);

      if (!res.success || !res.order) {
        setError(res.error || 'رمز الاستلام غير صحيح. يرجى التأكد مع الزبون.');
        setIsSubmitting(false);
        return;
      }

      onSuccess(res.order);
      onClose();
    } catch {
      setError('حدث خطأ أثناء معالجة تأكيد التوصيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6600]">
          <ShieldCheck className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-extrabold text-[#1A1A1B] mb-2">
          تأكيد تسليم الطلب للزبون
        </h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          يرجى طلب رمز الاستلام المكون من 4 أرقام من الزبون{' '}
          <span className="font-bold text-gray-900">({order.customerName})</span>{' '}
          لإتمام عملية التوصيل بنجاح.
        </p>

        {/* 4 Digit Boxes */}
        <div className="flex justify-center gap-3 mb-6" dir="ltr">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-14 h-16 text-2xl font-black text-center text-[#1A1A1B] bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-[#FF6600] focus:bg-white focus:outline-none transition shadow-sm"
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-right text-xs font-semibold text-red-700">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Production Courier Instruction */}
        <div className="mb-5 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 text-right flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>يرجى طلب رمز التسليم المكون من 4 أرقام مباشرة من العميل للتحقق من الاستلام وإتمام العملية.</span>
        </div>

        {/* Submit Action */}
        <button
          type="button"
          disabled={isSubmitting || digits.some((d) => d === '')}
          onClick={() => submitOtp()}
          className="w-full py-3.5 px-6 rounded-2xl bg-[#FF6600] hover:bg-[#E55C00] text-white font-bold text-base shadow-md hover:shadow-lg disabled:opacity-50 transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري التحقق...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>تأكيد وإنهاء التوصيل</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
