import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LogoProps {
  variant?: 'icon' | 'full';
  size?: number;
  className?: string;
}

/**
 * Marca da Delfo: o frontão de um templo em linha — três colunas
 * sustentando o teto, um ponto no ápice marcando o dado verificado que
 * sustenta cada resposta. Referência a Delfos, onde ficava o Oráculo: a
 * fonte da resposta verdadeira, não a mais confortável. currentColor,
 * sem gradiente/sombra.
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
      <line x1="4" y1="19" x2="20" y2="19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="7" y1="10" x2="7" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="10" x2="12" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="17" y1="10" x2="17" y2="18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path
        d="M5 10 L12 4 L19 10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="12" cy="4" r="1.15" fill="currentColor" />
    </svg>
  );

  if (variant === 'icon') {
    return mark;
  }

  return (
    <div className={cn('flex items-center gap-2.5 text-primary', className)}>
      {mark}
      <span className="font-display text-lg font-semibold tracking-tight text-foreground">
        Delfo
      </span>
    </div>
  );
}

export { Logo };
