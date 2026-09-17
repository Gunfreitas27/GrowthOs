import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-semibold font-body',
  {
    variants: {
      variant: {
        neutral: 'bg-surface-strong text-foreground',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        danger: 'bg-danger/10 text-danger',
        warning: 'bg-warning/10 text-warning',
      },
    },
    defaultVariants: { variant: 'neutral' },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
