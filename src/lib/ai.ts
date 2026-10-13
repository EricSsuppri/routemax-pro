// Shared Gemini AI helper — every v2 AI feature calls askGemini().
// Model: gemini-3.5-flash. Key is baked in at build time via VITE_GEMINI_API_KEY.
// v2.352: added 30s AbortController timeout + one retry on timeout/network
// failure, so a hung API can never leave the UI spinning for minutes.

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL = "gemini-3.5-flash";

export const isAiConfigured = Boolean(GEMINI_KEY);

/** Strip markdown code fences some models wrap around JSON replies. */
function cleanJson(text: string): string {
  return text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "").trim();
}

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

  // One attempt + one retry. 30s cap per attempt so a stalled API fails
  // fast instead of hanging the "Scanning..." UI for minutes. Only
  // timeouts / network errors are retried — HTTP errors (429 quota, 400
  // bad key, etc.) throw immediately.
  let lastErr: unknown = new Error("AI request failed.");
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 30000);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        throw new Error(`AI request failed (${res.status}). ${detail.slice(0, 120)}`);
      }
      const json = await res.json();
      const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      return cleanJson(text);
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      const aborted = e instanceof DOMException && e.name === "AbortError";
      const netErr =
        e instanceof Error &&
        (/failed to fetch/i.test(e.message) || /networkerror/i.test(e.message));
      if ((!aborted && !netErr) || attempt === 1) break;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("AI request failed.");
}

/** Parse the model's JSON reply, throwing a friendly error on bad output. */
export function parseAiJson<T>(text: string): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("AI returned an unreadable response. Try again.");
  }
}
