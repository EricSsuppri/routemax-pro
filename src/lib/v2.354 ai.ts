// Shared Gemini AI helper — every v2 AI feature calls askGemini().
// Key is baked in at build time via VITE_GEMINI_API_KEY.
// v2.352: 30s AbortController timeout + one retry on timeout/network failure.
// v2.354: reverted to gemini-3.5-flash (2.5-flash is retired for new accounts — 404); added exponential
// backoff retries (2s, 4s, 8s) for 429/503 so free-tier demand spikes
// resolve on their own instead of surfacing an error.

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL = "gemini-3.5-flash";

export const isAiConfigured = Boolean(GEMINI_KEY);

/** Strip markdown code fences some models wrap around JSON replies. */
function cleanJson(text: string): string {
  return text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function askGemini(prompt: string, imageBase64?: string, jsonMode = true): Promise<string> {
  if (!GEMINI_KEY) throw new Error("AI is not configured (missing API key).");
  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  if (imageBase64) {
    parts.push({ inline_data: { mime_type: "image/jpeg", data: imageBase64 } });
  }
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_KEY}`;
  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: jsonMode
      ? { responseMimeType: "application/json", temperature: 0.3 }
      : { temperature: 0.7 },
  });

  // 429 (quota) and 503 (demand spike) are transient: back off and retry.
  const transientDelays = [2000, 4000, 8000];
  let transientRetries = 0;
  let netRetries = 0;

  for (;;) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: ctrl.signal,
      });
    } catch (e) {
      clearTimeout(timer);
      const aborted = e instanceof DOMException && e.name === "AbortError";
      const netErr =
        e instanceof Error &&
        (/failed to fetch/i.test(e.message) || /networkerror/i.test(e.message));
      // One retry on timeout / network failure, then give up.
      if ((aborted || netErr) && netRetries === 0) {
        netRetries++;
        await sleep(1500);
        continue;
      }
      throw e instanceof Error ? e : new Error("AI request failed.");
    }
    clearTimeout(timer);

    if (res.status === 429 || res.status === 503) {
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
    if (!res.ok) {
      // 400/401/403 (bad key, etc.) fail immediately — retrying won't help.
      const detail = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 120)}`);
    }
    const json = await res.json();
    const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
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
