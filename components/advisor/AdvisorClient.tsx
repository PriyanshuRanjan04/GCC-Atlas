"use client";

import { useState, useRef } from "react";
import type { GCCRecord, CityRecord, IncentiveRecord } from "@/lib/types";
import type { AdvisorFormValues, AdvisorWeights, ScoringResult } from "@/lib/scoring";
import { computeAdvisorScores } from "@/lib/scoring";
import { AdvisorResults } from "./AdvisorResults";

interface Props {
  industries: string[];
  gccs: GCCRecord[];
  cities: CityRecord[];
  incentives: IncentiveRecord[];
}

/* ── Static options ─────────────────────────────────────────────────────── */

const TEAM_SIZES = [
  { value: "1-50",     label: "1–50" },
  { value: "51-200",   label: "51–200" },
  { value: "201-500",  label: "201–500" },
  { value: "501-1000", label: "501–1,000" },
  { value: "1000+",    label: "1,000+" },
];

const BUDGETS: { value: AdvisorFormValues["budgetSensitivity"]; label: string; hint: string }[] = [
  { value: "cost-sensitive",    label: "Cost-sensitive",          hint: "Lower rent & salary drives the shortlist" },
  { value: "balanced",          label: "Balanced",                hint: "Weigh cost and quality equally" },
  { value: "cost-not-priority", label: "Cost is not a priority",  hint: "Focus on talent depth and speed" },
];

const TIMELINES = [
  { value: "<6mo",    label: "< 6 months" },
  { value: "6-12mo",  label: "6–12 months" },
  { value: "12-24mo", label: "12–24 months" },
  { value: ">24mo",   label: "> 24 months" },
];

const WEIGHTS_META: { key: keyof AdvisorWeights; label: string; hint: string; color: string }[] = [
  { key: "talent",     label: "Talent depth",       hint: "GCC density & industry-specific talent",      color: "#00C9A7" },
  { key: "cost",       label: "Cost efficiency",     hint: "Lower rent and salary midpoints",             color: "#60A5FA" },
  { key: "incentives", label: "State incentives",    hint: "Strength and completeness of incentive data", color: "#F59E0B" },
  { key: "ecosystem",  label: "Ecosystem maturity",  hint: "Overall entity density in the city",         color: "#C084FC" },
];

/* ── Interactive Try It Scenarios ────────────────────────────────────────── */

interface Scenario {
  id: string;
  title: string;
  subtitle: string;
  targetIndustry: string;
  teamSize: string;
  budgetSensitivity: AdvisorFormValues["budgetSensitivity"];
  timeline: string;
  weights: AdvisorWeights;
}

