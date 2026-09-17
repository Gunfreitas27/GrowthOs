import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

/**
 * Marca da Flywell: um ponto central (dado verificado, o "núcleo" da
 * Sábia) orbitado por dois arcos assimétricos — a metáfora do flywheel
 * (momentum de growth) e das squads de agentes que orbitam o núcleo de
 * dados reais. currentColor, sem gradiente/sombra.
 */
function Logo({ variant = 'icon', size = 24, className }: LogoProps) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={variant === 'icon' ? className : 'shrink-0'}
    >
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="36.7 19.8"
        transform="rotate(-50 12 12)"
      />
      <circle
        cx="12"
        cy="12"
        r="6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray="17 20.7"
        opacity="0.7"
        transform="rotate(130 12 12)"
      />
    </svg>
  );

  if (variant === 'icon') {
    return mark;
  }

  return (
    <div className={cn('flex items-center gap-2.5 text-primary', className)}>
      {mark}
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Flywell
      </span>
    </div>
  );
}

export { Logo };
