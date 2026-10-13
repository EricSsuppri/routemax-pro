// Shared AI helper — every v2 AI feature calls askGemini().
// v2.356: switched provider from Gemini to Groq (free tier, no card needed).
// Uses Groq's OpenAI-compatible API. Key baked in at build time via VITE_GROQ_API_KEY.
// Text model: llama-3.3-70b-versatile. Vision model: meta-llama/llama-4-scout-17b-16e-instruct.
// The askGemini export name is kept so all call sites in App.tsx stay untouched.

const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY as string | undefined;
const TEXT_MODEL = "llama-3.3-70b-versatile";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export const isAiConfigured = Boolean(GROQ_KEY);

/** Strip markdown code fences some models wrap around JSON replies. */
function cleanJson(text: string): string {
  return text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function askGemini(prompt: string, imageBase64?: string, jsonMode = true): Promise<string> {
  if (!GROQ_KEY) throw new Error("AI is not configured (missing API key).");
  const model = imageBase64 ? VISION_MODEL : TEXT_MODEL;
  const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
  if (imageBase64) {
    content.push({
      type: "image_url",
      image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
    });
  }
  const body: Record<string, unknown> = {
    model,
    messages: [{ role: "user", content }],
    temperature: jsonMode ? 0.3 : 0.7,
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  // 503/502 (demand spike): back off and retry. 429 (rate limit): one
  // retry after 30s — hammering a rate limit extends the lockout.
  const transientDelays = [2000, 4000, 8000];
  let transientRetries = 0;
  let rateLimitRetries = 0;
  let netRetries = 0;

  for (;;) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_KEY}`,
        },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof DOMException && e.name === "AbortError";
      const netErr =
        e instanceof Error &&
        (/failed to fetch/i.test(e.message) || /networkerror/i.test(e.message));
      if ((aborted || netErr) && netRetries === 0) {
        netRetries++;
        await sleep(1500);
        continue;
      }
      throw e instanceof Error ? e : new Error("AI request failed.");
    }
    clearTimeout(timer);

    if (res.status === 503 || res.status === 502) {
      if (transientRetries < transientDelays.length) {
        await sleep(transientDelays[transientRetries]);
        transientRetries++;
        continue;
      }
      const detail = await res.text().catch(() => "");
      throw new Error(
        `AI is busy right now (HTTP ${res.status}). Try again in a moment. ${detail.slice(0, 120)}`
      );
    }
    if (res.status === 429) {
      if (rateLimitRetries === 0) {
        rateLimitRetries++;
        await sleep(30000);
        continue;
      }
      const detail = await res.text().catch(() => "");
      throw new Error(
        `AI is busy right now (HTTP 429). Try again in a moment. ${detail.slice(0, 120)}`
      );
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 120)}`);
    }
    const json = await res.json();
    const text: string = json.choices?.[0]?.message?.content ?? "";
    return cleanJson(text);
  }
}

/** Parse the model's JSON reply, throwing a friendly error on bad output. */
export function parseAiJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("AI returned an unreadable response. Try again.");
  }
}
