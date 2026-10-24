import type { Metadata } from "next";
import { allGCCs, getCaptiveGCCs } from "@/lib/data";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { EntityTypeBadge } from "@/components/ui/EntityTypeBadge";
import { NullableValue } from "@/components/ui/NullableValue";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "GCC Directory",
  description: "Browse 68 captive GCC profiles across 7 Indian cities. Filter by industry, country, and confidence.",
};

export default function DirectoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const captive = getCaptiveGCCs();
  const allEntities = allGCCs;

  const cities = [...new Set(allGCCs.map((r) => r.city))].sort();
  const industries = [...new Set(captive.map((r) => r.industry))].sort();
  const countries = [...new Set(captive.map((r) => r.parent_country))].sort();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">Research Tool</p>
        <h1 className="font-display font-extrabold text-display-md text-text-primary mb-3">
          GCC Directory
        </h1>
        <p className="text-text-secondary max-w-2xl">
          {captive.length} captive GCC profiles across {cities.length} cities.
          Ecosystem entities (professional services delivery, IFSC regulated units) are shown separately.
          Every record shows its confidence level and source links.
        </p>
      </div>

      {/* Data honesty note */}
      <div className="mb-8 p-4 rounded-lg border border-teal/20 bg-teal/5 text-sm text-text-secondary">
        <span className="text-teal font-semibold">Data note:</span> "Not disclosed" means the data was not
        found in a retrieved source — it is never shown as 0 or blank. Records marked{" "}
        <span className="text-yellow-400">Reported</span> are from secondary sources.{" "}
        <span className="text-teal">Verified</span> requires an official page to have been fetched.{" "}
        <Link href="/methodology" className="text-teal hover:underline">Methodology →</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Captive GCCs", value: captive.length },
          { label: "Prof. Services", value: allGCCs.filter(r => r.entity_type === "professional_services_delivery").length },
          { label: "IFSC Entities", value: allGCCs.filter(r => r.entity_type === "regulated_ifsc_entity").length },
          { label: "Cities", value: cities.length },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3 text-center">
            <div className="font-display font-bold text-2xl text-teal">{s.value}</div>
            <div className="text-xs text-text-muted mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter hint — full interactive filters are client components (Gate 2) */}
      <div className="card p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <div className="input-field pl-10 cursor-not-allowed opacity-60 select-none">
            Search & filter coming in Gate 2…
          </div>
        </div>
      </div>

      {/* Captive GCC cards */}
      <h2 className="font-display font-semibold text-lg text-text-primary mb-4">
        Captive GCCs <span className="text-text-muted font-normal text-sm">({captive.length})</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {captive.map((gcc) => (
          <Link
            key={gcc.id}
            href={`/directory/${gcc.id}`}
            className="card card-hover p-5 flex flex-col gap-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-display font-semibold text-text-primary group-hover:text-teal transition-colors text-sm leading-tight">
                  {gcc.company_name}
                </div>
                <div className="text-xs text-text-muted mt-0.5">{gcc.city} · {gcc.parent_country}</div>
              </div>
              <ConfidenceBadge confidence={gcc.confidence} size="sm" />
            </div>
            <div className="text-xs text-text-secondary">{gcc.industry}</div>
            <div className="flex flex-wrap gap-1.5 mt-auto pt-2 border-t border-border">
              <EntityTypeBadge entityType={gcc.entity_type} size="sm" />
              <span className="badge bg-surface-2 border border-border text-text-muted text-xs">
                {gcc.functions.slice(0, 2).join(", ")}
                {gcc.functions.length > 2 ? " …" : ""}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Ecosystem entities separator */}
      <div className="border-t border-border pt-10">
        <h2 className="font-display font-semibold text-lg text-text-primary mb-2">
          Ecosystem Entities{" "}
          <span className="text-text-muted font-normal text-sm">
            (professional services delivery + IFSC regulated units — not counted as captive GCCs)
          </span>
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          These entities operate in the GCC ecosystem but are not captive centres of a global product company.
          Ahmedabad / GIFT City entries are IFSCA-regulated financial units, not traditional GCCs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allGCCs
            .filter((r) => r.entity_type !== "captive_gcc")
            .map((gcc) => (
              <Link
                key={gcc.id}
                href={`/directory/${gcc.id}`}
                className="card card-hover p-4 flex items-start justify-between gap-3 group"
              >
                <div>
                  <div className="font-medium text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {gcc.company_name}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">{gcc.city}</div>
                </div>
                <EntityTypeBadge entityType={gcc.entity_type} size="sm" />
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
