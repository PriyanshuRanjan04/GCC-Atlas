// lib/types.ts — GCC Atlas type definitions matching data/*.json schemas

export type Confidence = "verified" | "reported" | "estimated";

export type EntityType =
  | "captive_gcc"
  | "professional_services_delivery"
  | "regulated_ifsc_entity"
  | "service_provider";

export interface HeadcountRange {
  min: number;
  max: number;
  as_of: string;
}

export interface GCCRecord {
  id: string;
  company_name: string;
  entity_name_india: string;
  city: string;
  state: string;
  location_detail: string;
  industry: string;
  parent_country: string;
  year_established: number | null;
  headcount: HeadcountRange | null;
  functions: string[];
  confidence: Confidence;
  entity_type: EntityType;
  source_urls: string[];
  notes: string;
}

export interface SalaryRole {
  role: string;
  min: number;
  max: number;
}

export interface TalentData {
  notes: string;
  annual_salary_inr_lakhs_by_role: SalaryRole[];
  as_of: string;
  source_urls: string[];
  confidence: Confidence;
}

export interface OfficeSpace {
  grade_a_rent_inr_per_sqft_per_month: { min: number; max: number };
  key_clusters: string[];
  as_of: string;
  source_urls: string[];
  confidence: Confidence;
  notes: string;
}

export interface CityRecord {
  city: string;
  state: string;
  gcc_count_in_dataset: number;
  ecosystem_entities_count: Record<string, number>;
  talent: TalentData;
  office_space: OfficeSpace;
  ecosystem_notes: string;
}

export interface IncentiveTier {
  label: string;
  value: string;
}

export interface IncentiveRecord {
  state: string;
  policy_name?: string;
  summary?: string;
  key_incentives?: string[];
  notes?: string;
  source_urls?: string[];
  confidence?: Confidence;
  // Allow any additional keys from the JSON
  [key: string]: unknown;
}

// Derived / computed types used in UI
export interface CityStats {
  city: string;
  captiveCount: number;
  ecosystemCount: number;
  totalCount: number;
}
