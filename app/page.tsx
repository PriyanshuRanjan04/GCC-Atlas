import { getHeadlineStats } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const stats = getHeadlineStats();

  return (
    <div style={{ position: "relative" }}>
      {/* Radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 900px 500px at 50% -80px, rgba(0,201,167,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "6rem 1rem 5rem",
          textAlign: "center",
        }}
      >
        <span className="section-label" style={{ marginBottom: "1.5rem", display: "block" }}>
          India GCC Intelligence Platform
        </span>

        <h1
          className="display-xl teal-glow"
          style={{ color: "var(--color-text-primary)", marginBottom: "1.375rem" }}
        >
          Where Global Companies
          <br />
          <span style={{ color: "var(--color-teal)" }}>Build in India</span>
        </h1>

        <p
          style={{
            fontSize: "1.0625rem",
            color: "var(--color-text-secondary)",
            maxWidth: "38rem",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Research cities, compare incentives, and find the right hub for your
          Global Capability Centre — all from one transparent, sourced dataset.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/directory" className="btn-primary" style={{ fontSize: "1rem", padding: "0.75rem 1.75rem" }}>
            Explore Directory
          </Link>
          <Link href="/cities" className="btn-secondary" style={{ fontSize: "1rem", padding: "0.75rem 1.75rem" }}>
            Compare Cities
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: "4rem",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            maxWidth: "36rem",
            margin: "4rem auto 0",
          }}
        >
          {[
            { value: stats.captiveGCCsInDataset, label: "Captive GCCs", sub: "in dataset" },
            { value: stats.citiesCovered,         label: "Cities Covered", sub: "across India" },
            { value: stats.statesWithIncentiveData, label: "State Incentive", sub: "records" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "1.375rem 1rem", textAlign: "center" }}>
              <div
                className="stat-num"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 800,
                  fontSize: "2.5rem",
                  color: "var(--color-teal)",
                  lineHeight: 1,
                  marginBottom: "0.375rem",
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-primary)" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.125rem" }}>
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Problem ───────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "5rem 1rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <div style={{ maxWidth: "44rem", margin: "0 auto", textAlign: "center" }}>
          <span className="section-label" style={{ marginBottom: "1rem", display: "block" }}>
            The Problem
          </span>
          <h2
            className="display-md"
            style={{ color: "var(--color-text-primary)", marginBottom: "1.5rem" }}
          >
            India's GCC data is fragmented
          </h2>
          <p
            style={{
              color: "var(--color-text-secondary)",
              fontSize: "1.0625rem",
              lineHeight: 1.75,
              marginBottom: "1.125rem",
            }}
          >
            Decisions about where to build a Global Capability Centre in India are
            driven by referrals, anecdote, and scattered consultant PDFs.
          </p>
          <p style={{ color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
            GCC Atlas aggregates what's publicly known, labels every figure with its
            confidence level and source, and is honest about what isn't disclosed.
            No hallucinated headcounts. No stale estimates presented as facts.
          </p>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "5rem 1rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <span className="section-label" style={{ display: "block", textAlign: "center", marginBottom: "1rem" }}>
          What's Inside
        </span>
        <h2
          className="display-md"
          style={{ textAlign: "center", color: "var(--color-text-primary)", marginBottom: "3rem" }}
        >
          Four tools. One platform.
        </h2>

        {/* Cards — equal height and padding */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.25rem",
            alignItems: "stretch",
          }}
        >
          {[
            {
              icon: "🗂️",
              title: "GCC Directory",
              desc: "68 captive GCC profiles across 7 cities. Search and filter by industry, country, entity type, and confidence. Every record has source links.",
            },
            {
              icon: "🏙️",
              title: "City Explorer",
              desc: "Side-by-side city intelligence: talent salary ranges, Grade A rent, state incentives, and captive GCC density — all sourced.",
            },
            {
              icon: "🧭",
              title: "Setup Advisor",
              desc: "Answer a few questions about industry, team size, budget and priorities, and get a ranked city shortlist with transparent scoring and an AI explanation based only on the dataset.",
            },
            {
              icon: "💬",
              title: "Ask Atlas",
              desc: "Ask questions in plain language and get answers grounded only in our dataset, with source citations and confidence ratings.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="card card-subtle-hover"
              style={{
                padding: "1.75rem",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                cursor: "default",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>{f.icon}</div>
              <h3
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "1.0625rem",
                  color: "var(--color-text-primary)",
                  marginBottom: "0.5rem",
                  letterSpacing: "-0.005em",
                }}
              >
                {f.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
