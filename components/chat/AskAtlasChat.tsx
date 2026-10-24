"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Send, RotateCcw, Sparkles, ExternalLink, X, AlertCircle } from "lucide-react";
import type { SourceChip } from "@/lib/retrieval";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChip[];
  isStreaming?: boolean;
  error?: boolean;
}

const STARTER_QUESTIONS = [
  "How many BFSI captive GCCs are in Mumbai?",
  "What incentives does Karnataka offer for a GCC?",
  "Compare Grade A rent and software engineer salaries between Bengaluru and Pune.",
  "Tell me about Goldman Sachs in Bengaluru.",
  "Can a captive tech GCC be set up in GIFT City?",
];

interface Props {
  onClose?: () => void;
}

export function AskAtlasChat({ onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Auto-scroll on new message content
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleSend(textToSend?: string) {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    if (query.length > 500) {
      alert("Question exceeds the 500-character limit.");
      return;
    }

    setInput("");
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const userMsgId = `user-${Date.now()}`;
    const assistantMsgId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: query },
      { id: assistantMsgId, role: "assistant", content: "", isStreaming: true },
    ]);

    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
        signal: ctrl.signal,
      });

      // Parse source chips from header
      const sourcesRaw = res.headers.get("X-Sources");
      let sources: SourceChip[] = [];
      if (sourcesRaw) {
        try {
          sources = JSON.parse(decodeURIComponent(sourcesRaw));
        } catch {
          sources = [];
        }
      }

      if (!res.body) {
        throw new Error("No response body received");
      }

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let accumulated = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += dec.decode(value, { stream: true });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId
              ? { ...m, content: accumulated, sources, isStreaming: true }
              : m
          )
        );
      }

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: accumulated, sources, isStreaming: false }
            : m
        )
      );
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return;

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "Ask Atlas encountered a temporary connection issue. Please try your question again.",
                isStreaming: false,
                error: true,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleClear() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "100vh",
        background: "var(--color-surface)",
        borderRadius: 0,
        border: "none",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* ── Chat Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "1rem 1.5rem",
          borderBottom: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "0.625rem",
              background: "var(--color-teal-muted)",
              border: "1px solid rgba(0, 201, 167, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-teal)",
              flexShrink: 0,
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.0625rem", color: "var(--color-text-primary)" }}>
                Ask Atlas
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  padding: "0.125rem 0.5rem",
                  borderRadius: "9999px",
                  background: "rgba(0, 201, 167, 0.12)",
                  color: "var(--color-teal)",
                  border: "1px solid rgba(0, 201, 167, 0.25)",
                }}
              >
                Grounded AI
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)", marginTop: "0.125rem" }}>
              Answers sourced strictly from the GCC Atlas dataset
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              title="Clear chat"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.4rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                fontSize: "0.75rem",
                fontFamily: "var(--font-sans)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close Ask Atlas"
              style={{
                padding: "0.4rem",
                borderRadius: "0.4rem",
                border: "1px solid var(--color-border)",
                background: "var(--color-surface)",
                color: "var(--color-text-secondary)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              <X size={17} />
            </button>
          )}
        </div>
      </div>

      {/* ── Message Area ─────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.375rem",
        }}
      >
        {messages.length === 0 && (
          <div style={{ margin: "auto 0", padding: "0.75rem 0" }}>
            <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
              <div
                style={{
                  width: "3.25rem",
                  height: "3.25rem",
                  borderRadius: "1rem",
                  background: "var(--color-teal-muted)",
                  border: "1px solid rgba(0, 201, 167, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.875rem",
                  fontSize: "1.625rem",
                }}
              >
                💬
              </div>
              <h3 style={{ fontFamily: "var(--font-sans)", fontWeight: 700, fontSize: "1.125rem", color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
                Ask anything about India&apos;s GCCs
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", maxWidth: "28rem", margin: "0 auto", lineHeight: 1.65 }}>
                Every answer cites exact records, confidence levels, and dates from the dataset. No invented companies or figures.
              </p>
            </div>

            {/* Clickable starter questions */}
            <div>
              <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--color-teal)", marginBottom: "0.75rem" }}>
                Suggested questions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    style={{
                      textAlign: "left",
                      padding: "0.75rem 1rem",
                      borderRadius: "0.5625rem",
                      border: "1px solid var(--color-border)",
                      background: "var(--color-surface-2)",
                      color: "var(--color-text-primary)",
                      fontSize: "0.875rem",
                      fontFamily: "var(--font-sans)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.75rem",
                      lineHeight: 1.5,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-teal)";
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--color-teal-muted)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                      (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)";
                    }}
                  >
                    <span>{q}</span>
                    <span style={{ color: "var(--color-teal)", fontSize: "1rem", flexShrink: 0 }}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: isUser ? "flex-end" : "flex-start",
                gap: "0.375rem",
              }}
            >
              <div
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  padding: "0 0.25rem",
                }}
              >
                {isUser ? "You" : "Atlas"}
              </div>

              <div
                style={{
                  maxWidth: isUser ? "82%" : "94%",
                  padding: "0.9375rem 1.125rem",
                  borderRadius: isUser ? "0.875rem 0.875rem 0.25rem 0.875rem" : "0.875rem 0.875rem 0.875rem 0.25rem",
                  background: isUser ? "var(--color-teal)" : "var(--color-surface-2)",
                  color: isUser ? "#0A0F1E" : "var(--color-text-primary)",
                  border: isUser ? "none" : "1px solid var(--color-border)",
                  fontSize: "0.9rem",
                  lineHeight: 1.7,
                  wordBreak: "break-word",
                  boxShadow: isUser ? "0 2px 10px rgba(0, 201, 167, 0.2)" : "none",
                }}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {m.content}
                  {m.isStreaming && !m.content && (
                    <span style={{ color: "var(--color-text-secondary)", fontStyle: "italic" }}>
                      Searching dataset and synthesizing…
                    </span>
                  )}
                  {m.isStreaming && m.content && (
                    <span style={{ animation: "blink 0.8s step-end infinite", color: "var(--color-teal)", fontWeight: 700 }}>
                      |
                    </span>
                  )}
                </div>

                {m.error && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.5rem", color: "#EF4444", fontSize: "0.75rem" }}>
                    <AlertCircle size={13} />
                    <span>Failed to complete</span>
                  </div>
                )}
              </div>

              {/* Source chips under assistant answer */}
              {!isUser && m.sources && m.sources.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "0.375rem",
                    marginTop: "0.25rem",
                    paddingLeft: "0.25rem",
                  }}
                >
                  <span style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--color-teal)" }}>
                    Sources:
                  </span>
                  {m.sources.map((s) => (
                    <Link
                      key={s.id}
                      href={s.href}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.1875rem 0.5rem",
                        borderRadius: "0.3rem",
                        background: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        color: "var(--color-text-secondary)",
                        fontSize: "0.6875rem",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-teal)";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-teal)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--color-text-secondary)";
                      }}
                    >
                      <span>{s.label}</span>
                      <ExternalLink size={9} style={{ opacity: 0.7 }} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "1rem 1.5rem 1.25rem",
          borderTop: "1px solid var(--color-border)",
          background: "var(--color-surface-2)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.625rem",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "0.75rem",
            padding: "0.625rem 0.875rem",
            transition: "border-color 0.15s ease",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 500))}
            onKeyDown={handleKeyDown}
            placeholder="Ask about cities, GCCs, incentives..."
            rows={1}
            maxLength={500}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "var(--color-text-primary)",
              fontSize: "0.9rem",
              fontFamily: "var(--font-sans)",
              resize: "none",
              outline: "none",
              minHeight: "1.5rem",
              maxHeight: "7rem",
              lineHeight: 1.6,
            }}
          />

          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            aria-label="Send question"
            style={{
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: input.trim() && !loading ? "var(--color-teal)" : "var(--color-surface-2)",
              color: input.trim() && !loading ? "#0A0F1E" : "var(--color-text-secondary)",
              cursor: input.trim() && !loading ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
              flexShrink: 0,
            }}
          >
            <Send size={16} />
          </button>
        </div>

        {/* Character counter & disclaimer note */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "0.5rem",
            fontSize: "0.6875rem",
            color: "var(--color-text-secondary)",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span>Answers come only from the GCC Atlas dataset</span>
          <span style={{ color: input.length > 450 ? "#F59E0B" : "var(--color-text-secondary)" }}>
            {input.length}/500
          </span>
        </div>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}
