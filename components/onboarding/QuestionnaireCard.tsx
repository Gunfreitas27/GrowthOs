'use client';

import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 max-w-2xl">
      {/* Header — no framework jargon exposed here on purpose: the person
          filling this out is a business owner/manager, not a growth
          specialist, and "Kotler: Market Analysis" means nothing to them. */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold">{section.title}</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">{section.description}</p>
      </div>

      {/* Questions */}
      <div className="space-y-4 mb-6">
        {section.questions.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium mb-1.5">{q.label}</label>

            {q.type === 'text' || q.type === 'url' ? (
              <input
                type={q.type === 'url' ? 'url' : 'text'}
                placeholder={q.placeholder}
                value={(answers[q.id] as string) ?? ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
            ) : q.type === 'select' ? (
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setAnswer(q.id, opt)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-sm border transition-colors',
                      answers[q.id] === opt
                        ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                        : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : q.type === 'multiselect' ? (
              <div className="flex flex-wrap gap-2">
                {q.options?.map((opt) => {
                  const selected = ((answers[q.id] as string[]) ?? []).includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        const current = (answers[q.id] as string[]) ?? [];
                        setAnswer(
                          q.id,
                          selected ? current.filter((v) => v !== opt) : [...current, opt]
                        );
                      }}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-1.5',
                        selected
                          ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                          : 'bg-[var(--muted)] border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                      )}
                    >
                      {selected && <Check size={12} />}
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-sm font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
      >
        {isSubmitting ? 'Processando...' : 'Continuar'}
        {!isSubmitting && <ChevronRight size={14} />}
      </button>
    </div>
  );
}
