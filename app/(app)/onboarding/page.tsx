'use client';

import { useState, useTransition } from 'react';
import QuestionnaireCard from '@/components/onboarding/QuestionnaireCard';
import { ONBOARDING_SECTIONS } from '@/lib/onboarding/sections';
import { Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stepper } from '@/components/ui/stepper';

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
        <Card className="p-10 text-center">
          <Badge variant="success" className="mb-4">
            <Check size={12} />
            Diagnóstico concluído
          </Badge>
          <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
            Seu radar está sendo calculado
          </h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
            Seu Growth Agent está analisando os dados e calculando seu radar de maturidade.
            Aguarde a pesquisa de marca ser concluída.
          </p>
          <Button asChild>
            <a href="/overview">Ver meu dashboard</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Diagnóstico de Growth
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {ONBOARDING_SECTIONS.length} seções · frameworks Kotler/Keller + Porter + Sean Ellis
        </p>
      </div>

      {/* Progress steps */}
      <Stepper
        steps={ONBOARDING_SECTIONS.map((s) => s.title)}
        currentIndex={currentIdx}
        completedIndices={completed}
        onStepClick={(idx) => idx <= currentIdx && setCurrentIdx(idx)}
        className="mb-8"
      />

      <QuestionnaireCard
        section={section}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}
