"use client";

import Link from "next/link";
import { X, Plus, Check } from "lucide-react";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import type { CityRichData } from "./CitiesClient";

interface Props {
  cityData: CityRichData;
  isInComparison: boolean;
  onClose: () => void;
  onAddToCompare: (city: string) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "0.75rem 0", borderBottom: "1px solid var(--color-border)" }}>
      <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)", marginBottom: "0.3125rem" }}>
        {label}
      </div>
      <div style={{ fontSize: "0.9rem", color: "var(--color-text-primary)" }}>{children}</div>
    </div>
  );
}

function Null() {
  return <span style={{ fontStyle: "italic", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Not disclosed</span>;
}

export function CityPanel({ cityData, isInComparison, onClose, onAddToCompare }: Props) {
  const { city, captiveCount, ecosystemCount, topGCCs, incentives } = cityData;
  const isGiftCity = city.city === "Ahmedabad";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "1rem 1rem 0.75rem",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          background: "var(--color-surface)",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
          <div>
            <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)", letterSpacing: "-0.01em" }}>
              {city.city}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
              {city.state}
              {isGiftCity && (
                <span style={{
                  marginLeft: "0.5rem", fontSize: "0.6875rem", fontWeight: 700,
                  padding: "0.0625rem 0.4375rem", borderRadius: "9999px",
                  background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.25)", color: "#FB923C",
                }}>
                  GIFT City
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ padding: "0.25rem", color: "var(--color-text-muted)", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0, marginTop: "0.125rem" }}>
            <X size={16} />
          </button>
        </div>

        {/* Add to compare */}
        <button
          onClick={() => onAddToCompare(city.city)}
          style={{
            marginTop: "0.75rem",
            display: "inline-flex", alignItems: "center", gap: "0.375rem",
            padding: "0.375rem 0.875rem", borderRadius: "0.4rem",
            border: "1px solid",
            borderColor: isInComparison ? "var(--color-teal)" : "var(--color-border)",
            background: isInComparison ? "var(--color-teal-muted)" : "var(--color-surface-2)",
            color: isInComparison ? "var(--color-teal)" : "var(--color-text-secondary)",
            fontSize: "0.8125rem", fontFamily: "var(--font-sans)", cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {isInComparison ? <Check size={13} /> : <Plus size={13} />}
          {isInComparison ? "In comparison" : "Add to compare"}
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: "0 1rem 1.5rem", flex: 1, overflowY: "auto" }}>
        {/* GIFT City note */}
        {isGiftCity && (
          <div style={{ marginTop: "0.875rem", padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(249,115,22,0.07)", border: "1px solid rgba(249,115,22,0.2)", fontSize: "0.8125rem", color: "#FB923C", lineHeight: 1.6 }}>
            Ahmedabad / GIFT City operates as a <strong>regulated financial services hub</strong> (IFSCA). It hosts exchanges, clearing corporations, and regulated fund entities — not traditional captive GCCs. Zero captive GCCs in the current dataset.
          </div>
        )}

        <Row label="GCC Presence">
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <span className="stat-num" style={{ fontWeight: 700, fontSize: "1.375rem", color: "var(--color-teal)" }}>{captiveCount}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "0.3rem" }}>Captive GCCs</span>
            </div>
            <div>
              <span className="stat-num" style={{ fontWeight: 700, fontSize: "1.375rem", color: "var(--color-text-secondary)" }}>{ecosystemCount}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginLeft: "0.3rem" }}>Ecosystem entities</span>
            </div>
          </div>
        </Row>

        <Row label={`Grade A Rent  ·  as of ${city.office_space.as_of}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ fontWeight: 600 }}>
              ₹{city.office_space.grade_a_rent_inr_per_sqft_per_month.min}–
              {city.office_space.grade_a_rent_inr_per_sqft_per_month.max}/sqft/mo
            </span>
            <ConfidenceBadge confidence={city.office_space.confidence} size="sm" />
          </div>
          {city.office_space.notes && (
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>{city.office_space.notes}</div>
          )}
        </Row>

        <Row label={`Salary Ranges  ·  as of ${city.talent.as_of}`}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            {city.talent.annual_salary_inr_lakhs_by_role.map((r) => (
              <div key={r.role} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>{r.role}</span>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>₹{r.min}–{r.max}L</span>
              </div>
            ))}
            <div style={{ marginTop: "0.25rem" }}>
              <ConfidenceBadge confidence={city.talent.confidence} size="sm" />
            </div>
          </div>
        </Row>

        <Row label="Key Clusters">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.25rem" }}>
            {city.office_space.key_clusters.map((c) => (
              <span key={c} style={{
                fontSize: "0.75rem", padding: "0.25rem 0.625rem", borderRadius: "0.3rem",
                background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                color: "var(--color-text-secondary)",
              }}>
                {c}
              </span>
            ))}
          </div>
        </Row>

        {/* State Incentives */}
        {incentives ? (
          <Row label={`State Incentives${incentives.policy_name ? ` — ${incentives.policy_name}` : ""}${incentives.as_of ? ` (as of ${incentives.as_of})` : ""}`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {incentives.confidence && <ConfidenceBadge confidence={incentives.confidence as "verified" | "reported" | "estimated"} size="sm" />}
              {incentives.items.map((item, idx) => (
                <div key={idx} style={{ background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "0.4rem", padding: "0.5rem 0.625rem" }}>
                  <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-teal)", marginBottom: "0.1875rem" }}>
                    {item.type}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)", lineHeight: 1.55 }}>
                    {item.description}
                  </div>
                </div>
              ))}
            </div>
          </Row>
        ) : (
          <Row label="State Incentives"><Null /></Row>
        )}

        {/* Top GCCs */}
        {!isGiftCity && topGCCs.length > 0 && (
          <Row label={`Top Captive GCCs (${topGCCs.length} shown)`}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.25rem" }}>
              {topGCCs.map((gcc) => (
                <Link
                  key={gcc.id}
                  href={`/directory/${gcc.id}`}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0.4375rem 0.625rem", borderRadius: "0.4rem",
                    background: "var(--color-surface-2)", border: "1px solid var(--color-border)",
                    textDecoration: "none", transition: "border-color 0.15s",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{gcc.company_name}</div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>{gcc.industry}</div>
                  </div>
                  <ConfidenceBadge confidence={gcc.confidence as "verified" | "reported" | "estimated"} size="sm" />
                </Link>
              ))}
            </div>
          </Row>
        )}
      </div>
    </div>
  );
}
