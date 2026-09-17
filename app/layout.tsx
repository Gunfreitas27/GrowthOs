import type { Metadata } from 'next';
import { Playfair_Display, Lora } from 'next/font/google';
import './globals.css';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display-raw',
  weight: ['600', '700'],
});

const bodyFont = Lora({
  subsets: ['latin'],
  variable: '--font-body-raw',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'Delfo — Growth Orchestrator',
  description: 'AI-powered growth orchestration platform',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${displayFont.variable} ${bodyFont.variable}`}>
      <body className="bg-background text-foreground font-body antialiased">
        {children}
      </body>
    </html>
  );
}
