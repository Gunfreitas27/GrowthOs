import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Flywell — Growth Orchestrator',
  description: 'AI-powered growth orchestration platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
      </body>
    </html>
  );
}
