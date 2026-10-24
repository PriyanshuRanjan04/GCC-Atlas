"use client";

import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { AskAtlasChat } from "./AskAtlasChat";

export function FloatingAskAtlas() {
  const [open, setOpen] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && open) setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Lock body scroll when drawer is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ── Floating Launcher Button ────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open Ask Atlas grounded AI chat"
        className="floating-ask-atlas-btn"
        style={{
          position: "fixed",
          bottom: "1.75rem",
          right: "1.75rem",
          zIndex: 45,
          display: open ? "none" : "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6875rem 1.125rem",
          borderRadius: "9999px",
          background: "var(--color-teal)",
          color: "#0A0F1E",
          border: "none",
          fontFamily: "var(--font-sans)",
          fontWeight: 700,
          fontSize: "0.875rem",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0, 201, 167, 0.45)",
          transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <Sparkles size={16} />
        </span>
        <span>Ask Atlas</span>
      </button>

      {/* ── Slide-Over Side Drawer ─────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(10, 15, 30, 0.75)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
            }}
          />

          {/* Drawer — 500px desktop, 100vw mobile */}
          <div
            className="ask-atlas-drawer"
            style={{
              position: "relative",
              width: "500px",
              maxWidth: "100vw",
              height: "100%",
              background: "var(--color-surface)",
              borderLeft: "1px solid var(--color-border)",
              boxShadow: "-8px 0 40px rgba(0, 0, 0, 0.65)",
              display: "flex",
              flexDirection: "column",
              zIndex: 65,
              animation: "slideInRight 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <AskAtlasChat onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      <style>{`
        .floating-ask-atlas-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 6px 24px rgba(0, 201, 167, 0.6) !important;
        }
        .floating-ask-atlas-btn:active {
          transform: translateY(0) scale(0.98);
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0);    }
        }

        @media (max-width: 768px) {
          .ask-atlas-drawer {
            width: 100vw !important;
            border-left: none !important;
          }
          .floating-ask-atlas-btn {
            bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px)) !important;
            right: calc(1.25rem + env(safe-area-inset-right, 0px)) !important;
            padding: 0.625rem 1rem !important;
          }
        }
      `}</style>
    </>
  );
}
