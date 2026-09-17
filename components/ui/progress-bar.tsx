import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const fillVariants = cva('h-full rounded-full transition-all duration-700', {
  variants: {
    variant: {
      primary: 'bg-primary',
      success: 'bg-success',
      danger: 'bg-danger',
      warning: 'bg-warning',
    },
  },
  defaultVariants: { variant: 'primary' },
});

export interface ProgressBarProps extends VariantProps<typeof fillVariants> {
  value: number;
  max?: number;
  className?: string;
  trackClassName?: string;
}

function ProgressBar({ value, max = 100, variant, className, trackClassName }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('w-full h-1.5 rounded-full bg-surface-strong overflow-hidden', trackClassName)}>
      <div className={cn(fillVariants({ variant }), className)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export { ProgressBar };
