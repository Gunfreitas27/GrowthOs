import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepperProps {
  steps: string[];
  currentIndex: number;
  completedIndices?: Set<number>;
  onStepClick?: (index: number) => void;
  className?: string;
}

function Stepper({ steps, currentIndex, completedIndices, onStepClick, className }: StepperProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((label, idx) => {
        const isCompleted = completedIndices?.has(idx) ?? idx < currentIndex;
        const isActive = idx === currentIndex;
        const circleClassName = cn(
          'w-9 h-9 rounded-full border-2 flex items-center justify-center font-display text-sm font-semibold transition-colors',
          isActive
            ? 'bg-primary border-primary text-primary-foreground'
            : isCompleted
              ? 'bg-card border-primary text-primary'
              : 'bg-card border-border text-muted-foreground'
        );
        const circleContent = isCompleted && !isActive ? <Check size={16} /> : idx + 1;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-1.5">
              {onStepClick ? (
                <button
                  type="button"
                  onClick={() => onStepClick(idx)}
                  className={circleClassName}
                >
                  {circleContent}
                </button>
              ) : (
                <div className={circleClassName}>{circleContent}</div>
              )}
              <span
                className={cn(
                  'text-xs whitespace-nowrap font-body',
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn('h-0.5 flex-1 mx-2', isCompleted ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export { Stepper };
