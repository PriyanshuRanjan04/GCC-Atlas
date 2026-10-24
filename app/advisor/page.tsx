import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Setup Advisor — Coming Soon",
  description: "Answer questions about your GCC's function and priorities to get a tailored city shortlist.",
};

export default function AdvisorPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="relative inline-block mb-8">
        <div className="w-20 h-20 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto">
          <span className="text-4xl">🧭</span>
        </div>
        <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full bg-surface border border-border text-teal">
          Next Phase
        </span>
      </div>

      <h1 className="font-display font-extrabold text-display-sm text-text-primary mb-4">
        Setup Advisor
      </h1>
      <p className="text-text-secondary leading-relaxed mb-6">
        Answer a few structured questions about your GCC's function, team size, talent needs,
        and business priorities — and get a tailored city shortlist with data-backed reasoning.
      </p>
      <div className="card p-6 text-left mb-8 space-y-3">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">Planned features</p>
        {[
          "Function-based filtering (tech R&D, BFSI ops, ER&D, shared services, AI/ML)",
          "Team size and growth projections matched against city talent pool depth",
          "Cost modelling: salary bands × rent per sqft × incentive deductions",
          "Risk flags: attrition rates, talent concentration, real-estate supply",
          "Powered by Groq API — reasoning on structured data, not hallucination",
        ].map((f) => (
          <div key={f} className="flex gap-2.5 text-sm text-text-secondary">
            <span className="text-teal/60 shrink-0">→</span> {f}
          </div>
        ))}
      </div>
      <Link href="/directory" className="btn-primary">
        Browse Directory in the meantime
      </Link>
    </div>
  );
}
