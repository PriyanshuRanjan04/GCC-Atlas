import { getHeadlineStats } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const stats = getHeadlineStats();

  return (
    <div className="relative">
      {/* Radial teal glow behind hero */}
      <div className="absolute inset-0 bg-gradient-radial-teal pointer-events-none" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 text-center">
        <p className="section-label mb-6">India GCC Intelligence Platform</p>
        <h1 className="font-display font-extrabold text-display-xl text-text-primary leading-tight mb-6 teal-glow">
          Where Global Companies<br />
          <span className="text-teal">Build in India</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
          Research cities, compare incentives, and find the right hub for your Global Capability Centre —
          all from one transparent, sourced dataset.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link href="/directory" className="btn-primary text-base px-7 py-3">
            Explore Directory
          </Link>
          <Link href="/cities" className="btn-secondary text-base px-7 py-3">
            Compare Cities
          </Link>
        </div>

        {/* Headline stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { value: stats.captiveGCCsInDataset, label: "Captive GCCs", sub: "in dataset" },
            { value: stats.citiesCovered, label: "Cities Covered", sub: "across India" },
            { value: stats.statesWithIncentiveData, label: "State Incentive", sub: "records" },
          ].map((s) => (
            <div key={s.label} className="card py-6 px-4 text-center">
              <div className="font-display font-extrabold text-4xl text-teal mb-1">{s.value}</div>
              <div className="text-sm font-semibold text-text-primary">{s.label}</div>
              <div className="text-xs text-text-muted">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <p className="section-label mb-4">The Problem</p>
          <h2 className="font-display font-bold text-display-md text-text-primary mb-6">
            India's GCC data is fragmented
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            Decisions about where to build a Global Capability Centre in India are driven by referrals,
            anecdote, and scattered consultant PDFs. City comparisons, incentive policies, and talent
            benchmarks live in different places — if they're public at all.
          </p>
          <p className="text-text-secondary leading-relaxed">
            GCC Atlas aggregates what's publicly known, labels every figure with its confidence level and source,
            and is honest about what isn't disclosed. No hallucinated headcounts. No stale estimates presented as facts.
          </p>
        </div>
      </section>

      {/* ── Feature Preview ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-border">
        <p className="section-label text-center mb-4">What's Inside</p>
        <h2 className="font-display font-bold text-display-md text-text-primary text-center mb-12">
          Three tools. One platform.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: "🗂️",
              title: "GCC Directory",
              desc: "68 captive GCC profiles across 7 cities. Filter by industry, country, entity type, and confidence. Every record has source links.",
              href: "/directory",
              cta: "Browse Directory",
              live: true,
            },
            {
              icon: "🏙️",
              title: "City Explorer",
              desc: "Side-by-side city comparisons: talent salary ranges, Grade A rent, state incentives, and captive GCC counts — all sourced.",
              href: "/cities",
              cta: "Explore Cities",
              live: true,
            },
            {
              icon: "🧭",
              title: "Setup Advisor",
              desc: "Answer a few questions about your GCC's function, size, and priorities — get a tailored city shortlist with reasoning.",
              href: "/advisor",
              cta: "Coming next phase",
              live: false,
            },
          ].map((f) => (
            <div key={f.title} className={`card card-hover p-7 flex flex-col ${!f.live ? "opacity-70" : ""}`}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-display font-bold text-lg text-text-primary mb-2">{f.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed flex-1 mb-5">{f.desc}</p>
              {f.live ? (
                <Link href={f.href} className="btn-primary self-start text-sm">
                  {f.cta}
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg border border-border text-text-muted text-sm">
                  <span className="w-2 h-2 rounded-full bg-teal/40 animate-pulse" />
                  {f.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
