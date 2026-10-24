/**
 * lib/llm.ts
 * Groq API wrapper — server-side only. Never import in client components.
 * Reads GROQ_API_KEY from process.env; never logs or exposes it.
 *
 * Model: qwen/qwen3.8-27b
 *   Groq supported 27B chat/instruct model with high token throughput and low latency.
 */

export const MODEL_ID = "qwen/qwen3.8-27b";

const GROQ_BASE = "https://api.groq.com/openai/v1";
const TIMEOUT_MS = 28_000;

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMErrorResult {
  error: "rate_limited" | "unavailable";
  message?: string;
}

export type StreamResult = ReadableStream<Uint8Array> | LLMErrorResult;

/** Narrows a StreamResult to the error case. */
export function isError(r: StreamResult): r is LLMErrorResult {
  return !isStream(r);
}

function isStream(r: StreamResult): r is ReadableStream<Uint8Array> {
  return typeof (r as ReadableStream<Uint8Array>).getReader === "function";
}

/**
 * Call Groq with streaming. Returns a ReadableStream of raw text chunks
 * (SSE already stripped) or an LLMErrorResult.
 *
 * Retries once on network / 5xx errors.
 * On HTTP 429 returns { error: "rate_limited" } immediately — no retry.
 */
export async function streamCompletion(
  messages: LLMMessage[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<StreamResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error("[Groq] GROQ_API_KEY is not configured in process.env");
    return { error: "unavailable", message: "GROQ_API_KEY is not configured" };
  }

  for (let attempt = 0; attempt <= 1; attempt++) {
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), TIMEOUT_MS);

    try {
      const res = await fetch(`${GROQ_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL_ID,
          messages,
          stream: true,
          max_tokens: opts.maxTokens ?? 900,
          temperature: opts.temperature ?? 0.25,
        }),
        signal: abort.signal,
      });

      clearTimeout(timer);

      if (res.status === 429) {
        let errorDetail = "";
        try {
          const errData = await res.json();
          errorDetail = errData.error?.message || JSON.stringify(errData);
        } catch {
          errorDetail = await res.text().catch(() => "");
        }
        console.error(`[Groq HTTP 429 Rate Limit]: ${errorDetail}`);
        return { error: "rate_limited", message: errorDetail };
      }

      if (!res.ok) {
        let errorDetail = "";
        try {
          const errData = await res.json();
          errorDetail = errData.error?.message || JSON.stringify(errData);
        } catch {
          errorDetail = await res.text().catch(() => "");
        }
        console.error(`[Groq HTTP ${res.status} Error]: ${errorDetail}`);

        if (attempt === 0 && res.status >= 500) {
          await sleep(700);
          continue;
        }
        return { error: "unavailable", message: `Groq ${res.status}: ${errorDetail}` };
      }

      // Convert SSE → plain text stream
      const upstream = res.body!;
      return new ReadableStream<Uint8Array>({
        async start(ctrl) {
          const reader = upstream.getReader();
          const dec = new TextDecoder();
          const enc = new TextEncoder();
          let buf = "";
          try {
            for (;;) {
              const { done, value } = await reader.read();
              if (done) break;
              buf += dec.decode(value, { stream: true });
              const lines = buf.split("\n");
              buf = lines.pop() ?? "";
              for (const line of lines) {
                const t = line.trim();
                if (!t.startsWith("data: ")) continue;
                const payload = t.slice(6);
                if (payload === "[DONE]") continue;
                try {
                  const chunk = JSON.parse(payload);
                  const text: string = chunk.choices?.[0]?.delta?.content ?? "";
                  if (text) ctrl.enqueue(enc.encode(text));
                } catch {
                  /* malformed chunk — skip */
                }
              }
            }
          } finally {
            ctrl.close();
          }
        },
      });
    } catch (err) {
      clearTimeout(timer);
      if (attempt === 0) {
        await sleep(700);
        continue;
      }
      const msg = err instanceof Error ? err.message : "Network error";
      return { error: "unavailable", message: msg };
    }
  }

  return { error: "unavailable", message: "Max retries exceeded" };
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}
