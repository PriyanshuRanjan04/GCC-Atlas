import type { Metadata } from "next";
import { AskAtlasChat } from "@/components/chat/AskAtlasChat";

export const metadata: Metadata = {
  title: "Ask Atlas — Grounded AI Intelligence",
  description:
    "Ask questions about India's Global Capability Centres, talent salaries, office rents, and state incentives. Every answer is grounded strictly in the GCC Atlas dataset.",
};

export default function ChatPage() {
  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2.5rem 1rem 4rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span className="section-label" style={{ display: "inline-block", marginBottom: "0.5rem" }}>
          Conversational Intelligence
        </span>
        <h1 className="display-md" style={{ color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
          Ask Atlas
        </h1>
        <p style={{ color: "var(--color-text-secondary)", maxWidth: "38rem", margin: "0 auto", lineHeight: 1.65, fontSize: "0.9375rem" }}>
          A grounded AI research assistant powered by Groq. Ask about cities, talent benchmarks, Grade A rents,
          specific captive GCCs, or state policies — answers cite source records from our verified dataset.
        </p>
      </div>

      {/* Main Chat Interface */}
      <AskAtlasChat embedded={true} />
    </div>
  );
}
