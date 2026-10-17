import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dbService } from '../../services/store';
import { Store, Product, Order, OrderStatus } from '../../types';
import { OrderStatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { MerchantFinancialWallet } from '../../components/merchant/MerchantFinancialWallet';
import {
  Store as StoreIcon,
  Package,
  Clock,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  ShoppingBag,
  Layers,
  ChefHat,
  Phone,
  MapPin,
  Wallet,
} from 'lucide-react';

export const MerchantDashboardView: React.FC = () => {
  const { currentUser } = useAuth();
  const [store, setStore] = useState<Store | undefined>(undefined);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings' | 'wallet'>('orders');

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: 'أطباق رئيسية',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    isAvailable: true,
    stockQuantity: 20,
  });

  // Load Store and Data
  const loadData = () => {
    // If merchant has an assigned storeId, retrieve it, or default to the first store in db
    let s = currentUser?.storeId ? dbService.getStoreById(currentUser.storeId) : undefined;
    if (!s) {
      const allStores = dbService.getStores();
      s = allStores[0];
    }
    setStore(s);

    if (s) {
      setProducts(dbService.getProducts(s.id));
      setOrders(dbService.getOrders({ storeId: s.id }));
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = dbService.subscribe(loadData);
    return () => unsubscribe();
  }, [currentUser]);

  if (!store) {
    return (
      <div className="min-h-screen py-12 px-4 max-w-xl mx-auto text-center" dir="rtl">
        <StoreIcon className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-neutral-900">لم يتم العثور على متجر مرتبط بحسابك</h2>
        <p className="text-neutral-500 text-sm mt-1">تواصل مع مسؤول المنصة لربط حساب التاجر بمتجرك</p>
      </div>
    );
  }

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status === 'DELIVERED')
    .reduce((acc, o) => acc + o.subtotal, 0);
  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  // Toggle Store Open / Close
  const handleToggleStoreOpen = () => {
    dbService.updateStore(store.id, { isOpen: !store.isOpen });
  };

  // Progression Action Handler
  const handleAdvanceOrderStatus = (orderId: string, nextStatus: OrderStatus, note: string) => {
    dbService.updateOrderStatus(
      orderId,
      nextStatus,
      currentUser?.id || 'merchant',
      'MERCHANT',
      note
    );
  };

  // Save / Edit Product
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: 500,
      originalPrice: 0,
      category: 'أطباق رئيسية',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable: true,
      stockQuantity: 20,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      description: p.description,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      category: p.category,
      imageUrl: p.imageUrl,
      isAvailable: p.isAvailable,
      stockQuantity: p.stockQuantity,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      dbService.updateProduct(editingProduct.id, {
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        category: productForm.category,
        imageUrl: productForm.imageUrl,
        isAvailable: productForm.isAvailable,
        stockQuantity: Number(productForm.stockQuantity),
      });
    } else {
      dbService.addProduct({
        storeId: store.id,
        name: productForm.name,
        description: productForm.description,
        price: Number(productForm.price),
        originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
        category: productForm.category,
        imageUrl: productForm.imageUrl,
        isAvailable: productForm.isAvailable,
        stockQuantity: Number(productForm.stockQuantity),
      });
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من متجرك؟')) {
      dbService.deleteProduct(productId);
    }
  };

  const handleToggleProductAvailability = (product: Product) => {
    dbService.updateProduct(product.id, { isAvailable: !product.isAvailable });
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" dir="rtl">
      {/* Top Banner / Store status */}
      <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgba(15,23,42,0.06)] mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white p-1 border border-white/80 shadow-md overflow-hidden shrink-0">
            <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover rounded-xl" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-neutral-900">{store.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/12 text-blue-700 border border-blue-500/20 backdrop-blur-xs">
                لوحة التاجر
              </span>
            </div>
            <p className="text-xs text-neutral-500 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-neutral-400" />
              <span>{store.address}، {store.commune} ({store.wilaya})</span>
              <span>•</span>
              <Phone className="w-3.5 h-3.5 text-neutral-400" />
              <span>{store.phone}</span>
            </p>
          </div>
        </div>

        {/* Store Open/Close Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-700">حالة المتجر لاستقبال الطلبات:</span>
            <button
              onClick={handleToggleStoreOpen}
              className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border ${
                store.isOpen
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 border-emerald-400'
                  : 'bg-neutral-200 text-neutral-700 border-neutral-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${store.isOpen ? 'bg-white animate-ping' : 'bg-neutral-500'}`} />
              <span>{store.isOpen ? 'المتجر مفتوح (يستقبل الطلبات)' : 'المتجر مغلق حالياً'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>الطلبات النشطة حالياً</span>
            <Clock className="w-4 h-4 text-[#FF6600]" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{activeOrders.length} طلب</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">بانتظار التحضير أو الاستلام</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>إجمالي الإيرادات المكتملة</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{totalRevenue} دج</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">صافي مبيعات المتجر</span>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-white/80 shadow-[0_6px_20px_rgba(15,23,42,0.05)]">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-medium mb-1">
            <span>قائمة المنتجات والوجبات</span>
            <ChefHat className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-neutral-900">{products.length} صنف</div>
          <span className="text-[11px] text-neutral-400 mt-1 block">
            منها {products.filter((p) => p.isAvailable).length} صنف متاح للطلب
          </span>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-white/70 backdrop-blur-xl p-1.5 rounded-2xl border border-white/80 shadow-xs mb-6 gap-2 text-xs sm:text-sm font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>الطلبات الواردة ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <ChefHat className="w-4 h-4" />
          <span>إدارة قائمة المنتجات ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'wallet'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>الأرباح والمحفظة المالية والسحب</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2 px-4 rounded-xl transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-gradient-to-tr from-[#EA580C] to-[#FF7711] text-white shadow-md shadow-orange-500/20'
              : 'text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <StoreIcon className="w-4 h-4" />
          <span>إعدادات المتجر ووقت التوصيل</span>
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base font-bold text-neutral-900">الطلبات الواردة ومراحل المعالجة</h2>
            <span className="text-xs text-neutral-500">تحديث فوري للطلبات</span>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
              <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="font-bold text-neutral-800">لا توجد طلبات واردة حالياً</h3>
              <p className="text-xs text-neutral-500 mt-1">ستظهر أي طلبات جديدة يرسلها الزبائن هنا فوراً</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm text-neutral-900">الطلب #{order.id}</h3>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      الزبون: <span className="font-bold text-neutral-800">{order.customerName}</span> (هاتف: {order.customerPhone})
                      {' • '}
                      العنوان: {order.deliveryAddress.commune}، {order.deliveryAddress.street}
                    </div>
                  </div>

                  <div className="text-left font-black text-sm text-[#FF6600]">
                    {order.subtotal} دج <span className="text-[10px] text-neutral-400 font-normal">صافي المتجر</span>
                  </div>
                </div>

                {/* Items */}
                <div className="bg-neutral-50 p-3 rounded-xl space-y-1.5 text-xs text-neutral-700">
                  {order.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{it.quantity}x</span>
                        <span>{it.productName}</span>
                        {it.notes && (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px]">
                            {it.notes}
                          </span>
                        )}
                      </div>
                      <span className="font-bold">{it.price * it.quantity} دج</span>
                    </div>
                  ))}
                </div>

                {/* Merchant Progression Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
                  <div className="text-xs text-neutral-500">
                    الحالة الحالية: <span className="font-bold text-neutral-800">{order.status}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {order.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() =>
                            handleAdvanceOrderStatus(
                              order.id,
                              'ACCEPTED',
                              'وافق المتجر على الطلب وجاري الاستعداد للتحضير'
                            )
                          }
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                        >
                          قبول الطلب (Accept)
                        </button>
                        <button
                          onClick={() =>
                            handleAdvanceOrderStatus(
                              order.id,
                              'CANCELLED',
                              'اعتذر المتجر عن تلبية الطلب نظراً لعدم توفر بعض المكونات'
                            )
                          }
                          className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition"
                        >
                          رفض الطلب
                        </button>
                      </>
                    )}

                    {order.status === 'ACCEPTED' && (
                      <button
                        onClick={() =>
                          handleAdvanceOrderStatus(
                            order.id,
                            'PREPARING',
                            'بدأ الطباخون في تحضير وتجهيز الوجبات المطلوبة'
                          )
                        }
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        بدء التحضير (Preparing)
                      </button>
                    )}

                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() =>
                          handleAdvanceOrderStatus(
                            order.id,
                            'READY_FOR_PICKUP',
                            'تم تجهيز الوجبة وتغليفها وهي جاهزة لاستلام الكابتن'
                          )
                        }
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        تأكيد جاهزية الطلب للاستلام (Ready for Pickup)
                      </button>
                    )}

                    {order.status === 'READY_FOR_PICKUP' && (
                      <span className="text-xs text-neutral-500 font-semibold px-3 py-1.5 bg-neutral-100 rounded-lg">
                        الطلب جاهز بانتظار استلام الكابتن المكلّف
                      </span>
                    )}

                    {order.status === 'PICKED_UP' || order.status === 'ON_THE_WAY' || order.status === 'ARRIVED' ? (
                      <span className="text-xs text-neutral-600 font-semibold px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg">
                        الطلب مع كابتن التوصيل: {order.courierName || 'الموصّل'}
                      </span>
                    ) : null}

                    {order.status === 'DELIVERED' && (
                      <span className="text-xs text-emerald-700 font-semibold px-3 py-1.5 bg-emerald-50 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم تسليم الطلب للزبون بنجاح</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">قائمة الوجبات والمنتجات</h2>
              <p className="text-xs text-neutral-500">أضف أو عدل أو أوقف توفر أي صنف بنقرة واحدة</p>
            </div>

            <button
              onClick={handleOpenAddProduct}
              className="px-4 py-2.5 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex gap-3">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-neutral-900 truncate">{p.name}</h4>
                    </div>
                    <span className="text-[10px] text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded inline-block mt-0.5">
                      {p.category}
                    </span>
                    <div className="text-sm font-black text-[#FF6600] mt-1">{p.price} دج</div>
                  </div>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">{p.description}</p>

                {/* Controls */}
                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => handleToggleProductAvailability(p)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition ${
                      p.isAvailable
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <span>{p.isAvailable ? 'متاح للطلب' : 'غير متوفر'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="p-1.5 text-neutral-500 hover:text-blue-600 rounded-lg hover:bg-neutral-100"
                      title="تعديل"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-neutral-500 hover:text-rose-600 rounded-lg hover:bg-neutral-100"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-neutral-200/80 shadow-xs max-w-2xl space-y-6">
          <h2 className="text-base font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            إعدادات التوصيل والمتجر
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">اسم المتجر الرسمي:</label>
              <input
                type="text"
                value={store.name}
                onChange={(e) => dbService.updateStore(store.id, { name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">وصف المتجر ونوع المأكولات:</label>
              <textarea
                rows={2}
                value={store.description}
                onChange={(e) => dbService.updateStore(store.id, { description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">أدنى وقت توصيل (دقيقة):</label>
                <input
                  type="number"
                  value={store.deliveryTimeMin}
                  onChange={(e) =>
                    dbService.updateStore(store.id, { deliveryTimeMin: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">أقصى وقت توصيل (دقيقة):</label>
                <input
                  type="number"
                  value={store.deliveryTimeMax}
                  onChange={(e) =>
                    dbService.updateStore(store.id, { deliveryTimeMax: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">رسوم التوصيل المقترحة (دج):</label>
                <input
                  type="number"
                  value={store.deliveryFee}
                  onChange={(e) =>
                    dbService.updateStore(store.id, { deliveryFee: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">الحد الأدنى للطلب (دج):</label>
                <input
                  type="number"
                  value={store.minimumOrder}
                  onChange={(e) =>
                    dbService.updateStore(store.id, { minimumOrder: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
                />
              </div>
            </div>

            <div className="pt-3">
              <span className="text-emerald-600 font-bold">يتم حفظ التعديلات تلقائياً في قاعدة البيانات.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: WALLET & FINANCES */}
      {activeTab === 'wallet' && currentUser && (
        <MerchantFinancialWallet user={currentUser} store={store} />
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'تعديل منتج في القائمة' : 'إضافة منتج جديد'}
        maxWidth="md"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-neutral-700 mb-1">اسم الوجبة / المنتج:</label>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="مثال: كسكس باللحم والخضر"
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-sm focus:ring-2 focus:ring-[#FF6600]/30"
            />
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">الوصف والمكونات:</label>
            <textarea
              rows={2}
              required
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              placeholder="تفاصيل ومكونات الوجبة..."
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">السعر بالدينار (DZD):</label>
              <input
                type="number"
                required
                min={50}
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">السعر قبل الخصم (اختياري):</label>
              <input
                type="number"
                value={productForm.originalPrice}
                onChange={(e) => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-neutral-700 mb-1">التصنيف:</label>
              <input
                type="text"
                required
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                placeholder="أطباق رئيسية، مقبلات، حلويات..."
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 mb-1">الكمية المتوفرة:</label>
              <input
                type="number"
                value={productForm.stockQuantity}
                onChange={(e) => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-neutral-700 mb-1">رابط صورة المنتج (URL):</label>
            <input
              type="url"
              required
              value={productForm.imageUrl}
              onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isAvailableCheckbox"
              checked={productForm.isAvailable}
              onChange={(e) => setProductForm({ ...productForm, isAvailable: e.target.checked })}
              className="rounded text-[#FF6600] focus:ring-[#FF6600]"
            />
            <label htmlFor="isAvailableCheckbox" className="font-bold text-neutral-700 select-none">
              المنتج متوفر حالياً للطلب
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            <button
              type="submit"
              className="flex-1 py-3 bg-[#FF6600] hover:bg-[#E65C00] text-white font-bold rounded-xl shadow-md transition"
            >
              {editingProduct ? 'حفظ التعديلات' : 'إضافة المنتج'}
            </button>
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-xl transition"
            >
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
