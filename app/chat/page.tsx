import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ask Atlas — Coming Soon",
  description: "Conversational GCC intelligence — ask questions about cities, incentives, and GCC profiles.",
};

export default function ChatPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
      <div className="relative inline-block mb-8">
        <div className="w-20 h-20 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto">
          <span className="text-4xl">💬</span>
        </div>
        <span className="absolute -top-2 -right-2 text-xs font-bold px-2 py-1 rounded-full bg-surface border border-border text-teal">
          Next Phase
        </span>
      </div>

      <h1 className="font-display font-extrabold text-display-sm text-text-primary mb-4">
        Ask Atlas
      </h1>
      <p className="text-text-secondary leading-relaxed mb-6">
        A structured chat interface grounded in the GCC Atlas dataset. Ask about cities, incentives,
        specific companies, or talent benchmarks — and get sourced, honest answers.
      </p>

      <div className="card p-6 text-left mb-8 space-y-3">
        <p className="text-sm font-semibold text-text-muted uppercase tracking-wide">Example questions</p>
        {[
          '"Which city has the deepest talent pool for semiconductor design?"',
          '"What incentives does Telangana offer for a 500-person GCC?"',
          '"Compare Pune and Chennai for an automotive ER&D centre."',
          '"How many BFSI captive GCCs are in Mumbai?"',
        ].map((q) => (
          <div key={q} className="flex gap-2.5 text-sm text-text-secondary italic">
            <span className="text-teal/60 shrink-0 not-italic">→</span> {q}
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mb-6">
        Will use the Groq API with the GCC Atlas dataset as context. Not connected yet.
      </p>

      <Link href="/cities" className="btn-primary">
        Explore Cities in the meantime
      </Link>
    </div>
  );
}
