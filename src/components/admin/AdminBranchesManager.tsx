import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/store';
import { Branch } from '../../types';
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from 'lucide-react';

const WILAYA_PRESETS = [
  { name: 'الجزائر العاصمة', lat: 36.7538, lng: 3.0588 },
  { name: 'وهران', lat: 35.6987, lng: -0.6349 },
  { name: 'قسنطينة', lat: 36.365, lng: 6.6147 },
  { name: 'البليدة', lat: 36.4701, lng: 2.8288 },
  { name: 'عنابة', lat: 36.9, lng: 7.7667 },
  { name: 'سطيف', lat: 36.1911, lng: 5.4137 },
  { name: 'تلمسان', lat: 34.8783, lng: -1.315 },
  { name: 'باتنة', lat: 35.5558, lng: 6.1742 },
];

export const AdminBranchesManager: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [wilaya, setWilaya] = useState('الجزائر العاصمة');
  const [municipality, setMunicipality] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [openingHours, setOpeningHours] = useState('08:00 - 17:00 (الأحد - الخميس)');
  const [latitude, setLatitude] = useState<number>(36.7538);
  const [longitude, setLongitude] = useState<number>(3.0588);
  const [isActive, setIsActive] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const loadBranches = () => {
    setBranches(dbService.getBranches());
  };

  useEffect(() => {
    loadBranches();
    const unsub = dbService.subscribe(loadBranches);
    return () => unsub();
  }, []);

  const handleOpenAddModal = () => {
    setEditingBranch(null);
    setName('');
    setWilaya('الجزائر العاصمة');
    setMunicipality('');
    setAddress('');
    setPhone('');
    setOpeningHours('08:00 - 17:00 (الأحد - الخميس)');
    setLatitude(36.7538);
    setLongitude(3.0588);
    setIsActive(true);
    setIsOpen(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setWilaya(branch.wilaya);
    setMunicipality(branch.municipality || '');
    setAddress(branch.address);
    setPhone(branch.phone || '');
    setOpeningHours(branch.openingHours || '08:00 - 17:00');
    setLatitude(branch.latitude || 36.7538);
    setLongitude(branch.longitude || 3.0588);
    setIsActive(branch.isActive);
    setIsOpen(branch.isOpen);
    setIsModalOpen(true);
  };

  const handleSelectWilayaPreset = (wName: string) => {
    setWilaya(wName);
    const preset = WILAYA_PRESETS.find((p) => p.name === wName);
    if (preset) {
      setLatitude(preset.lat);
      setLongitude(preset.lng);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim() || !wilaya.trim()) {
      alert('يرجى ملء اسم الفرع، الولاية، والعنوان بدقة.');
      return;
    }

    if (editingBranch) {
      dbService.updateBranch(editingBranch.id, {
        name: name.trim(),
        wilaya: wilaya.trim(),
        municipality: municipality.trim(),
        address: address.trim(),
        phone: phone.trim(),
        openingHours: openingHours.trim(),
        latitude,
        longitude,
        isActive,
        isOpen,
      });
    } else {
      dbService.createBranch({
        name: name.trim(),
        wilaya: wilaya.trim(),
        municipality: municipality.trim(),
        address: address.trim(),
        phone: phone.trim(),
        openingHours: openingHours.trim(),
        latitude,
        longitude,
        isActive,
        isOpen,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, branchName: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف فرع "${branchName}"؟`)) {
      dbService.deleteBranch(id);
    }
  };

  const handleToggleActive = (id: string) => {
    dbService.toggleBranchActive(id);
  };

  const handleToggleOpen = (id: string) => {
    dbService.toggleBranchOpen(id);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#FF6600]" />
            إدارة شبكة الفروع المعتمدة لسحب المستحقات
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            الفروع التي يمكن للتجار والموصّلين استلام أرباحهم منها نقداً بكل أمان
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#FF6600] text-white text-xs font-bold hover:bg-[#e05a00] transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" /> إضافة فرع جديد
        </button>
      </div>

      {/* Branches Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <div
            key={branch.id}
            className={`bg-white rounded-2xl border transition p-5 space-y-4 shadow-xs flex flex-col justify-between ${
              branch.isActive ? 'border-neutral-200' : 'border-neutral-200 opacity-60 bg-neutral-50'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-sm text-neutral-900 line-clamp-1">{branch.name}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      branch.isOpen
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {branch.isOpen ? 'مفتوح الآن' : 'مغلق'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      branch.isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {branch.isActive ? 'نشط' : 'معطل'}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-neutral-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800">{branch.wilaya}</span>
                    {branch.municipality && <span> - {branch.municipality}</span>}
                    <div className="text-neutral-500 text-[11px]">{branch.address}</div>
                  </div>
                </div>

                {branch.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="font-mono">{branch.phone}</span>
                  </div>
                )}

                {branch.openingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{branch.openingHours}</span>
                  </div>
                )}

                {branch.latitude && branch.longitude && (
                  <div className="text-[10px] font-mono text-neutral-400 bg-neutral-50 p-1.5 rounded-lg">
                    الإحداثيات: {branch.latitude.toFixed(4)}, {branch.longitude.toFixed(4)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleOpen(branch.id)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                    branch.isOpen
                      ? 'border-emerald-200 text-emerald-700 bg-emerald-50'
                      : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                  }`}
                  title="تغيير حالة الفتح"
                >
                  {branch.isOpen ? 'مفتوح' : 'مغلق'}
                </button>

                <button
                  onClick={() => handleToggleActive(branch.id)}
                  className={`text-[11px] font-bold px-2 py-1 rounded-lg border transition ${
                    branch.isActive
                      ? 'border-blue-200 text-blue-700 bg-blue-50'
                      : 'border-neutral-200 text-neutral-600 bg-neutral-50'
                  }`}
                  title="تفعيل أو تعطيل الفرع"
                >
                  {branch.isActive ? 'مفعّل' : 'معطّل'}
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(branch)}
                  className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100 transition"
                  title="تعديل بيانات الفرع"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(branch.id, branch.name)}
                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                  title="حذف الفرع"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="font-black text-base text-neutral-900">
                {editingBranch ? 'تعديل بيانات الفرع' : 'إضافة فرع معتمد جديد'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-neutral-700 mb-1">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: فرع ديدوش مراد - الجزائر الوسطى"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">الولاية *</label>
                  <select
                    value={wilaya}
                    onChange={(e) => handleSelectWilayaPreset(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                  >
                    {WILAYA_PRESETS.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">البلدية</label>
                  <input
                    type="text"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    placeholder="مثال: سيدي امحمد"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral-700 mb-1">العنوان التفصيلي *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="مثال: 45 شارع ديدوش مراد، قرب البريد المركزي"
                  className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">رقم هاتف الفرع</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="021 73 12 34"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">أوقات العمل</label>
                  <input
                    type="text"
                    value={openingHours}
                    onChange={(e) => setOpeningHours(e.target.value)}
                    placeholder="08:00 - 17:00"
                    className="w-full p-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-[#FF6600]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral-700 mb-1">خط العرض (Latitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral-700 mb-1">خط الطول (Longitude)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 rounded-xl border border-neutral-300 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                  />
                  فرع معتمد ونشط
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                  />
                  مفتوح لاستقبال الزوار
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold text-neutral-600 hover:bg-neutral-100 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#FF6600] text-white font-bold hover:bg-[#e05a00] transition"
                >
                  {editingBranch ? 'حفظ التعديلات' : 'إنشاء الفرع'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
