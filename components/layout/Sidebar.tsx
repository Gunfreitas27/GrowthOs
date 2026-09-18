'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  Palette,
  TrendingUp,
  Search,
  Users,
  BarChart2,
  SendHorizontal,
  FolderKanban,
  Puzzle,
  Zap,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODULE_KEYS, type ModuleKey } from '@/lib/agents/types';
import { Logo } from '@/components/brand/Logo';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LOCKED_MODULE_META } from '@/lib/modules/config';

interface ModuleState {
  moduleKey: string;
  status: 'hidden' | 'revealed' | 'setup' | 'active';
}

interface SidebarProps {
  visibleModules: ModuleState[];
  userEmail?: string | null;
  signOutAction?: () => Promise<void>;
}

const MODULE_CONFIG: Record<
  ModuleKey | 'overview' | 'onboarding',
  { label: string; href: string; icon: React.ReactNode }
> = {
  overview: {
    label: 'Overview',
    href: '/overview',
    icon: <LayoutDashboard size={16} />,
  },
  onboarding: {
    label: 'Diagnóstico',
    href: '/onboarding',
    icon: <Sparkles size={16} />,
  },
  strategy: {
    label: 'Estratégia',
    href: '/strategy',
    icon: <Target size={16} />,
  },
  branding: {
    label: 'Branding',
    href: '/branding',
    icon: <Palette size={16} />,
  },
  paid: {
    label: 'Tráfego Pago',
    href: '/paid',
    icon: <TrendingUp size={16} />,
  },
  seo: {
    label: 'SEO & Conteúdo',
    href: '/seo',
    icon: <Search size={16} />,
  },
  crm: { label: 'CRM', href: '/crm', icon: <Users size={16} /> },
  analytics: {
    label: 'Analytics',
    href: '/analytics',
    icon: <BarChart2 size={16} />,
  },
  outbound: {
    label: 'Outbound',
    href: '/outbound',
    icon: <SendHorizontal size={16} />,
  },
  community: {
    label: 'Comunidade',
    href: '/community',
    icon: <Zap size={16} />,
  },
  project: {
    label: 'Projetos',
    href: '/project',
    icon: <FolderKanban size={16} />,
  },
  integrations: {
    label: 'Integrações',
    href: '/integrations',
    icon: <Puzzle size={16} />,
  },
};

export default function Sidebar({ visibleModules, userEmail, signOutAction }: SidebarProps) {
  const pathname = usePathname();

  // Always show Overview and Agent Chat
  const permanentItems = ['overview', 'onboarding'] as const;

  const unlockedKeys = new Set(
    visibleModules.filter((m) => m.status !== 'hidden').map((m) => m.moduleKey)
  );

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="flex flex-col h-screen border-r border-border bg-surface-soft"
        style={{ width: 'var(--sidebar-width)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-border">
          <Logo variant="icon" size={22} className="text-primary" />
          <span className="font-display font-semibold text-base tracking-tight text-foreground">
            Delfo
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {/* Permanent items */}
          {permanentItems.map((key) => {
            const item = MODULE_CONFIG[key];
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={key}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-strong'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}

          {/* All 10 modules, always listed — locked ones show a lock icon
              instead of disappearing. Hiding them entirely reads as "empty/
              broken product" rather than "there's more here, unlock it" —
              found by watching a real first-time login: even knowing the
              codebase, "where are the other tools?" was the first reaction. */}
          <div className="px-3 py-2 mt-2 mb-1">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Módulos
            </span>
          </div>
          {MODULE_KEYS.map((key) => {
            const item = MODULE_CONFIG[key];
            // Integrações connects external tools to whatever data already
            // exists (or none) — it isn't a growth-strategy output like the
            // other modules, so it doesn't make sense to gate it behind a
            // maturity diagnostic the way the rest of the "Módulos" section is.
            const unlocked = key === 'integrations' ? true : unlockedKeys.has(key);

            if (!unlocked) {
              // Modules with a generic locked-preview page (lib/modules/config.ts)
              // are clickable — the agent explains what to do next there,
              // instead of a dead end. Modules with their own real page
              // (strategy/branding/analytics) keep the inert row: once
              // unlocked they'll use their real href below, so there's no
              // preview to send them to in the meantime.
              const preview = LOCKED_MODULE_META[key];
              if (!preview) {
                return (
                  <Tooltip key={key}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 text-muted-foreground opacity-45 cursor-default select-none">
                        {item.icon}
                        <span className="flex-1">{item.label}</span>
                        <Lock size={12} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Desbloqueia conforme seu diagnóstico de maturidade avança
                    </TooltipContent>
                  </Tooltip>
                );
              }

              const previewActive = pathname === `/modules/${key}`;
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <Link
                      href={`/modules/${key}`}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                        previewActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground hover:bg-surface-strong'
                      )}
                    >
                      {item.icon}
                      <span className="flex-1">{item.label}</span>
                      <Lock size={12} />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    Veja o que falta para desbloquear
                  </TooltipContent>
                </Tooltip>
              );
            }

            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={key}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-strong'
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom: session info */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate" title={userEmail ?? undefined}>
            {userEmail ?? 'Workspace (modo mock)'}
          </p>
          {signOutAction && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                Sair
              </button>
            </form>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
