// lib/data.ts — Load and type the static JSON data at build time
import type { GCCRecord, CityRecord, IncentiveRecord, CityStats } from "./types";

import gccsRaw from "@/data/gccs.json";
import citiesRaw from "@/data/cities.json";
import incentivesRaw from "@/data/incentives.json";

export const allGCCs: GCCRecord[] = gccsRaw as GCCRecord[];
export const allCities: CityRecord[] = citiesRaw as CityRecord[];
export const allIncentives: IncentiveRecord[] = incentivesRaw as IncentiveRecord[];

// ── GCC helpers ───────────────────────────────────────────────────────────────

export function getCaptiveGCCs(): GCCRecord[] {
  return allGCCs.filter((r) => r.entity_type === "captive_gcc");
}

export function getGCCById(id: string): GCCRecord | undefined {
  return allGCCs.find((r) => r.id === id);
}

export function getGCCsByCity(city: string): GCCRecord[] {
  return allGCCs.filter((r) => r.city === city);
}

export function getUniqueValues<K extends keyof GCCRecord>(key: K): string[] {
  return [...new Set(allGCCs.map((r) => String(r[key])))].sort();
}

// ── City helpers ──────────────────────────────────────────────────────────────

export function getCityBySlug(slug: string): CityRecord | undefined {
  return allCities.find(
    (c) => c.city.toLowerCase().replace(/\s+/g, "-") === slug
  );
}

export function cityToSlug(city: string): string {
  return city.toLowerCase().replace(/\s+/g, "-");
}

// ── Aggregate stats (computed from data, not hardcoded) ───────────────────────

export function getHeadlineStats() {
  const captive = getCaptiveGCCs();
  const statesWithIncentives = allIncentives.length;
  const citiesCovered = allCities.length;
  const totalCaptive = captive.length;

  const uniqueCountries = new Set(captive.map((r) => r.parent_country)).size;
  const uniqueIndustries = new Set(captive.map((r) => r.industry)).size;

  return {
    captiveGCCsInDataset: totalCaptive,
    citiesCovered,
    statesWithIncentiveData: statesWithIncentives,
    uniqueParentCountries: uniqueCountries,
    uniqueIndustries,
  };
}

export function getCityStats(): CityStats[] {
  return allCities.map((c) => {
    const captiveCount = c.gcc_count_in_dataset;
    const ecosystemCount = Object.values(c.ecosystem_entities_count).reduce(
      (sum, n) => sum + n,
      0
    );
    return {
      city: c.city,
      captiveCount,
      ecosystemCount,
      totalCount: captiveCount + ecosystemCount,
    };
  });
}

// ── Incentives ────────────────────────────────────────────────────────────────

export function getIncentiveByState(state: string): IncentiveRecord | undefined {
  return allIncentives.find(
    (r) => r.state?.toLowerCase() === state.toLowerCase()
  );
}
