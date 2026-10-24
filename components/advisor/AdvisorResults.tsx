"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import type { ScoringResult, CityScore } from "@/lib/scoring";
import type { GCCRecord, IncentiveRecord } from "@/lib/types";

interface Props {
  result: ScoringResult;
  gccs: GCCRecord[];
  incentives: IncentiveRecord[];
  onReset: () => void;
}

/* ── Factor bar ─────────────────────────────────────────────────────────── */
function FactorBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ marginBottom: "0.5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{label}</span>
        <span className="stat-num" style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{value}</span>
      </div>
      <div style={{ height: "6px", borderRadius: "3px", background: "var(--color-border)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: "3px", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

const FACTOR_COLORS = { talent: "#00C9A7", cost: "#60A5FA", incentives: "#F59E0B", ecosystem: "#C084FC" };
const RANK_COLORS = ["#00C9A7", "#60A5FA", "#C084FC", "#6B7280", "#6B7280", "#6B7280"];
const RANK_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

/* ── AI Explanation ──────────────────────────────────────────────────────── */
function AIExplanation({ result }: { result: ScoringResult }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setText("");
    setDone(false);
    setIsFallback(false);

    (async () => {
      try {
        const res = await fetch("/api/advisor/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ result }),
          signal: ctrl.signal,
        });

        if (!res.ok || !res.body) {
          setText("AI explanation is temporarily unavailable. All scored results above are fully deterministic.");
          setDone(true);
          setIsFallback(true);
          return;
        }

        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";

        for (;;) {
          const { done: d, value } = await reader.read();
          if (d) break;
          acc += dec.decode(value, { stream: true });
          if (acc.startsWith("__FALLBACK__\n")) {
            setIsFallback(true);
            setText(acc.slice(13));
          } else {
            setText(acc);
          }
        }
        setDone(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setText("AI explanation is temporarily unavailable. All scored results above are fully deterministic.");
          setDone(true);
          setIsFallback(true);
        }
      }
    })();

    return () => ctrl.abort();
  }, [result]);

  return (
    <div className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", gap: "0.75rem", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem", color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
            AI Analysis
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
            {isFallback ? "⚠ AI explanation temporarily unavailable — showing rule-based summary" : "Powered by Groq · llama-3.3-70b-versatile · grounded in dataset only"}
          </div>
        </div>
        {!done && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-teal)", fontSize: "0.8125rem" }}>
            <span style={{ animation: "pulse 1.2s ease-in-out infinite" }}>●</span> Generating…
          </div>
        )}
      </div>

      {text && (
        <div style={{
          fontSize: "0.9rem", lineHeight: 1.75, color: "var(--color-text-secondary)",
          whiteSpace: "pre-wrap",
        }}>
          {text}
          {!done && <span style={{ animation: "blink 0.8s step-end infinite", opacity: 0.7 }}>|</span>}
        </div>
      )}

      {!text && !done && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {[80, 60, 40].map((w, i) => (
            <div key={i} style={{ height: "14px", borderRadius: "7px", background: "var(--color-border)", width: `${w}%`, animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      )}

      {/* How this score works */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-teal)", fontSize: "0.8125rem", fontFamily: "var(--font-sans)", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          <span style={{ transition: "transform 0.2s", display: "inline-block", transform: open ? "rotate(90deg)" : "rotate(0deg)" }}>▶</span>
          How this score works
        </button>
        {open && (
          <div style={{ marginTop: "0.875rem", fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.7 }}>
            <p>Scores are computed from four factors, each normalised 0–100 across the six GCC cities:</p>
            <ul style={{ paddingLeft: "1.25rem", marginTop: "0.5rem" }}>
              <li><strong style={{ color: FACTOR_COLORS.talent }}>Talent depth</strong> — captive GCC count in the city (60%) + GCCs in your chosen industry (40%, weighted ×2.5). More established GCCs → deeper talent pool.</li>
              <li><strong style={{ color: FACTOR_COLORS.cost }}>Cost efficiency</strong> — Grade A rent midpoint (40%) + software-engineer salary midpoint (60%), inverted so lower cost = higher score. Modified by your budget sensitivity.</li>
              <li><strong style={{ color: FACTOR_COLORS.incentives }}>Incentives</strong> — whether the state has an active GCC policy (+30), number of incentive items (+8 each, capped at 50), and data confidence (+6/+12/+20).</li>
              <li><strong style={{ color: FACTOR_COLORS.ecosystem }}>Ecosystem maturity</strong> — total entities in the city (captive + ecosystem) normalised to the highest-density city.</li>
            </ul>
            <p style={{ marginTop: "0.75rem" }}>Final score = weighted average using your slider values, with your budget sensitivity multiplied into the cost weight (×1.6 for cost-sensitive, ×0.4 for cost-not-priority). Ahmedabad / GIFT City is never ranked.</p>
            <p style={{ marginTop: "0.5rem", fontStyle: "italic", color: "var(--color-text-secondary)" }}>⚠ Salary and rent figures are estimates from secondary sources. Treat ranges as directional, not contractual.</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
      `}</style>
    </div>
  );
}

/* ── City card ───────────────────────────────────────────────────────────── */
function CityCard({ score, rank, form, gccs, incentives }: {
  score: CityScore;
  rank: number;
  form: ScoringResult["form"];
  gccs: GCCRecord[];
  incentives: IncentiveRecord[];
}) {
  const color = RANK_COLORS[rank] ?? "#6B7280";
  const label = RANK_LABELS[rank] ?? `${rank + 1}th`;

  const industryGCCs = gccs.filter(
    (g) => g.entity_type === "captive_gcc" && g.city === score.city && g.industry.toLowerCase() === form.industry.toLowerCase()
  );
  const fallbackGCCs = industryGCCs.length > 0
    ? industryGCCs
    : gccs.filter((g) => g.entity_type === "captive_gcc" && g.city === score.city);
  const showGCCs = fallbackGCCs.slice(0, 3);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inc = incentives.find((i) => (i.state as string)?.toLowerCase() === score.state.toLowerCase()) as any;
  const incItems: { type: string; description: string }[] = Array.isArray(inc?.incentives) ? inc.incentives.slice(0, 2) : [];

  const isTop = rank === 0;

  return (
    <div className="card" style={{
      padding: "1.5rem",
      borderColor: isTop ? color : undefined,
      borderWidth: isTop ? "2px" : "1px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Rank badge */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        padding: "0.3rem 0.875rem",
        background: color,
        borderRadius: "0 0.625rem 0 0.625rem",
        fontSize: "0.75rem", fontWeight: 800, color: "#000",
        letterSpacing: "0.04em",
      }}>
        {label}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 800, fontSize: "1.125rem", color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
          {score.city}
        </h3>
        <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{score.state}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginTop: "0.5rem" }}>
          <span className="stat-num" style={{ fontWeight: 800, fontSize: "2rem", color }}>{score.totalScore}</span>
          <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>/100</span>
        </div>
      </div>

      {/* Factor bars */}
      <div style={{ marginBottom: "1.25rem" }}>
        <FactorBar label="Talent depth"       value={score.factors.talent}     color={FACTOR_COLORS.talent} />
        <FactorBar label="Cost efficiency"    value={score.factors.cost}       color={FACTOR_COLORS.cost} />
        <FactorBar label="State incentives"   value={score.factors.incentives} color={FACTOR_COLORS.incentives} />
        <FactorBar label="Ecosystem maturity" value={score.factors.ecosystem}  color={FACTOR_COLORS.ecosystem} />
      </div>

      {/* Key numbers */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.25rem" }}>
        {[
          { label: "Captive GCCs", value: score.raw.captiveCount },
          { label: `${form.industry} GCCs`, value: score.raw.industryGCCCount },
          { label: "Rent (est.)", value: `₹${score.raw.rentMid}/sqft` },
          { label: "SW Eng salary (est.)", value: `₹${score.raw.salaryMid}L` },
        ].map((kv) => (
          <div key={kv.label} style={{ background: "var(--color-surface-2)", borderRadius: "0.4rem", padding: "0.5rem 0.625rem" }}>
            <div style={{ fontSize: "0.6875rem", color: "var(--color-text-secondary)", marginBottom: "0.125rem" }}>{kv.label}</div>
            <div className="stat-num" style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{kv.value}</div>
          </div>
        ))}
      </div>

      {/* Comparable GCCs */}
      {showGCCs.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            {industryGCCs.length > 0 ? `${form.industry} captive GCCs` : "Captive GCCs (sample)"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {showGCCs.map((g) => (
              <Link key={g.id} href={`/directory/${g.id}`} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.375rem 0.5rem", borderRadius: "0.35rem",
                background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                textDecoration: "none",
              }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{g.company_name}</span>
                <ConfidenceBadge confidence={g.confidence} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Incentives */}
      {incItems.length > 0 && (
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.5rem" }}>
            {inc?.policy_name ?? "State incentives"}
            {inc?.confidence && <> · <ConfidenceBadge confidence={inc.confidence} size="sm" /></>}
          </div>
          {incItems.map((item, i) => (
            <div key={i} style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginBottom: "0.25rem" }}>
              <span style={{ fontWeight: 600, color: "var(--color-teal)" }}>{item.type}:</span>{" "}
              {item.description.slice(0, 100)}{item.description.length > 100 ? "…" : ""}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main export ─────────────────────────────────────────────────────────── */
export function AdvisorResults({ result, gccs, incentives, onReset }: Props) {
  const { rankedCities, giftCityRelevant, form } = result;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <span className="section-label" style={{ display: "block", marginBottom: "0.35rem" }}>Setup Advisor Results</span>
          <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
            {form.industry} · {form.teamSize} people · {form.budgetSensitivity.replace(/-/g, " ")} · {form.timeline.replace(/-/g, " ")}
          </div>
        </div>
        <button onClick={onReset} style={{
          padding: "0.4375rem 1rem", borderRadius: "0.4rem",
          border: "1px solid var(--color-border)", background: "var(--color-surface-2)",
          color: "var(--color-text-secondary)", fontSize: "0.8125rem",
          fontFamily: "var(--font-sans)", cursor: "pointer",
        }}>
          ← Adjust inputs
        </button>
      </div>

      {/* Top 3 featured, then rest below */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
        {rankedCities.slice(0, 3).map((city, i) => (
          <CityCard key={city.city} score={city} rank={i} form={form} gccs={gccs} incentives={incentives} />
        ))}
      </div>

      {/* Ranks 4-6 smaller */}
      {rankedCities.length > 3 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
          {rankedCities.slice(3).map((city, i) => (
            <div key={city.city} className="card" style={{ padding: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{city.city}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{city.state}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="stat-num" style={{ fontWeight: 800, fontSize: "1.375rem", color: RANK_COLORS[i + 3] ?? "#6B7280" }}>{city.totalScore}</div>
                  <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{RANK_LABELS[i + 3]}</div>
                </div>
              </div>
              <FactorBar label="Talent"     value={city.factors.talent}     color={FACTOR_COLORS.talent} />
              <FactorBar label="Cost"       value={city.factors.cost}       color={FACTOR_COLORS.cost} />
              <FactorBar label="Incentives" value={city.factors.incentives} color={FACTOR_COLORS.incentives} />
              <FactorBar label="Ecosystem"  value={city.factors.ecosystem}  color={FACTOR_COLORS.ecosystem} />
            </div>
          ))}
        </div>
      )}

      {/* GIFT City card */}
      {giftCityRelevant && (
        <div className="card" style={{ padding: "1.25rem", borderColor: "rgba(249,115,22,0.3)", borderWidth: "1.5px", marginBottom: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.125rem 0.5rem", borderRadius: "9999px", background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.3)", color: "#FB923C" }}>GIFT City</span>
            <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1rem", color: "#FB923C" }}>Ahmedabad · Financial Services Hub</span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            GIFT City (Gujarat International Finance Tec-City) is an IFSCA-regulated financial services hub — not a traditional GCC location.
            It hosts exchanges, clearing corporations, fund management entities, and IFSC banking units.
            <strong> Zero captive GCCs are present in the current dataset.</strong>
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
            Consider GIFT City if your {form.industry} function requires IFSCA licensing (e.g., offshore fund management, IFSC insurance office, or FPI custody). It is <em>complementary</em> to, not a substitute for, a captive GCC in the ranked cities above.
          </p>
        </div>
      )}

      {/* AI explanation */}
      <AIExplanation result={result} />

      {/* Disclaimer */}
      <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "1rem", lineHeight: 1.6 }}>
        ⚠ Salary and rent figures are estimates from secondary sources. Scores are relative to the six GCC cities in this dataset. This tool is a research aid — validate all figures independently before making location decisions.
      </p>
    </div>
  );
}
