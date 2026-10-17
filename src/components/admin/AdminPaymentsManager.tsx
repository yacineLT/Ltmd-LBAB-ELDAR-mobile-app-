import React, { useState, useEffect } from 'react';
import { subscriptionService } from '../../services/subscriptionService';
import { PaymentRecord, PaymentEventLog } from '../../types';
import { CreditCard, Search, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, Activity } from 'lucide-react';

export const AdminPaymentsManager: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [events, setEvents] = useState<PaymentEventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'events'>('records');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await subscriptionService.getAdminPayments();
      setPayments(res.payments || []);
      setEvents(res.events || []);
    } catch (err) {
      console.error('[AdminPaymentsManager] Error loading payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        p.orderId.toLowerCase().includes(term) ||
        String(p.slickpayInvoiceId || '').toLowerCase().includes(term) ||
        p.userName.toLowerCase().includes(term) ||
        p.userEmail.toLowerCase().includes(term) ||
        (p.transactionReference && p.transactionReference.toLowerCase().includes(term))
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
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <span>مدفوعات وفواتير Slick-Pay V2 (Payments)</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            سجل التحصيلات المالية، معرفات الفواتير، وحالات الدفع عبر SATIM (الذهبية / CIB)
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Tabs: Payment Records vs Audit Events */}
      <div className="flex gap-2 border-b border-neutral-200 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('records')}
          className={`pb-3 px-4 border-b-2 transition ${
            activeSubTab === 'records'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          سجل المعاملات والفواتير ({payments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('events')}
          className={`pb-3 px-4 border-b-2 transition flex items-center gap-1.5 ${
            activeSubTab === 'events'
              ? 'border-[#FF6600] text-[#FF6600]'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>سجل أحداث الدفع و Webhooks ({events.length})</span>
        </button>
      </div>

      {activeSubTab === 'records' && (
        <>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                placeholder="بحث برقم الطلب، معرف فاتورة Slick-Pay، اسم المشترك، أو المرجع..."
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
              <option value="paid">مدفوع بنجاح (Paid)</option>
              <option value="pending">قيد الانتظار (Pending)</option>
              <option value="failed">فاشل أو ملغي (Failed)</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-neutral-400">جاري تحميل سجل المدفوعات...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400">لا توجد سجلات دفع مطابقة.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                    <tr>
                      <th className="py-3 px-4">رقم الطلب (Order ID)</th>
                      <th className="py-3 px-4">فاتورة Slick-Pay</th>
                      <th className="py-3 px-4">المشترك</th>
                      <th className="py-3 px-4">الباقة</th>
                      <th className="py-3 px-4">المبلغ</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4">المرجع البنكي</th>
                      <th className="py-3 px-4">مصدر التحقق</th>
                      <th className="py-3 px-4">تاريخ الإنشاء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-900">{p.orderId}</td>
                        <td className="py-3 px-4 font-mono text-neutral-700">
                          {p.slickpayInvoiceId || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-neutral-900">{p.userName}</div>
                          <div className="text-[11px] text-neutral-400">{p.userEmail}</div>
                        </td>
                        <td className="py-3 px-4 font-medium text-neutral-800">{p.planName}</td>
                        <td className="py-3 px-4 font-black text-neutral-900" dir="ltr">
                          {p.amount} DZD
                        </td>
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
                            {p.status === 'paid'
                              ? 'مدفوع'
                              : p.status === 'pending'
                              ? 'قيد الانتظار'
                              : 'فاشل'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-500 text-[11px]">
                          {p.transactionReference || '—'}
                        </td>
                        <td className="py-3 px-4 text-neutral-500 text-[11px]">
                          {p.verificationSource === 'webhook'
                            ? 'Webhook فوري'
                            : p.verificationSource === 'return_url'
                            ? 'رابط العودة'
                            : '—'}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 text-[11px]">
                          {new Date(p.createdAt).toLocaleDateString('ar-DZ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Payment Events & Webhook Logs */}
      {activeSubTab === 'events' && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-neutral-50 border-b border-neutral-200">
            <h3 className="text-xs font-bold text-neutral-700">سجل الأحداث المباشرة (Event Log & Webhooks):</h3>
          </div>
          {events.length === 0 ? (
            <div className="p-12 text-center text-xs text-neutral-400">لا توجد أحداث مسجلة بعد.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-neutral-50 text-neutral-500 font-bold border-b border-neutral-200">
                  <tr>
                    <th className="py-3 px-4">نوع الحدث (Event)</th>
                    <th className="py-3 px-4">رقم الطلب</th>
                    <th className="py-3 px-4">فاتورة Slick-Pay</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">الوقت</th>
                    <th className="py-3 px-4">تفاصيل إضافية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {events.map((e) => (
                    <tr key={e.id} className="hover:bg-neutral-50/70 transition">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">{e.eventType}</td>
                      <td className="py-3 px-4 font-mono text-neutral-700">{e.orderId}</td>
                      <td className="py-3 px-4 font-mono text-neutral-600">{e.invoiceId || '—'}</td>
                      <td className="py-3 px-4 font-bold text-neutral-700">{e.status}</td>
                      <td className="py-3 px-4 text-neutral-400 text-[11px]">
                        {new Date(e.timestamp).toLocaleTimeString('ar-DZ')}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-neutral-500 max-w-xs truncate">
                        {JSON.stringify(e.details)}
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
