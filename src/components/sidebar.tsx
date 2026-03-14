'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Link2,
    Activity,
    LogOut,
    TrendingUp,
    FlaskConical,
    GitBranch,
    BookOpen,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const menuItems = [
    {
        title: 'Visão Geral',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Conectores',
        href: '/dashboard/connectors',
        icon: Link2,
    },
    {
        title: 'Diagnóstico de Funil',
        href: '/dashboard/diagnosis',
        icon: Activity,
    },
    {
        title: 'Forecast & Cenários',
        href: '/dashboard/forecast',
        icon: TrendingUp,
    },
    {
        title: 'Experimentos',
        href: '/dashboard/experiments',
        icon: FlaskConical,
    },
    {
        title: 'Funis',
        href: '/dashboard/funnels',
        icon: GitBranch,
    },
    {
        title: 'Aprendizados',
        href: '/dashboard/learnings',
        icon: BookOpen,
    },
    {
        title: 'Velocidade',
        href: '/dashboard/velocity',
        icon: Zap,
    },
];

// Velox brand mark SVG
function VeloxMark({ className }: { className?: string }) {
    return (
        <svg
            width="28"
            height="28"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="velox-grad-sidebar" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2D1B6B" />
                    <stop offset="50%" stopColor="#6B4FE8" />
                    <stop offset="100%" stopColor="#1AD3C5" />
                </linearGradient>
            </defs>
            <path
                d="M6 16C6 12 9 9 13 9C17 9 19 13 16 16C13 19 15 23 19 23C23 23 26 20 26 16"
                stroke="url(#velox-grad-sidebar)"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="w-60 h-screen sticky top-0 hidden md:flex flex-col border-r"
            style={{
                background: 'var(--velox-void)',
                borderColor: 'rgba(107, 79, 232, 0.15)',
            }}
        >
            {/* Logo */}
            <div
                className="p-5 border-b flex items-center gap-2.5"
                style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
            >
                <VeloxMark />
                <span
                    className="text-lg tracking-tight select-none"
                    style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        color: '#F8F7FC',
                    }}
                >
                    velox<span
                        style={{
                            display: 'inline-block',
                            transform: 'skewX(-5deg)',
                            color: 'var(--velox-velocity)',
                        }}
                    >x</span>
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                                isActive
                                    ? 'text-white'
                                    : 'text-[#A8A3C7] hover:text-white',
                            )}
                            style={
                                isActive
                                    ? {
                                        background: 'rgba(107, 79, 232, 0.18)',
                                        borderLeft: '3px solid #6B4FE8',
                                        paddingLeft: '9px',
                                    }
                                    : {
                                        borderLeft: '3px solid transparent',
                                    }
                            }
                        >
                            <item.icon
                                className="w-4 h-4 shrink-0"
                                style={{ color: isActive ? 'var(--velox-pulse)' : undefined }}
                            />
                            {item.title}
                        </Link>
                    );
                })}
            </nav>

            {/* Tagline + Logout */}
            <div
                className="p-4 border-t space-y-3"
                style={{ borderColor: 'rgba(107, 79, 232, 0.15)' }}
            >
                <p
                    className="text-center text-xs"
                    style={{
                        fontFamily: 'var(--font-ui)',
                        color: 'rgba(168, 163, 199, 0.5)',
                        letterSpacing: '0.04em',
                    }}
                >
                    Cresça com método. Não com caos.
                </p>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sm transition-colors"
                    style={{ color: '#EF4444' }}
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    <LogOut className="w-4 h-4" />
                    Sair
                </Button>
            </div>
        </aside>
    );
}
