import type { Metadata } from "next";
import { allCities, getCityStats } from "@/lib/data";
import Link from "next/link";

export const metadata: Metadata = {
  title: "City Explorer",
  description: "Compare India's GCC cities — talent salary ranges, office rents, incentives, and captive GCC counts.",
};

export default function CitiesPage() {
  const stats = getCityStats();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="section-label mb-2">City Intelligence</p>
        <h1 className="font-display font-extrabold text-display-md text-text-primary mb-3">
          City Explorer
        </h1>
        <p className="text-text-secondary max-w-2xl">
          Compare India's 7 GCC hubs across talent, real estate, incentives, and GCC density.
          Full interactive comparison and map coming in Gate 3.
        </p>
      </div>

      {/* City cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {allCities.map((city) => {
          const s = stats.find((st) => st.city === city.city)!;
          const isGiftCity = city.city === "Ahmedabad";
          return (
            <div key={city.city} className={`card card-hover p-6 flex flex-col gap-4 ${isGiftCity ? "border-orange-500/20" : ""}`}>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h2 className="font-display font-bold text-text-primary">{city.city}</h2>
                  {isGiftCity && (
                    <span className="badge bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs">
                      GIFT City
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">{city.state}</p>
              </div>

              {isGiftCity ? (
                <p className="text-xs text-text-secondary leading-relaxed">
                  Financial services hub — 8 IFSCA-regulated entities + 4 professional services centres.
                  Zero captive GCCs in current dataset.
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Captive GCCs</span>
                    <span className="font-display font-bold text-teal">{s.captiveCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Grade A Rent</span>
                    <span className="text-xs text-text-secondary">
                      ₹{city.office_space.grade_a_rent_inr_per_sqft_per_month.min}–
                      {city.office_space.grade_a_rent_inr_per_sqft_per_month.max}/sqft
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">SW Eng salary</span>
                    <span className="text-xs text-text-secondary">
                      {(() => {
                        const r = city.talent.annual_salary_inr_lakhs_by_role.find(
                          (r) => r.role.includes("software engineer")
                        );
                        return r ? `₹${r.min}–${r.max}L` : "—";
                      })()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-1.5 mt-auto pt-3 border-t border-border">
                {city.office_space.key_clusters.slice(0, 2).map((c) => (
                  <span key={c} className="text-xs px-2 py-0.5 rounded bg-surface-2 border border-border text-text-muted truncate max-w-[140px]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming in Gate 3 */}
      <div className="mt-12 card p-8 text-center border-dashed">
        <div className="text-3xl mb-3">🗺️</div>
        <h3 className="font-display font-semibold text-text-primary mb-2">Interactive Map & Comparison</h3>
        <p className="text-sm text-text-secondary max-w-md mx-auto">
          An interactive Leaflet map with markers sized by captive GCC count, side-by-side city comparison
          for up to 3 cities, and Recharts visualizations — coming in Gate 3.
        </p>
      </div>
    </div>
  );
}
