import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/card';

export interface ExecutiveSummaryHeroProps {
  summary: string;
}

function ExecutiveSummaryHero({ summary }: ExecutiveSummaryHeroProps) {
  return (
    <Card className="p-8 mb-8 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Logo variant="icon" size={18} className="text-primary" />
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">
          O que fazer agora
        </span>
      </div>
      <p className="font-display text-2xl leading-snug text-foreground max-w-3xl">{summary}</p>
    </Card>
  );
}

export { ExecutiveSummaryHero };
