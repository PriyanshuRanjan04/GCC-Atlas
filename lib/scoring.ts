/**
 * lib/scoring.ts
 * Deterministic Setup Advisor scoring — no AI, no randomness.
 * Pure functions: take data arrays + form values, return ranked results.
 * Safe to call from both server and client.
 */

import type { CityRecord, GCCRecord, IncentiveRecord } from "./types";

/* ── Form & result types ──────────────────────────────────────────────────── */

export interface AdvisorWeights {
  talent: number;     // 1–5
  cost: number;       // 1–5
  incentives: number; // 1–5
  ecosystem: number;  // 1–5
}

export interface AdvisorFormValues {
  industry: string;
  teamSize: string;
  budgetSensitivity: "cost-sensitive" | "balanced" | "cost-not-priority";
  timeline: string;
  weights: AdvisorWeights;
}

export interface FactorScores {
  talent: number;     // 0–100
  cost: number;       // 0–100
  incentives: number; // 0–100
  ecosystem: number;  // 0–100
}

export interface CityScore {
  city: string;
  state: string;
  totalScore: number;  // 0–100
  factors: FactorScores;
  raw: {
    captiveCount: number;
    industryGCCCount: number;
    rentMid: number;   // ₹/sqft/month
    salaryMid: number; // ₹ lakh/year
    incentiveItemCount: number;
    incentiveHasPolicy: boolean;
    incentiveConfidence: string;
    totalEntityCount: number;
  };
  appliedWeights: AdvisorWeights;
}

export interface ScoringResult {
  rankedCities: CityScore[];
  giftCityRelevant: boolean; // true when industry is BFSI/fintech/insurance
  form: AdvisorFormValues;
}

/* ── GIFT City detection ──────────────────────────────────────────────────── */

const GIFT_INDUSTRIES = [
  "bfsi", "financial services", "fintech", "fin-tech",
  "insurance", "banking", "capital markets", "asset management",
];

export function isGiftCityRelevant(industry: string): boolean {
  const lower = industry.toLowerCase();
  return GIFT_INDUSTRIES.some((k) => lower.includes(k));
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */

/** Normalise an array of raw numbers to 0–100. */
function normalise(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 50);
  return values.map((v) => Math.round(((v - min) / (max - min)) * 100));
}

/** Find state incentive record (case-insensitive). */
function findIncentive(
  incentives: IncentiveRecord[],
  state: string
): IncentiveRecord | undefined {
  return incentives.find(
    (i) => (i.state as string)?.toLowerCase() === state.toLowerCase()
  );
}

/* ── Main scoring function ────────────────────────────────────────────────── */

/**
 * Compute ranked city scores from data + form inputs.
 * Ahmedabad / GIFT City is never ranked — it is flagged separately.
 */
