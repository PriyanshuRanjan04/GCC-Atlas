"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/directory", label: "Directory" },
  { href: "/cities", label: "City Explorer" },
  { href: "/methodology", label: "Methodology" },
  { href: "/advisor", label: "Setup Advisor" },
  { href: "/chat", label: "Ask Atlas" },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas/80 backdrop-blur-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group" onClick={() => setOpen(false)}>
          <span className="w-7 h-7 rounded-lg bg-teal flex items-center justify-center text-text-inverse font-display font-bold text-sm">
            G
          </span>
          <span className="font-display font-bold text-base text-text-primary tracking-tight group-hover:text-teal transition-colors">
            GCC Atlas
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const isComingSoon = link.href === "/advisor" || link.href === "/chat";
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3.5 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "text-teal bg-teal-muted"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-2",
                  isComingSoon && "opacity-60"
                )}
              >
                {link.label}
                {isComingSoon && (
                  <span className="absolute -top-1.5 -right-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-surface border border-border text-teal leading-none">
                    Soon
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-canvas px-4 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => {
            const isComingSoon = link.href === "/advisor" || link.href === "/chat";
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive ? "text-teal bg-teal-muted" : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                )}
              >
                {link.label}
                {isComingSoon && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-teal">
                    Coming next phase
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
