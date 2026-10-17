import React from 'react';
import { Store, AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ReplaceCartModalProps {
  isOpen: boolean;
  currentStoreName: string;
  newStoreName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ReplaceCartModal: React.FC<ReplaceCartModalProps> = ({
  isOpen,
  currentStoreName,
  newStoreName,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-black text-[#1A1A1B]">
            السلة تحتوي على منتجات من متجر آخر
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            تحتوي سلتك حالياً على عناصر من <span className="font-bold text-[#1A1A1B]">"{currentStoreName}"</span>. 
            تسمح منصة لباب الدار بالطلب من متجر واحد في كل عملية توصيل لضمان جودة وسرعة وصول الوجبات.
          </p>
          <div className="p-3 bg-orange-50/70 rounded-xl text-xs text-orange-900 border border-orange-100 flex items-center gap-2">
            <Store className="w-4 h-4 text-[#F27D26] shrink-0" />
            <span>سيتم تفريغ السلة الحالية والبدء بالطلب من <strong className="font-bold">{newStoreName}</strong>.</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 bg-[#F27D26] hover:bg-[#d96716] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>استبدال السلة</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs sm:text-sm rounded-xl transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
