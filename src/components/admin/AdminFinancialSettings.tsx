import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { PaymentSettings, CommissionSettings } from '../../types';
import {
  Settings,
  CreditCard,
  Building2,
  Percent,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';

export const AdminFinancialSettings: React.FC = () => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() =>
    dbService.getPaymentSettings()
  );
  const [commSettings, setCommSettings] = useState<CommissionSettings>(() =>
    dbService.getCommissionSettings()
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const loadSettings = () => {
    setPaymentSettings(dbService.getPaymentSettings());
    setCommSettings(dbService.getCommissionSettings());
  };

  useEffect(() => {
    loadSettings();
    const unsub = dbService.subscribe(loadSettings);
    return () => unsub();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure delivery allocation sums to 100%
    const courierShare = commSettings.deliveryFeeAllocation.courierSharePercentage;
    const platformShare = 100 - courierShare;

    const validatedCommSettings: CommissionSettings = {
      ...commSettings,
      deliveryFeeAllocation: {
        courierSharePercentage: courierShare,
        platformSharePercentage: platformShare,
      },
    };

    dbService.updatePaymentSettings(paymentSettings);
    dbService.updateCommissionSettings(validatedCommSettings);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6" dir="rtl">
      {/* Top Header & Save Button */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF6600]" />
            إعدادات العمولات والمدفوعات وسياسات السحب
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            تحديد نسب الأرباح، شروط السحب عبر البنوك والبريد، والحدود المالية المسموح بها
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> تم حفظ التعديلات بنجاح
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#FF6600] text-white text-xs font-bold hover:bg-[#e05a00] transition flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" /> حفظ جميع الإعدادات
          </button>
        </div>
      </div>

      {/* Commission Rates & Delivery Splits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant & Courier Commission */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Percent className="w-5 h-5 text-purple-600" />
            <h3 className="font-black text-base text-neutral-900">نسب عمولة المنصة</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">
                نسبة عمولة المنصة على مبيعات المتاجر (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commSettings.merchant.value}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      merchant: { ...commSettings.merchant, value: Number(e.target.value) || 0 },
                    })
                  }
                  className="w-24 p-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-900 focus:ring-2 focus:ring-[#FF6600]"
                />
                <span className="text-neutral-500 font-bold">% من قيمة سلة الطلب (Subtotal)</span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">
                تُخصم هذه النسبة تلقائياً عند تسليم الطلب وتحويل الصافي لرصيد التاجر المتاح للسحب.
              </p>
            </div>

            <div className="pt-3 border-t border-neutral-100">
              <label className="block font-bold text-neutral-700 mb-1">
                توزيع رسم خدمة التوصيل (Delivery Fee Allocation)
              </label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-600 block mb-1 font-bold">حصة كابتن التوصيل:</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={commSettings.deliveryFeeAllocation.courierSharePercentage}
                      onChange={(e) => {
                        const val = Math.min(100, Math.max(0, Number(e.target.value) || 0));
                        setCommSettings({
                          ...commSettings,
                          deliveryFeeAllocation: {
                            courierSharePercentage: val,
                            platformSharePercentage: 100 - val,
                          },
                        });
                      }}
                      className="w-20 p-2 rounded-lg border border-neutral-300 font-bold text-neutral-900"
                    />
                    <span className="font-bold text-neutral-700">%</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-neutral-600 block mb-1 font-bold">حصة المنصة:</span>
                  <div className="text-lg font-black text-[#FF6600] mt-2">
                    {100 - commSettings.deliveryFeeAllocation.courierSharePercentage} %
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Limits & Policy */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-base text-neutral-900">حدود السحب وسياسة الموافقة</h3>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">أدنى سحب للتاجر (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.minAmountMerchant}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        minAmountMerchant: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">أقصى سحب للتاجر (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.maxAmountMerchant}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        maxAmountMerchant: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">أدنى سحب للكابتن (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.minAmountCourier}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        minAmountCourier: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">أقصى سحب للكابتن (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.maxAmountCourier}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        maxAmountCourier: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">الحد اليومي للتاجر (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.dailyLimitMerchant}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        dailyLimitMerchant: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">الحد اليومي للكابتن (دج)</label>
                <input
                  type="number"
                  value={commSettings.withdrawalLimits.dailyLimitCourier}
                  onChange={(e) =>
                    setCommSettings({
                      ...commSettings,
                      withdrawalLimits: {
                        ...commSettings.withdrawalLimits,
                        dailyLimitCourier: Number(e.target.value) || 0,
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 font-bold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <label className="block font-bold text-neutral-700 mb-1">نظام معالجة واعتماد السحوبات</label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="radio"
                    name="approvalMode"
                    value="MANUAL"
                    checked={commSettings.withdrawalLimits.approvalMode === 'MANUAL'}
                    onChange={() =>
                      setCommSettings({
                        ...commSettings,
                        withdrawalLimits: {
                          ...commSettings.withdrawalLimits,
                          approvalMode: 'MANUAL',
                        },
                      })
                    }
                    className="text-[#FF6600] focus:ring-[#FF6600]"
                  />
                  يدوي (مراجعة المشرف أولاً)
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-800">
                  <input
                    type="radio"
                    name="approvalMode"
                    value="AUTOMATIC"
                    checked={commSettings.withdrawalLimits.approvalMode === 'AUTOMATIC'}
                    onChange={() =>
                      setCommSettings({
                        ...commSettings,
                        withdrawalLimits: {
                          ...commSettings.withdrawalLimits,
                          approvalMode: 'AUTOMATIC',
                        },
                      })
                    }
                    className="text-[#FF6600] focus:ring-[#FF6600]"
                  />
                  تلقائي (موافقة فورية ضمن الحدود)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Methods Configuration Grid */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <h3 className="font-black text-base text-neutral-900">
            تفعيل وإعداد طرق السحب (CIB • الذهبية • الفروع)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* CIB Option */}
          <div className="p-4 rounded-2xl border border-neutral-200 space-y-3 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">الحساب البنكي (CIB / RIB)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.cib.enabled}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        cib: { ...paymentSettings.merchantWithdrawals.cib, enabled: e.target.checked },
                      },
                      courierWithdrawals: {
                        ...paymentSettings.courierWithdrawals,
                        cib: { ...paymentSettings.courierWithdrawals.cib, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6600]"></div>
              </label>
            </div>

            <div className="space-y-2 text-neutral-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.cib.requireRib}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        cib: { ...paymentSettings.merchantWithdrawals.cib, requireRib: e.target.checked },
                      },
                    })
                  }
                />
                إلزامية تقديم الـ RIB المكون من 20 رقماً
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.cib.requireBankName}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        cib: { ...paymentSettings.merchantWithdrawals.cib, requireBankName: e.target.checked },
                      },
                    })
                  }
                />
                إلزامية تحديد اسم البنك المعتمد
              </label>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">تعليمات السحب البنكي:</label>
                <textarea
                  rows={2}
                  value={paymentSettings.merchantWithdrawals.cib.instructions || ''}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        cib: { ...paymentSettings.merchantWithdrawals.cib, instructions: e.target.value },
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Edahabia CCP Option */}
          <div className="p-4 rounded-2xl border border-neutral-200 space-y-3 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">بطاقة الذهبية (بريد الجزائر CCP)</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.edahabia.enabled}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        edahabia: { ...paymentSettings.merchantWithdrawals.edahabia, enabled: e.target.checked },
                      },
                      courierWithdrawals: {
                        ...paymentSettings.courierWithdrawals,
                        edahabia: { ...paymentSettings.courierWithdrawals.edahabia, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6600]"></div>
              </label>
            </div>

            <div className="space-y-2 text-neutral-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.edahabia.requireCcp}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        edahabia: { ...paymentSettings.merchantWithdrawals.edahabia, requireCcp: e.target.checked },
                      },
                    })
                  }
                />
                إلزامية رقم الحساب البريدي والمفتاح (Clé)
              </label>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">تعليمات السحب بالذهبية:</label>
                <textarea
                  rows={2}
                  value={paymentSettings.merchantWithdrawals.edahabia.instructions || ''}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        edahabia: { ...paymentSettings.merchantWithdrawals.edahabia, instructions: e.target.value },
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Branch Cash Withdrawal */}
          <div className="p-4 rounded-2xl border border-neutral-200 space-y-3 bg-neutral-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-900">السحب النقدي من الفروع المعتمدة</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.merchantWithdrawals.branch.enabled}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        branch: { ...paymentSettings.merchantWithdrawals.branch, enabled: e.target.checked },
                      },
                      courierWithdrawals: {
                        ...paymentSettings.courierWithdrawals,
                        branch: { ...paymentSettings.courierWithdrawals.branch, enabled: e.target.checked },
                      },
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6600]"></div>
              </label>
            </div>

            <div className="space-y-2 text-neutral-600">
              <p className="text-[11px] text-neutral-500">
                يتيح للتجار والموصّلين السحب المباشر نقداً من أي فرع نشط مسجل في إدارة الفروع.
              </p>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">تعليمات استلام المبالغ من الفرع:</label>
                <textarea
                  rows={2}
                  value={paymentSettings.merchantWithdrawals.branch.instructions || ''}
                  onChange={(e) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      merchantWithdrawals: {
                        ...paymentSettings.merchantWithdrawals,
                        branch: { ...paymentSettings.merchantWithdrawals.branch, instructions: e.target.value },
                      },
                    })
                  }
                  className="w-full p-2 rounded-xl border border-neutral-300 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
