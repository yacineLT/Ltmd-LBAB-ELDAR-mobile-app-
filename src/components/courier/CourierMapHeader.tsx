import React from 'react';
import {
  Bike,
  Car,
  Wallet,
  Play,
  Pause,
  Compass,
  AlertCircle,
} from 'lucide-react';
import { Order } from '../../types';

interface CourierMapHeaderProps {
  isOnline: boolean;
  onToggleOnline: () => void;
  vehicleType: 'MOTORCYCLE' | 'BICYCLE' | 'CAR';
  onToggleVehicle: () => void;
  walletBalance: number;
  onOpenWallet: () => void;
  activeOrder?: Order | null;
  onRecenter?: () => void;
  isSimulating?: boolean;
  onToggleSimulation?: () => void;
  enableSimulation?: boolean;
}

export const CourierMapHeader: React.FC<CourierMapHeaderProps> = ({
  isOnline,
  onToggleOnline,
  vehicleType,
  onToggleVehicle,
  walletBalance,
  onOpenWallet,
  activeOrder,
  onRecenter,
  isSimulating,
  onToggleSimulation,
  enableSimulation,
}) => {
  const isRtl =
    typeof document !== 'undefined'
      ? document.documentElement.dir === 'rtl'
      : true;

  return (
    <div
      className="absolute top-3 left-3 right-3 z-30 pointer-events-none flex flex-col gap-2"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between gap-2">
        {/* Left side (or start side): Online status toggle & Vehicle */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-white/80">
          {/* Online/Offline Toggle */}
          <button
            type="button"
            id="courier-toggle-online-btn"
            onClick={onToggleOnline}
            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
              isOnline
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)] animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span>{isOnline ? (isRtl ? 'متصل' : 'ONLINE') : isRtl ? 'غير متصل' : 'OFFLINE'}</span>
          </button>

          {/* Vehicle Switcher */}
          <button
            type="button"
            onClick={onToggleVehicle}
            title={isRtl ? 'تبديل نوع المركبة' : 'Change vehicle'}
            className="p-2 rounded-xl text-neutral-700 hover:bg-white/80 transition-colors active:scale-95 cursor-pointer"
          >
            {vehicleType === 'CAR' ? (
              <Car className="w-4 h-4 text-blue-600" />
            ) : (
              <Bike className="w-4 h-4 text-[#FF6600]" />
            )}
          </button>
        </div>

        {/* Right side: Wallet balance button & Map controls */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Wallet pill button */}
          <button
            type="button"
            id="courier-wallet-btn"
            onClick={onOpenWallet}
            className="bg-neutral-900/85 hover:bg-neutral-900/95 backdrop-blur-xl text-white px-3.5 py-2 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-white/10 flex items-center gap-2 text-xs font-black transition-all active:scale-95 cursor-pointer"
            title={isRtl ? 'فتح المحفظة المالية' : 'Open courier wallet'}
          >
            <Wallet className="w-4 h-4 text-[#FF6600]" />
            <span className="font-mono text-amber-400">
              {walletBalance.toLocaleString('fr-DZ')} {isRtl ? 'دج' : 'DZD'}
            </span>
          </button>

          {/* Re-center GPS button */}
          {onRecenter && (
            <button
              type="button"
              onClick={onRecenter}
              title={isRtl ? 'تمركز على موقعي' : 'Center my location'}
              className="p-2.5 bg-white/80 hover:bg-white/95 backdrop-blur-xl text-neutral-700 hover:text-[#FF6600] rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-white/80 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Compass className="w-5 h-5 text-[#FF6600]" />
            </button>
          )}

          {/* Simulation Toggle (for developer & testing convenience) */}
          {enableSimulation && onToggleSimulation && (
            <button
              type="button"
              onClick={onToggleSimulation}
              title={isSimulating ? 'إيقاف المحاكاة' : 'تشغيل محاكاة الحركة'}
              className={`p-2.5 rounded-2xl shadow-lg border transition-all active:scale-95 flex items-center justify-center cursor-pointer ${
                isSimulating
                  ? 'bg-red-500 text-white border-red-600 animate-pulse'
                  : 'bg-white/80 backdrop-blur-xl text-neutral-700 border-white/80 hover:bg-orange-50'
              }`}
            >
              {isSimulating ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4 text-[#FF6600]" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="pointer-events-auto w-full max-w-xs mx-auto bg-amber-500/95 text-white px-3.5 py-1.5 rounded-full text-xs font-bold text-center shadow-lg backdrop-blur-xs flex items-center justify-center gap-1.5 animate-in fade-in">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{isRtl ? 'أنت غير متصل حالياً. انقر على الزر لتلقي الطلبات' : 'You are offline. Go online to receive orders'}</span>
        </div>
      )}
    </div>
  );
};
