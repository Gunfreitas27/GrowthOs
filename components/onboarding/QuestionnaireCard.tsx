'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TogglePill } from '@/components/ui/toggle-pill';
import { Button } from '@/components/ui/button';

export interface QuestionnaireSection {
  key: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Question {
  id: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'url';
  placeholder?: string;
  options?: string[];
}

interface QuestionnaireCardProps {
  section: QuestionnaireSection;
  onSubmit: (answers: Record<string, string | string[]>) => void;
  isSubmitting?: boolean;
}

export default function QuestionnaireCard({
  section,
  onSubmit,
  isSubmitting,
}: QuestionnaireCardProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    if (isSubmitting) return;
    onSubmit(answers);
  };

  return (
    <Card className="p-6 max-w-2xl">
      {/* Header — no framework jargon exposed here on purpose: the person
          filling this out is a business owner/manager, not a growth
          specialist, and "Kotler: Market Analysis" means nothing to them. */}
      <div className="mb-5">
        <h2 className="font-display text-lg font-semibold text-foreground">{section.title}</h2>
        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {section.questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium mb-1.5 text-foreground">{q.label}</label>

            {q.type === 'text' || q.type === 'url' ? (
              <Input
                type={q.type === 'url' ? 'url' : 'text'}
                placeholder={q.placeholder}
                value={(answers[q.id] as string) ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
              />
            ) : q.type === 'select' ? (
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => (
                  <TogglePill
                    key={opt}
                    selected={answers[q.id] === opt}
                    onClick={() => setAnswer(q.id, opt)}
                  >
                    {opt}
                  </TogglePill>
                ))}
              </div>
            ) : q.type === 'multiselect' ? (
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => {
                  const selected = ((answers[q.id] as string[]) ?? []).includes(opt);
                  return (
                    <TogglePill
                      key={opt}
                      selected={selected}
                      onClick={() => {
                        const current = (answers[q.id] as string[]) ?? [];
                        setAnswer(
                          q.id,
                          selected ? current.filter((v) => v !== opt) : [...current, opt]
                        );
                      }}
                    >
                      {opt}
                    </TogglePill>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Processando...' : 'Continuar'}
        {!isSubmitting && <ChevronRight size={14} />}
      </Button>
    </Card>
  );
}
