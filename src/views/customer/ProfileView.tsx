import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { dbService } from '../../services/store';
import { CustomerAddress } from '../../types';
import { useRouter, Link } from '../../router/Router';
import { RoleBadge } from '../../components/common/Badge';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Map,
  Package,
  Heart,
  LogOut,
  Shield,
  Store,
  Bike,
  ChevronLeft,
  Edit2,
  Check,
  Plus,
  Trash2,
  Home,
  Briefcase,
  Bookmark,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, role, logout } = useAuth();
  const { location, openMap, setLocation } = useLocation();
  const { navigate } = useRouter();

  const customerId = currentUser?.id || 'demo_customer';

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved Addresses State
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newLabel, setNewLabel] = useState<'المنزل' | 'العمل' | 'عنوان آخر'>('المنزل');
  const [newAddress, setNewAddress] = useState('');
  const [newCity, setNewCity] = useState(location?.city || 'الجزائر العاصمة');
  const [newDistrict, setNewDistrict] = useState(location?.district || 'سيدي امحمد');
  const [newPhone, setNewPhone] = useState(currentUser?.phone || '0555 12 34 56');

  const refreshAddresses = () => {
    setAddresses(dbService.getCustomerAddresses(customerId));
  };

  useEffect(() => {
    refreshAddresses();
    const unsub = dbService.subscribe(refreshAddresses);
    return () => unsub();
  }, [customerId]);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      currentUser.fullName = fullName.trim() || currentUser.fullName;
      currentUser.phone = phone.trim() || currentUser.phone;
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    dbService.addCustomerAddress({
      customerId,
      label: newLabel,
      address: newAddress.trim(),
      city: newCity.trim(),
      district: newDistrict.trim(),
      phone: newPhone.trim(),
      latitude: location?.latitude || 36.7692,
      longitude: location?.longitude || 3.0566,
      isDefault: addresses.length === 0,
    });

    setNewAddress('');
    setIsAddingAddress(false);
    refreshAddresses();
  };

  const handleDeleteAddress = (id: string) => {
    dbService.deleteCustomerAddress(id);
    refreshAddresses();
  };

  const handleSetDefaultAddress = (addr: CustomerAddress) => {
    dbService.setDefaultAddress(customerId, addr.id);
    setLocation({
      address: addr.address,
      latitude: addr.latitude,
      longitude: addr.longitude,
      city: addr.city,
      district: addr.district,
    });
    refreshAddresses();
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl.includes('منزل') || lbl === 'المنزل') return <Home className="w-4 h-4" />;
    if (lbl.includes('عمل') || lbl === 'العمل') return <Briefcase className="w-4 h-4" />;
    return <Bookmark className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1B]">الملف الشخصي والحساب</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          إدارة بيانات الحساب، العناوين المحفوظة، والمفضلة
        </p>
      </div>

      <div className="space-y-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1A1A1B] to-neutral-800 text-white flex items-center justify-center text-3xl font-black shadow-md shrink-0">
            {currentUser.fullName.charAt(0)}
          </div>

          <div className="flex-1 text-center sm:text-right space-y-3 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1B]">{currentUser.fullName}</h2>
                <div className="mt-1">
                  <RoleBadge role={currentUser.role} />
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-[#F27D26] text-xs font-bold text-gray-700 hover:text-[#F27D26] transition flex items-center justify-center gap-1.5 self-center sm:self-auto cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>تعديل البيانات</span>
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>تم حفظ التعديلات بنجاح</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2 text-right">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الاسم الكامل:</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">رقم الهاتف:</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] transition flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>حفظ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  <span>{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Phone className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-mono">{currentUser.phone}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shortcuts: Orders & Favorites */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/orders"
            className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-[#F27D26]/40 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 text-[#F27D26] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-[#1A1A1B]">سجل الطلبات</div>
                <div className="text-xs text-gray-500">تتبع الطلبات الحالية والسابقة وإعادة الطلب</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-[#F27D26] transition-colors" />
          </Link>

          <Link
            to="/favorites"
            className="p-5 rounded-2xl bg-white border border-gray-100 hover:border-rose-300 hover:shadow-md transition flex items-center justify-between group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div className="text-right">
                <div className="font-bold text-sm text-[#1A1A1B]">قائمة المفضلة</div>
                <div className="text-xs text-gray-500">المتاجر والوجبات المحفوظة للطلب السريع</div>
              </div>
            </div>
            <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-rose-500 transition-colors" />
          </Link>
        </div>

        {/* Saved Addresses Section */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-[#1A1A1B] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F27D26]" />
                <span>عناوين التوصيل المحفوظة</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                سجل عناوينك المفضلة (المنزل، العمل، إلخ) لتسريع وتسهيل وصول طلباتك
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3.5 py-2 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة عنوان</span>
            </button>
          </div>

          {/* Add Address Form */}
          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-3">
              <div className="font-bold text-xs text-[#1A1A1B]">تسمية العنوان:</div>
              <div className="grid grid-cols-3 gap-2">
                {(['المنزل', 'العمل', 'عنوان آخر'] as const).map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setNewLabel(lbl)}
                    className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      newLabel === lbl
                        ? 'border-[#F27D26] bg-[#F27D26]/10 text-[#F27D26]'
                        : 'border-gray-200 text-gray-600 bg-white'
                    }`}
                  >
                    {getLabelIcon(lbl)}
                    <span>{lbl}</span>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  العنوان التفصيلي (الشارع، رقم البناية، الطابق):
                </label>
                <input
                  type="text"
                  required
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="مثال: حي الرياض عمارة 4 شقة 10"
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">البلدية / الحي:</label>
                  <input
                    type="text"
                    required
                    value={newDistrict}
                    onChange={(e) => setNewDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">الولاية:</label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">هاتف المستلم:</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] transition cursor-pointer"
                >
                  حفظ العنوان
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-300 transition cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* List of saved addresses */}
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                لا توجد عناوين محفوظة بعد. أضف عنوانك الأول لتسهيل عملية الشراء.
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-[#F27D26] bg-orange-50/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        addr.isDefault
                          ? 'bg-[#F27D26] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {getLabelIcon(addr.label)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1A1A1B]">{addr.label}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] bg-[#F27D26] text-white px-2 py-0.2 rounded-full font-bold">
                            افتراضي
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-700 truncate mt-0.5">{addr.address}</p>
                      <p className="text-[11px] text-gray-400">
                        {addr.district}، {addr.city} • هاتف: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultAddress(addr)}
                        className="text-[11px] text-[#F27D26] hover:bg-orange-50 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer"
                      >
                        جعله افتراضياً
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Role Dashboards */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#1A1A1B] mb-2">لوحات التحكم والصلاحيات</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {role === 'MERCHANT' && (
              <Link
                to="/merchant"
                className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 hover:bg-blue-50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Store className="w-5 h-5 text-blue-600" />
                  <div className="text-right">
                    <div className="font-bold text-xs text-blue-900">لوحة تحكم التاجر</div>
                    <div className="text-[11px] text-blue-600">إدارة المتجر والمنتجات والطلبات</div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-blue-500" />
              </Link>
            )}

            {role === 'COURIER' && (
              <Link
                to="/courier/dashboard"
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 hover:bg-amber-50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Bike className="w-5 h-5 text-amber-600" />
                  <div className="text-right">
                    <div className="font-bold text-xs text-amber-900">لوحة تحكم الكابتن</div>
                    <div className="text-[11px] text-amber-600">قبول التوصيلات ومتابعة الأرباح</div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-amber-500" />
              </Link>
            )}

            {role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="p-4 rounded-xl border border-purple-200 bg-purple-50/30 hover:bg-purple-50 transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div className="text-right">
                    <div className="font-bold text-xs text-purple-900">لوحة إدارة المنصة</div>
                    <div className="text-[11px] text-purple-600">المستخدمين والمتاجر والتقارير</div>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-purple-500" />
              </Link>
            )}
          </div>
        </div>

        {/* Logout action */}
        <div className="pt-2">
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full py-3 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        </div>
      </div>
    </div>
  );
};
