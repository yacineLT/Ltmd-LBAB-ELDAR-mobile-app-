import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { UserSubscription } from '../../types';
import { ShieldCheck, Calendar, Search, RefreshCw, UserCheck, Clock, CheckCircle2 } from 'lucide-react';

export const AdminSubscriptionsManager: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionService.getAdminSubscriptions();
      setSubscriptions(data);
    } catch (err) {
      console.error('[AdminSubscriptionsManager] Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const filteredSubs = subscriptions.filter((sub) => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        sub.userName?.toLowerCase().includes(term) ||
        sub.userEmail?.toLowerCase().includes(term) ||
        sub.userId.toLowerCase().includes(term) ||
        sub.planName.toLowerCase().includes(term) ||
        sub.id.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-neutral-200">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#FF6600]" />
            <span>إدارة اشتراكات المستخدمين والتجار (Subscriptions)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            متابعة الاشتراكات النشطة، الباقات المفعلة عبر Slick-Pay، وتواريخ الصلاحية
          </p>
        </div>

        <button
          onClick={loadSubscriptions}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث القائمة</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="بحث بالاسم، البريد، معرف المستخدم أو معرف الاشتراك..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-[#FF6600]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 text-xs font-bold text-neutral-700 focus:outline-none focus:border-[#FF6600]"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="active">نشط فقط (Active)</option>
          <option value="expired">منتهي (Expired)</option>
          <option value="cancelled">ملغي (Cancelled)</option>
        </select>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-neutral-400">جاري تحميل سجل الاشتراكات...</div>
        ) : filteredSubs.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-400">لا توجد اشتراكات تطابق معايير البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                <tr>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">الباقة</th>
                  <th className="py-3 px-4">السعر</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ البداية</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">طريقة الدفع</th>
                  <th className="py-3 px-4">آخر فاتورة Slick-Pay</th>
                  <th className="py-3 px-4">المرجع البنكي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-neutral-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-neutral-900">{sub.userName || sub.userId}</div>
                      <div className="text-[11px] text-neutral-400">{sub.userEmail || sub.userId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          sub.planTier === 'BUSINESS'
                            ? 'bg-purple-100 text-purple-800'
                            : sub.planTier === 'PRO'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}
                      >
                        {sub.planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-black text-neutral-800" dir="ltr">
                      {sub.price} DZD
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          sub.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {sub.status === 'active' ? 'نشط' : sub.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(sub.startDate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(sub.endDate).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-neutral-700">
                      {sub.paymentMethod === 'SLICK_PAY_SATIM' ? 'Slick-Pay SATIM' : 'مجاني'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {sub.lastInvoiceId || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-500 text-[11px]">
                      {sub.transactionReference || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
