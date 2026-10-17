import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Order, Store, User, UserRole, OrderStatus } from '../../types';
import { OrderStatusBadge, RoleBadge } from '../../components/common/Badge';
import {
  ShieldCheck,
  Store as StoreIcon,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  Search,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Eye,
  Filter,
  CreditCard,
  Building2,
  Sliders,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useRouter } from '../../router/Router';
import { AdminFinancialStats } from '../../components/admin/AdminFinancialStats';
import { AdminWithdrawalsManager } from '../../components/admin/AdminWithdrawalsManager';
import { AdminBranchesManager } from '../../components/admin/AdminBranchesManager';
import { AdminFinancialSettings } from '../../components/admin/AdminFinancialSettings';
import { AdminPaymentVerifications } from '../../components/admin/AdminPaymentVerifications';
import { AdminTransactionLedger } from '../../components/admin/AdminTransactionLedger';
import { AdminSubscriptionsManager } from '../../components/admin/AdminSubscriptionsManager';
import { AdminPaymentsManager } from '../../components/admin/AdminPaymentsManager';
import { AdminPlansManager } from '../../components/admin/AdminPlansManager';

export const AdminDashboardView: React.FC = () => {
  const { navigate } = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingWithdrawalsCount, setPendingWithdrawalsCount] = useState<number>(0);
  const [pendingVerificationsCount, setPendingVerificationsCount] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'subscriptions'
    | 'payments'
    | 'plans'
    | 'finances'
    | 'withdrawals'
    | 'branches'
    | 'verifications'
    | 'financial-settings'
    | 'ledger'
    | 'orders'
    | 'stores'
    | 'users'
  >('overview');

  // Filter states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');

  const loadData = () => {
    setOrders(dbService.getOrders());
    setStores(dbService.getStores());
    setUsers(dbService.getUsers());
    const withdrawals = dbService.getWithdrawalRequests();
    setPendingWithdrawalsCount(withdrawals.filter((w) => w.status === 'PENDING').length);
    const profiles = dbService.getAllPaymentProfiles();
    setPendingVerificationsCount(profiles.filter((p) => p.verificationStatus === 'PENDING_VERIFICATION').length);
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  // Platform Metrics
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredGMV = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((sum, o) => sum + o.total, 0);
  const activeStoresCount = stores.filter((s) => s.isOpen).length;
  const couriersCount = users.filter((u) => u.role === 'COURIER').length;
  const merchantsCount = users.filter((u) => u.role === 'MERCHANT').length;

  const handleToggleStoreOpen = (storeId: string, currentStatus: boolean) => {
    dbService.updateStore(storeId, { isOpen: !currentStatus });
  };

  const handleToggleStoreFeatured = (storeId: string, currentStatus: boolean) => {
    dbService.updateStore(storeId, { isFeatured: !currentStatus });
  };

  const handleUpdateUserRole = (userId: string, newRole: UserRole) => {
    dbService.updateUser(userId, { role: newRole });
  };

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/12 text-purple-700 flex items-center justify-center font-black shadow-sm shrink-0 border border-purple-500/20 backdrop-blur-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900">لوحة الإدارة المركزية (Admin)</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 text-purple-800 border border-purple-400/30">
                كامل الصلاحيات
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              مراقبة وإدارة المتاجر، الكباتن، المستخدمين وحجم المعاملات المالية (GMV)
            </p>
          </div>
        </div>

        <div className="text-xs font-bold text-neutral-600 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/90 shadow-xs">
          عملة المنصة: <span className="text-[#FF6600]">الدينار الجزائري (DZD)</span>
        </div>
      </div>

      {/* Metric Cards (GMV, Total Orders, Active Stores, Couriers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>إجمالي حجم المعاملات (GMV)</span>
            <DollarSign className="w-4 h-4 text-[#FF6600]" />
          </div>
          <div className="text-2xl font-black text-neutral-900 font-mono">{totalGMV} دج</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block font-mono">
            {deliveredGMV} دج مسلّم ومحصّل
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>إجمالي الطلبات المنفذة</span>
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{orders.length} طلب</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">عبر جميع المتاجر والولايات</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>المتاجر المسجلة والنشطة</span>
            <StoreIcon className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {activeStoresCount} / {stores.length}
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">متجر مفتوح لاستقبال الطلبات</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>شبكة الكباتن والتجار</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{users.length} مستخدم</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            {couriersCount} كابتن • {merchantsCount} تاجر
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/80 shadow-xs mb-6 gap-1.5 text-xs sm:text-sm font-bold overflow-x-auto pb-1.5 scrollbar-none">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          نظرة عامة
        </button>

        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> الاشتراكات
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> مدفوعات Slick-Pay
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'plans'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> باقات الاشتراك
        </button>

        <button
          onClick={() => setActiveTab('finances')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'finances'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> النظام المالي
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'withdrawals'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> طلبات السحب
          {pendingWithdrawalsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
              {pendingWithdrawalsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('branches')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" /> الفروع المعتمدة
        </button>

        <button
          onClick={() => setActiveTab('verifications')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'verifications'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" /> توثيق الحسابات
          {pendingVerificationsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
              {pendingVerificationsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('financial-settings')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'financial-settings'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" /> إعدادات العمولات
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> دفتر القيود
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Package className="w-3.5 h-3.5" /> الطلبات ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('stores')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'stores'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <StoreIcon className="w-3.5 h-3.5" /> المتاجر ({stores.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-3.5 rounded-xl whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> المستخدمين ({users.length})
        </button>
      </div>

      {/* ADMIN SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && <AdminSubscriptionsManager />}

      {/* ADMIN PAYMENTS & SLICK-PAY INVOICES */}
      {activeTab === 'payments' && <AdminPaymentsManager />}

      {/* ADMIN SUBSCRIPTION PLANS */}
      {activeTab === 'plans' && <AdminPlansManager />}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h3 className="font-bold text-base text-neutral-900 border-b border-gray-100/80 pb-3">
              أحدث الطلبات على المنصة
            </h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="p-3 bg-white/70 backdrop-blur-sm border border-white/90 hover:border-orange-500/30 hover:bg-orange-500/10 rounded-2xl transition cursor-pointer flex items-center justify-between gap-3 text-xs shadow-xs"
                >
                  <div>
                    <div className="font-bold text-neutral-900">
                      #{order.id} • {order.storeName}
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      الزبون: {order.customerName} • {order.deliveryAddress.commune}
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="font-black text-[#FF6600] block font-mono">{order.total} دج</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stores Status Card */}
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
            <h3 className="font-bold text-base text-neutral-900 border-b border-gray-100/80 pb-3">
              حالة المتاجر المفتوحة
            </h3>
            <div className="space-y-3">
              {stores.map((s) => (
                <div
                  key={s.id}
                  className="p-3 bg-white/70 backdrop-blur-sm border border-white/90 rounded-2xl flex items-center justify-between text-xs shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img src={s.logoUrl} alt={s.name} className="w-10 h-10 rounded-xl object-cover shadow-xs border border-white/80" />
                    <div>
                      <h4 className="font-bold text-neutral-900">{s.name}</h4>
                      <p className="text-[11px] text-neutral-500">
                        {s.commune} ({s.wilaya}) • {s.category}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStoreOpen(s.id, s.isOpen)}
                    className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer border ${
                      s.isOpen ? 'bg-emerald-500/15 text-emerald-800 border-emerald-300/40' : 'bg-neutral-200 text-neutral-700 border-neutral-300'
                    }`}
                  >
                    {s.isOpen ? 'مفتوح' : 'مغلق'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900">سجل كافة طلبات المنصة</h2>

            {/* Filter by status */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-neutral-600">تصفية حسب الحالة:</span>
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 font-semibold"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="PENDING">PENDING</option>
                <option value="ACCEPTED">ACCEPTED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                <option value="COURIER_ASSIGNED">COURIER_ASSIGNED</option>
                <option value="PICKED_UP">PICKED_UP</option>
                <option value="ON_THE_WAY">ON_THE_WAY</option>
                <option value="ARRIVED">ARRIVED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">المتجر</th>
                  <th className="p-3">الزبون</th>
                  <th className="p-3">الكابتن المكلّف</th>
                  <th className="p-3">المبلغ الإجمالي</th>
                  <th className="p-3">طريقة الدفع</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/80">
                    <td className="p-3 font-mono font-bold text-neutral-900">#{o.id}</td>
                    <td className="p-3 font-bold">{o.storeName}</td>
                    <td className="p-3">
                      <div>{o.customerName}</div>
                      <div className="text-[10px] text-neutral-400">{o.customerPhone}</div>
                    </td>
                    <td className="p-3 font-medium">
                      {o.courierName ? (
                        <span className="text-amber-800">{o.courierName}</span>
                      ) : (
                        <span className="text-neutral-400">لم يُعيّن</span>
                      )}
                    </td>
                    <td className="p-3 font-black text-[#FF6600]">{o.total} دج</td>
                    <td className="p-3">
                      {o.paymentMethod === 'CASH_ON_DELIVERY' ? 'نقداً (COD)' : 'بطاقة CIB'}
                    </td>
                    <td className="p-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="p-3 text-left">
                      <button
                        onClick={() => navigate(`/orders/${o.id}`)}
                        className="px-3 py-1 bg-neutral-900 text-white font-bold rounded-lg hover:bg-black transition text-[11px]"
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STORES */}
      {activeTab === 'stores' && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100/80 pb-4">
            <h2 className="text-base font-bold text-neutral-900">إدارة المتاجر وحالة التشغيل</h2>
            <span className="text-xs text-neutral-500">التحكم الفوري في توفر المتاجر</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stores.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-white/90 bg-white/70 backdrop-blur-sm space-y-3 text-xs shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img src={s.logoUrl} alt={s.name} className="w-12 h-12 rounded-xl object-cover shadow-xs border border-white/80" />
                    <div>
                      <h3 className="font-bold text-sm text-neutral-900">{s.name}</h3>
                      <p className="text-neutral-500 text-[11px]">
                        {s.commune}، {s.wilaya} • هاتف: {s.phone}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      s.isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {s.isOpen ? 'مفتوح' : 'مغلق'}
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleStoreOpen(s.id, s.isOpen)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      s.isOpen
                        ? 'bg-rose-500/12 text-rose-700 border border-rose-300/40 hover:bg-rose-500/20'
                        : 'bg-emerald-500/12 text-emerald-700 border border-emerald-300/40 hover:bg-emerald-500/20'
                    }`}
                  >
                    {s.isOpen ? 'إيقاف المتجر مؤقتاً' : 'تفعيل المتجر وفتحه'}
                  </button>

                  <button
                    onClick={() => handleToggleStoreFeatured(s.id, s.isFeatured)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      s.isFeatured
                        ? 'bg-amber-500/15 text-amber-900 border border-amber-300/40'
                        : 'bg-white/80 text-neutral-600 hover:bg-white border border-white/90'
                    }`}
                  >
                    {s.isFeatured ? 'متجر مميز ★' : 'تعيين كمتجر مميز'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USERS & ROLES */}
      {activeTab === 'finances' && (
        <AdminFinancialStats onNavigateToTab={(tab) => setActiveTab(tab as any)} />
      )}

      {activeTab === 'withdrawals' && <AdminWithdrawalsManager />}

      {activeTab === 'branches' && <AdminBranchesManager />}

      {activeTab === 'verifications' && <AdminPaymentVerifications />}

      {activeTab === 'financial-settings' && <AdminFinancialSettings />}

      {activeTab === 'ledger' && <AdminTransactionLedger />}

      {activeTab === 'users' && (
        <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <h2 className="text-base font-bold text-neutral-900">المستخدمين وإدارة الأدوار (RBAC)</h2>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-neutral-600">الدور:</span>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 font-semibold"
              >
                <option value="ALL">جميع الأدوار</option>
                <option value="CUSTOMER">CUSTOMER</option>
                <option value="MERCHANT">MERCHANT</option>
                <option value="COURIER">COURIER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-neutral-50 text-neutral-600 font-bold border-b border-neutral-200">
                <tr>
                  <th className="p-3">الاسم الكامل</th>
                  <th className="p-3">البريد الإلكتروني</th>
                  <th className="p-3">الهاتف</th>
                  <th className="p-3">الدور الحالي</th>
                  <th className="p-3 text-left">تعديل الدور</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/80">
                    <td className="p-3 font-bold text-neutral-900">{u.fullName}</td>
                    <td className="p-3 text-neutral-600">{u.email}</td>
                    <td className="p-3 text-neutral-600 font-mono">{u.phone}</td>
                    <td className="p-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3 text-left">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateUserRole(u.id, e.target.value as UserRole)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-50 border border-neutral-200 text-[11px] font-bold text-neutral-800"
                      >
                        <option value="CUSTOMER">CUSTOMER (زبون)</option>
                        <option value="MERCHANT">MERCHANT (تاجر)</option>
                        <option value="COURIER">COURIER (كابتن)</option>
                        <option value="ADMIN">ADMIN (مسؤول)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
