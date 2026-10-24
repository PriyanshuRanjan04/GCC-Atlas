import type { Metadata } from "next";
import { allGCCs } from "@/lib/data";
import { Suspense } from "react";
import { DirectoryClient } from "@/components/directory/DirectoryClient";

export const metadata: Metadata = {
  title: "GCC Directory",
  description:
    "Browse 68 captive GCC profiles across 7 Indian cities. Filter by industry, country, entity type, and confidence.",
};

function DirectorySkeleton() {
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div
        style={{
          height: "5.5rem",
          borderRadius: "0.75rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          marginBottom: "1.5rem",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
          gap: "1rem",
        }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            style={{
              height: "9rem",
              borderRadius: "0.75rem",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              opacity: 1 - i * 0.08,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function DirectoryPage() {
  const captiveCount = allGCCs.filter((r) => r.entity_type === "captive_gcc").length;
  const proCount = allGCCs.filter((r) => r.entity_type === "professional_services_delivery").length;
  const ifscCount = allGCCs.filter((r) => r.entity_type === "regulated_ifsc_entity").length;
  const cityCount = [...new Set(allGCCs.map((r) => r.city))].length;

  return (
    <div
      style={{
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "3rem 1rem 5rem",
      }}
    >
      {/* ── Static header ────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <span className="section-label" style={{ marginBottom: "0.5rem", display: "block" }}>
          Research Tool
        </span>
        <h1
          className="display-md"
          style={{ color: "var(--color-text-primary)", marginBottom: "0.75rem" }}
        >
          GCC Directory
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "42rem", lineHeight: 1.7 }}>
          {captiveCount} captive GCC profiles across {cityCount} cities. Use the search and
          filters below to explore by industry, parent country, city, or confidence level.
          Toggle on ecosystem entities to include professional services delivery centres and
          IFSC regulated units.
        </p>
      </div>

      {/* ── Dataset summary stats (static totals, not filtered) ──────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "Captive GCCs", value: captiveCount },
          { label: "Prof. Services", value: proCount },
          { label: "IFSC Entities", value: ifscCount },
          { label: "Cities", value: cityCount },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ padding: "0.875rem 1rem", textAlign: "center" }}
          >
            <div
              className="stat-num"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: "1.625rem",
                color: "var(--color-teal)",
                lineHeight: 1,
                marginBottom: "0.3125rem",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Interactive filter + results ─────────────────────────────────── */}
      <Suspense fallback={<DirectorySkeleton />}>
        <DirectoryClient gccs={allGCCs} />
      </Suspense>
    </div>
  );
}
