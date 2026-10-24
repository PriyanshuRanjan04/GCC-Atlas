import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology",
  description: "How GCC Atlas sources its data, what confidence levels mean, and known limitations.",
};

export default function MethodologyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="section-label mb-3">Transparency</p>
      <h1 className="font-display font-extrabold text-display-md text-text-primary mb-4">
        Methodology
      </h1>
      <p className="text-text-secondary mb-10 leading-relaxed">
        GCC Atlas is a research prototype. Every figure has a provenance. This page explains
        how data was gathered, what the confidence labels mean, and what we know is incomplete.
      </p>

      <div className="space-y-8">
        {/* Confidence levels */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-4">Confidence Levels</h2>
          <div className="space-y-4">
            {[
              {
                label: "Verified",
                color: "text-teal",
                bg: "bg-teal/10 border-teal/30",
                desc: "An official company or government page was fetched and read directly in this research session. Currently only 3 URLs meet this standard (goldmansachs.com, astrazeneca.in, mbrdi.co.in).",
              },
              {
                label: "Reported",
                color: "text-yellow-400",
                bg: "bg-yellow-500/10 border-yellow-500/30",
                desc: "Supported by at least one named secondary source (news article, GCC directory, consultant report) retrieved via search grounding. The full page was not always directly fetched — only the search result summary or snippet was reviewed. 85 of 86 records are at this level.",
              },
              {
                label: "Estimated",
                color: "text-red-400",
                bg: "bg-red-500/10 border-red-500/30",
                desc: "Figure is inferred or calculated — for example, a city-level split of a national headcount total where no city-specific disclosure was found. Currently only 1 record (Deutsche Bank Pune headcount) carries this label.",
              },
            ].map((c) => (
              <div key={c.label} className={`p-4 rounded-lg border ${c.bg}`}>
                <div className={`font-semibold ${c.color} mb-1.5`}>{c.label}</div>
                <p className="text-sm text-text-secondary leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What "Not disclosed" means */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-3">"Not Disclosed" Policy</h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            When a field — typically <code className="text-teal/80 font-mono text-xs">headcount</code> or{" "}
            <code className="text-teal/80 font-mono text-xs">year_established</code> — could not be found in
            a retrieved source, it is stored as <code className="font-mono text-xs text-red-400">null</code>{" "}
            in the dataset and displayed as{" "}
            <span className="italic text-text-muted">Not disclosed</span> in the UI.
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">
            Null values are <strong className="text-text-primary">never</strong> shown as 0, blank, or
            approximated. This is a deliberate design constraint — fabricated precision is worse than
            acknowledged ignorance.
          </p>
        </section>

        {/* Data sources */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-3">Primary Sources</h2>
          <div className="text-sm text-text-secondary space-y-2 leading-relaxed">
            <p><strong className="text-text-primary">GCC records:</strong> nasscom.in, zinnov.com, businessofgcc.com, gccxglobal.com, tracxn.com, economictimes.com, and official company pages where directly accessible.</p>
            <p><strong className="text-text-primary">Salary benchmarks:</strong> Estimated from search result summaries referencing NASSCOM, quantalent.ai, talhive.com, and hrbx.in. No report PDF was directly fetched.</p>
            <p><strong className="text-text-primary">Office rents:</strong> Estimated from search result summaries citing JLL, CBRE, Cushman & Wakefield India market reports. No broker report was directly fetched.</p>
            <p><strong className="text-text-primary">State incentives:</strong> Secondary sources only. No state government policy PDF was fetched. Verify before any investment decision.</p>
          </div>
          <div className="mt-4">
            <Link href="/sources.md" className="text-teal text-sm hover:underline">
              View full sources list →
            </Link>
          </div>
        </section>

        {/* Known limitations */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-3">Known Limitations</h2>
          <ul className="text-sm text-text-secondary space-y-2 list-none">
            {[
              "86 total records across 7 cities — not exhaustive. Thousands of GCCs operate in India.",
              "74% of records have no disclosed headcount. Ranges shown are from secondary sources where available.",
              "81% of records have no confirmed year_established.",
              "Ahmedabad/GIFT City contains zero captive GCCs in this dataset — only IFSC regulated entities and professional services units.",
              "Salary and rent figures are indicative estimates, not verified benchmarks.",
              "No record was added from memory — every record has at least one source URL.",
              "Multi-city companies (Goldman Sachs, Barclays, Citi, JPMorgan) appear as separate records per city — their headcounts are not summed.",
            ].map((item, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="text-teal/60 shrink-0 mt-0.5">→</span>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Entity types */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-3">Entity Type Definitions</h2>
          <div className="space-y-3 text-sm text-text-secondary">
            <div><span className="text-blue-400 font-medium">Captive GCC:</span> A wholly-owned or majority-owned centre of a global company, serving its own group's technology, operations, or R&D needs. These are counted in all headline GCC figures.</div>
            <div><span className="text-purple-400 font-medium">Professional Services Delivery:</span> Big 4 and management consulting delivery centres (EY GDS, Deloitte, McKinsey GCS, KPMG, PwC). Serve external clients — not counted as captive GCCs.</div>
            <div><span className="text-orange-400 font-medium">IFSC Regulated Entity:</span> GIFT City entities regulated by IFSCA — bank branches, exchanges (NSE IFSC, IIBX), and platform providers. Different regulatory and operational profile from a GCC.</div>
          </div>
        </section>
        {/* Map boundaries attribution */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-text-primary mb-3">Map &amp; Cartography</h2>
          <div className="space-y-2 text-sm text-text-secondary leading-relaxed">
            <p>
              The City Explorer interactive map renders vector GeoJSON boundaries offline without external tile servers:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-text-secondary">
              <li>
                <strong className="text-text-primary">India state boundaries:</strong> Sourced from the community-maintained{" "}
                <a
                  href="https://github.com/datameet/maps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal underline underline-offset-2"
                >
                  DataMeet maps repository
                </a>{" "}
                under the Creative Commons Attribution 4.0 International (CC BY 4.0) licence. Reflects the official Survey of India boundary including Jammu &amp; Kashmir and Ladakh.
              </li>
              <li>
                <strong className="text-text-primary">Regional continental context:</strong> Neighbouring country boundaries from{" "}
                <a
                  href="https://www.naturalearthdata.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal underline underline-offset-2"
                >
                  Natural Earth
                </a>{" "}
                (Public Domain / CC0).
              </li>
            </ul>
            <p className="text-text-muted text-xs mt-3">
              Cartographic boundaries are provided for spatial orientation and visualization. All GCC entity profiles, talent metrics, and real estate data are independently sourced.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
