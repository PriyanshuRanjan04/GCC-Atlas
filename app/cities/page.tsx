import type { Metadata } from "next";
import { allCities, allGCCs, allIncentives, getIncentiveByState } from "@/lib/data";
import type { CityRichData } from "@/components/cities/CitiesClient";
import { CitiesClient } from "@/components/cities/CitiesClient";

export const metadata: Metadata = {
  title: "City Explorer",
  description:
    "Compare India's 7 GCC hubs — interactive map, talent salary ranges, Grade A rent, state incentives, and side-by-side city comparison.",
};

export default function CitiesPage() {
  /* ── Compute rich per-city data from JSON at build time ─────────────────── */

  const cityDataList: CityRichData[] = allCities.map((city) => {
    const cityGCCs    = allGCCs.filter((g) => g.city === city.city);
    const captiveGCCs = cityGCCs.filter((g) => g.entity_type === "captive_gcc");
    const ecoGCCs     = cityGCCs.filter((g) => g.entity_type !== "captive_gcc");

    const rent = city.office_space.grade_a_rent_inr_per_sqft_per_month;
    const rentMid = Math.round((rent.min + rent.max) / 2);

    const swRole = city.talent.annual_salary_inr_lakhs_by_role.find((r) =>
      r.role.toLowerCase().includes("software engineer")
    );
    const salaryMid = swRole ? Math.round((swRole.min + swRole.max) / 2) : 0;

    const gccsByIndustry: Record<string, number> = {};
    captiveGCCs.forEach((g) => {
      gccsByIndustry[g.industry] = (gccsByIndustry[g.industry] ?? 0) + 1;
    });

    const incentiveRaw = getIncentiveByState(city.state);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const incAny = incentiveRaw as any;
    const incentives: CityRichData["incentives"] = incAny
      ? {
          policy_name: incAny.policy_name,
          items: Array.isArray(incAny.incentives)
            ? incAny.incentives.slice(0, 5).map((item: { type: string; description: string }) => ({
                type: item.type,
                description: item.description,
              }))
            : [],
          as_of: incAny.as_of,
          confidence: incAny.confidence,
        }
      : null;

    return {
      city,
      captiveCount:     captiveGCCs.length,
      ecosystemCount:   ecoGCCs.length,
      totalCount:       captiveGCCs.length + ecoGCCs.length,
      rentMid,
      salaryMid,
      ecosystemMaturity: 0, // filled below after normalization
      gccsByIndustry,
      topGCCs: captiveGCCs.slice(0, 6).map((g) => ({
        id: g.id,
        company_name: g.company_name,
        entity_type: g.entity_type,
        industry: g.industry,
        confidence: g.confidence,
        headcount: g.headcount,
        year_established: g.year_established,
      })),
      incentives,
    };
  });

  // Normalize ecosystem maturity 0–100 by totalCount
  const maxTotal = Math.max(...cityDataList.map((c) => c.totalCount), 1);
  cityDataList.forEach((c) => {
    c.ecosystemMaturity = Math.round((c.totalCount / maxTotal) * 100);
  });

  // All unique industries across captive GCCs (for map filter dropdown)
  const allIndustries = [
    ...new Set(allGCCs.filter((g) => g.entity_type === "captive_gcc").map((g) => g.industry)),
  ].sort();

  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "3rem 1rem 5rem" }}>
      {/* ── Static header ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2.5rem" }}>
        <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>
          City Intelligence
        </span>
        <h1
          className="display-md"
          style={{ color: "var(--color-text-primary)", marginBottom: "0.75rem" }}
        >
          City Explorer
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "48rem", lineHeight: 1.7 }}>
          Compare India's {allCities.length} GCC hubs across talent, real estate, incentives, and
          GCC density. Click a city bubble on the map to see its full profile, and use{" "}
          <em>Add to compare</em> to build a side-by-side view.
        </p>
      </div>

      {/* ── City cards (existing) ──────────────────────────────────────────── */}
      <div style={{ marginBottom: "3rem" }}>
        <span className="section-label" style={{ display: "block", marginBottom: "1rem" }}>
          City Snapshot Cards
        </span>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px,1fr))",
            gap: "1rem",
          }}
        >
          {allCities.map((city) => {
            const d = cityDataList.find((c) => c.city.city === city.city)!;
            const isGiftCity = city.city === "Ahmedabad";
            const swEngineer = city.talent.annual_salary_inr_lakhs_by_role.find((r) =>
              r.role.toLowerCase().includes("software engineer")
            );

            return (
              <div
                key={city.city}
                className="card card-hover"
                style={{
                  padding: "1.25rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                  borderColor: isGiftCity ? "rgba(249,115,22,0.2)" : undefined,
                }}
              >
                {/* Name */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.2rem" }}>
                    <h2 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
                      {city.city}
                    </h2>
                    {isGiftCity && (
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.1rem 0.45rem", borderRadius: "9999px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", color: "#FB923C", whiteSpace: "nowrap" }}>
                        GIFT City
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{city.state}</p>
                </div>

                {/* Stats */}
                {isGiftCity ? (
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                    Regulated financial hub — {d.ecosystemCount} ecosystem entities. No captive GCCs in dataset.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Captive GCCs</span>
                      <span className="stat-num" style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem", color: "var(--color-teal)" }}>{d.captiveCount}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Grade A Rent</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        ₹{city.office_space.grade_a_rent_inr_per_sqft_per_month.min}–{city.office_space.grade_a_rent_inr_per_sqft_per_month.max}/sqft
                      </span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>SW Eng salary</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {swEngineer ? `₹${swEngineer.min}–${swEngineer.max}L` : "—"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Cluster chips — wrap enabled, full name readable */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.375rem",
                    marginTop: "auto",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  {city.office_space.key_clusters.slice(0, 3).map((c) => (
                    <span
                      key={c}
                      title={c}
                      style={{
                        fontSize: "0.6875rem",
                        padding: "0.1875rem 0.5rem",
                        borderRadius: "0.3rem",
                        background: "var(--color-surface-2)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-muted)",
                        wordBreak: "break-word",
                        maxWidth: "100%",
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interactive Client Section ─────────────────────────────────────── */}
      <CitiesClient data={cityDataList} allIndustries={allIndustries} />
    </div>
  );
}
