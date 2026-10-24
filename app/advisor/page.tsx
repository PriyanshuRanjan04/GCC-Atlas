import type { Metadata } from "next";
import { allGCCs, allCities, allIncentives } from "@/lib/data";
import { AdvisorClient } from "@/components/advisor/AdvisorClient";

export const metadata: Metadata = {
  title: "Setup Advisor",
  description:
    "Get a scored, data-driven shortlist of Indian cities for your GCC, with an AI explanation of the trade-offs — all grounded in the GCC Atlas dataset.",
};

export default function AdvisorPage() {
  // Unique industries from captive GCCs only, sorted
  const industries = [
    ...new Set(
      allGCCs
        .filter((g) => g.entity_type === "captive_gcc")
        .map((g) => g.industry)
    ),
  ].sort();

  return (
    <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "3rem 1rem 5rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <span className="section-label" style={{ display: "block", marginBottom: "0.5rem" }}>
          Setup Advisor
        </span>
        <h1 className="display-md" style={{ color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
          Where should your GCC be?
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "44rem", lineHeight: 1.7 }}>
          Tell us about your GCC — industry, team size, budget, and what matters most. We rank
          India&apos;s six major GCC cities using your weights, then explain the trade-offs using only
          data in this dataset.
        </p>

        <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          {[
            { label: "Deterministic scoring", icon: "⚙️", desc: "Transparent weights, no black box" },
            { label: "AI explanation",        icon: "✦",  desc: "Grounded in dataset only" },
            { label: "Source-linked results", icon: "🔗", desc: "Every number has a source" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>{f.icon}</span>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text-primary)" }}>{f.label}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Client form + results */}
      <AdvisorClient
        industries={industries}
        gccs={allGCCs}
        cities={allCities}
        incentives={allIncentives}
      />
    </div>
  );
}
