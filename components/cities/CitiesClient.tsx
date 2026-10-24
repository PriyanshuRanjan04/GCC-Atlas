"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { CityRecord } from "@/lib/types";
import { CityPanel } from "./CityPanel";
import { CityComparison } from "./CityComparison";
import { CityCharts } from "./CityCharts";

/* ── Shared types (imported by sub-components) ─────────────────────────── */
export type LayerType = "captive" | "rent" | "salary" | "ecosystem";

export interface CityRichData {
  city: CityRecord;
  captiveCount: number;
  ecosystemCount: number;
  totalCount: number;
  rentMid: number;
  salaryMid: number;
  ecosystemMaturity: number;
  gccsByIndustry: Record<string, number>;
  topGCCs: Array<{
    id: string;
    company_name: string;
    entity_type: string;
    industry: string;
    confidence: string;
    headcount: { min: number; max: number; as_of: string } | null;
    year_established: number | null;
  }>;
  incentives: {
    policy_name?: string;
    items: Array<{ type: string; description: string }>;
    as_of?: string;
    confidence?: string;
  } | null;
}

/* ── Dynamic import: Leaflet must not run on SSR ───────────────────────── */
const CityMap = dynamic(() => import("./CityMapLeaflet"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-surface)",
        borderRadius: "0.75rem",
        border: "1px solid var(--color-border)",
        color: "var(--color-text-muted)",
        fontSize: "0.875rem",
      }}
    >
      Loading map…
    </div>
  ),
});

const LAYER_OPTIONS: { value: LayerType; label: string }[] = [
  { value: "captive",   label: "Captive GCC count" },
  { value: "rent",      label: "Grade A rent" },
  { value: "salary",    label: "SW Eng salary" },
  { value: "ecosystem", label: "Ecosystem maturity" },
];

interface Props {
  data: CityRichData[];
  allIndustries: string[];
}

