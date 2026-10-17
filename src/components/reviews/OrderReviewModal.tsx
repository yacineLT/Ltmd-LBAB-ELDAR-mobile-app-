import React, { useState } from 'react';
import { dbService } from '../../services/store';
import { Order, OrderReview } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Star, Store, Bike, X, Check, MessageSquare } from 'lucide-react';

interface OrderReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onReviewSubmitted: (review: OrderReview) => void;
}

export const OrderReviewModal: React.FC<OrderReviewModalProps> = ({
  isOpen,
  onClose,
  order,
  onReviewSubmitted,
}) => {
  const { currentUser } = useAuth();
  const [storeRating, setStoreRating] = useState<number>(5);
  const [deliveryRating, setDeliveryRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Check if order already reviewed
  const existingReview = dbService.getOrderReview(order.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (existingReview) {
      setError('تم تقييم هذا الطلب مسبقاً، شكراً لمشاركتنا رأيك!');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = dbService.addOrderReview({
        orderId: order.id,
        customerId: currentUser?.id || order.customerId,
        customerName: currentUser?.fullName || order.customerName,
        storeId: order.storeId,
        storeRating,
        deliveryRating,
        comment: comment.trim() || undefined,
      });

      onReviewSubmitted(review);
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ التقييم');
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating: number, setRating: (r: number) => void) => {
    return (
      <div className="flex items-center gap-1.5 direction-ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-1 hover:scale-115 transition cursor-pointer"
            aria-label={`${star} نجوم`}
          >
            <Star
              className={`w-7 h-7 ${
                star <= rating
                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                  : 'text-gray-300 hover:text-amber-200'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-lg font-black text-[#1A1A1B]">
              تقييم الطلب #{order.orderNumber || order.id}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              رأيك يهمنا ويساعدنا في تحسين جودة المطاعم والموصّلين
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {existingReview ? (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>لقد قمت بتقييم هذا الطلب بالفعل!</span>
            </div>
            <p>تقييم المتجر: {existingReview.storeRating} / 5 نجوم</p>
            {existingReview.deliveryRating && (
              <p>تقييم التوصيل: {existingReview.deliveryRating} / 5 نجوم</p>
            )}
            {existingReview.comment && (
              <p className="text-gray-600 italic mt-1">"{existingReview.comment}"</p>
            )}
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold"
            >
              إغلاق
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            {/* Store Rating */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[#F27D26]" />
                <span className="text-xs font-bold text-[#1A1A1B]">
                  تقييم متجر "{order.storeName}":
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                {renderStars(storeRating, setStoreRating)}
                <span className="text-xs font-black text-amber-500 font-mono">
                  {storeRating} / 5
                </span>
              </div>
            </div>

            {/* Courier Rating */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-[#F27D26]" />
                <span className="text-xs font-bold text-[#1A1A1B]">
                  تقييم سرعة وتعامل المندوب:
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                {renderStars(deliveryRating, setDeliveryRating)}
                <span className="text-xs font-black text-amber-500 font-mono">
                  {deliveryRating} / 5
                </span>
              </div>
            </div>

            {/* Optional Comment */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
                <span>ملاحظاتك وتعليقك (اختياري):</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب تفاصيل تجربتك، جودة التغليف، مذاق الأكل..."
                rows={3}
                className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1A1A1B] focus:ring-2 focus:ring-[#F27D26] focus:bg-white resize-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 bg-[#F27D26] hover:bg-[#d96716] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
