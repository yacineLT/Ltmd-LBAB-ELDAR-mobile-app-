import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X,
  Navigation,
  MapPin,
  Check,
  AlertTriangle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Crosshair,
} from 'lucide-react';
import { DeliveryLocation } from '../../types';
import { MAP_CONFIG } from '../../config/mapConfig';

interface DeliveryMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLocation: DeliveryLocation | null;
  onConfirm: (location: DeliveryLocation) => void;
}

// Fallback Algerian wilaya estimator based on bounding boxes
const estimateAlgerianRegion = (lat: number, lng: number): { city: string; district: string } => {
  if (lat >= 36.6 && lat <= 36.85 && lng >= 2.9 && lng <= 3.3) {
    return { city: 'الجزائر العاصمة', district: 'سيدي امحمد' };
  }
  if (lat >= 36.4 && lat <= 36.6 && lng >= 2.7 && lng <= 3.0) {
    return { city: 'البليدة', district: 'وسط المدينة' };
  }
  if (lat >= 35.6 && lat <= 35.8 && lng >= -0.75 && lng <= -0.5) {
    return { city: 'وهران', district: 'حي السلام' };
  }
  if (lat >= 36.3 && lat <= 36.45 && lng >= 6.55 && lng <= 6.7) {
    return { city: 'قسنطينة', district: 'سيدي مبروك' };
  }
  if (lat >= 36.15 && lat <= 36.25 && lng >= 5.35 && lng <= 5.48) {
    return { city: 'سطيف', district: 'الهضاب' };
  }
  return { city: 'الجزائر', district: 'موقع التوصيل' };
};

