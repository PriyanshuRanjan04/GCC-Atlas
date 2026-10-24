// lib/geo.ts
// Geographic coordinates for GCC Atlas city and micro-market markers.
// These are NEVER stored in /data — geo data lives here only.
// All micro-market positions are approximate; label them as such in the UI.

export interface CityCoord {
  lat: number;
  lng: number;
}

export interface MicroMarket {
  name: string;
  lat: number;
  lng: number;
  city: string;
}

/** City centroids used as the map anchor for each GCC hub. */
export const CITY_COORDS: Record<string, CityCoord> = {
  "Bengaluru": { lat: 12.9716, lng: 77.5946 },
  "Hyderabad": { lat: 17.3850, lng: 78.4867 },
  "Pune":      { lat: 18.5204, lng: 73.8567 },
  "Chennai":   { lat: 13.0827, lng: 80.2707 },
  "Delhi NCR": { lat: 28.6280, lng: 77.1265 },
  "Mumbai":    { lat: 19.0760, lng: 72.8777 },
  "Ahmedabad": { lat: 23.2156, lng: 72.6369 }, // GIFT City SEZ approx.
};

/**
 * Key business/office micro-markets for each city.
 * Positions are approximate centroids of the named zone — labelled as
 * "approximate location" wherever shown in the UI.
 */
export const MICRO_MARKETS: MicroMarket[] = [
  { name: "Outer Ring Road / Bellandur",    lat: 12.9141, lng: 77.6446, city: "Bengaluru" },
  { name: "Whitefield / ITPL",              lat: 12.9698, lng: 77.7499, city: "Bengaluru" },
  { name: "Electronic City",                lat: 12.8399, lng: 77.6770, city: "Bengaluru" },
  { name: "HITEC City / Madhapur",          lat: 17.4483, lng: 78.3915, city: "Hyderabad" },
  { name: "Gachibowli / Nanakramguda",      lat: 17.4239, lng: 78.3569, city: "Hyderabad" },
  { name: "Kharadi / ISSD East",            lat: 18.5515, lng: 73.9430, city: "Pune"      },
  { name: "Viman Nagar / Yerwada",          lat: 18.5668, lng: 73.9001, city: "Pune"      },
  { name: "OMR Zone 1 / Perungudi",         lat: 12.9635, lng: 80.2346, city: "Chennai"   },
  { name: "Guindy (CBD)",                   lat: 13.0067, lng: 80.2206, city: "Chennai"   },
  { name: "Cyber City / MG Road, Gurugram", lat: 28.4959, lng: 77.0887, city: "Delhi NCR" },
  { name: "Noida Expressway",               lat: 28.5272, lng: 77.3316, city: "Delhi NCR" },
  { name: "Bandra Kurla Complex",           lat: 19.0596, lng: 72.8650, city: "Mumbai"    },
  { name: "Andheri East",                   lat: 19.1136, lng: 72.8697, city: "Mumbai"    },
  { name: "GIFT City SEZ (IFSC zone)",      lat: 23.2156, lng: 72.6369, city: "Ahmedabad" },
];
