import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { SubscriptionPlan, UserSubscription } from '../../types';
import {
  Check,
  Zap,
  CreditCard,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  Building2,
  Star,
} from 'lucide-react';

export const PricingPlansView: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, isAuthenticated } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const fetchedPlans = await subscriptionService.getPlans();
        setPlans(fetchedPlans);

        if (currentUser?.id) {
          const sub = await subscriptionService.getMySubscription(currentUser.id);
          setCurrentSub(sub);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'تعذر تحميل باقات الاشتراك.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login');
      return;
    }

    setProcessingPlanId(plan.id);
    setErrorMessage(null);

    try {
      // 1. If FREE plan, activate directly
      if (plan.price === 0 || plan.tier === 'FREE') {
        const sub = await subscriptionService.subscribeFree({
          userId: currentUser.id,
          userEmail: currentUser.email,
          userName: currentUser.fullName,
        });
        setCurrentSub(sub);
        setProcessingPlanId(null);
        navigate('/my-subscription');
        return;
      }

      // 2. Paid Plan (PRO / BUSINESS):
      // Initialize Slick-Pay Invoice from backend.
      // Notice: amount is NOT passed from the frontend!
      const invoiceData = await subscriptionService.createSlickPayInvoice({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        customerPhone: currentUser.phone,
        customerAddress: currentUser.deliveryLocation?.address,
        planId: plan.id,
      });

      // Redirect customer to Slick-Pay SATIM payment page
      if (invoiceData.paymentUrl) {
        if (invoiceData.isSimulated) {
          // Internal sandbox route in AI Studio
          navigate(invoiceData.paymentUrl.replace(/^https?:\/\/[^/]+/, ''));
        } else {
          // Real Slick-Pay SATIM external URL
          window.location.href = invoiceData.paymentUrl;
        }
      } else {
        throw new Error('لم يتم استلام رابط الدفع من Slick-Pay.');
      }
    } catch (err: any) {
      console.error('[PricingPlansView] Subscription error:', err);
      setErrorMessage(err.message || 'حدث خطأ أثناء بدء عملية الاشتراك.');
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" dir="rtl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-[#FF6600] px-4 py-1.5 rounded-full text-xs font-black mb-4 border border-orange-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>بوابات الدفع الرسمية عبر Slick-Pay و SATIM</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-4">
          اختر الباقة المناسبة لتنمية أعمالك في منصة لباب الدار
        </h1>
        <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
          دفع إلكتروني فوري وآمن بالدينار الجزائري (DZD) بواسطة البطاقة الذهبية لبريد الجزائر أو البطاقات البنكية CIB عبر بوابة Slick-Pay المعتمدة.
        </p>

        {/* Payment Methods Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 bg-amber-50 text-amber-900 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs font-bold shadow-2xs">
            <CreditCard className="w-4 h-4 text-amber-600" />
            <span>البطاقة الذهبية (Edahabia)</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 text-blue-900 px-3.5 py-1.5 rounded-xl border border-blue-200 text-xs font-bold shadow-2xs">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>بطاقة CIB البنكية</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-900 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-xs font-bold shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>معتمدة من SATIM & Slick-Pay V2</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-xl mx-auto mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-96 bg-neutral-100 rounded-3xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan) => {
            const isPro = plan.tier === 'PRO';
            const isBusiness = plan.tier === 'BUSINESS';
            const isCurrent = currentSub?.planTier === plan.tier && currentSub?.status === 'active';
            const isProcessing = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                id={`plan-card-${plan.tier.toLowerCase()}`}
                className={`relative flex flex-col rounded-3xl transition-all duration-300 ${
                  isPro
                    ? 'bg-gradient-to-b from-orange-50/50 to-white border-2 border-[#FF6600] shadow-xl md:-translate-y-2'
                    : 'bg-white border border-neutral-200/90 shadow-sm hover:shadow-md'
                } p-6 sm:p-8`}
              >
                {/* Badge if available */}
                {plan.badge && (
                  <div className="absolute -top-3.5 right-6 bg-[#FF6600] text-white text-[11px] font-black px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{plan.badge}</span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-black text-neutral-900 mb-2">{plan.name}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-neutral-100">
                  <div className="flex items-baseline gap-1.5" dir="ltr">
                    <span className="text-4xl font-black text-neutral-900">{plan.price}</span>
                    <span className="text-sm font-bold text-neutral-500">DZD / شهرياً</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 mt-1 block">
                    {plan.price === 0 ? 'مجاناً بدون أي التزام' : 'تجديد شهري عبر SATIM'}
                  </span>
                </div>

                {/* Features */}
                <div className="flex-1 space-y-3 mb-8">
                  <span className="text-xs font-bold text-neutral-400 block mb-2">المميزات المضمنة:</span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Action CTA Button */}
                <button
                  id={`btn-select-plan-${plan.tier.toLowerCase()}`}
                  disabled={isCurrent || isProcessing}
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 rounded-xl font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : isPro
                      ? 'bg-[#FF6600] hover:bg-[#E65C00] text-white'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>باقتك الحالية النشطة</span>
                    </>
                  ) : plan.price === 0 ? (
                    <span>تفعيل الباقة المجانية</span>
                  ) : (
                    <>
                      <span>الاشتراك عبر Slick-Pay SATIM</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Security & FAQ Footer */}
      <div className="mt-16 bg-neutral-50 rounded-3xl p-6 sm:p-8 border border-neutral-200 text-center max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-neutral-600 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>بيانات البطاقة لا تُحفظ مطلقاً على خوادمنا</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>تأكيد لحظي وتفعيل فوري عبر SATIM 3D-Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            <span>إلغاء أو ترقية الاشتراك في أي وقت بدون رسوم خفية</span>
          </div>
        </div>
      </div>
    </div>
  );
};
