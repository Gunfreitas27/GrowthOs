export interface ParsedLensSummary {
  headline: string | null;
  metric: string | null;
  bullets: string[];
  fullReport: string;
}

// Research prompts (brand-research-skill.ts) ask the model to open its
// response with a "## Resumo" block (manchete/métrica-chave/bullets) before
// the full detailed report. Parses that block out so the UI can show the
// "aha moment" first and the full markdown behind an expander. Tolerant by
// design: free-tier models (and any data saved before this format existed)
// won't always follow it — when the block isn't found, everything falls
// back to fullReport with no headline, which the UI still renders as
// formatted markdown instead of a raw text dump.
export function parseLensSummary(raw: string | null | undefined): ParsedLensSummary {
  if (!raw) {
    return { headline: null, metric: null, bullets: [], fullReport: '' };
  }

  const summaryBlockMatch = raw.match(/##\s*Resumo\s*\n([\s\S]*?)(?=\n##\s|\n#\s|$)/i);

  if (!summaryBlockMatch) {
    return { headline: null, metric: null, bullets: [], fullReport: raw };
  }

  const block = summaryBlockMatch[1];
  const headlineMatch = block.match(/\*\*Manchete:?\*\*\s*(.+)/i);
  const metricMatch = block.match(/\*\*M[ée]trica[- ]?chave:?\*\*\s*(.+)/i);
  const bullets = Array.from(block.matchAll(/^[-*]\s+(.+)$/gm)).map((m) => m[1].trim());

  const matchIndex = summaryBlockMatch.index ?? 0;
  const before = raw.slice(0, matchIndex).trim();
  const after = raw.slice(matchIndex + summaryBlockMatch[0].length).trim();
  const fullReport = [before, after].filter(Boolean).join('\n\n');

  return {
    headline: headlineMatch ? headlineMatch[1].trim() : null,
    metric: metricMatch ? metricMatch[1].trim() : null,
    bullets,
    fullReport: fullReport || raw,
  };
}
