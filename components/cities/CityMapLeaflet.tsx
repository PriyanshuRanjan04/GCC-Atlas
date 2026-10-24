"use client";

import { useEffect, useRef } from "react";
import type { Map as LMap, CircleMarker } from "leaflet";
import { CITY_COORDS, MICRO_MARKETS } from "@/lib/geo";
import type { CityRichData, LayerType } from "./CitiesClient";
import "leaflet/dist/leaflet.css";

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

export default function CityMapLeaflet({
  data, activeLayer, industryFilter, selectedCity, showMicroMarkets, onCityClick,
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const mapRef        = useRef<LMap | null>(null);
  const cityMarkersRef = useRef<{ marker: CircleMarker; city: string }[]>([]);
  const mmMarkersRef  = useRef<CircleMarker[]>([]);

  // ── Init map once ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    const map: LMap = L.map(containerRef.current, {
      center: [22.5, 79.5],
      zoom: 5,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://openstreetmap.org" target="_blank">OSM</a> &copy; <a href="https://carto.com" target="_blank">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Update city bubbles ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    cityMarkersRef.current.forEach(({ marker }) => marker.remove());
    cityMarkersRef.current = [];

    const values = data.map((d) => getLayerValue(d, activeLayer, industryFilter));
    const maxVal = Math.max(...values, 1);

    data.forEach((cityData, i) => {
      const coord = CITY_COORDS[cityData.city.city];
      if (!coord) return;

      const isGift = cityData.city.city === "Ahmedabad";
      const val    = values[i];
      const radius = isGift ? 12 : Math.max(8, (val / maxVal) * 38 + 6);
      const color  = isGift ? "#FB923C" : LAYER_COLORS[activeLayer];
      const isSel  = selectedCity === cityData.city.city;

      const marker: CircleMarker = L.circleMarker([coord.lat, coord.lng], {
        radius,
        fillColor:   color,
        color:       isSel ? "#FFFFFF" : color,
        weight:      isSel ? 2.5 : isGift ? 1.5 : 1,
        fillOpacity: isGift ? 0.15 : 0.5,
        opacity:     0.92,
        dashArray:   isGift ? "5 3" : undefined,
        bubblingMouseEvents: false,
      }).addTo(mapRef.current!);

      const labelVal = isGift
        ? "Regulated entities hub"
        : activeLayer === "captive" ? `${val} GCC${val !== 1 ? "s" : ""}`
        : activeLayer === "rent"    ? `₹${val}/sqft`
        : activeLayer === "salary"  ? `₹${val}L`
        : `Score: ${val}`;

      marker.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600;color:#E5E7EB;white-space:nowrap">${cityData.city.city}</div><div style="font-size:11px;color:#9CA3AF;margin-top:2px">${labelVal}</div>`,
        { permanent: false, direction: "top", className: "gcc-map-tooltip", offset: [0, -radius - 2] }
      );
      marker.bindPopup(
        `<strong style="font-family:Inter,sans-serif">${cityData.city.city}</strong><br/><span style="font-size:11px">${labelVal}</span>`,
        { maxWidth: 160 }
      );

      marker.on("click", () => onCityClick(cityData.city.city));

      cityMarkersRef.current.push({ marker, city: cityData.city.city });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, activeLayer, industryFilter, selectedCity]);

  // ── Micro-market markers ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require("leaflet");

    mmMarkersRef.current.forEach((m) => m.remove());
    mmMarkersRef.current = [];

    if (!showMicroMarkets && !selectedCity) return;

    const markets = selectedCity
      ? MICRO_MARKETS.filter((m) => m.city === selectedCity)
      : MICRO_MARKETS;

    markets.forEach((mm) => {
      const m: CircleMarker = L.circleMarker([mm.lat, mm.lng], {
        radius: 5,
        fillColor: "#9CA3AF",
        color: "#6B7280",
        weight: 1,
        fillOpacity: 0.6,
      }).addTo(mapRef.current!);

      m.bindTooltip(
        `<div style="font-family:Inter,sans-serif;font-size:11px;color:#E5E7EB">${mm.name}</div><div style="font-size:10px;color:#9CA3AF;font-style:italic">Approximate location</div>`,
        { direction: "top", className: "gcc-map-tooltip" }
      );
      mmMarkersRef.current.push(m);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMicroMarkets, selectedCity]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Legend */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1rem",
          zIndex: 1000,
          background: "rgba(10,15,30,0.92)",
          border: "1px solid rgba(31,45,69,0.9)",
          borderRadius: "0.625rem",
          padding: "0.75rem 1rem",
          backdropFilter: "blur(6px)",
          minWidth: "160px",
        }}
      >
        <div style={{ fontSize: "0.6875rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,201,167,0.8)", marginBottom: "0.5rem" }}>
          Legend
        </div>
        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "0.625rem" }}>
          {LAYER_LABELS[activeLayer]}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.375rem" }}>
          <svg width="32" height="16" viewBox="0 0 32 16">
            <circle cx="8"  cy="8" r="4"  fill={LAYER_COLORS[activeLayer]} fillOpacity="0.5" stroke={LAYER_COLORS[activeLayer]} strokeWidth="1" />
            <circle cx="24" cy="8" r="8"  fill={LAYER_COLORS[activeLayer]} fillOpacity="0.5" stroke={LAYER_COLORS[activeLayer]} strokeWidth="1" />
          </svg>
          <span style={{ fontSize: "0.6875rem", color: "#6B7280" }}>Low → High</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <circle cx="8" cy="8" r="5" fill="rgba(251,146,60,0.15)" stroke="#FB923C" strokeWidth="1.5" strokeDasharray="4 2" />
          </svg>
          <span style={{ fontSize: "0.6875rem", color: "#6B7280" }}>Regulated hub (GIFT City)</span>
        </div>
        {(showMicroMarkets || selectedCity) && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.375rem" }}>
            <svg width="16" height="16" viewBox="0 0 16 16">
              <circle cx="8" cy="8" r="4" fill="rgba(156,163,175,0.6)" stroke="#6B7280" strokeWidth="1" />
            </svg>
            <span style={{ fontSize: "0.6875rem", color: "#6B7280" }}>Micro-market (approx.)</span>
          </div>
        )}
      </div>

      <style>{`
        .gcc-map-tooltip {
          background: rgba(10,15,30,0.92) !important;
          border: 1px solid rgba(31,45,69,0.9) !important;
          border-radius: 6px !important;
          padding: 5px 9px !important;
          box-shadow: none !important;
        }
        .gcc-map-tooltip::before { display: none !important; }
        .leaflet-popup-content-wrapper {
          background: rgba(17,24,39,0.96) !important;
          border: 1px solid rgba(31,45,69,0.9) !important;
          color: #E5E7EB !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.5) !important;
        }
        .leaflet-popup-tip { background: rgba(17,24,39,0.96) !important; }
        .leaflet-control-attribution { background: rgba(10,15,30,0.75) !important; color: #6B7280 !important; font-size: 10px !important; }
        .leaflet-control-attribution a { color: #9CA3AF !important; }
        .leaflet-bar a { background-color: rgba(17,24,39,0.9) !important; color: #E5E7EB !important; border-color: rgba(31,45,69,0.9) !important; }
        .leaflet-bar a:hover { background-color: rgba(31,45,69,0.9) !important; }
      `}</style>
    </div>
  );
}
