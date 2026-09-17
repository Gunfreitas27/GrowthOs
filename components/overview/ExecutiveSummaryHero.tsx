import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/card';

export interface ExecutiveSummaryHeroProps {
  summary: string;
}

function ExecutiveSummaryHero({ summary }: ExecutiveSummaryHeroProps) {
  return (
    <Card className="p-8 mb-8 bg-primary/5 flex gap-4 items-start">
      <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-elevated">
        <Logo variant="icon" size={16} className="text-primary-foreground" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
          Growth Agent · agora
        </p>
        <p className="font-display text-2xl leading-snug text-foreground max-w-3xl">{summary}</p>
      </div>
    </Card>
  );
}

export { ExecutiveSummaryHero };
