import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { useRouter, Link } from '../../router/Router';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import {
  ShoppingBag,
  MapPin,
  Search,
  User,
  LogOut,
  ChevronDown,
  Store,
  Bike,
  ShieldCheck,
  Package,
  Heart,
  CreditCard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, role, isAuthenticated, logout } = useAuth();
  const { itemCount, subtotal } = useCart();
  const { location, openMap } = useLocation();
  const { navigate, path } = useRouter();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stores?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/stores');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/70 shadow-[0_4px_24px_rgba(15,23,42,0.04)]" dir="rtl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & Delivery Location */}
          <div className="flex items-center gap-2 sm:gap-6 min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0" aria-label="الصفحة الرئيسية لباب الدار">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#EA580C] to-[#FF7711] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0 border border-white/30">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-2xl font-black text-[#FF6600] tracking-tight font-['Cairo'] leading-none">
                  لباب الدار
                </h1>
                <span className="text-[10px] text-gray-500 font-medium tracking-wider hidden sm:inline mt-0.5">
                  سوق التوصيل الجزائري
                </span>
              </div>
            </Link>

            {/* Delivery Location display & quick changer - Desktop & Tablet */}
            <button
              onClick={openMap}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/60 hover:bg-orange-50/70 backdrop-blur-md border border-white/80 hover:border-orange-200/80 text-right transition cursor-pointer max-w-[200px] lg:max-w-[260px] truncate shadow-xs"
              title="تغيير موقع التوصيل على الخريطة"
            >
              <div className="w-7 h-7 rounded-lg bg-orange-100/70 text-[#FF6600] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-right">
                <span className="text-gray-400 text-[10px] block font-bold">التوصيل إلى:</span>
                <span className="font-bold text-xs text-[#1A1A1B] truncate block">
                  {location?.district ? `${location.district}، ` : ''}{location?.city || location?.address || 'الجزائر العاصمة'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-auto" />
            </button>
          </div>

          {/* Sleek Glass Search Bar */}
          <div className="flex-1 max-w-md hidden lg:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن متجر، مطعم، وجبة أو مستلزمات..."
                className="w-full bg-white/70 backdrop-blur-md border border-gray-200/70 focus:bg-white focus:border-[#FF6600] focus:ring-3 focus:ring-orange-500/15 rounded-full py-2 pr-10 pl-4 text-sm text-[#1A1A1B] placeholder-gray-400 transition-all shadow-xs"
              />
              <button
                type="submit"
                aria-label="بحث"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6600] transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Nav Links & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Primary Nav Links */}
            <nav className="hidden md:flex items-center gap-1 font-medium text-sm text-gray-700">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-xl transition ${
                  path === '/' ? 'text-[#FF6600] font-bold bg-orange-50/60' : 'hover:text-[#FF6600] hover:bg-white/50'
                }`}
              >
                الرئيسية
              </Link>
              <Link
                to="/stores"
                className={`px-3 py-1.5 rounded-xl transition ${
                  path.startsWith('/stores') || path.startsWith('/store/')
                    ? 'text-[#FF6600] font-bold bg-orange-50/60'
                    : 'hover:text-[#FF6600] hover:bg-white/50'
                }`}
              >
                المتاجر
              </Link>
              <Link
                to="/orders"
                className={`px-3 py-1.5 rounded-xl transition ${
                  path.startsWith('/orders') ? 'text-[#FF6600] font-bold bg-orange-50/60' : 'hover:text-[#FF6600] hover:bg-white/50'
                }`}
              >
                طلباتي
              </Link>
              <Link
                to="/pricing"
                className={`px-3 py-1.5 rounded-xl transition ${
                  path.startsWith('/pricing') ? 'text-[#FF6600] font-bold bg-orange-50/60' : 'hover:text-[#FF6600] hover:bg-white/50'
                }`}
              >
                الباقات والاشتراكات
              </Link>
            </nav>

            {/* Role Dedicated Dashboards shortcut */}
            {role === 'MERCHANT' && (
              <Link
                to="/merchant"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 border border-blue-200/70 backdrop-blur-xs text-xs font-bold hover:bg-blue-500/20 transition"
              >
                <Store className="w-4 h-4" />
                <span>لوحة التاجر</span>
              </Link>
            )}

            {role === 'COURIER' && (
              <Link
                to="/courier/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-200/70 backdrop-blur-xs text-xs font-bold hover:bg-amber-500/20 transition"
              >
                <Bike className="w-4 h-4" />
                <span>لوحة الكابتن</span>
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-700 border border-purple-200/70 backdrop-blur-xs text-xs font-bold hover:bg-purple-500/20 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>لوحة الإدارة</span>
              </Link>
            )}

            {/* Favorites Icon */}
            <Link
              to="/favorites"
              className={`hidden sm:flex p-2 rounded-xl text-gray-600 hover:text-rose-500 hover:bg-white/70 backdrop-blur-xs transition ${
                path === '/favorites' ? 'text-rose-500 bg-rose-50/80 border border-rose-200/60' : ''
              }`}
              title="المفضلة"
            >
              <Heart className="w-5 h-5" />
            </Link>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Sleek Glass Cart Button */}
            <Link
              to="/cart"
              id="btn-nav-cart"
              className="bg-orange-500/12 hover:bg-orange-500/20 backdrop-blur-md border border-orange-500/25 p-2 sm:p-2.5 rounded-xl relative text-[#FF6600] transition-all flex items-center justify-center active:scale-95 shadow-xs"
              title="سلة التسوق"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#18181B] text-white text-[9px] sm:text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Account / User Menu or Login */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  id="btn-user-menu"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-3 sm:py-2 rounded-xl bg-white/70 hover:bg-white/95 backdrop-blur-md border border-white/80 shadow-xs text-xs font-medium text-[#1A1A1B] transition cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-bold max-w-[90px] lg:max-w-[120px] truncate text-[#1A1A1B]">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400 shrink-0" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-gray-100/80">
                      <p className="font-bold text-sm text-[#1A1A1B] truncate">{currentUser.fullName}</p>
                      <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100/80 text-gray-700">
                        {role}
                      </span>
                    </div>

                    <div className="py-1 text-sm">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-orange-50/60 transition-colors"
                      >
                        <User className="w-4 h-4 text-gray-500" />
                        <span>الملف الشخصي</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-orange-50/60 transition-colors"
                      >
                        <Package className="w-4 h-4 text-gray-500" />
                        <span>طلباتي السابقة</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-gray-700 hover:bg-orange-50/60 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-gray-500" />
                        <span>قائمة المفضلة</span>
                      </Link>

                      <Link
                        to="/my-subscription"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-[#FF6600] hover:bg-orange-50/70 font-bold transition-colors"
                      >
                        <CreditCard className="w-4 h-4 text-[#FF6600]" />
                        <span>إدارة اشتراكي (Slick-Pay)</span>
                      </Link>

                      {role === 'MERCHANT' && (
                        <Link
                          to="/merchant"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-blue-700 hover:bg-blue-50/60 transition-colors"
                        >
                          <Store className="w-4 h-4 text-blue-600" />
                          <span>إدارة المتجر</span>
                        </Link>
                      )}

                      {role === 'COURIER' && (
                        <Link
                          to="/courier/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-amber-800 hover:bg-amber-50/60 transition-colors"
                        >
                          <Bike className="w-4 h-4 text-amber-600" />
                          <span>لوحة الكابتن</span>
                        </Link>
                      )}

                      {role === 'ADMIN' && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-purple-700 hover:bg-purple-50/60 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>لوحة الإدارة</span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        id="btn-logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-600 hover:bg-rose-50/60 text-right transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>تسجيل الخروج</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                id="btn-nav-login"
                className="px-4 py-2 rounded-xl bg-[#FF6600] hover:bg-[#e65c00] text-white font-bold text-xs shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer"
              >
                دخول / تسجيل
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
