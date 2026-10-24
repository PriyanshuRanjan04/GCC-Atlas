"use client";

/**
 * CityMapLeaflet.tsx
 *
 * Vector GeoJSON base layer styled for the dark slate theme:
 * - India states: DataMeet maps (CC BY 4.0) official boundary including J&K and Ladakh,
 *   rendered in dark slate (#1a2438) with thin lighter borders (#2c3d59).
 * - Surrounding countries: Natural Earth 110m (Public Domain) rendered in dimmer slate (#0c1322).
 * - Zero external tile requests or API keys required. Works 100% offline.
 * - Teal bubbles with the value printed next to the city name (e.g. "Bengaluru 17").
 * - Non-overlapping label placement (Mumbai into Arabian Sea, Pune inland east).
 * - Scroll-wheel zoom disabled to avoid trapped page scroll (+/- buttons enabled).
 */

import { useEffect, useRef } from "react";
import type { Map as LMap, CircleMarker, Marker, GeoJSON as LGeoJSON } from "leaflet";
import { CITY_COORDS, MICRO_MARKETS } from "@/lib/geo";
import type { CityRichData, LayerType } from "./CitiesClient";
import "leaflet/dist/leaflet.css";

/* ── Constants ──────────────────────────────────────────────────────────── */

const INDIA_CENTER: [number, number] = [21.8, 78.8];

// Max bounds limiting panning strictly around India and South Asia
const PAN_BOUNDS: [[number, number], [number, number]] = [
  [4.0, 60.0],   // SW: Indian Ocean / Arabian Sea
  [38.5, 99.0],  // NE: Himalayas / Bay of Bengal
];

// Min and max bubble radius in pixels
const R_MIN = 8;
const R_MAX = 26;

// Non-overlapping label placements relative to each city center
const LABEL_DIRECTIONS: Record<string, { align: "left" | "right"; dy: number }> = {
  "Mumbai":    { align: "right", dy: 0 },  // West into Arabian Sea (avoids overlap with Pune)
  "Pune":      { align: "left",  dy: 2 },  // East inland
  "Bengaluru": { align: "right", dy: 0 },  // West
  "Chennai":   { align: "left",  dy: 0 },  // East into Bay of Bengal
  "Hyderabad": { align: "left",  dy: -2 }, // East-northeast
  "Delhi NCR": { align: "left",  dy: -4 }, // East
  "Ahmedabad": { align: "right", dy: 0 },  // West (GIFT City)
};

/* ── In-Memory GeoJSON Cache ─────────────────────────────────────────────── */

let geoCachePromise: Promise<[any, any]> | null = null;

function loadGeoData(): Promise<[any, any]> {
  if (!geoCachePromise) {
    geoCachePromise = Promise.all([
      fetch("/geo/neighbours.geojson").then((r) => {
        if (!r.ok) throw new Error("Failed to load neighbours.geojson");
        return r.json();
      }),
      fetch("/geo/india_states.geojson").then((r) => {
        if (!r.ok) throw new Error("Failed to load india_states.geojson");
        return r.json();
      }),
    ]);
  }
  return geoCachePromise;
}

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

