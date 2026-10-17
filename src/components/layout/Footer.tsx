import React from 'react';
import { Link } from '../../router/Router';
import { ShoppingBag, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#18181B]/95 backdrop-blur-2xl text-gray-400 pt-14 pb-20 md:pb-12 border-t border-white/10" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#EA580C] to-[#FF7711] flex items-center justify-center text-white shadow-lg shadow-orange-500/25 border border-white/20">
                <ShoppingBag className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-black text-white font-['Cairo'] tracking-tight">
                لباب <span className="text-[#FF6600]">الدار</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              منصة التوصيل والتسوق الجزائرية الرائدة. نصلك بأفضل المطاعم والمحلات والسوبرماركت في حيك ومدينتك بأسرع وقت وأعلى جودة.
            </p>
            <div className="text-xs text-gray-400 space-y-1.5 pt-2">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
                <span dir="ltr">021 99 88 77</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>contact@lbabdar.dz</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#FF6600]" />
                <span>الجزائر العاصمة، الجمهورية الجزائرية</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/stores" className="hover:text-[#FF6600] transition">
                  تصفح جميع المتاجر
                </Link>
              </li>
              <li>
                <Link to="/stores?category=cat_restaurants" className="hover:text-[#FF6600] transition">
                  مطاعم ومأكولات
                </Link>
              </li>
              <li>
                <Link to="/stores?category=cat_groceries" className="hover:text-[#FF6600] transition">
                  سوبرماركت ومواد غذائية
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-[#FF6600] transition">
                  متابعة الطلبات
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#FF6600] transition">
                  سلة المشتريات
                </Link>
              </li>
            </ul>
          </div>

          {/* Partners & Opportunities */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">انضم إلى شبكتنا</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/register" className="hover:text-[#FF6600] transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]"></span>
                  <span>سجل كتاجر وزد مبيعاتك</span>
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#FF6600] transition flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6600]"></span>
                  <span>انضم ككابتن توصيل وحقق دخلاً</span>
                </Link>
              </li>
              <li>
                <Link to="/merchant" className="hover:text-[#FF6600] transition text-gray-400">
                  لوحة تحكم التجار
                </Link>
              </li>
              <li>
                <Link to="/courier/dashboard" className="hover:text-[#FF6600] transition text-gray-400">
                  لوحة تحكم الموصّلين
                </Link>
              </li>
            </ul>
          </div>

          {/* Delivery Wilayas */}
          <div>
            <h4 className="text-white font-bold text-base mb-4">الولايات المشمولة بالتوصيل</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['16 الجزائر', '09 البليدة', '31 وهران', '25 قسنطينة', '19 سطيف', '13 تلمسان', '23 عنابة', '35 بومرداس', '42 تيبازة'].map((w) => (
                <span key={w} className="px-2.5 py-1 bg-white/10 backdrop-blur-xs text-gray-300 rounded-xl border border-white/10 shadow-xs">
                  {w}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 leading-relaxed">
              الدفع متاح نقداً عند الاستلام (COD) أو عبر البطاقة الذهبية / CIB بأمان تام.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} منصة "لباب الدار" (Lbab Dar). جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-1">
            <span>صُنعت بكل</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>لخدمة العائلات والتجار في الجزائر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
