"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/cities", label: "City Explorer" },
  { href: "/methodology", label: "Methodology" },
  { href: "/advisor", label: "Setup Advisor", soon: true },
  { href: "/chat", label: "Ask Atlas", soon: true },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* ── Desktop nav ─────────────────────────────────────────────────── */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "0 1rem 0 0.75rem",
          height: "3.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        {/* Logo — sits at the left content-column edge */}
        <Link
          href="/"
          onClick={() => setOpen(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: "1.75rem",
              height: "1.75rem",
              borderRadius: "0.4rem",
              background: "var(--color-teal)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "0.875rem",
              color: "var(--color-text-inverse)",
              flexShrink: 0,
            }}
          >
            G
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "-0.01em",
              color: "var(--color-text-primary)",
            }}
          >
            GCC Atlas
          </span>
        </Link>

        {/* Desktop links — right-aligned */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.125rem",
          }}
          className="hidden md:flex"
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  position: "relative",
                  padding: "0.4375rem 0.875rem",
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-teal)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-teal-muted)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                  opacity: link.soon ? 0.65 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.target as HTMLAnchorElement).style.color = "var(--color-text-primary)";
                    (e.target as HTMLAnchorElement).style.background = "var(--color-surface-2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.target as HTMLAnchorElement).style.color = "var(--color-text-secondary)";
                    (e.target as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
                {link.soon && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-0.375rem",
                      right: "-0.25rem",
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      padding: "0.0625rem 0.3125rem",
                      borderRadius: "0.25rem",
                      background: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-teal)",
                      lineHeight: 1.4,
                      letterSpacing: "0.04em",
                    }}
                  >
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          style={{
            padding: "0.5rem",
            borderRadius: "0.5rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────────────── */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-canvas)",
            padding: "0.75rem 1rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.625rem 1rem",
                  borderRadius: "0.625rem",
                  fontSize: "0.9375rem",
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "var(--color-teal)" : "var(--color-text-secondary)",
                  background: isActive ? "var(--color-teal-muted)" : "transparent",
                  textDecoration: "none",
                }}
              >
                {link.label}
                {link.soon && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-teal)", opacity: 0.8 }}>
                    Coming soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
