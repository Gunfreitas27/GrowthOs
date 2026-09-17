import type { Components } from 'react-markdown';

// Maps GFM markdown elements to our own design tokens instead of relying on
// a generic typography plugin — keeps research reports visually consistent
// with the rest of the app (Playfair Display headings, muted-foreground
// body, no Tailwind-literal colors).
export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h3 className="font-display text-sm font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="font-display text-sm font-semibold text-foreground mt-4 mb-2 first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="font-display text-xs font-semibold text-foreground mt-3 mb-1.5">{children}</h4>
  ),
  p: ({ children }) => <p className="text-xs text-muted-foreground leading-relaxed mb-2">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  ul: ({ children }) => <ul className="space-y-1 mb-2 pl-4 list-disc marker:text-primary">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-1 mb-2 pl-4 list-decimal marker:text-primary">{children}</ol>,
  li: ({ children }) => <li className="text-xs text-muted-foreground">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 italic text-muted-foreground mb-2">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-border my-3" />,
  code: ({ children }) => (
    <code className="bg-surface-strong rounded px-1 py-0.5 text-[11px] font-mono text-foreground">{children}</code>
  ),
  pre: ({ children }) => (
    <pre className="bg-surface-strong rounded-sm p-3 mb-2 text-[11px] font-mono text-foreground overflow-x-auto">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="text-left font-semibold text-foreground border-b border-border px-2 py-1">{children}</th>
  ),
  td: ({ children }) => (
    <td className="text-muted-foreground border-b border-border px-2 py-1 align-top">{children}</td>
  ),
};
