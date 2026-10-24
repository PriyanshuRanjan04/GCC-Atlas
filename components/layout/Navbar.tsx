"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/cities", label: "City Explorer" },
  { href: "/advisor", label: "Setup Advisor" },
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
        width: "100%",
        borderBottom: "1px solid var(--color-border)",
        backgroundColor: "rgba(10,15,30,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* ── Full width header with 28px consistent side padding ── */}
      <div
        style={{
          width: "100%",
          padding: "0 1.75rem", // 28px side padding (within the 24-32px range)
          height: "3.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
        }}
      >
        {/* Logo — sits at the far left edge of padded area */}
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

        {/* Desktop links — far right */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
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
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger button */}
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

      {/* ── Mobile menu ── */}
      {open && (
        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            background: "var(--color-canvas)",
            padding: "0.75rem 1.25rem",
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
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
