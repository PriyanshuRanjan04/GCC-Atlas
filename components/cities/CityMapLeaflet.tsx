"use client";

/**
 * CityMapLeaflet.tsx
 *
 * OpenStreetMap raster tile base layer styled with a custom dark-teal CSS filter.
 * Tile source: https://tile.openstreetmap.org/{z}/{x}/{y}.png
 * Attribution: (c) OpenStreetMap contributors (ODbL).
 *
 * No external tile API key required.
 * Initial view centered on India (21N, 79E, zoom 5 on desktop, 4 on mobile).
 * Panning constrained with maxBounds.
 * Scroll-wheel zoom is disabled to prevent page scroll traps (+/- buttons enabled).
 */

import { useEffect, useRef } from "react";
import type { Map as LMap, CircleMarker, Marker } from "leaflet";
import { CITY_COORDS, MICRO_MARKETS } from "@/lib/geo";
import type { CityRichData, LayerType } from "./CitiesClient";
import "leaflet/dist/leaflet.css";

/* ── Constants ──────────────────────────────────────────────────────────── */

const INDIA_CENTER: [number, number] = [21.0, 79.0];

// Max bounds limiting panning strictly around India and immediate surroundings
const PAN_BOUNDS: [[number, number], [number, number]] = [
  [4.5, 64.0],   // SW: Indian Ocean / Arabian Sea
  [38.5, 100.0], // NE: Himalayas / Bay of Bengal
];

const LAYER_COLORS: Record<LayerType, string> = {
  captive:   "#00C9A7",
  rent:      "#F59E0B",
  salary:    "#60A5FA",
  ecosystem: "#C084FC",
};

const LAYER_LABELS: Record<LayerType, string> = {
  captive:   "Captive GCC count",
  rent:      "Grade A rent (midpoint ₹/sqft/mo)",
  salary:    "SW Eng salary (midpoint ₹L/yr)",
  ecosystem: "Ecosystem maturity score",
};

// Min and max bubble radius in pixels
const R_MIN = 8;
const R_MAX = 28;

// Non-overlapping label placements relative to each city center
const LABEL_DIRECTIONS: Record<string, { align: "left" | "right"; dy: number }> = {
  "Mumbai":    { align: "right", dy: 0 },  // West into Arabian Sea (prevents overlap with Pune)
  "Pune":      { align: "left",  dy: 2 },  // East inland
  "Bengaluru": { align: "right", dy: 0 },  // West
  "Chennai":   { align: "left",  dy: 0 },  // East into Bay of Bengal
  "Hyderabad": { align: "left",  dy: -2 }, // East-northeast
  "Delhi NCR": { align: "left",  dy: -4 }, // East
  "Ahmedabad": { align: "right", dy: 0 },  // West (GIFT City)
};

/* ── Helpers ─────────────────────────────────────────────────────────────── */

interface Props {
  data: CityRichData[];
  activeLayer: LayerType;
  industryFilter: string;
  selectedCity: string | null;
  showMicroMarkets: boolean;
  onCityClick: (city: string) => void;
}

function getLayerValue(d: CityRichData, layer: LayerType, industry: string): number {
  if (layer === "captive") return industry ? (d.gccsByIndustry[industry] ?? 0) : d.captiveCount;
  if (layer === "rent")    return d.rentMid;
  if (layer === "salary")  return d.salaryMid;
  return d.ecosystemMaturity;
}

function sqrtRadius(value: number, maxValue: number): number {
  if (maxValue <= 0 || value <= 0) return R_MIN;
  const ratio = Math.sqrt(value) / Math.sqrt(maxValue);
  return R_MIN + ratio * (R_MAX - R_MIN);
}

/* ── Component ───────────────────────────────────────────────────────────── */

