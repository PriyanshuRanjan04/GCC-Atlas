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
  "Bengaluru": { lat: 12.97, lng: 77.59 },
  "Hyderabad": { lat: 17.39, lng: 78.49 },
  "Pune":      { lat: 18.52, lng: 73.86 },
  "Chennai":   { lat: 13.08, lng: 80.27 },
  "Delhi NCR": { lat: 28.50, lng: 77.10 },
  "Mumbai":    { lat: 19.08, lng: 72.88 },
  "Ahmedabad": { lat: 23.16, lng: 72.68 }, // GIFT City / Ahmedabad
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
