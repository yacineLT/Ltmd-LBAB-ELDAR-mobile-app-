import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Store, Category } from '../../types';
import { useRouter, Link } from '../../router/Router';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Star,
  Clock,
  Bike,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  Flame,
  ShieldCheck,
  UtensilsCrossed,
  ShoppingBag,
  Apple,
  CakeSlice,
  Beef,
  HeartPulse,
  MapPin,
  Heart,
  History,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const { navigate } = useRouter();
  const { location, openMap } = useLocation();
  const { currentUser } = useAuth();
  const customerId = currentUser?.id || 'demo_customer';

  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentlyViewedStores, setRecentlyViewedStores] = useState<Store[]>([]);

  const loadData = () => {
    const allStores = dbService.getStores();
    setStores(allStores);
    setCategories(dbService.getCategories());

    try {
      const stored = localStorage.getItem('recently_viewed_stores');
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const viewed = ids
          .map((id) => allStores.find((s) => s.id === id))
          .filter((s): s is Store => !!s);
        setRecentlyViewedStores(viewed);
      }
    } catch {
      // Ignore json parse error
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, []);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-6 h-6" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-6 h-6" />;
      case 'Apple':
        return <Apple className="w-6 h-6" />;
      case 'CakeSlice':
        return <CakeSlice className="w-6 h-6" />;
      case 'Beef':
        return <Beef className="w-6 h-6" />;
      case 'HeartPulse':
        return <HeartPulse className="w-6 h-6" />;
      default:
        return <ShoppingBag className="w-6 h-6" />;
    }
  };

  const featuredStores = stores.filter((s) => s.isFeatured && s.isOpen);
  const popularStores = stores.filter((s) => s.isPopular && s.isOpen);
  const otherStores = stores.filter((s) => !s.isFeatured);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stores?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/stores');
    }
  };

  return (
    <div className="min-h-screen pb-28 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-3 sm:pt-4" dir="rtl">
      {/* Delivery Location Quick Selector Bar */}
      <div className="mb-4 bg-white/80 backdrop-blur-xl p-3 sm:p-3.5 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(15,23,42,0.04)] flex items-center justify-between gap-2.5 sm:gap-4 w-full">
        <div className="flex items-center gap-2.5 text-xs text-gray-600 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-orange-500/12 text-[#FF6600] flex items-center justify-center shrink-0 border border-orange-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-gray-400 block text-[10px] font-bold">موقع التوصيل المحدد:</span>
            <span className="font-bold text-[#1A1A1B] text-xs leading-snug line-clamp-2 break-words">
              {location?.address || 'شارع ديدوش مراد، الجزائر العاصمة'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={openMap}
          className="px-3 py-1.5 bg-orange-500/12 hover:bg-orange-500/20 text-[#FF6600] text-xs font-bold rounded-xl transition border border-orange-500/25 shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
        >
          تغيير الموقع
        </button>
      </div>

      {/* Sleek Hero Banner with Glass Layering */}
      <section className="min-h-[170px] sm:h-60 rounded-3xl overflow-hidden relative shadow-xl shadow-orange-500/15 bg-gradient-to-r from-[#EA580C] via-[#FF6600] to-[#FF8822] mb-6 sm:mb-8 flex flex-col justify-center border border-white/30">
        <div className="relative inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent flex flex-col justify-center p-5 sm:px-12 text-white z-10">
          <span className="bg-white/25 backdrop-blur-md border border-white/30 text-[10px] sm:text-xs px-3 py-1 rounded-full w-max mb-2 font-bold shadow-xs">
            عرض ترحيبي مميز
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black mb-1.5 sm:mb-2 leading-tight drop-shadow-sm">
            توصيل مجاني وسريع لأول 3 طلبيات
          </h2>
          <p className="text-xs sm:text-base opacity-95 max-w-xl leading-relaxed">
            تسوق من أفضل المتاجر والمطاعم الجزائرية بكل سهولة وبأعلى سرعة حتى لباب دارك
          </p>
        </div>
        <div className="absolute left-8 top-1/2 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block">
          <ShoppingBag className="w-44 h-44 text-white" />
        </div>
      </section>

      {/* Quick Search & Value Proposition */}
      <section className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1B] tracking-tight">
              كل ما تحتاجه من مطاعم ومتاجر <span className="text-[#FF6600]">يوصل حتى لباب دارك!</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              اطلب من أشهى المطاعم الجزائرية، السوبرماركت، الخضر والفواكه الطازجة والحلويات مع كباتن توصيل محترفين ودفع آمن عند الاستلام.
            </p>

            <form onSubmit={handleSearchSubmit} className="pt-1 flex items-center gap-2 max-w-xl">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن متجر، وجبة، أو صنف..."
                  className="w-full pr-10 pl-4 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/90 text-xs sm:text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-[#1A1A1B] shadow-sm transition-all"
                />
                <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#18181B] hover:bg-black text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition shrink-0 cursor-pointer active:scale-95 border border-white/10"
              >
                بحث
              </button>
            </form>

            <div className="pt-1 flex flex-wrap gap-4 text-xs font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <Bike className="w-4 h-4 text-[#FF6600]" />
                <span>توصيل سريع من 20 إلى 40 دقيقة</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#FF6600]" />
                <span>دفع نقدي عند الاستلام أو بطاقة ذهبية / CIB</span>
              </div>
            </div>
          </div>

          {/* Active Order Preview Card - Frosted Glass Surface */}
          <div className="lg:col-span-4 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/80 relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500">طلب نشط تجريبي</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/12 text-[#FF6600] border border-orange-500/20 backdrop-blur-xs">
                في الطريق إليك
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-white/70 backdrop-blur-sm rounded-2xl mb-3 border border-white/60">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80"
                alt="رشتة"
                className="w-12 h-12 rounded-xl object-cover shadow-xs"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-[#1A1A1B] truncate">رشتة عاصمية بالدجاج</h4>
                <p className="text-[11px] text-gray-500 truncate">مطعم القصبة العتيقة</p>
                <p className="text-xs font-black text-[#FF6600] mt-0.5 font-mono">850 دج</p>
              </div>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600 mb-3.5">
              <div className="flex justify-between font-medium text-[11px]">
                <span>الكابتن المكلّف:</span>
                <span className="font-bold text-[#1A1A1B]">ياسين بوزيد (دراجة نارية)</span>
              </div>
              <div className="flex justify-between font-medium text-[11px]">
                <span>الوقت المقدر للوصول:</span>
                <span className="font-bold text-emerald-600">12 دقيقة</span>
              </div>
            </div>
            <Link
              to="/orders/order_1001"
              className="w-full py-2.5 bg-gradient-to-tr from-neutral-900 to-neutral-800 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md border border-white/10"
            >
              <span>متابعة مسار الطلب المباشر</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Bar */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-[#1A1A1B]">الأصناف الأكثر طلباً</h3>
          <Link to="/stores" className="text-[#FF6600] text-sm font-bold hover:underline flex items-center gap-1">
            <span>مشاهدة الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(isSelected ? null : cat.id);
                  navigate(`/stores?category=${cat.id}`);
                }}
                className={`bg-white/75 hover:bg-white/95 backdrop-blur-xl border rounded-2xl p-3.5 flex flex-col items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'border-[#FF6600] text-[#FF6600] ring-2 ring-orange-500/15'
                    : 'border-white/80 hover:border-orange-300 text-[#1A1A1B]'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/25'
                      : 'bg-orange-500/10 text-[#FF6600]'
                  }`}
                >
                  {getCategoryIcon(cat.iconName)}
                </div>
                <span className="text-xs font-bold line-clamp-1">{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Viewed Stores (if any) */}
      {recentlyViewedStores.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#F27D26]" />
              <h3 className="text-lg font-bold text-[#1A1A1B]">متاجر شاهدتها مؤخراً</h3>
            </div>
            <Link to="/stores" className="text-[#F27D26] text-sm font-semibold hover:underline flex items-center gap-1">
              <span>جميع المتاجر</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyViewedStores.map((store) => (
              <StoreCard key={store.id} store={store} customerId={customerId} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Stores */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#1A1A1B]">المتاجر المميزة بالقرب منك</h3>
          <Link to="/stores" className="text-[#F27D26] text-sm font-semibold hover:underline flex items-center gap-1">
            <span>تصفح المزيد</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredStores.map((store) => (
            <StoreCard key={store.id} store={store} customerId={customerId} />
          ))}
        </div>
      </section>

      {/* Popular Stores */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#F27D26]" />
            <h3 className="text-lg font-bold text-[#1A1A1B]">الأكثر طلباً هذا الأسبوع</h3>
          </div>
          <Link to="/stores" className="text-[#F27D26] text-sm font-semibold hover:underline flex items-center gap-1">
            <span>عرض الكل</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popularStores.map((store) => (
            <StoreCard key={store.id} store={store} customerId={customerId} />
          ))}
        </div>
      </section>

      {/* Additional Stores in area */}
      {otherStores.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#1A1A1B]">متاجر إضافية في منطقتك</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {otherStores.map((store) => (
              <StoreCard key={store.id} store={store} customerId={customerId} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Reusable Store Card Component with Favorite Toggle
export const StoreCard: React.FC<{ store: Store; customerId?: string }> = ({ store, customerId = 'demo_customer' }) => {
  const [isFav, setIsFav] = useState(dbService.isFavorite(customerId, 'STORE', store.id));

  const handleToggleFav = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = dbService.toggleFavorite(customerId, 'STORE', store.id);
    setIsFav(next);
  };

  return (
    <Link
      to={`/store/${store.id}`}
      className="group bg-white/80 backdrop-blur-xl border border-white/80 rounded-3xl overflow-hidden shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:border-orange-500/40 hover:shadow-[0_16px_36px_rgba(255,102,0,0.12)] transition-all duration-300 flex flex-col justify-between relative"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-36 w-full bg-neutral-200 overflow-hidden">
        <img
          src={store.coverUrl}
          alt={store.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleToggleFav}
          className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full bg-white/75 backdrop-blur-md hover:bg-white text-gray-500 hover:text-rose-500 flex items-center justify-center transition shadow-xs cursor-pointer border border-white/80 active:scale-90"
          title={isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Time Badge */}
        <div className="absolute top-2 right-2 bg-white/85 backdrop-blur-md border border-white/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs text-[#18181B] font-mono">
          {store.deliveryTimeMin}-{store.deliveryTimeMax} د
        </div>

        {/* Store Logo floating */}
        <div className="absolute bottom-2 right-2 w-10 h-10 rounded-xl bg-white/95 p-0.5 shadow-md border border-white/90 overflow-hidden backdrop-blur-xs">
          <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-lg" />
        </div>

        {/* Commune tag */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg bg-black/55 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold">
          {store.commune}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-1 gap-2">
            <h4 className="font-bold text-sm text-[#18181B] group-hover:text-[#FF6600] transition line-clamp-1">
              {store.name}
            </h4>
            <span className="flex items-center gap-1 text-[#FF6600] text-xs font-bold shrink-0">
              <Star className="w-3 h-3 fill-[#FF6600]" />
              <span className="font-mono">{store.rating.toFixed(1)}</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-2.5 line-clamp-1 font-medium">{store.description}</p>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between flex-wrap gap-1 text-[11px] font-medium text-gray-600 pt-2 border-t border-gray-100/80">
          <span>توصيل: <strong className="font-mono text-[#18181B] font-bold">{store.deliveryFee} دج</strong></span>
          <span>الحد الأدنى: <strong className="font-mono text-[#18181B] font-bold">{store.minimumOrder} دج</strong></span>
        </div>
      </div>
    </Link>
  );
};