export function CitiesClient({ data, allIndustries }: Props) {
  const [selectedCity,     setSelectedCity]     = useState<string | null>(null);
  const [comparedCities,   setComparedCities]   = useState<string[]>([]);
  const [activeLayer,      setActiveLayer]      = useState<LayerType>("captive");
  const [industryFilter,   setIndustryFilter]   = useState("");
  const [showMicroMarkets, setShowMicroMarkets] = useState(false);

  const selectedData = useMemo(
    () => data.find((d) => d.city.city === selectedCity) ?? null,
    [data, selectedCity]
  );

  function handleCityClick(city: string) {
    setSelectedCity((prev) => (prev === city ? null : city));
  }

  function handleAddToCompare(city: string) {
    setComparedCities((prev) => {
      if (prev.includes(city)) return prev.filter((c) => c !== city);
      if (prev.length >= 3) return prev;
      return [...prev, city];
    });
  }

  const comparedData = useMemo(
    () => comparedCities.map((c) => data.find((d) => d.city.city === c)!).filter(Boolean),
    [data, comparedCities]
  );

  return (
    <div>
      {/* ── Section: Interactive Map ──────────────────────────────────────── */}
      <div style={{ marginBottom: "0.75rem" }}>
        <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>
          Interactive Map
        </span>
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
          Bubble size reflects the selected layer. Click a city to open its profile.
        </p>

        {/* Controls row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.625rem",
            marginBottom: "0.875rem",
            alignItems: "center",
          }}
        >
          {/* Layer switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", flexWrap: "wrap" }}>
            {LAYER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setActiveLayer(opt.value)}
                style={{
                  padding: "0.3125rem 0.75rem",
                  borderRadius: "0.4rem",
                  border: "1px solid",
                  borderColor: activeLayer === opt.value ? "var(--color-teal)" : "var(--color-border)",
                  background: activeLayer === opt.value ? "var(--color-teal-muted)" : "var(--color-surface-2)",
                  color: activeLayer === opt.value ? "var(--color-teal)" : "var(--color-text-secondary)",
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: activeLayer === opt.value ? 600 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto", alignItems: "center" }}>
            {/* Industry filter */}
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="select-field"
              id="map-industry-filter"
              style={{ minWidth: "130px", fontSize: "0.8125rem" }}
            >
              <option value="">All industries</option>
              {allIndustries.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {/* Micro-market toggle */}
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", cursor: "pointer", fontSize: "0.8125rem", color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}
            >
              <button
                role="switch"
                aria-checked={showMicroMarkets}
                onClick={() => setShowMicroMarkets((v) => !v)}
                style={{
                  width: "1.75rem", height: "1rem", borderRadius: "9999px",
                  background: showMicroMarkets ? "var(--color-teal)" : "var(--color-border)",
                  border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0,
                }}
              >
                <span style={{
                  position: "absolute", top: "0.125rem",
                  left: showMicroMarkets ? "0.75rem" : "0.125rem",
                  width: "0.75rem", height: "0.75rem",
                  borderRadius: "50%", background: "#fff", transition: "left 0.2s",
                }} />
              </button>
              Micro-markets
            </label>
          </div>
        </div>
      </div>

      {/* Map + Panel layout */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "3rem",
        }}
      >
        {/* Map */}
        <div
          style={{
            flex: "1 1 0",
            minWidth: 0,
            height: "520px",
            borderRadius: "0.75rem",
            overflow: "hidden",
            border: "1px solid var(--color-border)",
          }}
        >
          <CityMap
            data={data}
            activeLayer={activeLayer}
            industryFilter={industryFilter}
            selectedCity={selectedCity}
            showMicroMarkets={showMicroMarkets}
            onCityClick={handleCityClick}
          />
        </div>

        {/* Side panel (desktop) */}
        {selectedData && (
          <div
            style={{
              width: "360px",
              flexShrink: 0,
              height: "520px",
              overflowY: "auto",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface)",
            }}
          >
            <CityPanel
              cityData={selectedData}
              isInComparison={comparedCities.includes(selectedData.city.city)}
              onClose={() => setSelectedCity(null)}
              onAddToCompare={handleAddToCompare}
            />
          </div>
        )}

        {/* Empty state prompt when nothing selected */}
        {!selectedData && (
          <div
            style={{
              width: "320px",
              flexShrink: 0,
              height: "520px",
              borderRadius: "0.75rem",
              border: "1px dashed var(--color-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: "0.75rem",
              color: "var(--color-text-muted)",
              fontSize: "0.875rem",
              textAlign: "center",
              padding: "1.5rem",
            }}
          >
            <div style={{ fontSize: "2rem" }}>🏙️</div>
            <div>Click a city bubble on the map to see its full profile</div>
          </div>
        )}
      </div>

      {/* Mobile: panel below map */}
      {selectedData && (
        <div
          className="mobile-panel"
          style={{
            display: "none", // shown via CSS media query below
            marginBottom: "2rem",
            borderRadius: "0.75rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-surface)",
            overflow: "hidden",
          }}
        >
          <CityPanel
            cityData={selectedData}
            isInComparison={comparedCities.includes(selectedData.city.city)}
            onClose={() => setSelectedCity(null)}
            onAddToCompare={handleAddToCompare}
          />
        </div>
      )}

      {/* ── Section: Charts ───────────────────────────────────────────────── */}
      <div style={{ marginBottom: "3rem" }}>
        <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>
          Data Charts
        </span>
        <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1.25rem" }}>
          Figures are estimates from secondary sources. Rent and salary midpoints used for comparability.
        </p>
        <CityCharts data={data} />
      </div>

      {/* ── Section: Comparison ───────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span className="section-label" style={{ display: "block", marginBottom: "0.25rem" }}>
              Side-by-Side Comparison
            </span>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
              {comparedCities.length === 0
                ? "Add up to 3 cities via the city panel to compare them here."
                : `Comparing ${comparedCities.length} ${comparedCities.length === 1 ? "city" : "cities"}.${comparedCities.length < 3 ? " Click a city on the map and use \u201cAdd to compare\u201d." : ""}`}
            </p>
          </div>
          {comparedCities.length > 0 && (
            <button
              onClick={() => setComparedCities([])}
              style={{
                padding: "0.3125rem 0.75rem", borderRadius: "0.4rem",
                border: "1px solid var(--color-border)", background: "var(--color-surface-2)",
                color: "var(--color-text-secondary)", fontSize: "0.8125rem",
                fontFamily: "var(--font-sans)", cursor: "pointer",
              }}
            >
              Clear all
            </button>
          )}
        </div>
        {comparedData.length > 0 && (
          <CityComparison cities={comparedData} onRemove={(c) => setComparedCities((p) => p.filter((x) => x !== c))} />
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-panel { display: block !important; }
        }
      `}</style>
    </div>
  );
}
