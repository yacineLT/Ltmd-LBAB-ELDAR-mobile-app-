import React, { useState, useEffect } from 'react';
import { useRouter } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { subscriptionService } from '../../services/subscriptionService';
import { UserSubscription, PaymentRecord, SubscriptionPlan } from '../../types';
import {
  ShieldCheck,
  Calendar,
  CreditCard,
  Clock,
  ArrowUpRight,
  RefreshCw,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Loader2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

export const MySubscriptionView: React.FC = () => {
  const { navigate } = useRouter();
  const { currentUser, isAuthenticated } = useAuth();

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [isRenewing, setIsRenewing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!currentUser?.id) return;
    try {
      setLoading(true);
      const [subData, historyData] = await Promise.all([
        subscriptionService.getMySubscription(currentUser.id),
        subscriptionService.getUserHistory(currentUser.id),
      ]);
      setSubscription(subData);
      setPayments(historyData.payments || []);
    } catch (err: any) {
      setErrorMessage(err.message || 'تعذر تحميل بيانات الاشتراك.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [currentUser, isAuthenticated]);

  // Calculate remaining days
  const calculateRemainingDays = (endDateStr?: string) => {
    if (!endDateStr) return 0;
    const end = new Date(endDateStr).getTime();
    const now = Date.now();
    const diff = end - now;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const remainingDays = calculateRemainingDays(subscription?.endDate);

  const handleRenew = async () => {
    if (!subscription || !currentUser) return;
    setIsRenewing(true);
    setErrorMessage(null);

    try {
      if (subscription.planTier === 'FREE') {
        navigate('/pricing');
        return;
      }

      // Re-initiate invoice with Slick-Pay
      const invoiceData = await subscriptionService.createSlickPayInvoice({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.fullName,
        planId: subscription.planId,
      });

      if (invoiceData.paymentUrl) {
        if (invoiceData.isSimulated) {
          navigate(invoiceData.paymentUrl.replace(/^https?:\/\/[^/]+/, ''));
        } else {
          window.location.href = invoiceData.paymentUrl;
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل بدء تجديد الاشتراك.');
      setIsRenewing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center" dir="rtl">
        <Loader2 className="w-8 h-8 text-[#FF6600] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10" dir="rtl">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1 text-xs text-neutral-500">
            <span onClick={() => navigate('/')} className="hover:text-neutral-900 cursor-pointer">
              الرئيسية
            </span>
            <ChevronRight className="w-3 h-3 rotate-180" />
            <span className="text-[#FF6600] font-bold">إدارة اشتراكي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-neutral-900">
            اشتراكي في منصة لباب الدار
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-upgrade-plan"
            onClick={() => navigate('/pricing')}
            className="px-4 py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white text-xs sm:text-sm font-bold rounded-xl transition flex items-center gap-2 shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>ترقية أو تغيير الباقة</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Active Subscription Card */}
      <div className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm p-6 sm:p-8 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-neutral-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-neutral-400 font-bold">الخطة النشطة حالياً:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  subscription?.planTier === 'BUSINESS'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : subscription?.planTier === 'PRO'
                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                    : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                }`}
              >
                {subscription?.planName || 'الخطة المجانية (FREE)'}
              </span>
              <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>نشط</span>
              </span>
            </div>
            <div className="text-3xl font-black text-neutral-900" dir="ltr">
              {subscription?.price || 0} <span className="text-sm font-normal text-neutral-500">DZD / شهر</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2.5">
            <button
              id="btn-renew-subscription"
              disabled={isRenewing || subscription?.planTier === 'FREE'}
              onClick={handleRenew}
              className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRenewing ? 'animate-spin' : ''}`} />
              <span>تجديد الاشتراك عبر Slick-Pay</span>
            </button>

            <button
              onClick={() => navigate('/pricing')}
              className="px-4 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <span>مقارنة الباقات</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Subscription Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>تاريخ البداية</span>
            </div>
            <div className="text-sm font-bold text-neutral-800">
              {subscription?.startDate
                ? new Date(subscription.startDate).toLocaleDateString('ar-DZ')
                : 'اليوم'}
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>تاريخ الانتهاء</span>
            </div>
            <div className="text-sm font-bold text-neutral-800">
              {subscription?.endDate
                ? new Date(subscription.endDate).toLocaleDateString('ar-DZ')
                : 'غير محدد'}
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>الأيام المتبقية</span>
            </div>
            <div className="text-sm font-black text-amber-600">
              {remainingDays} يوماً
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
            <div className="flex items-center gap-1.5 text-neutral-400 text-xs mb-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
              <span>طريقة الدفع</span>
            </div>
            <div className="text-xs font-bold text-neutral-800 truncate">
              {subscription?.paymentMethod === 'SLICK_PAY_SATIM'
                ? 'Slick-Pay (الذهبية / CIB)'
                : 'مجاني / تلقائي'}
            </div>
          </div>
        </div>

        {/* Subscription ID & Transaction Ref */}
        <div className="mt-4 pt-4 border-t border-neutral-100 flex flex-wrap justify-between items-center text-[11px] text-neutral-400">
          <div>معرف الاشتراك: <span className="font-mono text-neutral-600">{subscription?.id || '—'}</span></div>
          {subscription?.transactionReference && (
            <div>مرجع العملية SATIM: <span className="font-mono text-neutral-600">{subscription.transactionReference}</span></div>
          )}
        </div>
      </div>

      {/* Tabs: Details vs Payment History */}
      <div className="flex gap-4 border-b border-neutral-200 mb-6 text-sm font-bold">
        <button
          onClick={() => setActiveTab('details')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'details'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          سجل أحداث الاشتراك
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 border-b-2 transition flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>سجل فواتير ومدفوعات Slick-Pay ({payments.length})</span>
        </button>
      </div>

      {/* Tab 1: Subscription Events History */}
      {activeTab === 'details' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 p-6">
          <h3 className="text-sm font-black text-neutral-900 mb-4">التسلسل الزمني للاشتراك:</h3>
          {subscription?.history && subscription.history.length > 0 ? (
            <div className="space-y-4">
              {subscription.history.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs pb-3 border-b border-neutral-100 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-[#FF6600] mt-1.5 shrink-0"></div>
                  <div className="flex-1">
                    <div className="font-bold text-neutral-800">{item.note}</div>
                    <div className="text-neutral-400 text-[11px] mt-0.5">
                      {new Date(item.timestamp).toLocaleString('ar-DZ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-400 text-xs text-center py-6">لا توجد أحداث سابقة مسجلة.</p>
          )}
        </div>
      )}

      {/* Tab 2: Slick-Pay Payment History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-neutral-200/90 overflow-hidden">
          <div className="p-6 border-b border-neutral-100">
            <h3 className="text-sm font-black text-neutral-900">سجل عمليات الدفع الإلكتروني (Slick-Pay & SATIM):</h3>
          </div>
          {payments.length === 0 ? (
            <div className="p-12 text-center text-neutral-400 text-xs">
              لم تقم بأي عمليات دفع سابقة عبر Slick-Pay بعد.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">رقم الطلب</th>
                    <th className="py-3 px-4">فاتورة Slick-Pay</th>
                    <th className="py-3 px-4">الباقة</th>
                    <th className="py-3 px-4">المبلغ</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">التاريخ</th>
                    <th className="py-3 px-4">المرجع البنكي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">{p.orderId}</td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{p.slickpayInvoiceId || '—'}</td>
                      <td className="py-3 px-4 font-bold">{p.planName}</td>
                      <td className="py-3 px-4 font-black text-neutral-900" dir="ltr">{p.amount} DZD</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.status === 'paid' ? 'مدفوع ومكتمل' : p.status === 'pending' ? 'قيد الانتظار' : 'ملغي / فاشل'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(p.createdAt).toLocaleDateString('ar-DZ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                        {p.transactionReference || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
