import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Store, Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRouter, Link } from '../../router/Router';
import {
  Heart,
  Store as StoreIcon,
  ShoppingBag,
  Star,
  Clock,
  Bike,
  Plus,
  Trash2,
  ChevronLeft,
} from 'lucide-react';

export const FavoritesView: React.FC = () => {
  const { currentUser } = useAuth();
  const { addToCart } = useCart();
  const { navigate } = useRouter();
  const customerId = currentUser?.id || 'demo_customer';

  const [activeTab, setActiveTab] = useState<'stores' | 'products'>('stores');
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([]);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const refreshFavorites = () => {
    setFavoriteStores(dbService.getFavoriteStores(customerId));
    setFavoriteProducts(dbService.getFavoriteProducts(customerId));
  };

  useEffect(() => {
    refreshFavorites();
    const unsubscribe = dbService.subscribe(refreshFavorites);
    return () => unsubscribe();
  }, [customerId]);

  const handleRemoveFavoriteStore = (storeId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dbService.toggleFavorite(customerId, 'STORE', storeId);
    refreshFavorites();
  };

  const handleRemoveFavoriteProduct = (productId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dbService.toggleFavorite(customerId, 'PRODUCT', productId);
    refreshFavorites();
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedToast(`تمت إضافة "${product.name}" إلى السلة`);
    setTimeout(() => setAddedToast(null), 2500);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Added Toast */}
      {addedToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in duration-200">
          <ShoppingBag className="w-4 h-4 text-[#F27D26]" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1B] flex items-center gap-2.5">
            <Heart className="w-7 h-7 text-rose-500 fill-rose-500" />
            <span>قائمة المفضلة</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            متاجرك ووجباتك المفضلة للوصول السريع وإعادة الطلب بلمسة واحدة
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'stores'
                ? 'bg-white text-[#1A1A1B] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            المتاجر المفضلة ({favoriteStores.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'products'
                ? 'bg-white text-[#1A1A1B] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            المنتجات والوجبات ({favoriteProducts.length})
          </button>
        </div>
      </div>

      {/* STORES TAB */}
      {activeTab === 'stores' && (
        <div>
          {favoriteStores.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1B] mb-1">لا توجد متاجر مفضلة بعد</h3>
              <p className="text-gray-500 text-xs mb-6">
                انقر على علامة القلب في أي متجر لإضافته هنا وتسهيل طلبك القادم
              </p>
              <Link
                to="/stores"
                className="px-6 py-3 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] transition inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>تصفح المتاجر</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteStores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => navigate(`/store/${store.id}`)}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:border-[#F27D26] hover:shadow-md transition cursor-pointer group"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={store.coverUrl}
                      alt={store.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                    {/* Logo & Category */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2.5">
                      <img
                        src={store.logoUrl}
                        alt={store.name}
                        className="w-11 h-11 rounded-xl bg-white p-0.5 shadow-md object-cover border border-white/80"
                      />
                      <span className="text-white text-xs font-black drop-shadow-sm">
                        {store.category}
                      </span>
                    </div>

                    {/* Favorite Remove Button */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavoriteStore(store.id, e)}
                      className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md text-rose-500 hover:bg-white flex items-center justify-center shadow-md transition"
                      title="إزالة من المفضلة"
                    >
                      <Heart className="w-5 h-5 fill-rose-500" />
                    </button>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#1A1A1B]">{store.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{store.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-1">{store.description}</p>

                    <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{store.deliveryTimeMin}-{store.deliveryTimeMax} دقيقة</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#F27D26] font-bold">
                        <Bike className="w-3.5 h-3.5" />
                        <span>{store.deliveryFee} دج</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div>
          {favoriteProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1A1B] mb-1">لا توجد منتجات مفضلة بعد</h3>
              <p className="text-gray-500 text-xs mb-6">
                احفظ وجباتك ومنتجاتك المفضلة لتتمكن من إضافتها مباشرة إلى السلة
              </p>
              <Link
                to="/stores"
                className="px-6 py-3 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] transition inline-flex items-center gap-2 shadow-md shadow-orange-500/20"
              >
                <span>استكشف المنتجات</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs hover:border-[#F27D26] transition flex flex-col justify-between"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFavoriteProduct(product.id, e)}
                      className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-rose-500 hover:bg-white flex items-center justify-center shadow-md transition"
                      title="إزالة من المفضلة"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                        غير متوفر حالياً
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1A1B] line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-sm font-black text-[#F27D26] font-mono">
                        {product.price} دج
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={!product.isAvailable || product.stockQuantity <= 0}
                        className="px-3.5 py-1.5 rounded-xl bg-[#F27D26] hover:bg-[#d96716] text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة للسلة</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
