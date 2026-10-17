import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { UserPaymentProfile, FinancialVerificationStatus } from '../../types';
import {
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Building2,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const AdminPaymentVerifications: React.FC = () => {
  const [profiles, setProfiles] = useState<UserPaymentProfile[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [rejectingProfile, setRejectingProfile] = useState<UserPaymentProfile | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = () => {
    setProfiles(dbService.getAllPaymentProfiles());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filtered = profiles.filter((p) => {
    if (statusFilter !== 'ALL' && p.verificationStatus !== statusFilter) return false;
    return true;
  });

  const handleVerify = (profileId: string) => {
    dbService.verifyUserPaymentProfile(
      profileId,
      'VERIFIED',
      'user_admin',
      'طه لحراوة (مدير المنصة)'
    );
  };

  const handleConfirmReject = () => {
    if (!rejectingProfile) return;
    dbService.verifyUserPaymentProfile(
      rejectingProfile.id,
      'REJECTED',
      'user_admin',
      'طه لحراوة (مدير المنصة)',
      rejectionReason.trim() || 'عدم وضوح أو صحة البيانات المالية'
    );
    setRejectingProfile(null);
    setRejectionReason('');
  };

  const pendingCount = profiles.filter((p) => p.verificationStatus === 'PENDING_VERIFICATION').length;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#FF6600]" />
            توثيق الحسابات والبيانات المالية للتجار والموصّلين
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            التحقق من صحة أرقام الـ CCP و RIB الخاصة بالمستخدمين قبل تمكينهم من سحب الأموال
          </p>
        </div>

        {pendingCount > 0 && (
          <span className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            {pendingCount} حسابات بانتظار التوثيق
          </span>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {['ALL', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              statusFilter === st
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {st === 'ALL'
              ? 'جميع الحسابات'
              : st === 'PENDING_VERIFICATION'
              ? 'قيد التحقق'
              : st === 'VERIFIED'
              ? 'موثقة'
              : 'مرفوضة'}
          </button>
        ))}
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((profile) => (
          <div
            key={profile.id}
            className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900">{profile.userName}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        profile.userRole === 'MERCHANT'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {profile.userRole === 'MERCHANT' ? 'تاجر' : 'كابتن توصيل'}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      آخر تحديث: {new Date(profile.lastUpdated).toLocaleDateString('ar-DZ')}
                    </span>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shrink-0 ${
                    profile.verificationStatus === 'VERIFIED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : profile.verificationStatus === 'REJECTED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {profile.verificationStatus === 'VERIFIED' ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" /> موثق ومعتمد
                    </>
                  ) : profile.verificationStatus === 'REJECTED' ? (
                    <>
                      <XCircle className="w-3 h-3" /> مرفوض
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3" /> بانتظار المراجعة
                    </>
                  )}
                </span>
              </div>

              {/* Method Details */}
              <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-xs space-y-2 text-neutral-700">
                {profile.edahabia && (
                  <div>
                    <span className="font-bold text-amber-800 flex items-center gap-1 mb-1">
                      <CreditCard className="w-3.5 h-3.5" /> بريد الجزائر (الذهبية):
                    </span>
                    <div className="font-mono text-neutral-800">
                      CCP: {profile.edahabia.ccpNumber || '—'} / مفتاح: {profile.edahabia.ripKey || '—'}
                    </div>
                    {profile.edahabia.accountHolderName && (
                      <div className="text-neutral-500 text-[11px]">
                        الاسم: {profile.edahabia.accountHolderName}
                      </div>
                    )}
                  </div>
                )}

                {profile.cib && (
                  <div className="pt-2 border-t border-neutral-200/60">
                    <span className="font-bold text-indigo-800 flex items-center gap-1 mb-1">
                      <CreditCard className="w-3.5 h-3.5" /> الحساب البنكي (CIB):
                    </span>
                    <div className="font-mono text-neutral-800 text-[11px] bg-white p-1 rounded border border-neutral-200">
                      RIB: {profile.cib.rib || '—'}
                    </div>
                    <div className="text-neutral-500 text-[11px] mt-0.5">
                      البنك: {profile.cib.bankName || 'غير محدد'} • الاسم: {profile.cib.accountHolderName}
                    </div>
                  </div>
                )}

                {profile.branch && (
                  <div className="pt-2 border-t border-neutral-200/60 text-[11px]">
                    <span className="font-bold text-emerald-800 flex items-center gap-1 mb-0.5">
                      <Building2 className="w-3.5 h-3.5" /> الفرع المفضل:
                    </span>
                    <span>{profile.branch.branchName || 'الفرع الرئيسي'}</span>
                  </div>
                )}
              </div>

              {profile.rejectionReason && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  <span className="font-bold">سبب الرفض: </span>
                  {profile.rejectionReason}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setRejectingProfile(profile);
                  setRejectionReason('');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 border border-rose-200 hover:bg-rose-50 transition"
              >
                رفض الحساب
              </button>

              <button
                onClick={() => handleVerify(profile.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> اعتماد وتوثيق
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Reason Modal */}
      {rejectingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-black text-base text-neutral-900">
              رفض توثيق حساب {rejectingProfile.userName}
            </h3>
            <p className="text-xs text-neutral-500">
              يرجى توضيح سبب الرفض لمساعدة المستخدم على تصحيح بياناته (مثل: خطأ في رقم الـ RIP أو الاسم غير متطابق):
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا..."
              rows={3}
              className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingProfile(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