function formatCityValue(cityName: string, val: number, layer: LayerType): string {
  if (cityName === "Ahmedabad" && layer === "captive") {
    return "(GIFT)";
  }
  if (layer === "rent") {
    return `₹${Math.round(val)}`;
  }
  if (layer === "salary") {
    return `₹${val.toFixed(1).replace(".0", "")}L`;
  }
  return String(Math.round(val));
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
  const containerRef    = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<LMap | null>(null);
  const indiaLayerRef   = useRef<LGeoJSON | null>(null);
  const cityMarkersRef  = useRef<{ marker: CircleMarker; city: string; label: Marker }[]>([]);
  const mmMarkersRef    = useRef<CircleMarker[]>([]);

  /* ── Init map & base GeoJSON once ──────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let isMounted = true;

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet") as typeof import("leaflet");

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const initialZoom = isMobile ? 4.2 : 4.8;

    const map = L.map(containerRef.current, {
      center: INDIA_CENTER,
      zoom: initialZoom,
      zoomSnap: 0.1,
      zoomDelta: 0.5,
      minZoom: 3.8,
      maxZoom: 9,
      maxBounds: PAN_BOUNDS,
      maxBoundsViscosity: 0.95,
      scrollWheelZoom: false, // Prevents trapped page scroll (use +/- zoom buttons)
      zoomControl: true,
      attributionControl: true,
    });

    mapRef.current = map;

    // ── Create named panes so z-order is stable from the very first render ──
    // This must happen synchronously, before any layer is added (incl. async GeoJSON).
    map.createPane("boundaryPane").style.zIndex = "300";
    map.createPane("bubblesPane").style.zIndex  = "450";
    map.createPane("labelsPane").style.zIndex   = "500";
    // Bubbles and labels still receive mouse events; boundary does not.
    (map.getPane("boundaryPane") as HTMLElement).style.pointerEvents = "none";
    (map.getPane("labelsPane")   as HTMLElement).style.pointerEvents = "none";

    // Custom attribution for community GeoJSON boundaries
    map.attributionControl.addAttribution(
      'Boundaries: <a href="https://github.com/datameet/maps" target="_blank" rel="noopener">DataMeet</a> (CC BY 4.0) · <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener">Natural Earth</a>'
    );

    // Load vector GeoJSON layers
    loadGeoData()
      .then(([neighboursData, indiaData]) => {
        if (!isMounted || !mapRef.current) return;

        // 1. Surrounding countries — below India, no mouse events
        L.geoJSON(neighboursData, {
          style: {
            fillColor: "#0b1220",
            fillOpacity: 0.9,
            color: "#182236",
            weight: 0.75,
          },
          interactive: false,
          pane: "boundaryPane",
        }).addTo(map);

        // 2. India states — dark slate, in boundaryPane (below bubbles always)
        const indiaLayer = L.geoJSON(indiaData, {
          style: {
            fillColor: "#1a2438",
            fillOpacity: 0.95,
            color: "#2c3d59",
            weight: 0.85,
          },
          pane: "boundaryPane",
          onEachFeature: (feature, layer) => {
            const stateName = feature.properties?.ST_NM;
            if (stateName) {
              layer.bindTooltip(stateName, {
                className: "state-tooltip",
                sticky: true,
                direction: "top",
                offset: [0, -4],
              });
              layer.on({
                mouseover: (e: any) => {
                  e.target.setStyle({ fillColor: "#22324d", color: "#3e5275", weight: 1.2 });
                },
                mouseout: (e: any) => {
                  e.target.setStyle({ fillColor: "#1a2438", color: "#2c3d59", weight: 0.85 });
                },
              });
            }
          },
        }).addTo(map);

        indiaLayerRef.current = indiaLayer;
      })
      .catch((err) => {
        console.error("Error loading boundary GeoJSON:", err);
      });

    // Handle container resize cleanly
    const timer = setTimeout(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    }, 150);

    const observer = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.invalidateSize();
    });
    observer.observe(containerRef.current);

    return () => {
      isMounted = false;
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

    // All bubbles use teal as the single primary accent colour
    const TEAL_FILL    = "#00C9A7";
    const TEAL_OUTLINE = "#5EEAD4";

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
      const isSelected = selectedCity === cityName;
      const value = getLayerValue(d, activeLayer, industryFilter);
      const valStr = formatCityValue(cityName, value, activeLayer);

      // ── GIFT City / Ahmedabad (regulated entity hub) ─────────────────────
      if (cityName === "Ahmedabad") {
        const giftMarker = L.circleMarker([coords.lat, coords.lng], {
          radius: 9,
          color:       isSelected ? "#ffffff" : "#FB923C",
          fillColor:   "#FB923C",
          fillOpacity: isSelected ? 0.6 : 0.25,
          weight:      isSelected ? 2.5 : 1.75,
          dashArray:   "4, 4",
          interactive: true,
          bubblingMouseEvents: false,
          pane: "bubblesPane",
        }).addTo(map);

        giftMarker.bindTooltip(
          `<strong>Ahmedabad / GIFT City</strong><br>Regulated financial hub · 0 captive GCCs in dataset`,
          { className: "gcc-tooltip", direction: "top", offset: [0, -10] }
        );
        giftMarker.on("click", () => onCityClick("Ahmedabad"));

        // City label beside bubble (West into Arabian Sea / align: right)
        const labelText = activeLayer === "captive" ? "Ahmedabad (GIFT)" : `Ahmedabad ${valStr}`;
        const giftLabelIcon = L.divIcon({
          className: "city-bubble-label",
          html: `<span style="display:inline-block;color:#f8fafc;font-size:11px;font-weight:600;white-space:nowrap;text-shadow:0 1px 4px #000, 0 0 8px #000, 0 0 14px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;letter-spacing:0.02em;">${labelText}</span>`,
          iconAnchor: placement.align === "right" ? [115, 6] : [-16, 6],
        });
        const giftLabel = L.marker([coords.lat, coords.lng], {
          icon: giftLabelIcon,
          interactive: false,
          pane: "labelsPane",
        }).addTo(map);

        cityMarkersRef.current.push({ marker: giftMarker, city: cityName, label: giftLabel });
        return;
      }

      // ── Normal GCC city bubble (teal, semi-transparent, brighter outline) ─
      const radius = sqrtRadius(value, maxVal);

      const marker = L.circleMarker([coords.lat, coords.lng], {
        radius,
        color:       isSelected ? "#ffffff" : TEAL_OUTLINE,
        fillColor:   TEAL_FILL,
        fillOpacity: isSelected ? 0.85 : 0.55,
        weight:      isSelected ? 2.5 : 1.75,
        interactive: true,
        bubblingMouseEvents: false,
        pane: "bubblesPane",
      }).addTo(map);

      // Tooltip
      const valLabel = activeLayer === "rent"   ? `₹${value.toFixed(0)}/sqft/mo`
                     : activeLayer === "salary" ? `₹${value.toFixed(1)}L/yr`
                     : String(Math.round(value));

      marker.bindTooltip(
        `<strong>${cityName}</strong><br>${activeLayer.toUpperCase()}: ${valLabel}`,
        { className: "gcc-tooltip", direction: "top", offset: [0, -radius - 3] }
      );

      marker.on("click", () => onCityClick(cityName));
      marker.on("mouseover", function (this: CircleMarker) {
        if (selectedCity !== cityName) this.setStyle({ fillOpacity: 0.85, weight: 2.2 });
      });
      marker.on("mouseout", function (this: CircleMarker) {
        if (selectedCity !== cityName) this.setStyle({ fillOpacity: 0.55, weight: 1.75 });
      });

      // City label beside bubble with current layer's value: "Bengaluru 17", "Mumbai 10", etc.
      // Mumbai label extends westwards into the Arabian Sea; Pune label extends eastwards inland.
      const offsetDist = Math.round(radius + 7);
      const isRightAligned = placement.align === "right";
      const anchorX = isRightAligned ? offsetDist + 96 : -offsetDist;

      const labelContent = `${cityName} ${valStr}`;

      const labelIcon = L.divIcon({
        className: "city-bubble-label",
        html: `<span style="display:inline-block;color:#f8fafc;font-size:11px;font-weight:600;white-space:nowrap;text-shadow:0 1px 4px #000, 0 0 8px #000, 0 0 14px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;letter-spacing:0.02em;text-align:${placement.align};">${labelContent}</span>`,
        iconAnchor: [anchorX, 6 + placement.dy],
      });
      const label = L.marker([coords.lat, coords.lng], {
        icon: labelIcon,
        interactive: false,
        pane: "labelsPane",
      }).addTo(map);

      cityMarkersRef.current.push({ marker, city: cityName, label });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeLayer, industryFilter, selectedCity]);

  /* ── Update selected city highlight ─────────────────────────────────── */
  useEffect(() => {
    cityMarkersRef.current.forEach(({ marker, city }) => {
      if (city === "Ahmedabad") return;
      const isSelected = city === selectedCity;
      marker.setStyle({
        color:       isSelected ? "#ffffff" : "#5EEAD4",
        fillOpacity: isSelected ? 0.85 : 0.55,
        weight:      isSelected ? 2.5 : 1.75,
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCity]);

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
        fillColor: "#64748b",
        fillOpacity: 0.7,
        weight: 1,
        bubblingMouseEvents: false,
        pane: "bubblesPane",
      }).addTo(map);
      m.bindTooltip(
        `<strong>${mm.name}</strong><br><em>Approximate micro-market (${mm.city})</em>`,
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

        /* State hover tooltip */
        .state-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(44, 61, 89, 0.8) !important;
          color: #94a3b8 !important;
          font-size: 11px !important;
          padding: 3px 7px !important;
          border-radius: 4px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5) !important;
          pointer-events: none !important;
        }
        .state-tooltip::before { display: none !important; }

        /* City bubble hover tooltip */
        .gcc-tooltip {
          background: rgba(15, 23, 42, 0.95) !important;
          border: 1px solid rgba(0, 201, 167, 0.4) !important;
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

        /* Map attribution styling */
        .leaflet-control-attribution {
          background: rgba(8, 14, 26, 0.88) !important;
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
          background: rgba(15, 23, 42, 0.92) !important;
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