export function computeAdvisorScores(
  form: AdvisorFormValues,
  cities: CityRecord[],
  gccs: GCCRecord[],
  incentives: IncentiveRecord[]
): ScoringResult {
  // Exclude GIFT City from ranking
  const rankableCities = cities.filter((c) => c.city !== "Ahmedabad");

  // ── Build raw metrics per city ───────────────────────────────────────────
  const rawData = rankableCities.map((city) => {
    const captiveGCCs = gccs.filter(
      (g) => g.entity_type === "captive_gcc" && g.city === city.city
    );
    const industryGCCs = captiveGCCs.filter(
      (g) => g.industry.toLowerCase() === form.industry.toLowerCase()
    );

    const rent = city.office_space.grade_a_rent_inr_per_sqft_per_month;
    const rentMid = (rent.min + rent.max) / 2;

    const swRole = city.talent.annual_salary_inr_lakhs_by_role.find((r) =>
      r.role.toLowerCase().includes("software engineer")
    );
    const salaryMid = swRole ? (swRole.min + swRole.max) / 2 : 50;

    const inc = findIncentive(incentives, city.state);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const incAny = inc as any;
    const incItems: number = Array.isArray(incAny?.incentives)
      ? incAny.incentives.length
      : 0;

    const ecoEntities = Object.values(city.ecosystem_entities_count ?? {}).reduce(
      (s, n) => s + (n as number),
      0
    );

    return {
      city: city.city,
      state: city.state,
      captiveCount: captiveGCCs.length,
      industryGCCCount: industryGCCs.length,
      rentMid,
      salaryMid,
      incentiveItemCount: incItems,
      incentiveHasPolicy: !!incAny?.policy_name,
      incentiveConfidence: (inc?.confidence as string) ?? "estimated",
      totalEntityCount: captiveGCCs.length + ecoEntities,
    };
  });

  // ── Factor 1: Talent depth (higher = better) ─────────────────────────────
  // Weight: 60% total captive count + 40% industry-specific × 2.5 (bonus)
  const talentRaw = rawData.map(
    (d) => d.captiveCount * 0.6 + d.industryGCCCount * 2.5
  );
  const talentNorm = normalise(talentRaw);

  // ── Factor 2: Cost efficiency (LOWER cost = HIGHER score) ────────────────
  const costRaw = rawData.map((d) => d.rentMid * 0.4 + d.salaryMid * 2);
  const costNorm = normalise(costRaw).map((n) => 100 - n); // invert

  // ── Factor 3: Incentives ──────────────────────────────────────────────────
  const incentivesRaw = rawData.map((d) => {
    let s = d.incentiveHasPolicy ? 30 : 0;
    s += Math.min(d.incentiveItemCount * 8, 50);
    s +=
      d.incentiveConfidence === "verified"
        ? 20
        : d.incentiveConfidence === "reported"
        ? 12
        : 6;
    return s;
  });
  const incentivesNorm = normalise(incentivesRaw);

  // ── Factor 4: Ecosystem maturity ─────────────────────────────────────────
  const maxTotal = Math.max(...rawData.map((d) => d.totalEntityCount), 1);
  const ecosystemNorm = rawData.map((d) =>
    Math.round((d.totalEntityCount / maxTotal) * 100)
  );

  // ── Apply user weights + budget sensitivity modifier ─────────────────────
  const budgetMod =
    form.budgetSensitivity === "cost-sensitive"
      ? 1.6
      : form.budgetSensitivity === "cost-not-priority"
      ? 0.4
      : 1.0;

  const effectiveWeights: AdvisorWeights = {
    talent: form.weights.talent,
    cost: form.weights.cost * budgetMod,
    incentives: form.weights.incentives,
    ecosystem: form.weights.ecosystem,
  };

  const wSum =
    effectiveWeights.talent +
    effectiveWeights.cost +
    effectiveWeights.incentives +
    effectiveWeights.ecosystem;

  const scored: CityScore[] = rawData.map((d, i) => ({
    city: d.city,
    state: d.state,
    factors: {
      talent: talentNorm[i],
      cost: costNorm[i],
      incentives: incentivesNorm[i],
      ecosystem: ecosystemNorm[i],
    },
    totalScore: Math.round(
      (talentNorm[i] * effectiveWeights.talent +
        costNorm[i] * effectiveWeights.cost +
        incentivesNorm[i] * effectiveWeights.incentives +
        ecosystemNorm[i] * effectiveWeights.ecosystem) /
        wSum
    ),
    raw: {
      captiveCount: d.captiveCount,
      industryGCCCount: d.industryGCCCount,
      rentMid: Math.round(d.rentMid),
      salaryMid: Math.round(d.salaryMid),
      incentiveItemCount: d.incentiveItemCount,
      incentiveHasPolicy: d.incentiveHasPolicy,
      incentiveConfidence: d.incentiveConfidence,
      totalEntityCount: d.totalEntityCount,
    },
    appliedWeights: effectiveWeights,
  }));

  scored.sort((a, b) => b.totalScore - a.totalScore);

  return {
    rankedCities: scored,
    giftCityRelevant: isGiftCityRelevant(form.industry),
    form,
  };
}

/** Build a text fallback explanation when the AI call fails. */
export function buildFallbackExplanation(result: ScoringResult): string {
  const top = result.rankedCities[0];
  const runner = result.rankedCities[1];
  if (!top) return "Insufficient data to generate a recommendation.";

  const ind = result.form.industry;
  const industryNote =
    top.raw.industryGCCCount > 0
      ? `, including ${top.raw.industryGCCCount} in ${ind}`
      : "";

  return [
    `**${top.city}** ranks first (score: ${top.totalScore}/100) for your ${ind} GCC with ${result.form.teamSize} people.`,
    `It has ${top.raw.captiveCount} captive GCCs in the dataset${industryNote}. Grade A rent is estimated at ₹${top.raw.rentMid}/sqft/month and software-engineer salary at ₹${top.raw.salaryMid}L/year — both are estimates from secondary sources.`,
    runner
      ? `**${runner.city}** is the runner-up (score: ${runner.totalScore}/100). ${runner.factors.cost > top.factors.cost ? "It offers a better cost profile" : runner.factors.talent > top.factors.talent ? "It has a stronger talent pool" : "The margin is narrow"} — worth including in your shortlist.`
      : "",
    `Next steps: validate headcount availability with a talent partner, check current Grade A vacancy rates, and confirm the state incentive package is still active.`,
    `_AI-generated narrative is temporarily unavailable. All scores above are fully deterministic._`,
  ]
    .filter(Boolean)
    .join("\n\n");
}
