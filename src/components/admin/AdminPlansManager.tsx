import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan } from '../../types';
import { Sliders, CheckCircle2, XCircle, DollarSign, RefreshCw, Edit3, Save, X } from 'lucide-react';

export const AdminPlansManager: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [editDescription, setEditDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAdminPlans();
      setPlans(data);
    } catch (err) {
      console.error('[AdminPlansManager] Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleStartEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setEditPrice(plan.price);
    setEditIsActive(plan.isActive);
    setEditDescription(plan.description);
    setFeedback(null);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const updated = await subscriptionService.updateAdminPlan(editingPlan.id, {
        price: Number(editPrice),
        isActive: editIsActive,
        description: editDescription,
      });

      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setEditingPlan(null);
      setFeedback({ type: 'success', message: `تم تحديث بيانات باقة [${updated.name}] بنجاح في قاعدة البيانات.` });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشل حفظ التعديلات.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    try {
      const updated = await subscriptionService.updateAdminPlan(plan.id, {
        isActive: !plan.isActive,
      });
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'فشل تبديل حالة الخطة.' });
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#FF6600]" />
            <span>إدارة باقات الاشتراك والأسعار (Subscription Plans)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            الأسعار مخزنة في قاعدة البيانات ومحكومة بالكامل من لوحة التحكم - لا يمكن للعميل التلاعب بها
          </p>
        </div>

        <button
          onClick={loadPlans}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Plans List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isEditingThis = editingPlan?.id === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border ${
                plan.isActive ? 'border-neutral-200' : 'border-rose-200 bg-neutral-50/50'
              } p-6 shadow-xs flex flex-col justify-between`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-neutral-400 block">
                      {plan.tier}
                    </span>
                    <h3 className="text-base font-black text-neutral-900">{plan.name}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    title={plan.isActive ? 'تعطيل الباقة' : 'تفعيل الباقة'}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                      plan.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    {plan.isActive ? 'مفعلة (Active)' : 'معطلة (Inactive)'}
                  </button>
                </div>

                {isEditingThis ? (
                  <div className="space-y-3 my-4 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs">
                    <div>
                      <label className="block text-neutral-500 mb-1 font-bold">السعر بالدينار (DZD):</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg font-bold text-neutral-900 focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                    <div>
                      <label className="block text-neutral-500 mb-1 font-bold">الوصف:</label>
                      <textarea
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full p-2 bg-white border border-neutral-300 rounded-lg text-xs text-neutral-800 focus:outline-none focus:border-[#FF6600]"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handleSaveEdit}
                        disabled={isSaving}
                        className="flex-1 py-1.5 bg-[#FF6600] text-white rounded-lg font-bold hover:bg-[#E65C00] transition flex items-center justify-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>حفظ</span>
                      </button>
                      <button
                        onClick={() => setEditingPlan(null)}
                        className="px-3 py-1.5 bg-neutral-200 text-neutral-700 rounded-lg font-bold hover:bg-neutral-300 transition"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="my-3 pb-3 border-b border-neutral-100 flex items-baseline gap-1" dir="ltr">
                      <span className="text-2xl font-black text-neutral-900">{plan.price}</span>
                      <span className="text-xs font-bold text-neutral-400">DZD / شهرياً</span>
                    </div>

                    <p className="text-xs text-neutral-600 mb-4 min-h-[36px]">{plan.description}</p>

                    <div className="space-y-1.5 mb-4">
                      {plan.features.map((f, i) => (
                        <div key={i} className="text-[11px] text-neutral-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {!isEditingThis && (
                <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
                  <span className="text-[11px] text-neutral-400">مدة الصلاحية: {plan.durationDays} يوماً</span>
                  <button
                    onClick={() => handleStartEdit(plan)}
                    className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>تعديل السعر والبيانات</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
