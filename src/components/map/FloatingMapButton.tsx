import React, { useState } from 'react';
import { MapPin, Map } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { useRouter } from '../../router/Router';

export const FloatingMapButton: React.FC = () => {
  const { openMap, location } = useLocation();
  const { itemCount } = useCart();
  const { path } = useRouter();
  const [showTooltip, setShowTooltip] = useState(false);

  const hasQuickCart = itemCount > 0 && path !== '/cart' && path !== '/checkout';

  return (
    <div
      className={`fixed ${
        hasQuickCart ? 'bottom-36 md:bottom-8' : 'bottom-20 md:bottom-8'
      } left-3 sm:left-4 md:left-8 z-40 flex items-center group transition-all duration-300`}
      dir="rtl"
    >
      {/* Tooltip */}
      <div
        className={`absolute right-full ml-0 mr-3 pointer-events-none transition-all duration-200 ease-out whitespace-nowrap ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <div className="bg-[#18181B]/90 backdrop-blur-xl text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xl border border-white/10 flex items-center gap-1.5">
          <span>خريطة التوصيل</span>
          {location?.district && (
            <span className="text-orange-200 font-medium text-[10px]">({location.district})</span>
          )}
        </div>
      </div>

      {/* Floating Button with Frosted Glass Ring */}
      <div className="p-1.5 rounded-full bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_12px_32px_rgba(255,102,0,0.22)] group-hover:bg-white/80 transition-all duration-200">
        <button
          type="button"
          onClick={openMap}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          aria-label="الخريطة"
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#EA580C] to-[#FF7711] hover:from-[#d84e06] hover:to-[#ea6c0e] text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center border border-white/40 focus:outline-none focus:ring-4 focus:ring-orange-400/30 cursor-pointer"
        >
          <div className="relative">
            <Map className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center shadow-xs">
              <span className="w-1.5 h-1.5 bg-[#FF6600] rounded-full animate-pulse" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
