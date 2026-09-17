import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TogglePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  showCheck?: boolean;
}

const TogglePill = React.forwardRef<HTMLButtonElement, TogglePillProps>(
  ({ className, selected = false, showCheck = true, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium font-body transition-colors',
        selected
          ? 'bg-primary border-primary text-primary-foreground'
          : 'bg-muted border-border text-muted-foreground hover:text-foreground',
        className
      )}
      {...props}
    >
      {selected && showCheck && <Check size={14} />}
      {children}
    </button>
  )
);
TogglePill.displayName = 'TogglePill';

export { TogglePill };
