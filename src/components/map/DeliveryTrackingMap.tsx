import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import {
  Compass,
  Maximize2,
  Plus,
  Minus,
  Navigation,
  Play,
  Pause,
} from 'lucide-react';
import { Order } from '../../types';
import {
  routingService,
  calculateHaversineDistance,
  calculateBearing,
  RouteResult,
} from '../../services/routing';
import { MAP_CONFIG } from '../../config/mapConfig';

interface DeliveryTrackingMapProps {
  order?: Order | null;
  incomingOrder?: Order | null;
  courierCoordinates?: [number, number];
  heading?: number;
  isCourierView?: boolean;
  minimalUi?: boolean;
  onLocationUpdate?: (
    latitude: number,
    longitude: number,
    metrics?: {
      distanceMeters: number;
      durationSeconds: number;
      distanceFormatted: string;
      durationFormatted: string;
    }
  ) => void;
  className?: string;
  enableSimulation?: boolean;
}

export const DeliveryTrackingMap: React.FC<DeliveryTrackingMapProps> = ({
  order,
  incomingOrder,
  courierCoordinates,
  heading = 0,
  isCourierView = false,
  minimalUi = false,
  onLocationUpdate,
  className = 'h-full w-full',
  enableSimulation = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Active or preview target order
  const activeOrder = order || incomingOrder || null;

  // Markers & Layers refs
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const routeShadowRef = useRef<L.Polyline | null>(null);
  const routeCasingRef = useRef<L.Polyline | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const requestIdRef = useRef<number>(0);

  // Tracking state
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<RouteResult | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationIndex, setSimulationIndex] = useState(0);
  const [currentHeading, setCurrentHeading] = useState<number>(heading);
  const simulationTimerRef = useRef<number | null>(null);

  // Position references for deviation detection
  const lastRoutedCourierPosRef = useRef<[number, number] | null>(null);
  const activeDestinationRef = useRef<[number, number] | null>(null);

  // RTL check
  const isRtl =
    typeof document !== 'undefined'
      ? document.documentElement.dir === 'rtl'
      : true;

  // Default coordinate fallbacks in Algiers
  const storePos: [number, number] = [
    activeOrder?.pickupLatitude || 36.7695,
    activeOrder?.pickupLongitude || 3.0558,
  ];

  const customerPos: [number, number] = [
    activeOrder?.customerLatitude ||
      activeOrder?.deliveryAddress?.latitude ||
      36.758,
    activeOrder?.customerLongitude ||
      activeOrder?.deliveryAddress?.longitude ||
      3.051,
  ];

  // Default initial courier position
  const courierPos: [number, number] = courierCoordinates || [
    activeOrder?.courierLatitude || 36.764,
    activeOrder?.courierLongitude || 3.0535,
  ];

  // Determine current active target based on delivery state machine:
  const isTargetingStore =
    !activeOrder ||
    activeOrder.status === 'COURIER_ASSIGNED' ||
    activeOrder.status === 'READY_FOR_PICKUP' ||
    activeOrder.status === 'ACCEPTED' ||
    activeOrder.status === 'PREPARING';

  const currentDestination: [number, number] = isTargetingStore
    ? storePos
    : customerPos;

  // Keep internal heading in sync with incoming heading prop
  useEffect(() => {
    if (heading !== undefined && !isNaN(heading)) {
      setCurrentHeading(heading);
    }
  }, [heading]);

  /**
   * 1. Modern Navigation-Style Directional Courier Marker
   * - Calm circular accuracy breathing ring
   * - Translucent directional forward beam cone when moving/heading is available
   * - Crisp LBAB DAR orange navigation puck with white directional arrowhead
   */
  const createCourierIcon = useCallback((deg: number = 0) => {
    const isDirectional = deg !== 0 && !isNaN(deg);

    return L.divIcon({
      className: 'custom-courier-marker',
      html: `
        <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; pointer-events: auto;">
          <!-- Subtle Calm Accuracy Disc -->
          <div class="animate-gps-pulse" style="position: absolute; width: 44px; height: 44px; background: rgba(255, 102, 0, 0.12); border: 1px solid rgba(255, 102, 0, 0.28); border-radius: 9999px;"></div>
          
          <!-- Directional Forward Beam (shown when moving or heading available) -->
          ${
            isDirectional
              ? `
            <div style="position: absolute; top: -14px; width: 28px; height: 26px; transform-origin: 50% 38px; transform: rotate(${deg}deg); transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1); pointer-events: none;">
              <svg width="28" height="26" viewBox="0 0 28 26" fill="none">
                <path d="M14 0L27 24C23 20 19 18 14 18C9 18 5 20 1 24L14 0Z" fill="url(#courier-beam-grad)" opacity="0.45"/>
                <defs>
                  <linearGradient id="courier-beam-grad" x1="14" y1="0" x2="14" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FF6600"/>
                    <stop offset="1" stop-color="#FF6600" stop-opacity="0"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          `
              : ''
          }

          <!-- Courier Navigation Puck -->
          <div style="position: relative; width: 32px; height: 32px; background: linear-gradient(135deg, #FF7711, #EA580C); border: 3px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.22), 0 2px 5px rgba(255,102,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
            <svg style="transform: rotate(${deg}deg); transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);" width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
    });
  }, []);

  /**
   * 2. Distinct Minimal Pickup Location Marker (Store)
   * - Compact rounded beacon with warm amber tone
   * - White store icon
   * - Subtle active destination halo if active
   * - Micro anchor dot (no bulky road-blocking text)
   */
  const createStoreIcon = useCallback((isActive: boolean = false) => {
    return L.divIcon({
      className: 'custom-store-marker',
      html: `
        <div style="position: relative; width: 32px; height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer;">
          <!-- Active Destination Halo -->
          ${
            isActive
              ? `
            <div class="animate-beacon-halo" style="position: absolute; top: 0; left: 2px; width: 28px; height: 28px; background: rgba(217, 119, 6, 0.25); border-radius: 9px;"></div>
          `
              : ''
          }
          
          <!-- Store Beacon -->
          <div style="position: relative; width: 28px; height: 28px; background: linear-gradient(135deg, #F59E0B, #D97706); border: 2.5px solid #FFFFFF; border-radius: 9px; box-shadow: 0 4px 12px rgba(217,119,6,0.35), 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          
          <!-- Micro Anchor Pinpoint -->
          <div style="width: 5px; height: 5px; background: #D97706; border: 1px solid #FFFFFF; border-radius: 9999px; margin-top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [16, 35],
    });
  }, []);

  /**
   * 3. Distinct Minimal Customer Location Marker
   * - Compact circular beacon with emerald green tone
   * - Destination pin/home icon
   * - Micro anchor dot (no bulky road-blocking text)
   */
  const createCustomerIcon = useCallback((isActive: boolean = false) => {
    return L.divIcon({
      className: 'custom-customer-marker',
      html: `
        <div style="position: relative; width: 32px; height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; cursor: pointer;">
          <!-- Active Destination Halo -->
          ${
            isActive
              ? `
            <div class="animate-beacon-halo" style="position: absolute; top: 0; left: 2px; width: 28px; height: 28px; background: rgba(5, 150, 105, 0.25); border-radius: 9999px;"></div>
          `
              : ''
          }

          <!-- Customer Destination Beacon -->
          <div style="position: relative; width: 28px; height: 28px; background: linear-gradient(135deg, #10B981, #059669); border: 2.5px solid #FFFFFF; border-radius: 9999px; box-shadow: 0 4px 12px rgba(5,150,105,0.35), 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; color: white;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="2.5"></circle>
            </svg>
          </div>

          <!-- Micro Anchor Pinpoint -->
          <div style="width: 5px; height: 5px; background: #059669; border: 1px solid #FFFFFF; border-radius: 9999px; margin-top: 2px; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
        </div>
      `,
      iconSize: [32, 38],
      iconAnchor: [16, 35],
    });
  }, []);

  /**
   * 4. Navigation Camera Lower-Third Placement
   * Positions the courier in the lower third of the viewport (~66% down),
   * providing the driver with maximum visibility of the road ahead.
   */
  const centerOnCourierLowerThird = useCallback(
    (coords: [number, number], zoomLevel?: number, animate = true) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      const currentZoom = zoomLevel ?? map.getZoom() ?? 16;
      const size = map.getSize();
      if (size.y === 0) {
        map.setView(coords, currentZoom);
        return;
      }

      // Shift map center north so courier sits at ~66% from top
      const offsetPixels = L.point(0, -Math.round(size.y * 0.16));
      const targetPoint = map.project(coords, currentZoom).add(offsetPixels);
      const targetLatLng = map.unproject(targetPoint, currentZoom);

      if (animate) {
        map.panTo(targetLatLng, {
          animate: true,
          duration: 0.8,
          easeLinearity: 0.25,
        });
      } else {
        map.setView(targetLatLng, currentZoom);
      }
    },
    []
  );

  // Initialize Leaflet Map with Clean Light Positron Basemap
  useEffect(() => {
    if (!mapContainerRef.current) return;

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

    // Create Map with clean gesture handling
    const map = L.map(mapContainerRef.current, {
      center: courierPos,
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
    });

    // Canonical OpenStreetMap raster tile layer with documented usage policy
    L.tileLayer(MAP_CONFIG.tileUrl, {
      maxZoom: MAP_CONFIG.maxZoom,
      attribution: MAP_CONFIG.attribution,
    }).addTo(map);

    mapInstanceRef.current = map;
    setIsMapReady(true);

    return () => {
      requestIdRef.current++;
      setIsMapReady(false);

      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }

      if (storeMarkerRef.current) {
        try {
          storeMarkerRef.current.remove();
        } catch {}
        storeMarkerRef.current = null;
      }
      if (customerMarkerRef.current) {
        try {
          customerMarkerRef.current.remove();
        } catch {}
        customerMarkerRef.current = null;
      }
      if (courierMarkerRef.current) {
        try {
          courierMarkerRef.current.remove();
        } catch {}
        courierMarkerRef.current = null;
      }
      if (routeShadowRef.current) {
        try {
          routeShadowRef.current.remove();
        } catch {}
        routeShadowRef.current = null;
      }
      if (routeCasingRef.current) {
        try {
          routeCasingRef.current.remove();
        } catch {}
        routeCasingRef.current = null;
      }
      if (routePolylineRef.current) {
        try {
          routePolylineRef.current.remove();
        } catch {}
        routePolylineRef.current = null;
      }

      lastRoutedCourierPosRef.current = null;
      activeDestinationRef.current = null;

      try {
        map.remove();
      } catch (err) {
        console.warn('Map cleanup notice:', err);
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when order, courier, or destination changes
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    if (!map.getContainer() || !(map as any)._panes) return;

    // 1. Store Marker (only when active delivery exists)
    if (activeOrder) {
      if (!storeMarkerRef.current) {
        storeMarkerRef.current = L.marker(storePos, {
          icon: createStoreIcon(isTargetingStore),
          zIndexOffset: isTargetingStore ? 800 : 500,
        }).addTo(map);

        storeMarkerRef.current.bindPopup(
          `<div style="font-family: 'Cairo', sans-serif; text-align: right; padding: 2px;">
             <span style="font-size: 11px; font-weight: 700; color: #D97706; text-transform: uppercase;">نقطة الاستلام</span>
             <b style="display: block; color: #1E293B; font-size: 14px; margin-top: 2px;">${activeOrder.storeName}</b>
             <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">${activeOrder.storeAddress}</p>
           </div>`
        );
      } else {
        storeMarkerRef.current.setLatLng(storePos);
        storeMarkerRef.current.setIcon(createStoreIcon(isTargetingStore));
      }
    } else if (storeMarkerRef.current) {
      try {
        map.removeLayer(storeMarkerRef.current);
      } catch {}
      storeMarkerRef.current = null;
    }

    // 2. Customer Marker (only when active delivery exists)
    if (activeOrder) {
      if (!customerMarkerRef.current) {
        customerMarkerRef.current = L.marker(customerPos, {
          icon: createCustomerIcon(!isTargetingStore),
          zIndexOffset: !isTargetingStore ? 800 : 500,
        }).addTo(map);

        customerMarkerRef.current.bindPopup(
          `<div style="font-family: 'Cairo', sans-serif; text-align: right; padding: 2px;">
             <span style="font-size: 11px; font-weight: 700; color: #059669; text-transform: uppercase;">نقطة التوصيل</span>
             <b style="display: block; color: #1E293B; font-size: 14px; margin-top: 2px;">${activeOrder.customerName}</b>
             <p style="margin: 4px 0 0 0; font-size: 12px; color: #64748B;">${activeOrder.deliveryAddress?.street || 'عنوان الزبون'}</p>
           </div>`
        );
      } else {
        customerMarkerRef.current.setLatLng(customerPos);
        customerMarkerRef.current.setIcon(createCustomerIcon(!isTargetingStore));
      }
    } else if (customerMarkerRef.current) {
      try {
        map.removeLayer(customerMarkerRef.current);
      } catch {}
      customerMarkerRef.current = null;
    }

    // 3. Courier Marker (always present in courier view)
    if (!courierMarkerRef.current) {
      courierMarkerRef.current = L.marker(courierPos, {
        icon: createCourierIcon(currentHeading),
        zIndexOffset: 1000,
      }).addTo(map);
    } else {
      courierMarkerRef.current.setLatLng(courierPos);
      courierMarkerRef.current.setIcon(createCourierIcon(currentHeading));
    }
  }, [
    isMapReady,
    activeOrder?.id,
    activeOrder?.pickupLatitude,
    activeOrder?.pickupLongitude,
    activeOrder?.customerLatitude,
    activeOrder?.customerLongitude,
    activeOrder?.courierLatitude,
    activeOrder?.courierLongitude,
    courierPos[0],
    courierPos[1],
    currentHeading,
    isTargetingStore,
    createCourierIcon,
    createStoreIcon,
    createCustomerIcon,
  ]);

  /**
   * 5. Clean Navigation-Style Road Route Rendering
   * - Follows actual road geometry from OSRM engine
   * - 3-layer visual hierarchy:
   *   a. Ambient ground shadow (slate-900 at 0.12 opacity)
   *   b. High-contrast white casing (8px width, rounded joins)
   *   c. Vibrant LBAB DAR brand orange (#FF6600, 5.5px width, rounded joins)
   */
  const fetchAndDrawRoute = useCallback(
    async (start: [number, number], end: [number, number], force = false) => {
      const map = mapInstanceRef.current;
      if (!map || !map.getContainer() || !(map as any)._panes) return;

      // Avoid redundant calculations if start hasn't deviated significantly and end is same
      if (
        !force &&
        lastRoutedCourierPosRef.current &&
        activeDestinationRef.current
      ) {
        const devFromLastStart = calculateHaversineDistance(
          start,
          lastRoutedCourierPosRef.current
        );
        const destDiff = calculateHaversineDistance(
          end,
          activeDestinationRef.current
        );
        if (devFromLastStart < 60 && destDiff < 10) {
          return;
        }
      }

      const reqId = ++requestIdRef.current;
      setIsLoadingRoute(true);

      try {
        const result = await routingService.calculateRoute(start, end);

        if (
          reqId !== requestIdRef.current ||
          !mapInstanceRef.current ||
          mapInstanceRef.current !== map ||
          !map.getContainer() ||
          !(map as any)._panes?.overlayPane
        ) {
          return;
        }

        setCurrentRoute(result);
        lastRoutedCourierPosRef.current = start;
        activeDestinationRef.current = end;

        // Clean up previous polylines
        if (routeShadowRef.current) {
          try {
            map.removeLayer(routeShadowRef.current);
          } catch {}
          routeShadowRef.current = null;
        }
        if (routeCasingRef.current) {
          try {
            map.removeLayer(routeCasingRef.current);
          } catch {}
          routeCasingRef.current = null;
        }
        if (routePolylineRef.current) {
          try {
            map.removeLayer(routePolylineRef.current);
          } catch {}
          routePolylineRef.current = null;
        }

        if (!map.getContainer() || !(map as any)._panes?.overlayPane) {
          return;
        }

        // Layer 1: Ambient Ground Shadow
        routeShadowRef.current = L.polyline(result.coordinates, {
          color: '#0F172A',
          weight: 10,
          opacity: 0.14,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Layer 2: High-Contrast White Casing
        routeCasingRef.current = L.polyline(result.coordinates, {
          color: '#FFFFFF',
          weight: 8,
          opacity: 0.96,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Layer 3: Vibrant LBAB DAR Brand Orange Road Route
        routePolylineRef.current = L.polyline(result.coordinates, {
          color: '#FF6600',
          weight: 5.5,
          opacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);

        // Fit bounds with safe area padding for bottom sheet
        const bounds = L.latLngBounds([start, end]);
        map.fitBounds(bounds, {
          paddingTopLeft: [60, 40],
          paddingBottomRight: [40, 180],
          maxZoom: 16,
          animate: true,
        });

        // Compute initial bearing if heading was 0 and path has at least 2 points
        if (result.coordinates.length >= 2 && currentHeading === 0) {
          const initialBearing = calculateBearing(
            result.coordinates[0],
            result.coordinates[1]
          );
          if (!isNaN(initialBearing)) {
            setCurrentHeading(initialBearing);
            if (courierMarkerRef.current) {
              courierMarkerRef.current.setIcon(
                createCourierIcon(initialBearing)
              );
            }
          }
        }

        // Notify parent callback
        if (onLocationUpdate) {
          onLocationUpdate(start[0], start[1], {
            distanceMeters: result.distanceMeters,
            durationSeconds: result.durationSeconds,
            distanceFormatted: result.distanceFormatted,
            durationFormatted: result.durationFormatted,
          });
        }
      } catch (err) {
        console.warn('Road route calculation notice:', err);
      } finally {
        if (reqId === requestIdRef.current) {
          setIsLoadingRoute(false);
        }
      }
    },
    [currentHeading, onLocationUpdate, createCourierIcon]
  );

  // Trigger route calculation when destination or courier position changes
  useEffect(() => {
    if (!isMapReady) return;
    if (activeOrder) {
      fetchAndDrawRoute(courierPos, currentDestination, false);
    } else {
      const map = mapInstanceRef.current;
      if (map) {
        if (routeShadowRef.current) {
          try {
            map.removeLayer(routeShadowRef.current);
          } catch {}
          routeShadowRef.current = null;
        }
        if (routeCasingRef.current) {
          try {
            map.removeLayer(routeCasingRef.current);
          } catch {}
          routeCasingRef.current = null;
        }
        if (routePolylineRef.current) {
          try {
            map.removeLayer(routePolylineRef.current);
          } catch {}
          routePolylineRef.current = null;
        }
      }
      setCurrentRoute(null);
    }
  }, [
    isMapReady,
    courierPos[0],
    courierPos[1],
    currentDestination[0],
    currentDestination[1],
    activeOrder?.id,
    activeOrder?.status,
    fetchAndDrawRoute,
  ]);

  // Live Geolocation Watcher for Courier View
  useEffect(() => {
    if (!isCourierView) return;
    if (
      activeOrder?.status === 'DELIVERED' ||
      activeOrder?.status === 'CANCELLED' ||
      typeof window === 'undefined' ||
      !('geolocation' in navigator) ||
      !navigator.geolocation
    ) {
      return;
    }

    let lastSentTimestamp = 0;
    let lastSentCoords: [number, number] | null = null;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading: gpsHeading } = position.coords;
        const currentCoords: [number, number] = [latitude, longitude];

        // Move marker smoothly on map
        if (courierMarkerRef.current) {
          courierMarkerRef.current.setLatLng(currentCoords);
          if (gpsHeading !== null && !isNaN(gpsHeading)) {
            setCurrentHeading(gpsHeading);
            courierMarkerRef.current.setIcon(createCourierIcon(gpsHeading));
          }
        }

        // Throttle updates: only dispatch if > 25 meters moved or > 12 seconds elapsed
        const now = Date.now();
        const timeDiff = now - lastSentTimestamp;
        let distanceMoved = 999;
        if (lastSentCoords) {
          distanceMoved = calculateHaversineDistance(
            lastSentCoords,
            currentCoords
          );
        }

        if (distanceMoved >= 25 || timeDiff >= 12000) {
          lastSentTimestamp = now;
          lastSentCoords = currentCoords;

          if (activeOrder) {
            fetchAndDrawRoute(currentCoords, currentDestination, false);
          }
        }
      },
      (err) => {
        console.warn('Geolocation watch notice:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [
    isCourierView,
    activeOrder?.status,
    currentDestination,
    fetchAndDrawRoute,
    createCourierIcon,
  ]);

  // Simulation controls for route demo
  const toggleSimulation = () => {
    if (isSimulating) {
      if (simulationTimerRef.current) {
        clearInterval(simulationTimerRef.current);
        simulationTimerRef.current = null;
      }
      setIsSimulating(false);
    } else {
      if (!currentRoute || currentRoute.coordinates.length < 2) return;
      setIsSimulating(true);

      let step = simulationIndex;
      simulationTimerRef.current = window.setInterval(() => {
        if (!currentRoute || step >= currentRoute.coordinates.length - 1) {
          if (simulationTimerRef.current) {
            clearInterval(simulationTimerRef.current);
            simulationTimerRef.current = null;
          }
          setIsSimulating(false);
          setSimulationIndex(0);
          return;
        }

        step += 1;
        setSimulationIndex(step);
        const nextPos = currentRoute.coordinates[step];
        const prevPos = currentRoute.coordinates[step - 1];

        // Compute bearing along road segment
        const segmentBearing = calculateBearing(prevPos, nextPos);
        if (!isNaN(segmentBearing)) {
          setCurrentHeading(segmentBearing);
        }

        // Move courier marker smoothly
        if (courierMarkerRef.current) {
          courierMarkerRef.current.setLatLng(nextPos);
          courierMarkerRef.current.setIcon(createCourierIcon(segmentBearing));
        }

        // Keep courier in lower third
        centerOnCourierLowerThird(nextPos, undefined, true);

        // Calculate remaining metrics
        const remainingDistance = Math.max(
          50,
          currentRoute.distanceMeters *
            (1 - step / currentRoute.coordinates.length)
        );
        const remainingDuration = Math.max(
          10,
          currentRoute.durationSeconds *
            (1 - step / currentRoute.coordinates.length)
        );

        if (onLocationUpdate) {
          onLocationUpdate(nextPos[0], nextPos[1], {
            distanceMeters: Math.round(remainingDistance),
            durationSeconds: Math.round(remainingDuration),
            distanceFormatted:
              remainingDistance >= 1000
                ? `${(remainingDistance / 1000).toFixed(1)} كم`
                : `${Math.round(remainingDistance)} م`,
            durationFormatted: `${Math.max(
              1,
              Math.round(remainingDuration / 60)
            )} دقيقة`,
          });
        }
      }, 1400);
    }
  };

  // Zoom In / Out Handlers
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

  // Center on Courier (Lower-Third position for active delivery, center for idle)
  const handleRecenterCourier = () => {
    if (!mapInstanceRef.current || !courierMarkerRef.current) return;
    const latlng = courierMarkerRef.current.getLatLng();
    const coords: [number, number] = [latlng.lat, latlng.lng];

    if (activeOrder) {
      centerOnCourierLowerThird(coords, 16, true);
    } else {
      mapInstanceRef.current.setView(latlng, 16, { animate: true });
    }
  };

  // Fit Entire Active Route
  const handleFitAll = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([courierPos, currentDestination]);
      mapInstanceRef.current.fitBounds(bounds, {
        paddingTopLeft: [60, 40],
        paddingBottomRight: [40, 180],
        maxZoom: 16,
        animate: true,
      });
    }
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#F8FAFC] select-none ${className}`}
    >
      {/* 
        The Map Canvas (Geographical OpenStreetMap Tile Layer)
        Reliable, accurate street network and real geographical map rendering
      */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* 
        Minimal Modern Map Controls
        - Placed safe-area aware on ltr:right-3.5 rtl:left-3.5 top-28
        - Compact modern floating controls (+ zoom, - zoom, recenter, full overview)
        - Clean light glassmorphism style, does not cover route, bottom sheet, or cards
      */}
      <div
        className="absolute top-28 z-20 flex flex-col items-center gap-2 pointer-events-auto ltr:right-3.5 rtl:left-3.5"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        {/* Zoom Stack Pill */}
        <div className="flex flex-col rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 overflow-hidden divide-y divide-gray-100">
          <button
            type="button"
            id="map-zoom-in-btn"
            onClick={handleZoomIn}
            title={isRtl ? 'تكبير الخريطة' : 'Zoom in'}
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-[#FF6600] hover:bg-orange-50/50 transition-colors active:scale-90 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          <button
            type="button"
            id="map-zoom-out-btn"
            onClick={handleZoomOut}
            title={isRtl ? 'تصغير الخريطة' : 'Zoom out'}
            className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-[#FF6600] hover:bg-orange-50/50 transition-colors active:scale-90 cursor-pointer"
          >
            <Minus className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Locate / Recenter on Courier */}
        <button
          type="button"
          id="map-recenter-courier-btn"
          onClick={handleRecenterCourier}
          title={isRtl ? 'تمركز على موقعي' : 'Center on my location'}
          className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 flex items-center justify-center text-gray-700 hover:text-[#FF6600] hover:bg-orange-50/50 transition-all active:scale-90 cursor-pointer"
        >
          <Compass className="w-4.5 h-4.5 text-[#FF6600]" />
        </button>

        {/* Full Route Overview (available when active delivery exists) */}
        {activeOrder && (
          <button
            type="button"
            id="map-fit-route-btn"
            onClick={handleFitAll}
            title={isRtl ? 'عرض كامل المسار' : 'View entire route'}
            className="w-9 h-9 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-gray-200/80 flex items-center justify-center text-gray-600 hover:text-[#FF6600] hover:bg-orange-50/50 transition-all active:scale-90 cursor-pointer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Optional Simulation Control (only when explicitly enabled) */}
        {enableSimulation && activeOrder && (
          <button
            type="button"
            onClick={toggleSimulation}
            title={
              isSimulating
                ? 'إيقاف محاكاة الحركة'
                : 'تشغيل محاكاة حركة الكابتن'
            }
            className={`w-9 h-9 rounded-2xl shadow-md border transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
              isSimulating
                ? 'bg-red-500 text-white border-red-600 animate-pulse'
                : 'bg-white/95 backdrop-blur-md text-[#FF6600] border-gray-200/80 hover:bg-orange-50'
            }`}
          >
            {isSimulating ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
