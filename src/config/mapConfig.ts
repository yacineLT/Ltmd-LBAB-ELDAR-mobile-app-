/// <reference types="vite/client" />

/**
 * Map Configuration & Basemap Tile Providers
 * 
 * Centralized, configurable map tiles adhering to the OpenStreetMap Tile Usage Policy:
 * https://operations.osmfoundation.org/policies/tiles/
 */

const env = (import.meta as { env?: Record<string, string> }).env || {};

export const MAP_CONFIG = {
  // Documented canonical OpenStreetMap raster tile URL (or environment variable override)
  tileUrl:
    env.VITE_MAP_TILE_URL ||
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',

  // Documented OpenStreetMap attribution
  attribution:
    env.VITE_MAP_TILE_ATTRIBUTION ||
    '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',

  maxZoom: 19,
  defaultZoom: 15,
  defaultCenter: [36.7525, 3.042] as [number, number], // Algiers central reference
};
