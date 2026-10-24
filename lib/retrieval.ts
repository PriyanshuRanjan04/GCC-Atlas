/**
 * lib/retrieval.ts
 *
 * Deterministic retrieval engine for Ask Atlas (no embeddings).
 * Parses user questions, detects entities (cities, states, industries, companies, countries),
 * pre-computes aggregate/count queries directly against the JSON records,
 * and packages a tightly bounded context string and source chips.
 */

import { allGCCs, allCities, allIncentives } from "@/lib/data";
import type { GCCRecord, CityRecord, IncentiveRecord } from "@/lib/types";

export interface SourceChip {
  id: string;
  label: string;
  href: string;
  type: "gcc" | "city" | "incentive";
}

export interface RetrievalResult {
  matched: boolean;
  contextText: string;
  computedAnswer?: string;
  sources: SourceChip[];
  detected: {
    cities: string[];
    states: string[];
    industries: string[];
    companies: string[];
    isCountQuery: boolean;
  };
}

/* ── Entity Lexicons ──────────────────────────────────────────────────────── */

const CITY_SYNONYMS: Record<string, string> = {
  bengaluru: "Bengaluru",
  bangalore: "Bengaluru",
  hyderabad: "Hyderabad",
  pune: "Pune",
  chennai: "Chennai",
  madras: "Chennai",
  "delhi ncr": "Delhi NCR",
  delhi: "Delhi NCR",
  gurgaon: "Delhi NCR",
  gurugram: "Delhi NCR",
  noida: "Delhi NCR",
  mumbai: "Mumbai",
  bombay: "Mumbai",
  ahmedabad: "Ahmedabad",
  "gift city": "Ahmedabad",
  "gift-city": "Ahmedabad",
  gandhinagar: "Ahmedabad",
};

const STATE_SYNONYMS: Record<string, string> = {
  karnataka: "Karnataka",
  telangana: "Telangana",
  maharashtra: "Maharashtra",
  "tamil nadu": "Tamil Nadu",
  tamilnadu: "Tamil Nadu",
  gujarat: "Gujarat",
  haryana: "Haryana",
  "uttar pradesh": "Uttar Pradesh",
  delhi: "Delhi",
};

