"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import type { GCCRecord } from "@/lib/types";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { EntityTypeBadge } from "@/components/ui/EntityTypeBadge";
import Link from "next/link";
import { Search, X } from "lucide-react";

interface Props {
  gccs: GCCRecord[];
}

const SRK: Record<string, string> = {
  q: "",
  city: "",
  industry: "",
  country: "",
  confidence: "",
  sort: "city",
  ecosystem: "",
};

function Select({
  id,
  value,
  onChange,
  style,
  children,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="select-field"
      style={style}
    >
      {children}
    </select>
  );
}

export function DirectoryClient({ gccs }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const q = searchParams.get("q") ?? "";
  const city = searchParams.get("city") ?? "";
  const industry = searchParams.get("industry") ?? "";
  const country = searchParams.get("country") ?? "";
  const confidence = searchParams.get("confidence") ?? "";
  const sort = searchParams.get("sort") ?? "city";
  const showEcosystem = searchParams.get("ecosystem") === "1";

  // Options derived from data
  const cities = useMemo(
    () => [...new Set(gccs.map((r) => r.city))].sort(),
    [gccs]
  );
  const industries = useMemo(
    () =>
      [...new Set(gccs.filter((r) => r.entity_type === "captive_gcc").map((r) => r.industry))].sort(),
    [gccs]
  );
  const countries = useMemo(
    () =>
      [...new Set(gccs.filter((r) => r.entity_type === "captive_gcc").map((r) => r.parent_country))].sort(),
    [gccs]
  );

  // URL param helpers
  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    const def = SRK[key] ?? "";
    if (value && value !== def) params.set(key, value);
    else params.delete(key);
    startTransition(() => {
      router.replace(`/directory${params.size ? `?${params}` : ""}`, {
        scroll: false,
      });
    });
  }

  function clearAll() {
    startTransition(() => {
      router.replace("/directory", { scroll: false });
    });
  }

  const hasFilters =
    !!(q || city || industry || country || confidence || showEcosystem) ||
    sort !== "city";

  // Filter
  const filtered = useMemo(() => {
    let results = gccs;

    if (!showEcosystem) {
      results = results.filter((r) => r.entity_type === "captive_gcc");
    }

    if (q) {
      const lq = q.toLowerCase();
      results = results.filter(
        (r) =>
          r.company_name.toLowerCase().includes(lq) ||
          r.entity_name_india.toLowerCase().includes(lq) ||
          r.parent_country.toLowerCase().includes(lq) ||
          r.industry.toLowerCase().includes(lq) ||
          (r.location_detail ?? "").toLowerCase().includes(lq) ||
          r.functions.some((f) => f.toLowerCase().includes(lq))
      );
    }

    if (city) results = results.filter((r) => r.city === city);
    if (industry) results = results.filter((r) => r.industry === industry);
    if (country) results = results.filter((r) => r.parent_country === country);
    if (confidence) results = results.filter((r) => r.confidence === confidence);

    return [...results].sort((a, b) => {
      if (sort === "name") return a.company_name.localeCompare(b.company_name);
      return a.city.localeCompare(b.city) || a.company_name.localeCompare(b.company_name);
    });
  }, [gccs, q, city, industry, country, confidence, sort, showEcosystem]);

  const captiveTotal = gccs.filter((r) => r.entity_type === "captive_gcc").length;

  return (
    <div>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="card" style={{ padding: "1rem", marginBottom: "1.5rem" }}>
        {/* Row 1: search + dropdowns */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.625rem",
            marginBottom: "0.75rem",
          }}
        >
          {/* Text search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "180px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-muted)",
                pointerEvents: "none",
              }}
            />
            <input
              id="directory-search"
              type="text"
              placeholder="Search companies, industries, locations…"
              value={q}
              onChange={(e) => setParam("q", e.target.value)}
              className="input-field"
              style={{ paddingLeft: "2.25rem" }}
            />
          </div>

          <Select id="city-filter" value={city} onChange={(v) => setParam("city", v)} style={{ minWidth: "140px" }}>
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Select id="industry-filter" value={industry} onChange={(v) => setParam("industry", v)} style={{ minWidth: "150px" }}>
            <option value="">All industries</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </Select>

          <Select id="country-filter" value={country} onChange={(v) => setParam("country", v)} style={{ minWidth: "140px" }}>
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>

          <Select id="confidence-filter" value={confidence} onChange={(v) => setParam("confidence", v)} style={{ minWidth: "135px" }}>
            <option value="">All confidence</option>
            <option value="verified">Verified</option>
            <option value="reported">Reported</option>
            <option value="estimated">Estimated</option>
          </Select>

          <Select id="sort-control" value={sort} onChange={(v) => setParam("sort", v)} style={{ minWidth: "130px" }}>
            <option value="city">Sort: City</option>
            <option value="name">Sort: Name A–Z</option>
          </Select>
        </div>

        {/* Row 2: ecosystem toggle + result count + clear */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {/* Toggle */}
          <label
            htmlFor="ecosystem-toggle"
            style={{ display: "flex", alignItems: "center", gap: "0.625rem", cursor: "pointer" }}
          >
            <button
              id="ecosystem-toggle"
              role="switch"
              aria-checked={showEcosystem}
              onClick={() => setParam("ecosystem", showEcosystem ? "" : "1")}
              style={{
                width: "2.125rem",
                height: "1.25rem",
                borderRadius: "9999px",
                border: "none",
                cursor: "pointer",
                padding: 0,
                position: "relative",
                background: showEcosystem ? "var(--color-teal)" : "var(--color-border)",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "0.125rem",
                  left: showEcosystem ? "0.9375rem" : "0.125rem",
                  width: "1rem",
                  height: "1rem",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                }}
              />
            </button>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              Include ecosystem entities
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
              (professional services delivery, IFSC regulated)
            </span>
          </label>

          {/* Count + clear */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)" }}>
              <span
                className="stat-num"
                style={{ fontWeight: 700, color: "var(--color-text-primary)" }}
              >
                {filtered.length}
              </span>
              {" "}result{filtered.length !== 1 ? "s" : ""}
              <span style={{ color: "var(--color-text-muted)" }}>
                {" "}of {showEcosystem ? gccs.length : captiveTotal}{" "}
                {showEcosystem ? "total" : "captive GCCs"}
              </span>
            </span>

            {hasFilters && (
              <button
                onClick={clearAll}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3125rem",
                  padding: "0.3125rem 0.75rem",
                  borderRadius: "0.375rem",
                  border: "1px solid var(--color-border)",
                  background: "var(--color-surface-2)",
                  color: "var(--color-text-secondary)",
                  fontSize: "0.8125rem",
                  fontFamily: "var(--font-sans)",
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
              >
                <X size={12} />
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        // Empty state
        <div style={{ textAlign: "center", padding: "5rem 1rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1.25rem" }}>🔍</div>
          <h3
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 600,
              fontSize: "1.125rem",
              color: "var(--color-text-primary)",
              marginBottom: "0.625rem",
            }}
          >
            No results found
          </h3>
          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              marginBottom: "1.75rem",
              maxWidth: "28rem",
              margin: "0 auto 1.75rem",
              lineHeight: 1.65,
            }}
          >
            No GCCs match your current filters. Try broadening your search or
            clearing one of the dropdowns.
          </p>
          <button onClick={clearAll} className="btn-primary">
            Clear all filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((gcc) => (
            <Link
              key={gcc.id}
              href={`/directory/${gcc.id}`}
              className="card card-hover"
              style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", textDecoration: "none" }}
            >
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      color: "var(--color-text-primary)",
                      lineHeight: 1.35,
                      transition: "color 0.15s",
                    }}
                    className="group-hover:text-teal"
                  >
                    {gcc.company_name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                      marginTop: "0.1875rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {gcc.city} · {gcc.parent_country}
                  </div>
                </div>
                <ConfidenceBadge confidence={gcc.confidence} size="sm" />
              </div>

              {/* Industry */}
              <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                {gcc.industry}
              </div>

              {/* Tags row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.375rem",
                  marginTop: "auto",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--color-border)",
                }}
              >
                <EntityTypeBadge entityType={gcc.entity_type} size="sm" />
                {gcc.functions.length > 0 && (
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      padding: "0.1875rem 0.5rem",
                      borderRadius: "0.3rem",
                      background: "var(--color-surface-2)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-text-muted)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "10rem",
                    }}
                  >
                    {gcc.functions.slice(0, 2).join(", ")}
                    {gcc.functions.length > 2 ? " …" : ""}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
