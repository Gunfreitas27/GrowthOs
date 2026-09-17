// Free-tier models often wrap JSON in a markdown code fence even when told
// to respond with only JSON — strip ```json ... ``` / ``` ... ``` before
// parsing instead of failing outright. Shared by anything that asks a skill
// for strict JSON (lib/maturity/scorer.ts, lib/business-context/estimate-market-sizing.ts).
export function extractJson<T>(content: string): T | null {
  const fenced = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  const candidate = fenced ? fenced[1] : content;
  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    return null;
  }
}