export default function CityMapLeaflet({
  data, activeLayer, industryFilter, selectedCity, showMicroMarkets, onCityClick,
}: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<LMap | null>(null);
  const cityMarkersRef = useRef<{ marker: CircleMarker; city: string; label: Marker }[]>([]);
  const mmMarkersRef   = useRef<CircleMarker[]>([]);

  /* ── Init map once ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const initialZoom = isMobile ? 4 : 5;

    const map = L.map(containerRef.current, {
      center: INDIA_CENTER,
      zoom: initialZoom,
      minZoom: 4,
      maxZoom: 9,
      maxBounds: PAN_BOUNDS,
      maxBoundsViscosity: 0.9,
      scrollWheelZoom: false, // Prevents trapped page scroll (use +/- zoom buttons)
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;

    // OpenStreetMap standard raster tiles with custom dark filter
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      className: "dark-osm-tiles",
      maxZoom: 9,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
    }).addTo(map);

    // Initial resize invalidation to prevent cut-off rendering
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    const observer = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    observer.observe(containerRef.current);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      map.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Update city bubbles when data / layer / filter changes ───────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    // Clear existing city markers and labels
    cityMarkersRef.current.forEach(({ marker, label }) => {
      marker.remove();
      label.remove();
    });
    cityMarkersRef.current = [];

    const color = LAYER_COLORS[activeLayer];

    // Compute max value for square root scaling
    const values = data
      .filter((d) => d.city.city !== "Ahmedabad")
      .map((d) => getLayerValue(d, activeLayer, industryFilter));
    const maxVal = Math.max(...values, 1);

    data.forEach((d) => {
      const cityName = d.city.city;
      const coords = CITY_COORDS[cityName];
      if (!coords) return;

      const placement = LABEL_DIRECTIONS[cityName] ?? { align: "left", dy: 0 };

      // ── GIFT City / Ahmedabad (regulated entity hub) ─────────────────────
      if (cityName === "Ahmedabad") {
        const giftMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 9,
          color: "#F97316",
          fillColor: "#F97316",
          fillOpacity: 0.25,
          weight: 2,
          dashArray: "4, 4",
          interactive: true,
          bubblingMouseEvents: false,
        }).addTo(map);

        giftMarker.bindTooltip(
          `<strong>Ahmedabad / GIFT City</strong><br>Regulated financial hub · 0 captive GCCs in dataset`,
          { className: "gcc-tooltip", direction: "top", offset: [0, -10] }
        );
        giftMarker.on("click", () => onCityClick("Ahmedabad"));

        // Label to the west (align: right)
        const giftLabelIcon = L.divIcon({
          className: "city-bubble-label",
          html: `<span style="display:inline-block;color:#FB923C;font-size:11px;font-weight:700;white-space:nowrap;text-shadow:0 1px 4px #000, 0 0 6px #000;letter-spacing:0.03em;">GIFT City</span>`,
          iconAnchor: placement.align === "right" ? [72, 6] : [-16, 6],
        });
        const giftLabel = L.marker([coords.lat, coords.lng], {
          icon: giftLabelIcon,
          interactive: false,
        }).addTo(map);

        cityMarkersRef.current.push({ marker: giftMarker, city: cityName, label: giftLabel });
        return;
      }

      // ── Normal GCC city bubble ───────────────────────────────────────────
      const value  = getLayerValue(d, activeLayer, industryFilter);
      const radius = sqrtRadius(value, maxVal);
      const isSelected = selectedCity === cityName;

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        color:       isSelected ? "#ffffff" : color,
        fillColor:   color,
        fillOpacity: isSelected ? 0.85 : 0.55,
        weight:      isSelected ? 2.5 : 1.5,
        interactive: true,
        bubblingMouseEvents: false,
      }).addTo(map);

      // Tooltip
      const valLabel = activeLayer === "rent"   ? `₹${value.toFixed(0)}/sqft/mo`
                     : activeLayer === "salary" ? `₹${value.toFixed(0)}L/yr`
                     : String(Math.round(value));

      marker.bindTooltip(
        `<strong>${cityName}</strong><br>${LAYER_LABELS[activeLayer]}: ${valLabel}`,
        { className: "gcc-tooltip", direction: "top", offset: [0, -radius - 3] }
      );

      marker.on("click", () => onCityClick(cityName));
      marker.on("mouseover", function (this: CircleMarker) {
        if (selectedCity !== cityName) this.setStyle({ fillOpacity: 0.85, weight: 2 });
      });
      marker.on("mouseout", function (this: CircleMarker) {
        if (selectedCity !== cityName) this.setStyle({ fillOpacity: 0.55, weight: 1.5 });
      });

      // City label beside bubble (Mumbai west into sea; Pune east inland; etc.)
      const offsetDist = Math.round(radius + 7);
      const anchorX = placement.align === "right" ? offsetDist + 80 : -offsetDist;

      const labelIcon = L.divIcon({
        className: "city-bubble-label",
        html: `<span style="display:inline-block;color:#e2e8f0;font-size:11px;font-weight:600;white-space:nowrap;text-shadow:0 1px 4px #000, 0 0 8px #000;letter-spacing:0.02em;text-align:${placement.align};">${cityName}</span>`,
        iconAnchor: [anchorX, 6 + placement.dy],
      });
      const label = L.marker([coords.lat, coords.lng], {
        icon: labelIcon,
        interactive: false,
      }).addTo(map);

      cityMarkersRef.current.push({ marker, city: cityName, label });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeLayer, industryFilter, selectedCity]);

  /* ── Update selected city highlight ─────────────────────────────────── */
  useEffect(() => {
    const color = LAYER_COLORS[activeLayer];
    cityMarkersRef.current.forEach(({ marker, city }) => {
      if (city === "Ahmedabad") return;
      const isSelected = city === selectedCity;
      marker.setStyle({
        color:       isSelected ? "#ffffff" : color,
        fillOpacity: isSelected ? 0.85 : 0.55,
        weight:      isSelected ? 2.5 : 1.5,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity, activeLayer]);

  /* ── Micro-market markers ─────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    mmMarkersRef.current.forEach((m) => m.remove());
    mmMarkersRef.current = [];

    if (!showMicroMarkets) return;

    MICRO_MARKETS.forEach((mm) => {
      const m = L.circleMarker([mm.lat, mm.lng], {
        radius: 4.5,
        color: "#94a3b8",
        fillColor: "#94a3b8",
        fillOpacity: 0.65,
        weight: 1,
        bubblingMouseEvents: false,
      }).addTo(map);
      m.bindTooltip(
        `<strong>${mm.name}</strong><br><em>Approximate micro-market location (${mm.city})</em>`,
        { className: "gcc-tooltip", direction: "top", offset: [0, -6] }
      );
      mmMarkersRef.current.push(m);
    });
  }, [showMicroMarkets]);

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", minHeight: "440px", borderRadius: "inherit", background: "#080e1a" }}
      />
      <style>{`
        /* Map container background */
        .leaflet-container {
          background: #080e1a !important;
          font-family: var(--font-sans), sans-serif;
        }

        /* 
         * Dark teal CSS filter applied strictly to OSM raster tiles.
         * Invert + hue-rotate + contrast + saturate aligns OSM standard tiles
         * perfectly with the dark teal theme, leaving SVG overlays & controls untouched.
         */
        .dark-osm-tiles {
          filter: invert(1) hue-rotate(180deg) brightness(0.8) contrast(0.9) saturate(0.6) !important;
        }

        /* Tooltip styling */
        .gcc-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(0, 201, 167, 0.3) !important;
          color: #e2e8f0 !important;
          font-size: 12px !important;
          line-height: 1.5 !important;
          padding: 6px 10px !important;
          border-radius: 6px !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6) !important;
          pointer-events: none !important;
        }
        .gcc-tooltip::before { display: none !important; }

        /* City labels beside bubbles — non-interactive */
        .city-bubble-label {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          pointer-events: none !important;
          user-select: none !important;
        }

        /* Attribution styling */
        .leaflet-control-attribution {
          background: rgba(8, 14, 26, 0.85) !important;
          color: #64748b !important;
          font-size: 10px !important;
          padding: 2px 8px !important;
          border-radius: 4px 0 0 0 !important;
        }
        .leaflet-control-attribution a {
          color: #94a3b8 !important;
          text-decoration: underline !important;
        }

        /* Zoom controls */
        .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.9) !important;
          color: #94a3b8 !important;
          border-color: rgba(38, 60, 93, 0.8) !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(28, 46, 79, 0.95) !important;
          color: #e2e8f0 !important;
        }
      `}</style>
    </>
  );
}