export const DeliveryMapModal: React.FC<DeliveryMapModalProps> = ({
  isOpen,
  onClose,
  initialLocation,
  onConfirm,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const defaultLat = initialLocation?.latitude || 36.7692;
  const defaultLng = initialLocation?.longitude || 3.0566;

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: defaultLat,
    lng: defaultLng,
  });
  const [readableAddress, setReadableAddress] = useState<string>(
    initialLocation?.address || 'شارع ديدوش مراد، الجزائر العاصمة'
  );
  const [city, setCity] = useState<string>(initialLocation?.city || 'الجزائر العاصمة');
  const [district, setDistrict] = useState<string>(initialLocation?.district || 'سيدي امحمد');
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [isLocatingUser, setIsLocatingUser] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true);
    setGeoError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar,fr,en`,
        {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.street || '';
          const neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || addr.district || '';
          const cityName = addr.city || addr.town || addr.municipality || addr.county || addr.state || 'الجزائر';
          const detectedDistrict = neighborhood || road || 'حي سكني';

          // Build clean Arabic address representation
          const parts = [road, neighborhood, cityName].filter(Boolean);
          const formatted = parts.length > 0 ? parts.join('، ') : data.display_name?.split(',').slice(0, 3).join('، ');

          setReadableAddress(formatted || `الموقع الجغرافي (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          setCity(cityName);
          setDistrict(detectedDistrict);
          setIsGeocoding(false);
          return;
        }
      }
    } catch {
      // Fallback on network delay or rate-limiting
    }

    // Heuristic Algerian Fallback
    const region = estimateAlgerianRegion(lat, lng);
    setCity(region.city);
    setDistrict(region.district);
    setReadableAddress(`${region.district}، ${region.city} (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    setIsGeocoding(false);
  }, []);

  // Prevent scroll background and manage escape key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Create custom orange marker icon
  const createCustomIcon = useCallback(() => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `
        <div style="position: relative; width: 38px; height: 38px; transform: translate(-50%, -100%);">
          <div style="
            width: 38px;
            height: 38px;
            background: #F27D26;
            border: 3px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 14px rgba(242, 125, 38, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 12px;
              height: 12px;
              background: #ffffff;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
          <div style="
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 14px;
            height: 6px;
            background: rgba(0, 0, 0, 0.25);
            border-radius: 50%;
            filter: blur(1px);
          "></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Destroy existing instance if any
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore
      }
      mapInstanceRef.current = null;
    }
    if ((mapContainerRef.current as any)._leaflet_id) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    const initialLat = initialLocation?.latitude || 36.7692;
    const initialLng = initialLocation?.longitude || 3.0566;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false, // We use sleek custom zoom controls
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // OpenStreetMap Tile Layer
    L.tileLayer(MAP_CONFIG.tileUrl, {
      maxZoom: MAP_CONFIG.maxZoom,
      attribution: MAP_CONFIG.attribution,
    }).addTo(map);

    // Add Draggable Marker
    const icon = createCustomIcon();
    const marker = L.marker([initialLat, initialLng], {
      icon,
      draggable: true,
      autoPan: true,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      setCurrentCoords({ lat: position.lat, lng: position.lng });
      reverseGeocode(position.lat, position.lng);
    });

    // Handle map click to reposition marker
    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      setCurrentCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    // Leaflet needs recalculation of container size after mounting in modal
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(resizeTimer);
      if (markerRef.current) {
        try {
          markerRef.current.remove();
        } catch {
          // ignore
        }
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen, initialLocation, createCustomIcon, reverseGeocode]);

  // Request user location with browser Geolocation API
  const handleUseMyLocation = () => {
    setGeoError(null);

    if (!('geolocation' in navigator)) {
      setGeoError('متصفحك لا يدعم خاصية تحديد الموقع الجغرافي. يمكنك تحريك الخريطة واختيار موقعك يدوياً.');
      return;
    }

    setIsLocatingUser(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingUser(false);
        const { latitude, longitude } = position.coords;

        setCurrentCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 16, {
            animate: true,
            duration: 1.2,
          });
          markerRef.current.setLatLng([latitude, longitude]);
        }

        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setIsLocatingUser(false);
        console.warn('Geolocation error:', error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('تم رفض إذن الوصول إلى الموقع الجغرافي. يمكنك سحب الخريطة والنقر لتحديد موقعك بكل سهولة.');
        } else if (error.code === error.TIMEOUT) {
          setGeoError('استغرق تحديد الموقع وقتاً طويلاً. يرجى اختيار موقعك مباشرة على الخريطة.');
        } else {
          setGeoError('تعذر الوصول إلى موقعك الحالي بدقة. يرجى تحديد موقعك يدوياً على الخريطة.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Center map on current marker
  const handleCenterOnMarker = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo(markerRef.current.getLatLng(), { animate: true });
    }
  };

  // Confirm and Save
  const handleConfirmLocation = () => {
    const loc: DeliveryLocation = {
      address: readableAddress,
      latitude: currentCoords.lat,
      longitude: currentCoords.lng,
      city,
      district,
      createdAt: initialLocation?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onConfirm(loc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      dir="rtl"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      {/* Main Floating Modal Container */}
      <div className="relative w-full max-w-5xl h-[88vh] sm:h-[82vh] bg-white rounded-3xl shadow-2xl border border-gray-200 z-10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F27D26]/10 text-[#F27D26] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#1A1A1B]">
                تحديد موقع التوصيل لباب الدار
              </h2>
              <p className="text-xs text-gray-500 hidden sm:block">
                حرك المؤشر أو انقر على الخريطة لتحديد موقعك الدقيق لاستلام الطلبات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
            aria-label="إغلاق الخريطة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error / Instruction Notice */}
        {geoError && (
          <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-800 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{geoError}</span>
            </div>
            <button
              onClick={() => setGeoError(null)}
              className="text-amber-700 font-bold hover:underline ml-2"
            >
              حسناً
            </button>
          </div>
        )}

        {/* Interactive Map Stage */}
        <div className="relative flex-1 w-full h-full bg-gray-100 overflow-hidden">
          {/* Leaflet container */}
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Floating Controls Overlay (Top-Right / Left depending on RTL) */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            {/* "استخدم موقعي" Button */}
            <button
              onClick={handleUseMyLocation}
              disabled={isLocatingUser}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 hover:bg-white text-xs font-bold text-[#1A1A1B] hover:text-[#F27D26] transition active:scale-95 disabled:opacity-75"
              title="تحديد موقعي الجغرافي عبر GPS"
            >
              {isLocatingUser ? (
                <Loader2 className="w-4 h-4 text-[#F27D26] animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-[#F27D26]" />
              )}
              <span>{isLocatingUser ? 'جاري التحديد...' : 'استخدم موقعي'}</span>
            </button>
          </div>

          {/* Map Nav Buttons (Zoom & Center) */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
            <button
              onClick={handleZoomIn}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 hover:bg-white text-gray-700 flex items-center justify-center transition active:scale-95"
              title="تكبير"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 hover:bg-white text-gray-700 flex items-center justify-center transition active:scale-95"
              title="تصغير"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleCenterOnMarker}
              className="w-9 h-9 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-gray-100 hover:bg-white text-gray-700 flex items-center justify-center transition active:scale-95"
              title="التركيز على المؤشر"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Helper Badge */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 pointer-events-none hidden sm:block">
            <span className="bg-black/70 text-white text-[11px] px-3.5 py-1.5 rounded-full backdrop-blur-xs shadow-md">
              اسحب العلامة البرتقالية أو انقر في أي مكان لتحديد عنوانك
            </span>
          </div>
        </div>

        {/* Footer with Selected Address & Confirm Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F27D26]/10 text-[#F27D26] flex items-center justify-center shrink-0 mt-0.5">
                {isGeocoding ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#F27D26]" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400">العنوان المحدد:</span>
                  <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                    {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#1A1A1B] truncate mt-0.5">
                  {isGeocoding ? 'جاري جلب تفاصيل العنوان...' : readableAddress}
                </p>
              </div>
            </div>

            {/* Change coordinates or input hint */}
            <div className="text-[11px] text-gray-500 shrink-0 text-left sm:text-right">
              {city} {district ? `• ${district}` : ''}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleConfirmLocation}
              className="flex-1 py-3.5 bg-[#F27D26] hover:bg-[#d96716] text-white font-black text-sm rounded-2xl shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 active:scale-98"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد موقع التوصيل</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm rounded-2xl transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
