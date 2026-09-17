import type { ComponentType } from 'react';
import { Lock, Check } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { Card } from '@/components/ui/card';

export interface LockedModulePreviewProps {
  label: string;
  description: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  agentMessage: string;
  unlocked?: boolean;
}

function LockedModulePreview({
  label,
  description,
  icon: Icon,
  agentMessage,
  unlocked = false,
}: LockedModulePreviewProps) {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-7">
        <div className="w-9 h-9 rounded-xl bg-surface-strong flex items-center justify-center">
          <Icon size={18} className="text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{label}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <Card className="p-5 bg-primary/5 mb-7 flex gap-3.5 items-start">
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
          <Logo variant="icon" size={14} className="text-primary-foreground" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">Growth Agent</p>
          <p className="text-sm text-foreground leading-relaxed">
            {unlocked
              ? 'Esse módulo já foi desbloqueado com base no seu diagnóstico — ainda estamos construindo a tela completa dele. Assim que estiver pronta, ela aparece aqui automaticamente.'
              : agentMessage}
          </p>
        </div>
      </Card>

      {unlocked ? (
        <div className="flex items-center gap-2 text-sm text-success">
          <Check size={16} />
          Desbloqueado — tela completa em construção
        </div>
      ) : (
        <div className="relative min-h-[220px]">
          <div className="blur-[1.5px] opacity-40 grid grid-cols-3 gap-4 pointer-events-none select-none" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <Card key={i} className="p-5">
                <div className="h-2 w-1/2 rounded-full bg-border mb-3" />
                <div className="h-16 rounded-lg bg-surface-strong" />
              </Card>
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5">
            <div className="w-11 h-11 rounded-full bg-white shadow-elevated flex items-center justify-center">
              <Lock size={18} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Conteúdo liberado após o desbloqueio</p>
          </div>
        </div>
      )}
    </div>
  );
}

export { LockedModulePreview };