const SCENARIOS: Scenario[] = [
  {
    id: "bfsi",
    title: "BFSI · 201–500 people · Cost-sensitive",
    subtitle: "Weights: Cost 5 · Incentives 4 · Talent 3 · Ecosystem 2",
    targetIndustry: "BFSI",
    teamSize: "201-500",
    budgetSensitivity: "cost-sensitive",
    timeline: "12-24mo",
    weights: { cost: 5, incentives: 4, talent: 3, ecosystem: 2 },
  },
  {
    id: "tech",
    title: "Technology · 1,000+ people · Balanced budget",
    subtitle: "Weights: Talent 5 · Ecosystem 4 · Cost 3 · Incentives 2",
    targetIndustry: "Technology / Software", // Mapped to closest dataset option: "Technology / Software"
    teamSize: "1000+",
    budgetSensitivity: "balanced",
    timeline: "12-24mo",
    weights: { talent: 5, ecosystem: 4, cost: 3, incentives: 2 },
  },
  {
    id: "healthcare",
    title: "Healthcare · 51–200 people · Balanced budget",
    subtitle: "Weights: Incentives 5 · Talent 3 · Cost 3 · Ecosystem 2",
    targetIndustry: "Healthcare / Life Sciences", // Mapped to closest dataset option: "Healthcare / Life Sciences"
    teamSize: "51-200",
    budgetSensitivity: "balanced",
    timeline: "12-24mo",
    weights: { incentives: 5, talent: 3, cost: 3, ecosystem: 2 },
  },
];

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Radio({
  options, value, onChange,
}: {
  options: { value: string; label: string; hint?: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            style={{
              padding: "0.4375rem 0.875rem",
              borderRadius: "0.4rem",
              border: "1px solid",
              borderColor: active ? "var(--color-teal)" : "var(--color-border)",
              background: active ? "var(--color-teal-muted)" : "var(--color-surface-2)",
              color: active ? "var(--color-teal)" : "var(--color-text-secondary)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-sans)",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function WeightSlider({
  meta, value, onChange,
}: {
  meta: (typeof WEIGHTS_META)[number];
  value: number;
  onChange: (v: number) => void;
}) {
  const pips = [1, 2, 3, 4, 5];
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
        <div>
          <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{meta.label}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginLeft: "0.5rem" }}>{meta.hint}</span>
        </div>
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
          <span className="stat-num" style={{ fontSize: "0.875rem", fontWeight: 700, color: meta.color }}>{value}</span>
          <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>/5</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.375rem" }}>
        {pips.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            style={{
              flex: 1, height: "8px", borderRadius: "4px", border: "none", cursor: "pointer",
              background: p <= value ? meta.color : "var(--color-border)",
              opacity: p <= value ? (0.6 + (p / value) * 0.4) : 0.4,
              transition: "background 0.15s, opacity 0.15s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--color-teal)", marginBottom: "0.75rem" }}>
        {title}
      </div>
      {children}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */

export function AdvisorClient({ industries, gccs, cities, incentives }: Props) {
  const [industry, setIndustry]   = useState(industries.find((i) => i === "BFSI") ?? industries[0] ?? "BFSI");
  const [teamSize, setTeamSize]   = useState("201-500");
  const [budget, setBudget]       = useState<AdvisorFormValues["budgetSensitivity"]>("balanced");
  const [timeline, setTimeline]   = useState("12-24mo");
  const [weights, setWeights]     = useState<AdvisorWeights>({ talent: 4, cost: 3, incentives: 2, ecosystem: 2 });
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [result, setResult]       = useState<ScoringResult | null>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  function applyScenario(s: Scenario) {
    setActiveScenario(s.id);

    // Map to closest existing industry in data if not exact
    const matchedIndustry =
      industries.find((i) => i.toLowerCase() === s.targetIndustry.toLowerCase()) ??
      industries.find((i) =>
        i.toLowerCase().includes(s.id === "tech" ? "technology" : s.id === "healthcare" ? "healthcare" : "bfsi")
      ) ??
      s.targetIndustry;

    setIndustry(matchedIndustry);
    setTeamSize(s.teamSize);
    setBudget(s.budgetSensitivity);
    setTimeline(s.timeline);
    setWeights(s.weights);

    // Smoothly scroll to the form without auto-submitting
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function setWeight(key: keyof AdvisorWeights, v: number) {
    setActiveScenario(null); // User customized weights manually
    setWeights((prev) => ({ ...prev, [key]: v }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form: AdvisorFormValues = { industry, teamSize, budgetSensitivity: budget, timeline, weights };
    const scored = computeAdvisorScores(form, cities, gccs, incentives);
    setResult(scored);

    // Smoothly scroll down to the results section below the form
    setTimeout(() => {
      if (resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }

  return (
    <div>
      {/* ── Interactive Example Scenarios Bar ─────────────────────────────── */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1.125rem 1.25rem",
          borderRadius: "0.625rem",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-teal)",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
          }}
        >
          <span>Try it — Example Scenarios</span>
          <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--color-text-secondary)", textTransform: "none" }}>
            (click to autofill and adjust weights)
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {SCENARIOS.map((s) => {
            const isActive = activeScenario === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => applyScenario(s)}
                className="scenario-chip"
                style={{
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "0.1875rem",
                  padding: "0.5625rem 0.875rem",
                  borderRadius: "0.45rem",
                  border: "1px solid",
                  borderColor: isActive ? "var(--color-teal)" : "var(--color-border)",
                  background: isActive ? "var(--color-teal-muted)" : "var(--color-surface-2)",
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "left",
                  boxShadow: isActive ? "0 0 12px rgba(0, 201, 167, 0.2)" : "none",
                }}
              >
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: isActive ? "var(--color-teal)" : "var(--color-text-primary)" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)" }}>
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Advisor Form ─────────────────────────────────────────────────── */}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

          {/* ── Left column ── */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <FormSection title="Your GCC profile">
              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "0.5rem" }}>
                  Primary industry / function
                </label>
                <select
                  id="advisor-industry"
                  value={industry}
                  onChange={(e) => {
                    setActiveScenario(null);
                    setIndustry(e.target.value);
                  }}
                  className="select-field"
                  style={{ width: "100%", background: "var(--color-surface-2)", color: "var(--color-text-primary)" }}
                  required
                >
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "0.5rem" }}>
                  Planned team size (Year 3)
                </label>
                <Radio
                  options={TEAM_SIZES}
                  value={teamSize}
                  onChange={(v) => {
                    setActiveScenario(null);
                    setTeamSize(v);
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "0.5rem" }}>
                  Budget sensitivity
                </label>
                <Radio
                  options={BUDGETS}
                  value={budget}
                  onChange={(v) => {
                    setActiveScenario(null);
                    setBudget(v as AdvisorFormValues["budgetSensitivity"]);
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", display: "block", marginBottom: "0.5rem" }}>
                  Target timeline to go live
                </label>
                <Radio
                  options={TIMELINES}
                  value={timeline}
                  onChange={(v) => {
                    setActiveScenario(null);
                    setTimeline(v);
                  }}
                />
              </div>
            </FormSection>
          </div>

          {/* ── Right column ── */}
          <div className="card" style={{ padding: "1.75rem" }}>
            <FormSection title="What matters most to you?">
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem", lineHeight: 1.6 }}>
                Click the bars to set weight (1 = less important, 5 = most important). Budget sensitivity adjusts the cost weight automatically.
              </p>
              {WEIGHTS_META.map((meta) => (
                <WeightSlider key={meta.key} meta={meta} value={weights[meta.key]} onChange={(v) => setWeight(meta.key, v)} />
              ))}
            </FormSection>

            {/* Quick weight presets */}
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: "var(--color-teal)", marginBottom: "0.5rem" }}>
                Quick presets
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {[
                  { label: "Talent-first", w: { talent: 5, cost: 2, incentives: 2, ecosystem: 3 } },
                  { label: "Cost-first",   w: { talent: 3, cost: 5, incentives: 2, ecosystem: 1 } },
                  { label: "Balanced",     w: { talent: 3, cost: 3, incentives: 3, ecosystem: 3 } },
                ].map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setActiveScenario(null);
                      setWeights(p.w);
                    }}
                    style={{
                      padding: "0.375rem 0.8125rem", borderRadius: "0.35rem",
                      border: "1px solid var(--color-border)", background: "var(--color-surface-2)",
                      color: "var(--color-text-secondary)", fontSize: "0.8125rem",
                      fontFamily: "var(--font-sans)", cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.target as HTMLButtonElement).style.color = "var(--color-text-primary)";
                      (e.target as HTMLButtonElement).style.borderColor = "var(--color-teal)";
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLButtonElement).style.color = "var(--color-text-secondary)";
                      (e.target as HTMLButtonElement).style.borderColor = "var(--color-border)";
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Primary Action Card (Aligned with Form) ─────────────────────────── */}
        <div
          className="card"
          style={{
            marginTop: "1.5rem",
            padding: "1.25rem 1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1.5rem",
            flexWrap: "wrap",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
            background: "var(--color-surface)",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <button
              type="submit"
              className="advisor-submit-btn"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.8125rem 2.25rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "var(--color-teal)",
                color: "#0A0F1E", // Dark text on bright teal for maximum readability
                fontSize: "0.9375rem",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: "0 2px 10px rgba(0, 201, 167, 0.25)",
              }}
            >
              {result ? "Recalculate recommendations →" : "Find my best cities →"}
            </button>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "0.8125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.55,
              maxWidth: "34rem",
            }}
          >
            Scoring is deterministic and runs locally. No data is sent until you request the AI explanation.
          </p>
        </div>
      </form>

      {/* ── Results Section (Displayed below the form) ──────────────────────── */}
      {result && (
        <div
          ref={resultsRef}
          style={{
            marginTop: "3rem",
            paddingTop: "2.5rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <AdvisorResults
            result={result}
            gccs={gccs}
            incentives={incentives}
            onReset={() => {
              setResult(null);
              if (formRef.current) {
                formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
          />
        </div>
      )}

      <style>{`
        .advisor-submit-btn:hover {
          background: var(--color-teal-dim) !important;
          box-shadow: 0 4px 20px rgba(0, 201, 167, 0.4) !important;
          transform: translateY(-1px);
        }
        .advisor-submit-btn:focus-visible {
          outline: 2px solid var(--color-teal) !important;
          outline-offset: 3px !important;
        }
        .advisor-submit-btn:disabled {
          opacity: 0.5 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        .scenario-chip:hover {
          border-color: var(--color-teal) !important;
          transform: translateY(-1px);
        }
        .scenario-chip:focus-visible {
          outline: 2px solid var(--color-teal);
          outline-offset: 2px;
        }
        @media (max-width: 768px) {
          .advisor-submit-btn {
            width: 100% !important;
          }
          form > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
