import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../router/Router';
import { ShoppingBag, Lock, Mail, ArrowLeft, AlertCircle, Sparkles } from 'lucide-react';
import { UserRole } from '../../types';

export const LoginView: React.FC = () => {
  const { login, loginAsRole } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    loginAsRole(role);
    if (role === 'MERCHANT') navigate('/merchant');
    else if (role === 'COURIER') navigate('/courier/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center max-w-md mx-auto" dir="rtl">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6600] flex items-center justify-center text-white shadow-md">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <span className="text-3xl font-black text-neutral-900 font-['Cairo']">
            لباب <span className="text-[#FF6600]">الدار</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-neutral-900 mt-4">تسجيل الدخول إلى حسابك</h2>
        <p className="text-xs text-neutral-500 mt-1">
          أدخل بياناتك للمتابعة أو استخدم أزرار الدخول السريع التجريبية
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-lg space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">البريد الإلكتروني:</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600]"
              />
              <Mail className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">كلمة المرور:</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600]"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>جاري تسجيل الدخول...</span> : <span>دخول</span>}
          </button>
        </form>

        {/* Quick Demo Access Bar */}
        <div className="pt-4 border-t border-neutral-100 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-600">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
            <span>تسجيل دخول سريع بحساب تجريبي (1-Click):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('CUSTOMER')}
              className="p-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 text-neutral-800 border border-neutral-200 transition"
            >
              حساب زبون
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('MERCHANT')}
              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
            >
              حساب تاجر
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('COURIER')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
            >
              كابتن توصيل
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition"
            >
              مسؤول منصة
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            ليس لديك حساب بعد؟{' '}
            <Link to="/register" className="font-bold text-[#FF6600] hover:underline">
              سجل حساب جديد مجاناً
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