const INDUSTRY_KEYWORDS: { pattern: RegExp; industry: string }[] = [
  { pattern: /\b(bfsi|banking|banks?|financial services|finance|insurance|fintech)\b/i, industry: "BFSI" },
  { pattern: /\b(software|saas|cloud|platform|it|information tech)\b/i, industry: "Technology / Software" },
  { pattern: /\b(semiconductor|chip design|vlsi|silicon)\b/i, industry: "Technology / Semiconductors" },
  { pattern: /\b(hardware|networking hardware|computing)\b/i, industry: "Technology / Hardware" },
  { pattern: /\b(e-commerce|ecommerce|retail|shopping)\b/i, industry: "Retail / Consumer" },
  { pattern: /\b(health|healthcare|pharma|life sciences|therapeutics|biotech)\b/i, industry: "Healthcare / Life Sciences" },
  { pattern: /\b(automotive|auto|cars?|vehicles?|mobility|ev)\b/i, industry: "Manufacturing / Automotive" },
  { pattern: /\b(aerospace|aviation|aircraft)\b/i, industry: "Manufacturing / Industrial" },
  { pattern: /\b(energy|oil|gas|renewables)\b/i, industry: "Manufacturing / Energy" },
  { pattern: /\b(agricultural|agriculture|farming|tractors)\b/i, industry: "Manufacturing / Agricultural" },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

/** Check if text asks a counting or aggregation question */
function isCountQuestion(text: string): boolean {
  return /\b(how many|count|number of|total number|list all|which companies|how much)\b/i.test(text);
}

/** Check if text asks about rents, office space, or clusters */
function isRealEstateQuestion(text: string): boolean {
  return /\b(rent|rents|office|real estate|sqft|grade a|micro-market|clusters?|commercial space)\b/i.test(text);
}

/** Check if text asks about salaries, talent, or compensation */
function isSalaryQuestion(text: string): boolean {
  return /\b(salary|salaries|compensation|pay|lakhs?|engineer salary|talent|headcount|hiring)\b/i.test(text);
}

/** Check if text asks about state incentives, subsidies, or government policy */
function isIncentiveQuestion(text: string): boolean {
  return /\b(incentives?|policy|policies|subsid(y|ies)|reimbursement|exemption|epf|stipend|single window)\b/i.test(text);
}

/** Check if text specifically asks about GIFT City */
function isGiftCityQuestion(text: string): boolean {
  return /\b(gift city|gift-city|ifsc|ifsca|ahmedabad|regulated entity|financial centre)\b/i.test(text);
}

/* ── Main Retrieval Function ─────────────────────────────────────────────── */

export function retrieveContext(query: string): RetrievalResult {
  const qNorm = ` ${normalize(query)} `;
  const sources: SourceChip[] = [];

  // 1. Detect Cities
  const detectedCities = new Set<string>();
  for (const [key, city] of Object.entries(CITY_SYNONYMS)) {
    if (new RegExp(`\\b${key}\\b`, "i").test(query)) {
      detectedCities.add(city);
    }
  }

  // 2. Detect States
  const detectedStates = new Set<string>();
  for (const [key, state] of Object.entries(STATE_SYNONYMS)) {
    if (new RegExp(`\\b${key}\\b`, "i").test(query)) {
      detectedStates.add(state);
    }
  }

  // Also map detected cities to their respective states
  for (const c of detectedCities) {
    const cityRec = allCities.find((cr) => cr.city === c);
    if (cityRec) detectedStates.add(cityRec.state);
  }

  // 3. Detect Industries
  const detectedIndustries = new Set<string>();
  for (const { pattern, industry } of INDUSTRY_KEYWORDS) {
    if (pattern.test(query)) {
      detectedIndustries.add(industry);
    }
  }

  // 4. Detect Companies (fuzzy match on GCC records)
  const detectedCompanyGCCs: GCCRecord[] = [];
  for (const gcc of allGCCs) {
    const companyClean = gcc.company_name.toLowerCase();
    // Check full name or significant words (min 4 chars)
    if (
      query.toLowerCase().includes(companyClean) ||
      (companyClean.length >= 4 && new RegExp(`\\b${companyClean}\\b`, "i").test(query))
    ) {
      detectedCompanyGCCs.push(gcc);
    }
  }

  // Special aliases for prominent GCCs
  const companyAliases: Record<string, string> = {
    "goldman": "Goldman Sachs",
    "jpmorgan": "JPMorgan Chase",
    "jp morgan": "JPMorgan Chase",
    "morgan stanley": "Morgan Stanley",
    "wells fargo": "Wells Fargo",
    "barclays": "Barclays",
    "boeing": "Boeing",
    "walmart": "Walmart Global Tech",
    "target": "Target",
    "amazon": "Amazon",
    "google": "Google",
    "microsoft": "Microsoft",
    "bosch": "Bosch Global Software Technologies",
    "astrazeneca": "AstraZeneca",
    "fidelity": "Fidelity Investments",
    "hsbc": "HSBC Electronic Data Processing",
    "deutsche": "Deutsche Bank Group",
  };

  for (const [alias, companyName] of Object.entries(companyAliases)) {
    if (new RegExp(`\\b${alias}\\b`, "i").test(query)) {
      const match = allGCCs.find((g) => g.company_name.toLowerCase().includes(companyName.toLowerCase()));
      if (match && !detectedCompanyGCCs.some((g) => g.id === match.id)) {
        detectedCompanyGCCs.push(match);
      }
    }
  }

  const isCount = isCountQuestion(query);
  const isRE = isRealEstateQuestion(query);
  const isSalary = isSalaryQuestion(query);
  const isIncentive = isIncentiveQuestion(query);
  const isGift = isGiftCityQuestion(query);

  // ── Determine if this query has any match with the GCC Atlas dataset ─────
  const hasEntity =
    detectedCities.size > 0 ||
    detectedStates.size > 0 ||
    detectedIndustries.size > 0 ||
    detectedCompanyGCCs.length > 0 ||
    isGift ||
    (/\b(gcc|gccs|captive|captives|india|cities|platform|ecosystem)\b/i.test(query) && (isCount || isRE || isSalary || isIncentive));

  if (!hasEntity) {
    return {
      matched: false,
      contextText: "",
      sources: [],
      detected: {
        cities: [],
        states: [],
        industries: [],
        companies: [],
        isCountQuery: isCount,
      },
    };
  }

  // ── Build Context ────────────────────────────────────────────────────────
  const contextParts: string[] = [];

  // A. Pre-computed Answers for Counting / Aggregation
  let computedAnswer: string | undefined;

  if (isCount) {
    let captiveSet = allGCCs.filter((g) => g.entity_type === "captive_gcc");
    let ecosystemSet = allGCCs.filter((g) => g.entity_type !== "captive_gcc");

    // Filter by city if specified
    if (detectedCities.size > 0) {
      captiveSet = captiveSet.filter((g) => detectedCities.has(g.city));
      ecosystemSet = ecosystemSet.filter((g) => detectedCities.has(g.city));
    }

    // Filter by industry if specified
    if (detectedIndustries.size > 0) {
      captiveSet = captiveSet.filter((g) => {
        const ind = g.industry.toLowerCase();
        return Array.from(detectedIndustries).some((di) => ind.includes(di.toLowerCase().split("/")[0].trim()));
      });
      ecosystemSet = ecosystemSet.filter((g) => {
        const ind = g.industry.toLowerCase();
        return Array.from(detectedIndustries).some((di) => ind.includes(di.toLowerCase().split("/")[0].trim()));
      });
    }

    const cityNames = Array.from(detectedCities).join(", ");
    const industryNames = Array.from(detectedIndustries).join(", ");

    const captiveNames = captiveSet.map((g) => `${g.company_name} (ID: ${g.id})`).join(", ");
    const ecosystemNames = ecosystemSet.map((g) => `${g.company_name} (Type: ${g.entity_type.replace(/_/g, " ")})`).join(", ");

    computedAnswer = `EXACT DATABASE COUNT:\n- Captive GCCs: ${captiveSet.length}${captiveSet.length > 0 ? ` [${captiveNames}]` : ""}\n- Ecosystem entities: ${ecosystemSet.length}${ecosystemSet.length > 0 ? ` [${ecosystemNames}]` : ""}\nFilter applied: City = ${cityNames || "All"}, Industry = ${industryNames || "All"}. Remember: only captive_gcc records count as GCCs.`;

    contextParts.push(`--- PRE-COMPUTED AGGREGATION ---\n${computedAnswer}`);

    // Add source chips for the counted captive GCCs (up to 4)
    captiveSet.slice(0, 4).forEach((g) => {
      sources.push({ id: g.id, label: `${g.company_name} (${g.city})`, href: `/directory/${g.id}`, type: "gcc" });
    });
  }

  // B. Specific Company GCC Records
  if (detectedCompanyGCCs.length > 0) {
    const gccDetails = detectedCompanyGCCs.slice(0, 4).map((g) => {
      sources.push({ id: g.id, label: `${g.company_name} (${g.city})`, href: `/directory/${g.id}`, type: "gcc" });
      return JSON.stringify({
        id: g.id,
        company_name: g.company_name,
        entity_name_india: g.entity_name_india,
        entity_type: g.entity_type,
        city: g.city,
        state: g.state,
        location_detail: g.location_detail,
        industry: g.industry,
        parent_country: g.parent_country,
        year_established: g.year_established ?? "Not disclosed",
        headcount: g.headcount ? `${g.headcount.min}–${g.headcount.max} (as of ${g.headcount.as_of})` : "Not disclosed",
        functions: g.functions,
        confidence: g.confidence,
        notes: g.notes,
      }, null, 2);
    }).join("\n\n");

    contextParts.push(`--- MATCHING GCC RECORDS ---\n${gccDetails}`);
  }

  // C. Matching City Records (Rents, Salaries, Clusters)
  const relevantCities = allCities.filter((c) => detectedCities.has(c.city) || (detectedCities.size === 0 && (isRE || isSalary)));
  if (relevantCities.length > 0) {
    const cityDetails = relevantCities.slice(0, 3).map((c) => {
      sources.push({ id: c.city, label: `${c.city} City Profile`, href: "/cities", type: "city" });
      return JSON.stringify({
        city: c.city,
        state: c.state,
        captive_gcc_count: c.gcc_count_in_dataset,
        ecosystem_entities_count: c.ecosystem_entities_count,
        grade_a_rent: {
          range_inr_sqft_mo: `${c.office_space.grade_a_rent_inr_per_sqft_per_month.min}–${c.office_space.grade_a_rent_inr_per_sqft_per_month.max}`,
          confidence: c.office_space.confidence,
          as_of: c.office_space.as_of,
          key_clusters: c.office_space.key_clusters,
        },
        salaries: {
          confidence: c.talent.confidence,
          as_of: c.talent.as_of,
          annual_lakhs_by_role: c.talent.annual_salary_inr_lakhs_by_role,
        },
        ecosystem_summary: c.ecosystem_notes,
      }, null, 2);
    }).join("\n\n");

    contextParts.push(`--- CITY REAL ESTATE & TALENT DATA ---\n${cityDetails}`);
  }

  // D. Matching State Incentives
  const relevantIncentives = allIncentives.filter((inc) =>
    detectedStates.has(inc.state) || (detectedStates.size === 0 && isIncentive)
  );

  if (relevantIncentives.length > 0) {
    const incDetails = relevantIncentives.slice(0, 2).map((inc) => {
      sources.push({ id: inc.state, label: `${inc.state} Incentives`, href: "/methodology", type: "incentive" });
      return JSON.stringify({
        state: inc.state,
        policy_name: inc.policy_name,
        policy_status: inc.policy_status,
        confidence: inc.confidence,
        as_of: inc.as_of,
        key_incentives: (inc.incentives as unknown[] | undefined)?.slice(0, 6),
      }, null, 2);
    }).join("\n\n");

    contextParts.push(`--- STATE INCENTIVE POLICIES ---\n${incDetails}`);
  }

  // E. GIFT City Special Context if referenced
  if (isGift || detectedCities.has("Ahmedabad")) {
    contextParts.push(
      `--- GIFT CITY / AHMEDABAD SPECIAL STATUS ---\nAhmedabad / GIFT City operates as a special financial services hub regulated by IFSCA. It hosts financial institutions, exchanges (NSE IFSC, India INX, IIBX), and banking units. There are ZERO captive GCCs in GIFT City in the dataset. It is not suitable for a standard captive tech/ops GCC.`
    );
  }

  // Deduplicate sources and limit to 6
  const uniqueSources: SourceChip[] = [];
  const seenIds = new Set<string>();
  for (const s of sources) {
    if (!seenIds.has(s.id)) {
      seenIds.add(s.id);
      uniqueSources.push(s);
      if (uniqueSources.length >= 6) break;
    }
  }

  return {
    matched: true,
    contextText: contextParts.join("\n\n").slice(0, 7500), // Cap context size
    computedAnswer,
    sources: uniqueSources,
    detected: {
      cities: Array.from(detectedCities),
      states: Array.from(detectedStates),
      industries: Array.from(detectedIndustries),
      companies: detectedCompanyGCCs.map((g) => g.company_name),
      isCountQuery: isCount,
    },
  };
}
