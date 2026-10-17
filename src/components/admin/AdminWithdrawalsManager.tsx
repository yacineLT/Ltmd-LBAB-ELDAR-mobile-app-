import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { WithdrawalRequest, WithdrawalStatus, UserRole } from '../../types';
import {
  CreditCard,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Eye,
  ArrowRight,
  AlertCircle,
  FileText,
  UserCheck,
  Send,
} from 'lucide-react';

export const AdminWithdrawalsManager: React.FC = () => {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);

  // Modal actions
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'PROCESS' | 'COMPLETE' | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadData = () => {
    setRequests(dbService.getWithdrawalRequests());
  };

  useEffect(() => {
    loadData();
    const unsub = dbService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredRequests = requests.filter((r) => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (roleFilter !== 'ALL' && r.userRole !== roleFilter) return false;
    return true;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const processingCount = requests.filter((r) => ['APPROVED', 'PROCESSING'].includes(r.status)).length;
  const completedTotal = requests
    .filter((r) => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleOpenActionModal = (
    req: WithdrawalRequest,
    type: 'APPROVE' | 'REJECT' | 'PROCESS' | 'COMPLETE'
  ) => {
    setSelectedRequest(req);
    setActionType(type);
    setAdminNote('');
    setRejectionReason('');
  };

  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;

    let targetStatus: WithdrawalStatus;
    if (actionType === 'APPROVE') targetStatus = 'APPROVED';
    else if (actionType === 'REJECT') targetStatus = 'REJECTED';
    else if (actionType === 'PROCESS') targetStatus = 'PROCESSING';
    else targetStatus = 'COMPLETED';

    dbService.updateWithdrawalStatus(
      selectedRequest.id,
      targetStatus,
      'user_admin',
      'طه لحراوة (مدير المنصة)',
      adminNote.trim() || undefined,
      actionType === 'REJECT' ? rejectionReason.trim() || 'عدم تطابق البيانات المالية' : undefined
    );

    setActionType(null);
    setSelectedRequest(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-amber-800">طلبات سحب بانتظار المراجعة</div>
            <div className="text-2xl font-black text-amber-900 mt-0.5">{pendingCount} طلب</div>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-blue-800">قيد المعالجة والتحويل</div>
            <div className="text-2xl font-black text-blue-900 mt-0.5">{processingCount} طلب</div>
          </div>
          <CreditCard className="w-8 h-8 text-blue-500 opacity-80" />
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-800">إجمالي السحوبات المسددة</div>
            <div className="text-2xl font-black text-emerald-900 mt-0.5">
              {completedTotal.toLocaleString()} دج
            </div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-80" />
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-neutral-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> تصفية الحالة:
          </span>
          {['ALL', 'PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st === 'ALL'
                ? 'الكل'
                : st === 'PENDING'
                ? 'جديد'
                : st === 'APPROVED'
                ? 'مقبول'
                : st === 'PROCESSING'
                ? 'قيد التحويل'
                : st === 'COMPLETED'
                ? 'مكتمل'
                : 'مرفوض'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-500">الفئة:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-bold bg-neutral-100 border-none rounded-xl px-3 py-2 text-neutral-800 focus:ring-2 focus:ring-[#FF6600]"
          >
            <option value="ALL">جميع المستخدمين</option>
            <option value="MERCHANT">التجار فقط</option>
            <option value="COURIER">الكباتن فقط</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-sm">
            لا توجد طلبات سحب تطابق خيارات التصفية
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-neutral-50 text-[11px] font-black text-neutral-500 uppercase">
                  <th className="py-3.5 px-4">رقم الطلب</th>
                  <th className="py-3.5 px-4">المستفيد</th>
                  <th className="py-3.5 px-4">المبلغ</th>
                  <th className="py-3.5 px-4">طريقة السحب والبيانات</th>
                  <th className="py-3.5 px-4">التاريخ</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                      {req.requestId}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-neutral-900">{req.userName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            req.userRole === 'MERCHANT'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {req.userRole === 'MERCHANT' ? 'تاجر' : 'كابتن'}
                        </span>
                        {req.storeName && (
                          <span className="text-[10px] text-neutral-500 truncate max-w-[120px]">
                            {req.storeName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-black text-sm text-neutral-900">
                        {req.amount.toLocaleString()} دج
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {req.withdrawalMethod === 'CIB' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 flex items-center gap-1">
                            <CreditCard className="w-3 h-3" /> حساب بنكي (CIB)
                          </span>
                        )}
                        {req.withdrawalMethod === 'EDAHABIA' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 flex items-center gap-1">
                            <CreditCard className="w-3 h-3 text-amber-600" /> الذهبية (CCP)
                          </span>
                        )}
                        {req.withdrawalMethod === 'BRANCH' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> استلام من الفرع
                          </span>
                        )}
                      </div>

                      {/* Snapshot mini details */}
                      <div className="text-[10px] text-neutral-500 mt-1 truncate max-w-[200px]">
                        {req.withdrawalMethod === 'EDAHABIA' && req.paymentInformationSnapshot?.details?.ccpNumber && (
                          <span>CCP: {req.paymentInformationSnapshot.details.ccpNumber} / {req.paymentInformationSnapshot.details.ripKey}</span>
                        )}
                        {req.withdrawalMethod === 'CIB' && req.paymentInformationSnapshot?.details?.rib && (
                          <span>RIB: {req.paymentInformationSnapshot.details.rib}</span>
                        )}
                        {req.withdrawalMethod === 'BRANCH' && req.paymentInformationSnapshot?.branchDetails?.branchName && (
                          <span>{req.paymentInformationSnapshot.branchDetails.branchName}</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[11px] text-neutral-500">
                      {new Date(req.createdAt).toLocaleDateString('ar-DZ')}
                      <div className="text-[10px] text-neutral-400">
                        {new Date(req.createdAt).toLocaleTimeString('ar-DZ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {req.status === 'PENDING' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 w-max">
                          <Clock className="w-3 h-3" /> بانتظار المراجعة
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> تمت الموافقة
                        </span>
                      )}
                      {req.status === 'PROCESSING' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 flex items-center gap-1 w-max">
                          <CreditCard className="w-3 h-3" /> قيد المعالجة
                        </span>
                      )}
                      {req.status === 'COMPLETED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" /> تم التحويل والسداد
                        </span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-max">
                          <XCircle className="w-3 h-3" /> مرفوض
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Details Modal Trigger */}
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setActionType(null);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleOpenActionModal(req, 'APPROVE')}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[11px] hover:bg-blue-700 transition"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => handleOpenActionModal(req, 'REJECT')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-bold text-[11px] hover:bg-rose-100 transition"
                            >
                              رفض
                            </button>
                          </>
                        )}

                        {req.status === 'APPROVED' && (
                          <button
                            onClick={() => handleOpenActionModal(req, 'PROCESS')}
                            className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition"
                          >
                            بدء التحويل
                          </button>
                        )}

                        {req.status === 'PROCESSING' && (
                          <button
                            onClick={() => handleOpenActionModal(req, 'COMPLETE')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> تأكيد السداد
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details & Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="font-black text-lg text-neutral-900">
                  تفاصيل طلب السحب #{selectedRequest.requestId}
                </h3>
                <span className="text-xs text-neutral-400">
                  المستفيد: {selectedRequest.userName} ({selectedRequest.userRole === 'MERCHANT' ? 'تاجر' : 'كابتن'})
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="text-neutral-400 hover:text-neutral-900 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Financial Info */}
            <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">المبلغ المطلوب:</span>
                <span className="font-black text-base text-[#FF6600]">
                  {selectedRequest.amount.toLocaleString()} دج
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">طريقة السحب:</span>
                <span className="font-bold text-neutral-800">
                  {selectedRequest.withdrawalMethod === 'CIB'
                    ? 'حساب بنكي وطني (CIB)'
                    : selectedRequest.withdrawalMethod === 'EDAHABIA'
                    ? 'بطاقة الذهبية - بريد الجزائر (CCP)'
                    : 'السحب النقدي من الفرع المعتمد'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold">تاريخ الطلب:</span>
                <span className="text-neutral-700">
                  {new Date(selectedRequest.createdAt).toLocaleString('ar-DZ')}
                </span>
              </div>
              {selectedRequest.adminName && (
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-bold">المشرف المسؤول:</span>
                  <span className="text-neutral-700">{selectedRequest.adminName}</span>
                </div>
              )}
            </div>

            {/* Payment Snapshot Details */}
            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1 mb-2">
                <FileText className="w-4 h-4" /> بيانات الحساب المالي المعتمدة:
              </div>

              {selectedRequest.withdrawalMethod === 'EDAHABIA' && (
                <div className="space-y-1.5 text-neutral-700">
                  <div>
                    <span className="font-bold">صاحب الحساب: </span>
                    {selectedRequest.paymentInformationSnapshot?.details?.accountHolderName || selectedRequest.userName}
                  </div>
                  <div>
                    <span className="font-bold">رقم الحساب البريدي (CCP): </span>
                    <span className="font-mono font-bold text-neutral-900">
                      {selectedRequest.paymentInformationSnapshot?.details?.ccpNumber || 'غير متوفر'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">مفتاح الحساب (Clé RIP): </span>
                    <span className="font-mono font-bold text-neutral-900">
                      {selectedRequest.paymentInformationSnapshot?.details?.ripKey || 'غير متوفر'}
                    </span>
                  </div>
                </div>
              )}

              {selectedRequest.withdrawalMethod === 'CIB' && (
                <div className="space-y-1.5 text-neutral-700">
                  <div>
                    <span className="font-bold">صاحب الحساب: </span>
                    {selectedRequest.paymentInformationSnapshot?.details?.accountHolderName || selectedRequest.userName}
                  </div>
                  <div>
                    <span className="font-bold">اسم البنك: </span>
                    <span className="font-bold text-neutral-900">
                      {selectedRequest.paymentInformationSnapshot?.details?.bankName || 'غير متوفر'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">رقم الـ RIB (20 رقم): </span>
                    <span className="font-mono font-bold text-neutral-900 block mt-0.5 bg-white p-1.5 rounded border border-blue-200">
                      {selectedRequest.paymentInformationSnapshot?.details?.rib || 'غير متوفر'}
                    </span>
                  </div>
                </div>
              )}

              {selectedRequest.withdrawalMethod === 'BRANCH' && (
                <div className="space-y-1.5 text-neutral-700">
                  <div>
                    <span className="font-bold">الفرع المختار: </span>
                    <span className="font-bold text-neutral-900">
                      {selectedRequest.paymentInformationSnapshot?.branchDetails?.branchName || 'الفرع الرئيسي'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">العنوان: </span>
                    <span>
                      {selectedRequest.paymentInformationSnapshot?.branchDetails?.branchAddress || 'ديدوش مراد'}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold">الولاية: </span>
                    <span>
                      {selectedRequest.paymentInformationSnapshot?.branchDetails?.wilaya || 'الجزائر العاصمة'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Rejection Reason if already rejected */}
            {selectedRequest.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                <span className="font-bold block">سبب الرفض المسجل:</span>
                {selectedRequest.rejectionReason}
              </div>
            )}

            {/* If performing action: Prompt for reason/notes */}
            {actionType === 'REJECT' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-rose-700">
                  سبب رفض طلب السحب (سيظهر للمستخدم): *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="مثال: رقم الحساب البريدي غير صحيح أو اسم الحساب لا يطابق بطاقة الهوية"
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-rose-300 focus:ring-2 focus:ring-rose-500"
                />
              </div>
            )}

            {(actionType === 'APPROVE' || actionType === 'PROCESS' || actionType === 'COMPLETE') && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700">
                  ملاحظة إدارية أو رقم الحوالة / الإشعار (اختياري):
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="مثال: رقم الحوالة البريدية 7894562 / تم التحويل بنجاح"
                  className="w-full text-xs p-3 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                />
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                onClick={() => {
                  setSelectedRequest(null);
                  setActionType(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                إغلاق
              </button>

              {actionType && (
                <button
                  onClick={handleConfirmAction}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition ${
                    actionType === 'REJECT'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : actionType === 'COMPLETE'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-[#FF6600] hover:bg-[#e05a00]'
                  }`}
                >
                  {actionType === 'APPROVE'
                    ? 'تأكيد الموافقة'
                    : actionType === 'REJECT'
                    ? 'تأكيد الرفض'
                    : actionType === 'PROCESS'
                    ? 'بدء المعالجة'
                    : 'تأكيد السداد والإنهاء'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
