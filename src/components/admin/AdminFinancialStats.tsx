import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { FinancialTransaction } from '../../types';
import {
  DollarSign,
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
  Truck,
  Store as StoreIcon,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminFinancialStats: React.FC<Props> = ({ onNavigateToTab }) => {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [stats, setStats] = useState(() => dbService.calculateAdminFinancialStats('all'));
  const [recentTransactions, setRecentTransactions] = useState<FinancialTransaction[]>([]);

  const loadData = () => {
    setStats(dbService.calculateAdminFinancialStats(dateFilter));
    setRecentTransactions(dbService.getTransactions().slice(0, 8));
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [dateFilter]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Date Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-neutral-500" />
          <span className="font-bold text-sm text-neutral-800">الفترة الزمنية للإحصاءات:</span>
        </div>
        <div className="flex items-center bg-neutral-100 p-1 rounded-xl gap-1 w-full sm:w-auto">
          <button
            onClick={() => setDateFilter('today')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilter === 'today' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            اليوم
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilter === 'week' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            آخر 7 أيام
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilter === 'month' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            آخر 30 يوم
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            الكل
          </button>
        </div>
      </div>

      {/* Main KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>إجمالي المعاملات (GMV)</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6600] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {(stats?.gmv ?? 0).toLocaleString()} <span className="text-sm font-bold text-neutral-500">دج</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            {stats?.deliveredOrdersCount ?? 0} طلب مسلّم ومحصّل بالكامل
          </p>
        </div>

        {/* Platform Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs relative overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="flex items-center justify-between text-emerald-800 text-xs font-medium mb-1">
            <span>صافي إيرادات المنصة (الربح)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {(stats?.totalPlatformRevenue ?? 0).toLocaleString()} <span className="text-sm font-bold text-emerald-600">دج</span>
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">
            عمولة المتاجر + حصة خدمة التوصيل
          </p>
        </div>

        {/* Merchant Payouts */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>مستحقات التجار الصافية</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <StoreIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {(stats?.netMerchantPayouts ?? 0).toLocaleString()} <span className="text-sm font-bold text-neutral-500">دج</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            من إجمالي مبيعات {(stats?.merchantGrossSales ?? 0).toLocaleString()} دج
          </p>
        </div>

        {/* Courier Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>مستحقات كباتن التوصيل</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {(stats?.totalCourierEarnings ?? 0).toLocaleString()} <span className="text-sm font-bold text-neutral-500">دج</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">
            من إجمالي رسوم توصيل {(stats?.deliveryFeesTotal ?? 0).toLocaleString()} دج
          </p>
        </div>
      </div>

      {/* Financial Breakdown & Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Economics Card */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Layers className="w-5 h-5 text-[#FF6600]" />
            <h3 className="font-black text-base text-neutral-900">توزيع التدفقات المالية للمنصة</h3>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-neutral-600 font-medium">عمولات المتاجر المكتسبة</span>
              <span className="font-bold text-neutral-900">{(stats?.totalCommissions ?? 0).toLocaleString()} دج</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <span className="text-neutral-600 font-medium">حصة المنصة من التوصيل</span>
              <span className="font-bold text-neutral-900">
                {((stats?.deliveryFeesTotal ?? 0) - (stats?.totalCourierEarnings ?? 0)).toLocaleString()} دج
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-800 font-bold">إجمالي أرباح المنصة</span>
              <span className="font-black text-emerald-800">{(stats?.totalPlatformRevenue ?? 0).toLocaleString()} دج</span>
            </div>

            <div className="pt-2 border-t border-neutral-100 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>سحوبات مكتملة ومسددة</span>
                <span className="font-bold text-neutral-800">{(stats?.completedWithdrawals ?? 0).toLocaleString()} دج</span>
              </div>
              <div className="flex items-center justify-between text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                <span>سحوبات قيد المراجعة والمعالجة ({stats?.pendingWithdrawalsCount ?? 0})</span>
                <span className="font-bold">{(stats?.pendingWithdrawalsAmount ?? 0).toLocaleString()} دج</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Ledger Snapshot */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-neutral-700" />
              <h3 className="font-black text-base text-neutral-900">أحدث حركات سجل المعاملات المالية</h3>
            </div>
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('ledger')}
                className="text-xs font-bold text-[#FF6600] hover:underline"
              >
                عرض السجل المالي الكامل ←
              </button>
            )}
          </div>

          <div className="divide-y divide-neutral-100 overflow-x-auto">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-neutral-400 text-sm">
                لا توجد معاملات مالية مسجلة حتى الآن
              </div>
            ) : (
              recentTransactions.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.amount >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.amount >= 0 ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 truncate">{tx.description}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-2">
                        <span>{tx.transactionId}</span>
                        <span>•</span>
                        <span>{new Date(tx.createdAt).toLocaleDateString('ar-DZ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span
                      className={`font-black text-sm block ${
                        tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} دج
                    </span>
                    <span className="text-[10px] font-medium text-neutral-400">
                      {tx.status === 'COMPLETED'
                        ? 'مكتمل'
                        : tx.status === 'PENDING'
                        ? 'معلق'
                        : 'ملغى'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
