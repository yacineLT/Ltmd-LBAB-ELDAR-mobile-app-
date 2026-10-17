import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { User, Store, WithdrawalRequest, UserPaymentProfile, Branch, WithdrawalMethod } from '../../types';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  FileText,
  ShieldCheck,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

interface Props {
  user: User;
  store: Store;
}

export const MerchantFinancialWallet: React.FC<Props> = ({ user, store }) => {
  const [finances, setFinances] = useState(() =>
    dbService.calculateMerchantFinances(store.id)
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [profile, setProfile] = useState<UserPaymentProfile | undefined>(undefined);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [commSettings, setCommSettings] = useState(() => dbService.getCommissionSettings());
  const [paymentSettings, setPaymentSettings] = useState(() => dbService.getPaymentSettings());

  // Withdrawal Modal State
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(3000);
  const [withdrawMethod, setWithdrawMethod] = useState<WithdrawalMethod>('EDAHABIA');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null);

  // Profile Edit Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [ccpNumber, setCcpNumber] = useState('');
  const [ripKey, setRipKey] = useState('');
  const [rib, setRib] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  const loadData = () => {
    setFinances(dbService.calculateMerchantFinances(store.id));
    setWithdrawals(dbService.getWithdrawalRequests(user.id));
    const p = dbService.getUserPaymentProfile(user.id);
    setProfile(p);
    if (p) {
      setCcpNumber(p.edahabia?.ccpNumber || '');
      setRipKey(p.edahabia?.ripKey || '');
      setRib(p.cib?.rib || '');
      setBankName(p.cib?.bankName || '');
      setAccountHolderName(p.edahabia?.accountHolderName || p.cib?.accountHolderName || user.fullName);
    }
    const bList = dbService.getBranches().filter((b) => b.isActive);
    setBranches(bList);
    if (bList.length > 0 && !selectedBranchId) {
      setSelectedBranchId(bList[0].id);
    }
    setCommSettings(dbService.getCommissionSettings());
    setPaymentSettings(dbService.getPaymentSettings());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, [user.id, store.id]);

  const handleSavePaymentProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedBranch = branches.find((b) => b.id === selectedBranchId);

    dbService.saveUserPaymentProfile({
      userId: user.id,
      userRole: 'MERCHANT',
      userName: user.fullName,
      storeId: store.id,
      activeMethod: withdrawMethod,
      edahabia: {
        ccpNumber: ccpNumber.trim(),
        ripKey: ripKey.trim(),
        accountHolderName: accountHolderName.trim() || user.fullName,
      },
      cib: {
        rib: rib.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim() || user.fullName,
      },
      branch: selectedBranch
        ? {
            branchId: selectedBranch.id,
            branchName: selectedBranch.name,
            branchAddress: selectedBranch.address,
            wilaya: selectedBranch.wilaya,
          }
        : undefined,
    });

    setProfileSavedMsg(true);
    setTimeout(() => {
      setProfileSavedMsg(false);
      setIsProfileModalOpen(false);
    }, 1500);
  };

  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccess(null);

    const minAmount = commSettings?.withdrawalLimits?.minAmountMerchant ?? 3000;
    const maxAmount = commSettings?.withdrawalLimits?.maxAmountMerchant ?? 300000;

    if (withdrawAmount < minAmount) {
      setWithdrawError(`الحد الأدنى لطلب السحب هو ${minAmount.toLocaleString()} دج.`);
      return;
    }

    if (withdrawAmount > maxAmount) {
      setWithdrawError(`الحد الأقصى لطلب السحب هو ${maxAmount.toLocaleString()} دج.`);
      return;
    }

    if (withdrawAmount > finances.availableBalance) {
      setWithdrawError(`المبلغ المطلوب يتجاوز رصيدك المتاح للسحب (${(finances.availableBalance ?? 0).toLocaleString()} دج).`);
      return;
    }

    if (withdrawMethod === 'EDAHABIA' && (!ccpNumber || !ripKey)) {
      setWithdrawError('يرجى إدخال رقم الحساب البريدي (CCP) ومفتاح الـ RIP أولاً في بيانات الحساب.');
      return;
    }

    if (withdrawMethod === 'CIB' && (!rib || rib.length < 15)) {
      setWithdrawError('يرجى إدخال رقم الـ RIB البنكي كاملاً واسم البنك.');
      return;
    }

    // Auto-save/ensure payment profile exists before withdrawing
    const selectedBranch = branches.find((b) => b.id === selectedBranchId);
    dbService.saveUserPaymentProfile({
      userId: user.id,
      userRole: 'MERCHANT',
      userName: user.fullName,
      storeId: store.id,
      activeMethod: withdrawMethod,
      edahabia: {
        ccpNumber: ccpNumber.trim(),
        ripKey: ripKey.trim(),
        accountHolderName: accountHolderName.trim() || user.fullName,
      },
      cib: {
        rib: rib.trim(),
        bankName: bankName.trim(),
        accountHolderName: accountHolderName.trim() || user.fullName,
      },
      branch: selectedBranch
        ? {
            branchId: selectedBranch.id,
            branchName: selectedBranch.name,
            branchAddress: selectedBranch.address,
            wilaya: selectedBranch.wilaya,
          }
        : undefined,
    });

    const result = dbService.createWithdrawalRequest({
      userId: user.id,
      userName: user.fullName,
      userRole: 'MERCHANT',
      storeId: store.id,
      storeName: store.name,
      amount: withdrawAmount,
      withdrawalMethod: withdrawMethod,
      branchId: withdrawMethod === 'BRANCH' ? selectedBranchId : undefined,
    });

    if (!result.success) {
      setWithdrawError(result.error || 'تعذر إرسال طلب السحب');
      return;
    }

    setWithdrawSuccess(`تم إرسال طلب السحب #${result.request?.requestId} بنجاح وهو قيد المعالجة الإدارية.`);
    setTimeout(() => {
      setIsWithdrawModalOpen(false);
      setWithdrawSuccess(null);
    }, 2000);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner: Available Balance & Request Withdrawal */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-neutral-700/50">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
            <Wallet className="w-4 h-4 text-[#FF6600]" />
            <span>محفظة أرباح متجر: {store.name}</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              {(finances?.availableBalance ?? 0).toLocaleString()}
            </span>
            <span className="text-lg font-bold text-neutral-300">دج رصيد متاح للسحب</span>
          </div>

          <p className="text-xs text-neutral-400 max-w-md">
            الأرباح المكتسبة من الطلبات المسلمة بعد خصم عمولة المنصة ({commSettings.merchant.value}%). الرصيد آمن ومتاح للسحب في أي وقت.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-white/10"
          >
            <CreditCard className="w-4 h-4 text-[#FF6600]" /> بيانات الحساب البنكي / CCP
          </button>

          <button
            onClick={() => {
              setWithdrawError(null);
              setWithdrawSuccess(null);
              setIsWithdrawModalOpen(true);
            }}
            disabled={(finances?.availableBalance ?? 0) < (commSettings?.withdrawalLimits?.minAmountMerchant ?? 3000)}
            className="px-6 py-3 rounded-2xl bg-[#FF6600] hover:bg-[#e05a00] disabled:bg-neutral-700 disabled:text-neutral-400 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" /> طلب سحب أرباح
          </button>
        </div>
      </div>

      {/* Financial KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>إجمالي المبيعات (Gross)</span>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {(finances?.grossSales ?? 0).toLocaleString()} <span className="text-xs font-bold text-neutral-500">دج</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            من {finances?.deliveredOrdersCount ?? 0} طلب مسلّم
          </span>
        </div>

        {/* Platform Commission Deducted */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>عمولة المنصة ({commSettings.merchant.value}%)</span>
            <span className="text-xs font-bold text-rose-600">خصم المنصة</span>
          </div>
          <div className="text-2xl font-black text-rose-600">
            -{(finances?.commissionDeducted ?? 0).toLocaleString()} <span className="text-xs font-bold">دج</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            رسوم التشغيل وخدمات المنصة
          </span>
        </div>

        {/* Net Sales */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>صافي الأرباح المكتسبة</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {(finances?.netSales ?? 0).toLocaleString()} <span className="text-xs font-bold">دج</span>
          </div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            المبيعات ناقص عمولة المنصة
          </span>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>سحوبات مكتملة ومسددة</span>
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {(finances?.totalWithdrawn ?? 0).toLocaleString()} <span className="text-xs font-bold text-neutral-500">دج</span>
          </div>
          <span className="text-[11px] text-amber-600 font-bold mt-1 block">
            {(finances?.pendingWithdrawals ?? 0) > 0
              ? `${(finances?.pendingWithdrawals ?? 0).toLocaleString()} دج قيد السحب حالياً`
              : 'لا توجد سحوبات قيد الانتظار'}
          </span>
        </div>
      </div>

      {/* Account Verification & Registered Payment Details Card */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-neutral-900">حالة الحساب البنكي / البريدي المعتمد للسحب</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                profile?.verificationStatus === 'VERIFIED'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : profile?.verificationStatus === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {profile?.verificationStatus === 'VERIFIED'
                ? 'موثق ومعتمد'
                : profile?.verificationStatus === 'REJECTED'
                ? 'مرفوض - يرجى تصحيح البيانات'
                : 'قيد مراجعة الإدارة'}
            </span>
          </div>

          <div className="text-xs text-neutral-500 flex flex-wrap gap-4 pt-1">
            {profile?.edahabia?.ccpNumber && (
              <span>
                <strong className="text-neutral-700">CCP:</strong> {profile.edahabia.ccpNumber} (مفتاح: {profile.edahabia.ripKey})
              </span>
            )}
            {profile?.cib?.rib && (
              <span>
                <strong className="text-neutral-700">RIB:</strong> {profile.cib.rib} ({profile.cib.bankName})
              </span>
            )}
            {!profile?.edahabia?.ccpNumber && !profile?.cib?.rib && (
              <span className="text-amber-700">لم تقم بإضافة بياناتك المالية بعد. انقر على الزر لتسجيلها.</span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="text-xs font-bold text-[#FF6600] hover:underline shrink-0"
        >
          تعديل أو تحديث الحساب ←
        </button>
      </div>

      {/* Withdrawal Requests History */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-neutral-500" />
            سجل طلبات سحب الأرباح ({withdrawals.length})
          </h3>
          <span className="text-xs text-neutral-400">
            الحد الأدنى: {(commSettings?.withdrawalLimits?.minAmountMerchant ?? 3000).toLocaleString()} دج
          </span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs">
            لم تقم بتقديم أي طلبات سحب أرباح بعد
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 font-bold">
                  <th className="p-3">رقم الطلب</th>
                  <th className="p-3">المبلغ</th>
                  <th className="p-3">طريقة السحب</th>
                  <th className="p-3">تاريخ الطلب</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">ملاحظات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {withdrawals.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/70">
                    <td className="p-3 font-mono font-bold text-neutral-800">{req.requestId}</td>
                    <td className="p-3 font-black text-sm text-neutral-900">
                      {(req?.amount ?? 0).toLocaleString()} دج
                    </td>
                    <td className="p-3">
                      {req.withdrawalMethod === 'EDAHABIA'
                        ? 'الذهبية (CCP)'
                        : req.withdrawalMethod === 'CIB'
                        ? 'حساب بنكي (CIB)'
                        : 'استلام من الفرع'}
                    </td>
                    <td className="p-3 text-neutral-500 font-mono">
                      {new Date(req.createdAt).toLocaleDateString('ar-DZ')}
                    </td>
                    <td className="p-3">
                      {req.status === 'PENDING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          بانتظار المراجعة
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          تمت الموافقة
                        </span>
                      )}
                      {req.status === 'PROCESSING' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                          قيد التحويل
                        </span>
                      )}
                      {req.status === 'COMPLETED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          مكتمل ومسدد
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          مرفوض
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-neutral-600 max-w-[200px] truncate">
                      {req.rejectionReason || req.adminNote || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#FF6600]" />
                طلب سحب أرباح المتجر
              </h3>
              <button
                onClick={() => setIsWithdrawModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {withdrawError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{withdrawError}</span>
              </div>
            )}

            {withdrawSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{withdrawSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateWithdrawal} className="space-y-4 text-xs">
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200 text-neutral-700 flex justify-between items-center">
                <span>رصيدك المتاح للسحب:</span>
                <span className="font-black text-base text-emerald-600">
                  {(finances?.availableBalance ?? 0).toLocaleString()} دج
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">
                  المبلغ المراد سحبه (دج) *
                </label>
                <input
                  type="number"
                  min={commSettings?.withdrawalLimits?.minAmountMerchant ?? 3000}
                  max={Math.min(commSettings?.withdrawalLimits?.maxAmountMerchant ?? 300000, finances.availableBalance)}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value) || 0)}
                  required
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-black text-base text-neutral-900 focus:ring-2 focus:ring-[#FF6600]"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  الحد الأدنى: {(commSettings?.withdrawalLimits?.minAmountMerchant ?? 3000).toLocaleString()} دج • الحد الأقصى: {(commSettings?.withdrawalLimits?.maxAmountMerchant ?? 300000).toLocaleString()} دج
                </span>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">طريقة السحب المفضلة *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('EDAHABIA')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      withdrawMethod === 'EDAHABIA'
                        ? 'border-[#FF6600] bg-orange-50 text-[#FF6600]'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>الذهبية (CCP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('CIB')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      withdrawMethod === 'CIB'
                        ? 'border-[#FF6600] bg-orange-50 text-[#FF6600]'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>بنك (CIB)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawMethod('BRANCH')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex flex-col items-center gap-1 ${
                      withdrawMethod === 'BRANCH'
                        ? 'border-[#FF6600] bg-orange-50 text-[#FF6600]'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>من الفرع</span>
                  </button>
                </div>
              </div>

              {withdrawMethod === 'BRANCH' && (
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">اختر الفرع للاستلام *</label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold text-xs"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.wilaya}) - {b.address}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {withdrawMethod === 'EDAHABIA' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-[11px]">
                  <span className="font-bold text-amber-900 block">بيانات الحساب البريدي المسجلة:</span>
                  <div>رقم CCP: {ccpNumber || 'غير مسجل (يرجى إدخاله في الملف المالي)'}</div>
                  <div>مفتاح RIP: {ripKey || 'غير مسجل'}</div>
                </div>
              )}

              {withdrawMethod === 'CIB' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 text-[11px]">
                  <span className="font-bold text-blue-900 block">بيانات الحساب البنكي المسجلة:</span>
                  <div>البنك: {bankName || 'غير مسجل'}</div>
                  <div className="font-mono">RIB: {rib || 'غير مسجل'}</div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsWithdrawModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={finances.availableBalance < commSettings.withdrawalLimits.minAmountMerchant}
                  className="px-5 py-2.5 rounded-xl bg-[#FF6600] text-white font-black hover:bg-[#e05a00] transition"
                >
                  تأكيد إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900">
                بيانات الدفع والحسابات المالية
              </h3>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {profileSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" /> تم حفظ البيانات وإرسالها للمراجعة
              </div>
            )}

            <form onSubmit={handleSavePaymentProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">اسم صاحب الحساب الكامل *</label>
                <input
                  type="text"
                  required
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="كما هو مدون في بطاقة الهوية أو الشيك"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 font-bold focus:ring-2 focus:ring-[#FF6600]"
                />
              </div>

              {/* CCP details */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
                <span className="font-black text-amber-900 block flex items-center gap-1">
                  <CreditCard className="w-4 h-4 text-amber-600" /> حساب بريد الجزائر (الذهبية / CCP)
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block font-bold text-neutral-700 mb-1">رقم الحساب CCP</label>
                    <input
                      type="text"
                      value={ccpNumber}
                      onChange={(e) => setCcpNumber(e.target.value)}
                      placeholder="0012345678"
                      className="w-full p-2 rounded-lg border border-neutral-300 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-neutral-700 mb-1">المفتاح (Clé)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={ripKey}
                      onChange={(e) => setRipKey(e.target.value)}
                      placeholder="45"
                      className="w-full p-2 rounded-lg border border-neutral-300 font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* CIB details */}
              <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2.5">
                <span className="font-black text-blue-900 block flex items-center gap-1">
                  <Building2 className="w-4 h-4 text-blue-600" /> الحساب البنكي (CIB / RIB)
                </span>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">اسم البنك</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="مثال: BNA, BEA, CPA, BDL, Al Baraka"
                    className="w-full p-2 rounded-lg border border-neutral-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">رقم الـ RIB المكون من 20 رقماً</label>
                  <input
                    type="text"
                    maxLength={20}
                    value={rib}
                    onChange={(e) => setRib(e.target.value)}
                    placeholder="00100 00000 0000000000 00"
                    className="w-full p-2 rounded-lg border border-neutral-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF6600] text-white font-black hover:bg-[#e05a00] transition"
                >
                  حفظ البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
