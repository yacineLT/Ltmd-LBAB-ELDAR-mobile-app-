import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/Router';
import { dbService } from '../../services/store';
import { UserRole } from '../../types';
import { ShieldCheck, Store, Bike, User, RefreshCw, ChevronDown, Check } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, role, switchUserRole } = useAuth();
  const { navigate, path } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const roles: { role: UserRole; title: string; desc: string; icon: React.ReactNode; defaultPath: string }[] = [
    {
      role: 'CUSTOMER',
      title: 'زبون (Customer)',
      desc: 'تسوق وتصفح المتاجر والطلب ومتابعة التوصيل',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      defaultPath: '/',
    },
    {
      role: 'MERCHANT',
      title: 'تاجر (Merchant)',
      desc: 'إدارة متجر القصبة، المنتجات والطلبات الواردة',
      icon: <Store className="w-4 h-4 text-blue-600" />,
      defaultPath: '/merchant',
    },
    {
      role: 'COURIER',
      title: 'كابتن توصيل (Courier)',
      desc: 'قبول طلبات التوصيل وتحديث حالة التوصيل والمحفظة',
      icon: <Bike className="w-4 h-4 text-amber-600" />,
      defaultPath: '/courier/dashboard',
    },
    {
      role: 'ADMIN',
      title: 'مسؤول النظام (Admin)',
      desc: 'لوحة التحكم الشاملة، المتاجر والمستخدمين والإيرادات',
      icon: <ShieldCheck className="w-4 h-4 text-purple-600" />,
      defaultPath: '/admin/dashboard',
    },
  ];

  const handleSelectRole = (r: UserRole, targetPath: string) => {
    switchUserRole(r);
    setIsOpen(false);
    // Navigate to appropriate section if current path belongs to incompatible role
    if (
      (r === 'CUSTOMER' && (path.startsWith('/merchant') || path.startsWith('/courier') || path.startsWith('/admin'))) ||
      (r === 'MERCHANT' && (path.startsWith('/courier') || path.startsWith('/admin'))) ||
      (r === 'COURIER' && (path.startsWith('/merchant') || path.startsWith('/admin')))
    ) {
      navigate(targetPath);
    }
  };

  const handleResetData = () => {
    if (window.confirm('هل تريد إعادة تعيين جميع البيانات التجريبية إلى حالتها الأصلية؟')) {
      dbService.resetToDefault();
      setResetMessage('تمت استعادة البيانات الأصلية بنجاح');
      setTimeout(() => setResetMessage(null), 3000);
    }
  };

  return (
    <div className="bg-[#18181B]/90 backdrop-blur-xl text-neutral-200 text-xs py-1.5 px-3 sm:px-4 border-b border-white/10 relative z-40" dir="rtl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse shrink-0" />
          <span className="text-neutral-400 font-medium hidden md:inline">البيئة الحالية:</span>
          <span className="text-white font-semibold hidden md:inline">منصة حقيقية (RTL - بالدينار DZD)</span>
          <span className="text-neutral-300 font-medium text-[10px] sm:text-xs md:hidden">نسخة تجريبية (DZD)</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {resetMessage && (
            <span className="text-emerald-400 text-[10px] sm:text-xs animate-in fade-in duration-300 truncate max-w-[120px] sm:max-w-none font-bold">
              {resetMessage}
            </span>
          )}

          <button
            onClick={handleResetData}
            title="إعادة تهيئة البيانات التجريبية"
            className="flex items-center gap-1 text-neutral-300 hover:text-white p-1 sm:px-2 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md transition text-[11px] sm:text-xs cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3 h-3 shrink-0" />
            <span className="hidden sm:inline">إعادة ضبط البيانات</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 sm:gap-2 bg-white/10 hover:bg-white/15 backdrop-blur-md text-white px-2.5 sm:px-3 py-1 rounded-xl transition font-medium border border-white/15 text-[11px] sm:text-xs cursor-pointer active:scale-95 shadow-xs"
            >
              <span className="hidden sm:inline text-neutral-300">الدور الحالي:</span>
              <span className="sm:hidden text-neutral-400 text-[10px]">الدور:</span>
              <span className="text-[#FF8833] font-black">
                {role === 'ADMIN' ? 'مسؤول (Admin)' : role === 'MERCHANT' ? 'تاجر (Merchant)' : role === 'COURIER' ? 'كابتن (Courier)' : 'زبون (Customer)'}
              </span>
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
            </button>

            {isOpen && (
              <div
                className="absolute left-0 mt-2 w-72 max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-2xl text-neutral-900 rounded-2xl shadow-2xl border border-white/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                dir="rtl"
              >
                <div className="px-3.5 py-1.5 border-b border-neutral-100 text-[11px] text-neutral-500 font-bold">
                  اختر دوراً لتجربة لوحة التحكم الخاصة به:
                </div>
                {roles.map((item) => (
                  <button
                    key={item.role}
                    onClick={() => handleSelectRole(item.role, item.defaultPath)}
                    className={`w-full text-right px-3.5 py-2.5 flex items-start gap-2.5 hover:bg-orange-50/60 transition cursor-pointer ${
                      role === item.role ? 'bg-orange-50/80 text-[#FF6600]' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-xl bg-white shadow-xs border border-neutral-100">{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center justify-between text-xs text-neutral-900">
                        <span>{item.title}</span>
                        {role === item.role && <Check className="w-3.5 h-3.5 text-[#FF6600]" />}
                      </div>
                      <div className="text-[11px] text-neutral-500 line-clamp-1">{item.desc}</div>
                    </div>
                  </button>
                ))}
                <div className="px-3.5 pt-2 mt-1 border-t border-neutral-100 text-[11px] text-neutral-400">
                  المستخدم: <span className="font-bold text-neutral-800">{currentUser?.fullName}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
