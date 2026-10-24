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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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
    <div className="py-4 border-b border-border last:border-0">
      <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">{label}</div>
      <div className="text-sm text-text-primary">{children}</div>
    </div>
  );
}

export default async function GCCDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gcc = getGCCById(id);
  if (!gcc) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/directory" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-teal transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </Link>

      {/* Header */}
      <div className="card p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-extrabold text-display-sm text-text-primary mb-1">
              {gcc.company_name}
            </h1>
            <p className="text-text-secondary text-sm">{gcc.entity_name_india}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ConfidenceBadge confidence={gcc.confidence} />
            <EntityTypeBadge entityType={gcc.entity_type} />
          </div>
        </div>

        {/* Key info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "City", value: gcc.city },
            { label: "State", value: gcc.state },
            { label: "Parent Country", value: gcc.parent_country },
            { label: "Industry", value: gcc.industry },
          ].map((item) => (
            <div key={item.label} className="bg-surface-2 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">{item.label}</div>
              <div className="font-medium text-sm text-text-primary">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="card p-6 mb-6">
        <h2 className="font-display font-semibold text-text-primary mb-2">Details</h2>
        <div className="divide-y divide-border">
          <Field label="Location Detail">
            <NullableValue value={gcc.location_detail} />
          </Field>
          <Field label="Year Established">
            <NullableValue value={gcc.year_established} />
          </Field>
          <Field label="Headcount">
            <HeadcountValue headcount={gcc.headcount} />
          </Field>
          <Field label="Functions">
            {gcc.functions.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {gcc.functions.map((fn) => (
                  <span key={fn} className="badge bg-surface-2 border border-border text-text-secondary text-xs">
                    {fn}
                  </span>
                ))}
              </div>
            ) : (
              <span className="null-value">Not disclosed</span>
            )}
          </Field>
        </div>
      </div>

      {/* Sourcing */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Data Sourcing</h2>
        <div className="mb-4">
          <SourceLinks urls={gcc.source_urls} />
        </div>
        <div className="mt-4 p-4 rounded-lg bg-surface-2 border border-border">
          <div className="text-xs text-text-muted font-semibold mb-1.5 uppercase tracking-wide">Researcher Note</div>
          <p className="text-xs text-text-secondary leading-relaxed">{gcc.notes}</p>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs text-text-muted">Record ID:</span>
          <code className="text-xs font-mono text-teal/80">{gcc.id}</code>
        </div>
      </div>
    </div>
  );
}
