/**
 * Routing Engine Service
 *
 * Provides real road routing using OpenStreetMap-compatible routing engines (OSRM).
 * Highly modular and configurable so the provider can be swapped (e.g. to Valhalla, GraphHopper,
 * or self-hosted OSRM) without touching UI components.
 */

export interface RouteResult {
  coordinates: [number, number][]; // [latitude, longitude] for Leaflet
  distanceMeters: number;
  durationSeconds: number;
  distanceFormatted: string; // e.g. "2.4 كم"
  durationFormatted: string; // e.g. "8 دقيقة"
  provider: string;
  isFallback?: boolean;
}

export interface RoutingProvider {
  name: string;
  getRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteResult>;
}

export function calculateBearing(start: [number, number], end: [number, number]): number {
  const [lat1, lon1] = start;
  const [lat2, lon2] = end;
  const y = Math.sin(((lon2 - lon1) * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180);
  const x =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(((lon2 - lon1) * Math.PI) / 180);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

// Distance & Duration Arabic Formatters
export function formatDistanceArabic(meters: number): string {
  if (meters >= 1000) {
    const km = (meters / 1000).toFixed(1);
    return `${km} كم`;
  }
  return `${Math.round(meters)} م`;
}

export function formatDurationArabic(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0
      ? `${hours} س و ${remainingMinutes} د`
      : `${hours} ساعة`;
  }
  return `${minutes} دقيقة`;
}

// Haversine formula to compute great-circle distance between two GPS coordinates in meters
export function calculateHaversineDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const [lat1, lon1] = coord1;
  const [lat2, lon2] = coord2;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Generate a curved fallback road path if OSRM is unreachable,
 * guaranteeing the map never crashes and always displays a realistic route.
 */
function generateFallbackPath(
  start: [number, number],
  end: [number, number]
): [number, number][] {
  const points: [number, number][] = [start];
  const steps = 8;
  const midLat = (start[0] + end[0]) / 2;
  const midLng = (start[1] + end[1]) / 2;
  
  // Slight perpendicular offset to mimic road grid
  const dx = end[1] - start[1];
  const dy = end[0] - start[0];
  const offsetScale = 0.15;
  const offsetX = -dy * offsetScale;
  const offsetY = dx * offsetScale;

  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Quadratic Bezier interpolation with road detour
    const lat =
      (1 - t) * (1 - t) * start[0] +
      2 * (1 - t) * t * (midLat + offsetY) +
      t * t * end[0];
    const lng =
      (1 - t) * (1 - t) * start[1] +
      2 * (1 - t) * t * (midLng + offsetX) +
      t * t * end[1];
    points.push([lat, lng]);
  }

  points.push(end);
  return points;
}

/**
 * OSRM Routing Engine Provider
 * Uses the official open-source OSRM car/driving profile.
 */
export class OSRMProvider implements RoutingProvider {
  name = 'OSRM (OpenStreetMap)';
  private baseUrl: string;

  constructor(baseUrl = 'https://router.project-osrm.org') {
    this.baseUrl = baseUrl;
  }

  async getRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteResult> {
    const [startLat, startLng] = start;
    const [endLat, endLng] = end;

    // Direct distance calculation as sanity baseline
    const directDistance = calculateHaversineDistance(start, end);

    // If points are virtually identical (e.g. arrived)
    if (directDistance < 10) {
      return {
        coordinates: [start, end],
        distanceMeters: directDistance,
        durationSeconds: 10,
        distanceFormatted: formatDistanceArabic(directDistance),
        durationFormatted: '1 دقيقة',
        provider: this.name,
      };
    }

    try {
      // OSRM expects coordinates formatted as {longitude},{latitude}
      const url = `${this.baseUrl}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=false`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
        },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`OSRM API error HTTP ${response.status}`);
      }

      const data = await response.json();

      if (!data.routes || data.routes.length === 0) {
        throw new Error('No route found by OSRM');
      }

      const bestRoute = data.routes[0];
      // OSRM returns GeoJSON coordinates in [longitude, latitude]
      // Leaflet requires [latitude, longitude]
      const coordinates: [number, number][] = bestRoute.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
      );

      const distanceMeters = Math.round(bestRoute.distance);
      const durationSeconds = Math.round(bestRoute.duration);

      return {
        coordinates,
        distanceMeters,
        durationSeconds,
        distanceFormatted: formatDistanceArabic(distanceMeters),
        durationFormatted: formatDurationArabic(durationSeconds),
        provider: this.name,
      };
    } catch (err) {
      console.warn('OSRM routing fetch failed or timed out, applying resilient road fallback:', err);
      
      // Resilient road estimation: urban road distance is ~1.35x direct line distance
      const estimatedMeters = Math.round(directDistance * 1.35);
      // Average urban speed: 30 km/h = 8.33 m/s
      const estimatedDuration = Math.round(estimatedMeters / 8.33);

      return {
        coordinates: generateFallbackPath(start, end),
        distanceMeters: estimatedMeters,
        durationSeconds: estimatedDuration,
        distanceFormatted: formatDistanceArabic(estimatedMeters),
        durationFormatted: formatDurationArabic(estimatedDuration),
        provider: 'Fallback Engine (Road Estimate)',
        isFallback: true,
      };
    }
  }
}

/**
 * Global Routing Service Configuration
 */
class RoutingService {
  private provider: RoutingProvider;

  constructor(defaultProvider?: RoutingProvider) {
    this.provider = defaultProvider || new OSRMProvider();
  }

  setProvider(provider: RoutingProvider) {
    this.provider = provider;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async calculateRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<RouteResult> {
    return this.provider.getRoute(start, end);
  }
}

export const routingService = new RoutingService();

/**
 * Generates an external turn-by-turn navigation URL for Google Maps, Apple Maps, or OpenStreetMap
 */
export function getNavigationUrl(
  destination: [number, number],
  origin?: [number, number]
): string {
  const [destLat, destLng] = destination;
  
  if (origin) {
    const [origLat, origLng] = origin;
    // Standard Google Maps Direction URL compatible with Android/iOS intent & web
    return `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${destLat},${destLng}&travelmode=driving`;
  }
  
  return `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=driving`;
}

export function getOSMNavigationUrl(
  destination: [number, number],
  origin?: [number, number]
): string {
  const [destLat, destLng] = destination;
  if (origin) {
    const [origLat, origLng] = origin;
    return `https://www.openstreetmap.org/directions?engine=osrm_car&route=${origLat}%2C${origLng}%3B${destLat}%2C${destLng}`;
  }
  return `https://www.openstreetmap.org/?mlat=${destLat}&mlon=${destLng}#map=16/${destLat}/${destLng}`;
}
