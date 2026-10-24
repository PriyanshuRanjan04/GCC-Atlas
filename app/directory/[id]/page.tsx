import type { Metadata } from "next";
import { getGCCById, allGCCs } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { EntityTypeBadge } from "@/components/ui/EntityTypeBadge";
import { SourceLinks } from "@/components/ui/SourceLinks";
import { NullableValue, HeadcountValue } from "@/components/ui/NullableValue";
import { ArrowLeft } from "lucide-react";

export async function generateStaticParams() {
  return allGCCs.map((g) => ({ id: g.id }));
}

// Required in Next.js 16: forces blocking pre-render so `await params` in the
// component body is resolved at build time, not in a streaming shell.
export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const gcc = getGCCById(id);
  if (!gcc) return { title: "Not Found" };
  return {
    title: `${gcc.company_name} — ${gcc.city}`,
    description: `${gcc.entity_name_india} — ${gcc.industry} GCC in ${gcc.city}, India.`,
  };
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "0.875rem 0",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        style={{
          fontSize: "0.6875rem",
          fontWeight: 700,
          color: "var(--color-text-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.3125rem",
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: "0.9375rem", color: "var(--color-text-primary)" }}>{children}</div>
    </div>
  );
}

export default async function GCCDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gcc = getGCCById(id);
  if (!gcc) notFound();

  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "3rem 1rem 5rem" }}>
      {/* Back link */}
      <Link
        href="/directory"
        className="back-link"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          textDecoration: "none",
          marginBottom: "2rem",
          transition: "color 0.15s",
        }}
      >
        <ArrowLeft size={14} />
        Back to Directory
      </Link>

      {/* ── Header card ───────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "2rem", marginBottom: "1.25rem" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h1
              className="display-sm"
              style={{ color: "var(--color-text-primary)", marginBottom: "0.25rem" }}
            >
              {gcc!.company_name}
            </h1>
            <p style={{ fontSize: "0.9375rem", color: "var(--color-text-secondary)" }}>
              {gcc!.entity_name_india}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <ConfidenceBadge confidence={gcc!.confidence} />
            <EntityTypeBadge entityType={gcc!.entity_type} />
          </div>
        </div>

        {/* Key info grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(130px,1fr))",
            gap: "0.75rem",
          }}
        >
          {[
            { label: "City", value: gcc!.city },
            { label: "State", value: gcc!.state },
            { label: "Parent Country", value: gcc!.parent_country },
            { label: "Industry", value: gcc!.industry },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: "var(--color-surface-2)",
                borderRadius: "0.5rem",
                padding: "0.75rem",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ fontSize: "0.6875rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                {item.label}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  color: "var(--color-text-primary)",
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Details card ──────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-text-primary)",
            marginBottom: "0.25rem",
            letterSpacing: "-0.005em",
          }}
        >
          Details
        </h2>
        <div>
          <Field label="Location Detail">
            <NullableValue value={gcc!.location_detail} />
          </Field>
          <Field label="Year Established">
            <NullableValue value={gcc!.year_established} />
          </Field>
          <Field label="Headcount">
            <HeadcountValue headcount={gcc!.headcount} />
          </Field>
          <Field label="Functions">
            {gcc!.functions.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.375rem" }}>
                {gcc!.functions.map((fn) => (
                  <span
                    key={fn}
                    style={{
                      fontSize: "0.75rem",
                      padding: "0.1875rem 0.625rem",
                      borderRadius: "0.3rem",
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {fn}
                  </span>
                ))}
              </div>
            ) : (
              <span className="null-value">Not disclosed</span>
            )}
          </Field>
          <div style={{ paddingTop: "0.875rem" }} /> {/* last field no border */}
        </div>
      </div>

      {/* ── Data sourcing card ────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "1.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--font-sans)",
            fontWeight: 700,
            fontSize: "1rem",
            color: "var(--color-text-primary)",
            marginBottom: "1rem",
            letterSpacing: "-0.005em",
          }}
        >
          Data Sourcing
        </h2>
        <div style={{ marginBottom: "1rem" }}>
          <SourceLinks urls={gcc!.source_urls} />
        </div>
        <div
          style={{
            padding: "1rem",
            borderRadius: "0.5rem",
            background: "var(--color-surface-2)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "0.375rem",
            }}
          >
            Researcher Note
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", lineHeight: 1.65 }}>
            {gcc!.notes}
          </p>
        </div>
        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.75rem",
            color: "var(--color-text-muted)",
          }}
        >
          <span>Record ID:</span>
          <code style={{ fontFamily: "var(--font-mono)", color: "rgba(0,201,167,0.75)" }}>
            {gcc!.id}
          </code>
        </div>
      </div>
    </div>
  );
}
