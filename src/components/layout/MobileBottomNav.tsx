import React from 'react';
import { useRouter, Link } from '../../router/Router';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Home, Store, Package, Heart, User, ShoppingBag, ArrowLeft } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { path } = useRouter();
  const { itemCount, total } = useCart();
  const { isAuthenticated } = useAuth();

  const isCartOrCheckout = path === '/cart' || path === '/checkout';

  return (
    <>
      {/* Floating Quick Cart Bar when items exist in cart on mobile */}
      {itemCount > 0 && !isCartOrCheckout && (
        <div className="md:hidden fixed bottom-18 right-3 left-3 sm:right-4 sm:left-4 z-40 animate-in slide-in-from-bottom-3 duration-200" dir="rtl">
          <Link
            to="/cart"
            className="w-full py-2.5 sm:py-3 px-3.5 sm:px-4 bg-[#18181B]/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl flex items-center justify-between border border-white/15 hover:bg-black transition-all active:scale-[0.99]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white flex items-center justify-center font-black text-xs shadow-xs border border-white/20">
                {itemCount}
              </div>
              <div>
                <span className="text-xs font-bold block">سلة التسوق</span>
                <span className="text-[10px] text-orange-200 font-mono font-bold">{total} دج</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#FF6600]">
              <span>عرض السلة</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-white/70 h-16 flex items-center justify-around px-2 shadow-[0_-4px_24px_rgba(0,0,0,0.03)]"
        dir="rtl"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around w-full">
          <Link
            to="/"
            className={`flex flex-col items-center py-1 px-3 transition ${
              path === '/' ? 'text-[#FF6600] font-black' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">الرئيسية</span>
          </Link>

          <Link
            to="/stores"
            className={`flex flex-col items-center py-1 px-3 transition ${
              path.startsWith('/stores') || path.startsWith('/store/')
                ? 'text-[#FF6600] font-black'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Store className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">المتاجر</span>
          </Link>

          <Link
            to="/orders"
            className={`flex flex-col items-center py-1 px-3 transition ${
              path.startsWith('/orders') ? 'text-[#FF6600] font-black' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Package className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">الطلبات</span>
          </Link>

          <Link
            to="/favorites"
            className={`flex flex-col items-center py-1 px-3 transition ${
              path === '/favorites' ? 'text-[#FF6600] font-black' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Heart className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">المفضلة</span>
          </Link>

          <Link
            to={isAuthenticated ? '/profile' : '/login'}
            className={`flex flex-col items-center py-1 px-3 transition ${
              path === '/profile' || path === '/login' || path === '/register'
                ? 'text-[#FF6600] font-black'
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <User className="w-5 h-5 stroke-[2.2]" />
            <span className="text-[10px] font-bold mt-1">الحساب</span>
          </Link>
        </div>
      </nav>
    </>
  );
};
