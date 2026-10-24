import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-canvas mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-md bg-teal flex items-center justify-center text-text-inverse font-display font-bold text-xs">
                G
              </span>
              <span className="font-display font-bold text-sm text-text-primary">GCC Atlas</span>
            </div>
            <p className="text-xs text-text-muted max-w-xs">
              Seed dataset: sourced from public reports and news, not exhaustive.
              Salary and rent figures are estimates.{" "}
              <Link href="/methodology" className="text-teal hover:underline">
                Methodology →
              </Link>
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted">
            <Link href="/directory" className="hover:text-teal transition-colors">Directory</Link>
            <Link href="/cities" className="hover:text-teal transition-colors">City Explorer</Link>
            <Link href="/methodology" className="hover:text-teal transition-colors">Methodology</Link>
            <Link href="/advisor" className="hover:text-teal transition-colors opacity-60">Setup Advisor (soon)</Link>
            <Link href="/chat" className="hover:text-teal transition-colors opacity-60">Ask Atlas (soon)</Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-xs text-text-muted">
          <span>© 2026 GCC Atlas. Prototype — not for investment decisions.</span>
          <span className="text-teal/60 font-mono">v0.1.0-alpha</span>
        </div>
      </div>
    </footer>
  );
}
