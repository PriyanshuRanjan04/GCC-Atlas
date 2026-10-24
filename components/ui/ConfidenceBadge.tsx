"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Confidence } from "@/lib/types";

interface Props {
  confidence: Confidence;
  size?: "sm" | "md";
}

const TOOLTIPS: Record<Confidence, string> = {
  verified:
    "Verified — confirmed on an official company or government page during research.",
  reported:
    "Reported — from a news article, GCC directory, or consultant report. The full source page was not always directly fetched.",
  estimated:
    "Estimated — inferred or calculated from secondary data (e.g. a national figure split by city). Treat with extra caution.",
};

const STYLES: Record<
  Confidence,
  { bg: string; color: string; dot: string }
> = {
  verified:  { bg: "rgba(0,201,167,0.12)",  color: "#00C9A7", dot: "#00C9A7" },
  reported:  { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", dot: "#F59E0B" },
  estimated: { bg: "rgba(248,113,113,0.12)", color: "#F87171", dot: "#F87171" },
};

export function ConfidenceBadge({ confidence, size = "md" }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const s = STYLES[confidence];
  const padding = size === "sm" ? "0.125rem 0.5rem" : "0.1875rem 0.625rem";
  const dotSize = size === "sm" ? "6px" : "7px";
  const fontSize = "0.6875rem";

  return (
    <span
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{
        position: "relative",
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
          opacity: 0.75,
          marginLeft: "0.0625rem",
        }}
        aria-label="Hover for explanation"
      >
        ⓘ
      </span>

      {/* Interactive Tooltip with "How we rate confidence →" link */}
      {showTooltip && (
        <span
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            paddingBottom: "6px",
            zIndex: 100,
            pointerEvents: "auto",
          }}
        >
          <span
            style={{
              display: "block",
              width: "240px",
              padding: "0.5625rem 0.6875rem",
              borderRadius: "0.45rem",
              background: "rgba(17, 24, 39, 0.98)",
              border: "1px solid var(--color-border)",
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.65)",
              color: "var(--color-text-secondary)",
              fontSize: "0.75rem",
              fontWeight: 400,
              lineHeight: 1.5,
              whiteSpace: "normal",
              textAlign: "left",
            }}
          >
            <span style={{ display: "block", marginBottom: "0.375rem" }}>
              {TOOLTIPS[confidence]}
            </span>
            {/* Use a <button> not <Link>/<a> so this is safe when nested inside another <a> (e.g. GCC card links) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                router.push("/methodology");
              }}
              style={{
                display: "inline-block",
                background: "none",
                border: "none",
                padding: 0,
                color: "var(--color-teal)",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                fontSize: "inherit",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              How we rate confidence →
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
