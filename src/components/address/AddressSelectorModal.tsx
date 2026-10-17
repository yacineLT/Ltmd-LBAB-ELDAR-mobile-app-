import React, { useState } from 'react';
import { dbService } from '../../services/store';
import { CustomerAddress, DeliveryLocation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import {
  MapPin,
  Home,
  Briefcase,
  Bookmark,
  Plus,
  Trash2,
  Check,
  X,
  Phone,
  Navigation,
} from 'lucide-react';

interface AddressSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAddress: (addr: CustomerAddress) => void;
  onOpenMap: () => void;
}

export const AddressSelectorModal: React.FC<AddressSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectAddress,
  onOpenMap,
}) => {
  const { currentUser } = useAuth();
  const { location } = useLocation();
  const customerId = currentUser?.id || 'demo_customer';

  const [addresses, setAddresses] = useState<CustomerAddress[]>(() =>
    dbService.getCustomerAddresses(customerId)
  );

  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState<'المنزل' | 'العمل' | 'عنوان آخر'>('المنزل');
  const [street, setStreet] = useState(location?.address || '');
  const [city, setCity] = useState(location?.city || 'الجزائر العاصمة');
  const [district, setDistrict] = useState(location?.district || 'سيدي امحمد');
  const [phone, setPhone] = useState(currentUser?.phone || '0555 12 34 56');
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const refreshList = () => {
    setAddresses(dbService.getCustomerAddresses(customerId));
  };

  const handleSaveNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) return;

    dbService.addCustomerAddress({
      customerId,
      label,
      address: street.trim(),
      city: city.trim(),
      district: district.trim(),
      phone: phone.trim(),
      latitude: location?.latitude || 36.7692,
      longitude: location?.longitude || 3.0566,
      isDefault,
    });

    refreshList();
    setIsAdding(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.deleteCustomerAddress(id);
    refreshList();
  };

  const handleSetDefault = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dbService.setDefaultAddress(customerId, id);
    refreshList();
  };

  const getLabelIcon = (lbl: string) => {
    if (lbl.includes('منزل') || lbl === 'المنزل') return <Home className="w-4 h-4" />;
    if (lbl.includes('عمل') || lbl === 'العمل') return <Briefcase className="w-4 h-4" />;
    return <Bookmark className="w-4 h-4" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F27D26]/10 text-[#F27D26] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-[#1A1A1B]">
                عناوين التوصيل المحفوظة
              </h3>
              <p className="text-[11px] text-gray-500">
                اختر عنواناً مسجلاً أو حدد موقعاً جديداً على الخريطة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Location Display */}
        <div className="p-3.5 bg-orange-50/60 rounded-2xl border border-orange-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-[#F27D26] shrink-0" />
            <div>
              <span className="text-[10px] text-orange-900 font-bold block">الموقع المختار حالياً:</span>
              <p className="text-gray-800 font-semibold truncate max-w-[240px] sm:max-w-xs">
                {location?.address || 'الجزائر العاصمة'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMap();
            }}
            className="px-3 py-1.5 bg-[#F27D26] text-white rounded-xl text-xs font-bold hover:bg-[#d96716] transition shrink-0 cursor-pointer"
          >
            تغيير على الخريطة
          </button>
        </div>

        {/* Saved Addresses List */}
        {!isAdding && (
          <div className="space-y-3">
            {addresses.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-xs">
                لم تسجل أي عناوين محفوظة بعد. يمكنك حفظ عناوينك الدائمة هنا.
              </div>
            ) : (
              addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    onSelectAddress(addr);
                    onClose();
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    addr.isDefault
                      ? 'border-[#F27D26] bg-orange-50/30 shadow-xs'
                      : 'border-gray-200 hover:border-[#F27D26]/60 hover:bg-gray-50'
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
                      <p className="text-xs text-gray-600 truncate mt-0.5">{addr.address}</p>
                      <p className="text-[11px] text-gray-400">
                        {addr.district}، {addr.city} • هاتف: {addr.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={(e) => handleSetDefault(addr.id, e)}
                        className="text-[10px] text-gray-500 hover:text-[#F27D26] px-2 py-1 rounded-md hover:bg-gray-100 transition"
                      >
                        جعله افتراضياً
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(addr.id, e)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}

            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-[#F27D26] text-gray-600 hover:text-[#F27D26] font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عنوان جديد (المنزل / العمل / آخر)</span>
            </button>
          </div>
        )}

        {/* Add Address Form */}
        {isAdding && (
          <form onSubmit={handleSaveNewAddress} className="space-y-4 pt-1">
            <div className="text-xs font-bold text-[#1A1A1B]">تسمية العنوان:</div>
            <div className="grid grid-cols-3 gap-2">
              {(['المنزل', 'العمل', 'عنوان آخر'] as const).map((lbl) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={() => setLabel(lbl)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    label === lbl
                      ? 'border-[#F27D26] bg-[#F27D26]/10 text-[#F27D26]'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {getLabelIcon(lbl)}
                  <span>{lbl}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                العنوان التفصيلي (الشارع، رقم البناية، الطابق):
              </label>
              <input
                type="text"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="مثال: شارع ديدوش مراد عمارة 15 طابق 2"
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">البلدية / الحي:</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">الولاية:</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                رقم هاتف المستلم:
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0555 00 00 00"
                  className="w-full pr-9 pl-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs focus:ring-2 focus:ring-[#F27D26] focus:bg-white font-mono"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-gray-700">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 text-[#F27D26] rounded border-gray-300 focus:ring-[#F27D26]"
              />
              <span>تعيين كعنوان توصيل رئيسي وافتراضي</span>
            </label>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-[#F27D26] text-white text-xs font-bold rounded-xl hover:bg-[#d96716] shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>حفظ العنوان</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
