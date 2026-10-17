import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Store, Category } from '../../types';
import { useRouter } from '../../router/Router';
import { StoreCard } from './HomeView';
import { Search, Filter, SlidersHorizontal, Store as StoreIcon } from 'lucide-react';

export const StoresView: React.FC = () => {
  const { searchParams } = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState<string>(searchParams.get('category') || 'ALL');
  const [selectedWilaya, setSelectedWilaya] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'speed' | 'deliveryFee'>('rating');
  const [onlyOpen, setOnlyOpen] = useState(false);

  useEffect(() => {
    setStores(dbService.getStores());
    setCategories(dbService.getCategories());

    const unsubscribe = dbService.subscribe(() => {
      setStores(dbService.getStores());
    });
    return () => unsubscribe();
  }, []);

  const wilayas = [
    'الجزائر العاصمة',
    'البليدة',
    'وهران',
    'قسنطينة',
    'سطيف',
  ];

  // Filtering & Sorting
  const filteredStores = stores
    .filter((s) => {
      if (onlyOpen && !s.isOpen) return false;
      if (selectedCat !== 'ALL' && s.category !== selectedCat) return false;
      if (selectedWilaya !== 'ALL' && s.wilaya !== selectedWilaya) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(query);
        const matchesDesc = s.description.toLowerCase().includes(query);
        const matchesCommune = s.commune.toLowerCase().includes(query);
        // Also check if any product matches
        const storeProds = dbService.getProducts(s.id);
        const matchesProduct = storeProds.some(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
        if (!matchesName && !matchesDesc && !matchesCommune && !matchesProduct) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'speed') return a.deliveryTimeMin - b.deliveryTimeMin;
      if (sortBy === 'deliveryFee') return a.deliveryFee - b.deliveryFee;
      return 0;
    });

  const recommendedStores = stores.filter((s) => s.isFeatured || s.isPopular).slice(0, 4);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1B]">
          استكشف المتاجر والمطاعم
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          اختر من بين أفضل المحلات والمطاعم في مختلف الولايات الجزائرية
        </p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالاسم أو المنطقة أو نوع المأكولات..."
              className="w-full pr-10 pl-4 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-sm focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] text-[#1A1A1B] placeholder-gray-400 shadow-xs transition-all"
            />
          </div>

          {/* Wilaya Filter */}
          <div className="w-full md:w-48">
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-xs font-bold text-[#1A1A1B] focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] shadow-xs cursor-pointer"
            >
              <option value="ALL">جميع الولايات</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="w-full md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/90 text-xs font-bold text-[#1A1A1B] focus:outline-hidden focus:bg-white focus:ring-3 focus:ring-orange-500/15 focus:border-[#FF6600] shadow-xs cursor-pointer"
            >
              <option value="rating">الأعلى تقييماً</option>
              <option value="speed">الأسرع توصيلاً</option>
              <option value="deliveryFee">الأقل رسوم توصيل</option>
            </select>
          </div>
        </div>

        {/* Categories Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-bold">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-4 py-2 rounded-xl shrink-0 transition-all cursor-pointer active:scale-95 ${
              selectedCat === 'ALL'
                ? 'bg-neutral-900 text-white shadow-md border border-white/10'
                : 'bg-white/60 hover:bg-white/90 text-neutral-700 border border-white/80 shadow-xs'
            }`}
          >
            الكل
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-4 py-2 rounded-xl shrink-0 transition-all cursor-pointer active:scale-95 ${
                selectedCat === cat.id
                  ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/25 border border-white/20'
                  : 'bg-white/60 hover:bg-white/90 text-neutral-700 border border-white/80 shadow-xs'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <label className="mr-auto flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-600 font-bold shrink-0 bg-white/60 px-3 py-1.5 rounded-xl border border-white/80">
            <input
              type="checkbox"
              checked={onlyOpen}
              onChange={(e) => setOnlyOpen(e.target.checked)}
              className="rounded text-[#FF6600] focus:ring-[#FF6600] cursor-pointer"
            />
            <span>المتاجر المفتوحة فقط</span>
          </label>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6 text-xs text-gray-500 font-medium">
        <span>عرض {filteredStores.length} متجر متوفر</span>
      </div>

      {/* Grid */}
      {filteredStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredStores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-[#F27D26] flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#1A1A1B] mb-1">لا توجد متاجر تطابق بحثك</h3>
          <p className="text-gray-500 text-xs mb-6 leading-relaxed">
            جرّب تغيير كلمات البحث أو إلغاء بعض معايير التصفية والولاية المحددة.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCat('ALL');
              setSelectedWilaya('ALL');
              setOnlyOpen(false);
            }}
            className="px-5 py-2.5 bg-[#1A1A1B] text-white text-xs font-bold rounded-xl hover:bg-black transition cursor-pointer"
          >
            إعادة تعيين البحث
          </button>

          {recommendedStores.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 text-right">
              <h4 className="text-xs font-bold text-gray-500 mb-3">متاجر شائعة وموصى بها:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-right">
                {recommendedStores.map((rec) => (
                  <StoreCard key={rec.id} store={rec} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
