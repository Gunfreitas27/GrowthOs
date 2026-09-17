'use client';

import { useState, useTransition } from 'react';
import QuestionnaireCard from '@/components/onboarding/QuestionnaireCard';
import { ONBOARDING_SECTIONS } from '@/lib/onboarding/sections';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function OnboardingPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [finished, setFinished] = useState(false);

  const section = ONBOARDING_SECTIONS[currentIdx];

  const handleSubmit = async (answers: Record<string, string | string[]>) => {
    startTransition(async () => {
      try {
        await fetch('/api/onboarding/section', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionKey: section.key,
            answers,
          }),
        });

        setCompleted((prev) => new Set([...prev, currentIdx]));

        if (currentIdx < ONBOARDING_SECTIONS.length - 1) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          setFinished(true);
        }
      } catch (err) {
        console.error('Failed to save section:', err);
      }
    });
  };

  if (finished) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Diagnóstico concluído!</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Seu Growth Agent está analisando os dados e calculando seu radar de maturidade.
            Aguarde a pesquisa de marca ser concluída.
          </p>
          <a
            href="/overview"
            className="inline-flex px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Ver meu dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Diagnóstico de Growth</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {ONBOARDING_SECTIONS.length} seções · frameworks Kotler/Keller + Porter + Sean Ellis
        </p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-8">
        {ONBOARDING_SECTIONS.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-2">
            <button
              onClick={() => idx <= currentIdx && setCurrentIdx(idx)}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border transition-colors',
                completed.has(idx)
                  ? 'bg-green-500 border-green-500 text-white'
                  : idx === currentIdx
                  ? 'bg-primary border-primary text-white'
                  : 'bg-muted border-border text-muted-foreground'
              )}
            >
              {completed.has(idx) ? <Check size={12} /> : idx + 1}
            </button>
            {idx < ONBOARDING_SECTIONS.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-px w-8',
                  completed.has(idx) ? 'bg-green-500' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <QuestionnaireCard
        section={section}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}
