import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Store, Product, OrderReview } from '../../types';
import { useRouter, Link } from '../../router/Router';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Modal } from '../../components/common/Modal';
import {
  Star,
  Clock,
  Bike,
  MapPin,
  Phone,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
  Heart,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const StoreDetailView: React.FC = () => {
  const { params, navigate } = useRouter();
  const storeId = params.storeId;
  const { currentUser } = useAuth();
  const { addToCart, items, total, itemCount } = useCart();
  const customerId = currentUser?.id || 'demo_customer';

  const [store, setStore] = useState<Store | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<OrderReview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNotes, setModalNotes] = useState('');
  const [addedToast, setAddedToast] = useState<string | null>(null);
  const [isStoreFavorite, setIsStoreFavorite] = useState(false);

  useEffect(() => {
    if (storeId) {
      const s = dbService.getStoreById(storeId);
      setStore(s);
      const p = dbService.getProducts(storeId);
      setProducts(p);
      const r = dbService.getStoreReviews(storeId);
      setReviews(r);
      setIsStoreFavorite(dbService.isFavorite(customerId, 'STORE', storeId));

      // Record to recently viewed stores in localStorage
      try {
        const stored = localStorage.getItem('recently_viewed_stores');
        const list: string[] = stored ? JSON.parse(stored) : [];
        const updated = [storeId, ...list.filter((id) => id !== storeId)].slice(0, 8);
        localStorage.setItem('recently_viewed_stores', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to update recently viewed stores:', err);
      }
    }
  }, [storeId, customerId]);

  if (!store) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center" dir="rtl">
        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
        <h2 className="text-xl font-bold text-[#1A1A1B] mb-2">المتجر غير موجود</h2>
        <p className="text-gray-500 text-sm mb-6">قد يكون تم تغيير معرف المتجر أو تم حذفه</p>
        <button
          onClick={() => navigate('/stores')}
          className="px-6 py-2.5 bg-[#F27D26] text-white text-xs font-bold rounded-xl"
        >
          العودة لقائمة المتاجر
        </button>
      </div>
    );
  }

  const storeCategories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    return true;
  });

  const handleToggleStoreFavorite = () => {
    const next = dbService.toggleFavorite(customerId, 'STORE', store.id);
    setIsStoreFavorite(next);
  };

  const handleToggleProductFavorite = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.toggleFavorite(customerId, 'PRODUCT', productId);
    // Force re-render
    setProducts([...products]);
  };

  const handleOpenProductModal = (product: Product) => {
    if (!product.isAvailable || product.stockQuantity <= 0) return;
    setSelectedProduct(product);
    setModalQuantity(1);
    setModalNotes('');
  };

  const handleConfirmAddToCart = () => {
    if (!selectedProduct) return;
    const ok = addToCart(selectedProduct, modalQuantity, modalNotes);
    if (ok) {
      setAddedToast(`تمت إضافة "${selectedProduct.name}" إلى السلة`);
      setTimeout(() => setAddedToast(null), 3000);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Added to cart toast */}
      {addedToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A1B] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{addedToast}</span>
        </div>
      )}

      {/* Store Header Banner */}
      <div className="relative h-64 sm:h-80 w-full bg-[#1A1A1B]">
        <img
          src={store.coverUrl}
          alt={store.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Favorite Store Button Floating */}
        <button
          type="button"
          onClick={handleToggleStoreFavorite}
          className="absolute top-6 left-6 z-10 w-11 h-11 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-rose-500 flex items-center justify-center transition shadow-lg cursor-pointer"
          title={isStoreFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
        >
          <Heart className={`w-6 h-6 ${isStoreFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        <div className="absolute bottom-6 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white p-1 shadow-xl border border-white/20 overflow-hidden shrink-0">
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-xl" />
            </div>

            {/* Main Info */}
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black">{store.name}</h1>
                {store.isOpen ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    مفتوح للطلب
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    مغلق حالياً
                  </span>
                )}
              </div>
              <p className="text-gray-300 text-xs sm:text-sm max-w-2xl line-clamp-2">
                {store.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-300 pt-1">
                <div className="flex items-center gap-1 font-bold text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="font-mono">{store.rating.toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({store.reviewCount} تقييم)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{store.deliveryTimeMin}-{store.deliveryTimeMax} دقيقة</span>
                </div>
                <div className="flex items-center gap-1 font-semibold text-white">
                  <Bike className="w-3.5 h-3.5 text-[#F27D26]" />
                  <span className="font-mono">{store.deliveryFee} دج</span>
                  <span>رسوم التوصيل</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{store.commune}، {store.wilaya}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Store Category Tabs */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white/80 backdrop-blur-xl border-b border-white/80 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-2 py-3 overflow-x-auto no-scrollbar text-xs font-bold">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-4 py-2 rounded-xl shrink-0 transition cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                : 'bg-white/70 backdrop-blur-md text-gray-700 hover:bg-white border border-white/90'
            }`}
          >
            كل المنتجات ({products.length})
          </button>
          {storeCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl shrink-0 transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
                  : 'bg-white/70 backdrop-blur-md text-gray-700 hover:bg-white border border-white/90'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        {/* Products Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#1A1A1B]">قائمة الوجبات والمنتجات</h2>
            <span className="text-xs text-gray-500 font-medium">
              {filteredProducts.length} منتج متاح للطلب
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isProdFavorite = dbService.isFavorite(customerId, 'PRODUCT', product.id);

              return (
                <div
                  key={product.id}
                  className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/80 overflow-hidden shadow-[0_6px_20px_rgba(15,23,42,0.05)] hover:border-orange-500/40 hover:shadow-[0_16px_36px_rgba(255,102,0,0.12)] transition-all duration-300 flex flex-col justify-between group relative"
                >
                  <div className="relative h-44 w-full bg-neutral-100 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />

                    {/* Favorite Button for product */}
                    <button
                      type="button"
                      onClick={(e) => handleToggleProductFavorite(product.id, e)}
                      className="absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full bg-white/75 backdrop-blur-md hover:bg-white text-gray-500 hover:text-rose-500 flex items-center justify-center transition shadow-xs cursor-pointer border border-white/80 active:scale-90"
                      title={isProdFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isProdFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>

                    {product.isPopular && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6600] text-white shadow-xs">
                        شائع
                      </span>
                    )}
                    {!product.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                        غير متوفر حالياً
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-[#1A1A1B] group-hover:text-[#FF6600] transition line-clamp-1">{product.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-gray-100/80 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#FF6600] font-mono">{product.price} دج</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-[11px] text-gray-400 line-through -mt-1 font-mono">
                            {product.originalPrice} دج
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleOpenProductModal(product)}
                        disabled={!product.isAvailable || product.stockQuantity <= 0}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-500/12 text-[#FF6600] hover:bg-[#FF6600] hover:text-white font-bold text-xs transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer border border-orange-500/20 active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>إضافة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Store Customer Reviews Section */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1A1A1B] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#F27D26]" />
                <span>تقييمات وآراء الزبائن عن المتجر</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                تجارب حقيقية لزبائن استلموا طلباتهم من {store.name}
              </p>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-1.5 rounded-2xl border border-amber-200">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              <span className="font-black text-base text-amber-900 font-mono">
                {store.rating.toFixed(1)}
              </span>
              <span className="text-xs text-amber-700">({store.reviewCount} تقييم)</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              لا توجد تقييمات مكتوبة حتى الآن. كن أول من يقيّم هذا المتجر بعد استلام طلبك!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A1A1B]">{rev.customerName}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.storeRating
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-gray-600">{rev.comment}</p>}
                  <span className="text-[10px] text-gray-400 block font-mono">
                    {new Date(rev.createdAt).toLocaleDateString('ar-DZ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Cart CTA bar if cart has items */}
      {itemCount > 0 && (
        <div className="fixed bottom-16 md:bottom-6 left-4 right-4 max-w-xl mx-auto z-30">
          <Link
            to="/cart"
            className="flex items-center justify-between p-4 rounded-2xl bg-[#1A1A1B] text-white shadow-xl hover:bg-black transition border border-gray-800"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F27D26] flex items-center justify-center text-white font-bold text-sm">
                {itemCount}
              </div>
              <div>
                <p className="font-bold text-xs text-gray-300">سلة المشتريات الحالية</p>
                <p className="text-sm font-black text-white font-mono">{total} دج مع التوصيل</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#F27D26]">
              <span>إتمام الطلب</span>
              <ArrowLeft className="w-4 h-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Product Details & Customize Modal */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={selectedProduct.name}
          maxWidth="md"
        >
          <div className="space-y-4 text-right" dir="rtl">
            <div className="h-44 w-full rounded-xl overflow-hidden bg-gray-100">
              <img
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedProduct.description}</p>
              <div className="mt-2 text-lg font-black text-[#F27D26] font-mono">
                {selectedProduct.price * modalQuantity} دج
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
              <span className="text-xs font-bold text-[#1A1A1B]">الكمية المطلوبة:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-[#1A1A1B] font-bold hover:bg-gray-100 transition cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-black text-sm text-[#1A1A1B] font-mono">{modalQuantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setModalQuantity(Math.min(selectedProduct.stockQuantity, modalQuantity + 1))
                  }
                  className="w-8 h-8 rounded-lg bg-white border border-gray-300 flex items-center justify-center text-[#1A1A1B] font-bold hover:bg-gray-100 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-xs font-bold text-[#1A1A1B] mb-1">
                ملاحظات خاصة للطلب (اختياري):
              </label>
              <input
                type="text"
                value={modalNotes}
                onChange={(e) => setModalNotes(e.target.value)}
                placeholder="مثال: زيادة صلصة الجبن، بدون حار، تغليف محكم..."
                className="w-full px-3 py-2 rounded-xl bg-gray-100 border-none text-xs focus:ring-2 focus:ring-[#F27D26] text-[#1A1A1B]"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmAddToCart}
                className="flex-1 py-3 bg-[#F27D26] hover:bg-[#d96716] text-white font-medium text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>إضافة إلى السلة ({selectedProduct.price * modalQuantity} دج)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
