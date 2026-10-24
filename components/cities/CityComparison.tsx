"use client";

import { X } from "lucide-react";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import type { CityRichData } from "./CitiesClient";

interface Props {
  cities: CityRichData[];
  onRemove: (city: string) => void;
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "0.75rem 0.875rem", border: "1px solid var(--color-border)", verticalAlign: "top", minWidth: "160px" }}>
      {children}
    </td>
  );
}

function HeadCell({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      padding: "0.5rem 0.875rem", border: "1px solid var(--color-border)",
      fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
      color: "var(--color-text-muted)", textAlign: "left", background: "var(--color-surface-2)",
      whiteSpace: "nowrap",
    }}>
      {children}
    </th>
  );
}

function Null() {
  return <span style={{ fontStyle: "italic", color: "var(--color-text-muted)", fontSize: "0.8125rem" }}>Not disclosed</span>;
}

export function CityComparison({ cities, onRemove }: Props) {
  const allRoles = Array.from(
    new Set(cities.flatMap((c) => c.city.talent.annual_salary_inr_lakhs_by_role.map((r) => r.role)))
  );

  return (
    <div style={{ overflowX: "auto", borderRadius: "0.75rem", border: "1px solid var(--color-border)" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-sans)" }}>
        <thead>
          <tr>
            <th style={{
              padding: "0.625rem 0.875rem", border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)", textAlign: "left", width: "160px",
              fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-text-muted)",
            }}>
              Metric
            </th>
            {cities.map((c) => (
              <th key={c.city.city} style={{
                padding: "0.625rem 0.875rem", border: "1px solid var(--color-border)",
                background: "var(--color-surface-2)", textAlign: "left", minWidth: "180px",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>
                      {c.city.city}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", fontWeight: 400, marginTop: "0.125rem" }}>{c.city.state}</div>
                  </div>
                  <button
                    onClick={() => onRemove(c.city.city)}
                    style={{ padding: "0.1875rem", color: "var(--color-text-muted)", background: "transparent", border: "none", cursor: "pointer", flexShrink: 0 }}
                  >
                    <X size={13} />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Captive GCC count */}
          <tr>
            <HeadCell>Captive GCCs</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                {c.city.city === "Ahmedabad" ? (
                  <span style={{ fontSize: "0.8125rem", color: "#FB923C" }}>
                    0 captive GCCs — regulated financial hub (IFSCA). {c.ecosystemCount} ecosystem entities.
                  </span>
                ) : (
                  <span className="stat-num" style={{ fontWeight: 700, fontSize: "1.25rem", color: "var(--color-teal)" }}>
                    {c.captiveCount}
                  </span>
                )}
              </Cell>
            ))}
          </tr>

          {/* Ecosystem entities */}
          <tr>
            <HeadCell>Ecosystem Entities</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                <span className="stat-num" style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>{c.ecosystemCount}</span>
              </Cell>
            ))}
          </tr>

          {/* Ecosystem maturity */}
          <tr>
            <HeadCell>Ecosystem Maturity</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    height: "6px", borderRadius: "3px", flex: 1, minWidth: "60px",
                    background: "var(--color-border)",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", inset: 0, right: `${100 - c.ecosystemMaturity}%`,
                      background: "var(--color-teal)", borderRadius: "3px",
                    }} />
                  </div>
                  <span className="stat-num" style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)", flexShrink: 0 }}>
                    {c.ecosystemMaturity}/100
                  </span>
                </div>
              </Cell>
            ))}
          </tr>

          {/* Rent */}
          <tr>
            <HeadCell>Grade A Rent</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                  ₹{c.city.office_space.grade_a_rent_inr_per_sqft_per_month.min}–
                  {c.city.office_space.grade_a_rent_inr_per_sqft_per_month.max}/sqft/mo
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  <ConfidenceBadge confidence={c.city.office_space.confidence} size="sm" />
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>as of {c.city.office_space.as_of}</span>
                </div>
              </Cell>
            ))}
          </tr>

          {/* Salary by role */}
          {allRoles.map((role) => (
            <tr key={role}>
              <HeadCell>{role}</HeadCell>
              {cities.map((c) => {
                const r = c.city.talent.annual_salary_inr_lakhs_by_role.find((x) => x.role === role);
                return (
                  <Cell key={c.city.city}>
                    {r ? (
                      <div>
                        <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>₹{r.min}–{r.max}L/yr</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                          <ConfidenceBadge confidence={c.city.talent.confidence} size="sm" />
                          <span style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)" }}>as of {c.city.talent.as_of}</span>
                        </div>
                      </div>
                    ) : <Null />}
                  </Cell>
                );
              })}
            </tr>
          ))}

          {/* Key clusters */}
          <tr>
            <HeadCell>Key Clusters</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {c.city.office_space.key_clusters.slice(0, 3).map((cluster) => (
                    <span key={cluster} style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>• {cluster}</span>
                  ))}
                </div>
              </Cell>
            ))}
          </tr>

          {/* State incentives */}
          <tr>
            <HeadCell>State Incentives</HeadCell>
            {cities.map((c) => (
              <Cell key={c.city.city}>
                {c.incentives ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    {c.incentives.policy_name && (
                      <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
                        {c.incentives.policy_name}
                      </div>
                    )}
                    {c.incentives.items.slice(0, 3).map((item, i) => (
                      <div key={i} style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", lineHeight: 1.5 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-teal)" }}>{item.type}:</span>{" "}
                        {item.description.slice(0, 100)}{item.description.length > 100 ? "…" : ""}
                      </div>
                    ))}
                    {c.incentives.confidence && <ConfidenceBadge confidence={c.incentives.confidence as "verified" | "reported" | "estimated"} size="sm" />}
                  </div>
                ) : <Null />}
              </Cell>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
