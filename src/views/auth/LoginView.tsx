import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../router/Router';
import { ShoppingBag, Lock, Mail, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
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
      const res = await login(email, password);
      if (res.success && res.user) {
        // Automatic redirection to the appropriate dashboard based on genuine role
        if (res.user.role === 'MERCHANT') {
          navigate('/merchant');
        } else if (res.user.role === 'COURIER') {
          navigate('/courier/dashboard');
        } else if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else if (res.error) {
        setError(res.error);
      }
    } catch (err: any) {
      setError(err.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
    } finally {
      setLoading(false);
    }
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
          أدخل بيانات حسابك المعتمدة للمتابعة إلى لوحة التحكم الخاصة بك
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
            className="w-full py-3 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <span>جاري تسجيل الدخول...</span> : <span>تسجيل الدخول</span>}
          </button>
        </form>

        {/* Register link */}
        <div className="text-center pt-4 border-t border-neutral-100">
          <p className="text-xs text-neutral-500">
            ليس لديك حساب بعد؟{' '}
            <Link to="/register" className="font-bold text-[#FF6600] hover:underline">
              سجل حساب جديد في المنصة
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
