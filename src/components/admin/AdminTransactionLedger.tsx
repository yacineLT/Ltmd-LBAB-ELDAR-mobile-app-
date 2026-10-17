import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { FinancialTransaction, FinancialAuditLog, TransactionType, UserRole } from '../../types';
import {
  FileText,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Layers,
  Activity,
} from 'lucide-react';

export const AdminTransactionLedger: React.FC = () => {
  const [viewMode, setViewMode] = useState<'transactions' | 'audit'>('transactions');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditLog[]>([]);

  // Filters
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setTransactions(dbService.getTransactions());
    setAuditLogs(dbService.getAuditLogs());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (typeFilter !== 'ALL' && tx.type !== typeFilter) return false;
    if (roleFilter !== 'ALL' && tx.userRole !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchId = tx.transactionId.toLowerCase().includes(q);
      const matchOrder = tx.orderId?.toLowerCase().includes(q);
      if (!matchDesc && !matchId && !matchOrder) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'transactions'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FileText className="w-4 h-4" /> دفتر قيود المعاملات المالية ({transactions.length})
          </button>

          <button
            onClick={() => setViewMode('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              viewMode === 'audit'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> سجل تدقيق العمليات الإدارية ({auditLogs.length})
          </button>
        </div>

        {viewMode === 'transactions' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute right-3 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث بالرقم أو الوصف..."
              className="w-full text-xs pr-9 pl-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 focus:ring-2 focus:ring-[#FF6600]"
            />
          </div>
        )}
      </div>

      {viewMode === 'transactions' ? (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> نوع المعاملة:
            </span>
            {[
              { id: 'ALL', label: 'الكل' },
              { id: 'ORDER_EARNING', label: 'مبيعات التجار' },
              { id: 'COMMISSION', label: 'عمولات المنصة' },
              { id: 'DELIVERY_EARNING', label: 'أتعاب التوصيل' },
              { id: 'WITHDRAWAL', label: 'سحوبات أرباح' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTypeFilter(t.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  typeFilter === t.id
                    ? 'bg-neutral-800 text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                {t.label}
              </button>
            ))}

            <span className="text-neutral-300 mx-1">|</span>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs font-bold bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-neutral-700"
            >
              <option value="ALL">جميع الأطراف</option>
              <option value="ADMIN">المنصة (Admin)</option>
              <option value="MERCHANT">التجار</option>
              <option value="COURIER">الكباتن</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-neutral-400 text-sm">
                لا توجد قيود مالية تطابق شروط البحث
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-neutral-50 text-[11px] font-black text-neutral-500 uppercase">
                      <th className="py-3 px-4">رقم القيد</th>
                      <th className="py-3 px-4">النوع والطرف</th>
                      <th className="py-3 px-4">البيان والتفاصيل</th>
                      <th className="py-3 px-4">التاريخ والوقت</th>
                      <th className="py-3 px-4 text-left">المبلغ الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-xs">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-neutral-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-neutral-700">
                          {tx.transactionId}
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tx.type === 'COMMISSION'
                                  ? 'bg-purple-50 text-purple-700'
                                  : tx.type === 'ORDER_EARNING'
                                  ? 'bg-blue-50 text-blue-700'
                                  : tx.type === 'DELIVERY_EARNING'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {tx.type === 'COMMISSION'
                                ? 'عمولة منصة'
                                : tx.type === 'ORDER_EARNING'
                                ? 'صافي بيع'
                                : tx.type === 'DELIVERY_EARNING'
                                ? 'توصيل'
                                : 'سحب أموال'}
                            </span>
                            <span className="text-[10px] text-neutral-400">
                              ({tx.userRole === 'ADMIN' ? 'المنصة' : tx.userRole === 'MERCHANT' ? 'تاجر' : 'كابتن'})
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-neutral-900 font-medium max-w-[320px]">
                          {tx.description}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-neutral-500 font-mono">
                          {new Date(tx.createdAt).toLocaleString('ar-DZ')}
                        </td>

                        <td className="py-3 px-4 text-left">
                          <span
                            className={`font-black text-sm block ${
                              tx.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()} دج
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Audit Trail View */
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              لا توجد سجلات تدقيق حتى الآن
            </div>
          ) : (
            <div className="divide-y divide-neutral-100 text-xs">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900">{log.actorName || log.actorId}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-600">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-neutral-600">{log.details}</p>
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('ar-DZ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
