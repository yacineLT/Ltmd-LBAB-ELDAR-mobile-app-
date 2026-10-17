import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, Link } from '../../router/Router';
import { ShoppingBag, Lock, Mail, User, Phone, Store, Bike, AlertCircle } from 'lucide-react';
import { UserRole } from '../../types';

export const RegisterView: React.FC = () => {
  const { register } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('CUSTOMER');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({
        fullName,
        email,
        phone,
        password,
        role: selectedRole,
      });

      if (selectedRole === 'MERCHANT') navigate('/merchant');
      else if (selectedRole === 'COURIER') navigate('/courier/dashboard');
      else navigate('/');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center max-w-lg mx-auto" dir="rtl">
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
        <h2 className="text-xl font-bold text-neutral-900 mt-4">إنشاء حساب جديد</h2>
        <p className="text-xs text-neutral-500 mt-1">انضم إلى أكبر منصة توصيل ومتاجر جزائرية</p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-lg space-y-6">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Choice */}
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-2">نوع الحساب المطلوب:</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRole('CUSTOMER')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition ${
                  selectedRole === 'CUSTOMER'
                    ? 'border-[#FF6600] bg-orange-50/50 text-[#FF6600]'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <User className="w-5 h-5" />
                <span>زبون</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('MERCHANT')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition ${
                  selectedRole === 'MERCHANT'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-700'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Store className="w-5 h-5" />
                <span>صاحب متجر</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('COURIER')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 font-bold transition ${
                  selectedRole === 'COURIER'
                    ? 'border-amber-600 bg-amber-50/50 text-amber-800'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Bike className="w-5 h-5" />
                <span>كابتن توصيل</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">الاسم الكامل:</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: فاروق بوعلام"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600]"
              />
              <User className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

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
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">رقم الهاتف الجزائري:</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 0770 12 34 56"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600]"
              />
              <Phone className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
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
                placeholder="6 أحرف على الأقل"
                className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30 focus:border-[#FF6600]"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-sm rounded-xl shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <span>جاري إنشاء الحساب...</span> : <span>تسجيل حساب جديد</span>}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-neutral-500">
            لديك حساب بالفعل؟{' '}
            <Link to="/login" className="font-bold text-[#FF6600] hover:underline">
              تسجيل الدخول هنا
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
