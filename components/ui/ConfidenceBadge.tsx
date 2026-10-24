import type { Confidence } from "@/lib/types";

interface Props {
  confidence: Confidence;
  size?: "sm" | "md";
}

const TOOLTIPS: Record<Confidence, string> = {
  verified:
    "Verified — confirmed on an official company or government page during this research session (currently 3 records).",
  reported:
    "Reported — from a news article, GCC directory, or consultant report. The full source page was not always directly fetched.",
  estimated:
    "Estimated — inferred or calculated from secondary data (e.g. a national figure split by city). Treat with extra caution.",
};

const STYLES: Record<
  Confidence,
  { bg: string; color: string; dot: string }
> = {
  verified:  { bg: "rgba(0,201,167,0.10)",   color: "#00C9A7", dot: "#00C9A7" },
  reported:  { bg: "rgba(245,158,11,0.10)",  color: "#F59E0B", dot: "#F59E0B" },
  estimated: { bg: "rgba(248,113,113,0.10)", color: "#F87171", dot: "#F87171" },
};

export function ConfidenceBadge({ confidence, size = "md" }: Props) {
  const s = STYLES[confidence];
  const padding = size === "sm" ? "0.125rem 0.5rem" : "0.1875rem 0.625rem";
  const dotSize = size === "sm" ? "6px" : "7px";
  const fontSize = "0.6875rem";

  return (
    <span
      title={TOOLTIPS[confidence]}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3125rem",
        borderRadius: "9999px",
        fontSize,
        fontFamily: "var(--font-sans)",
        fontWeight: 600,
        letterSpacing: "0.02em",
        padding,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}35`,
        whiteSpace: "nowrap",
        cursor: "help",
        userSelect: "none",
      }}
    >
      <span
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: "50%",
          background: s.dot,
          flexShrink: 0,
        }}
      />
      {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
      <span
        style={{
          fontSize: "0.625rem",
          opacity: 0.7,
          marginLeft: "0.0625rem",
        }}
        aria-label="Hover for explanation"
      >
        ⓘ
      </span>
    </span>
  );
}
