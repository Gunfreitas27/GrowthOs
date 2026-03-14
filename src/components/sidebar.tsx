'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Link2,
    Activity,
    LogOut,
    ChevronRight,
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
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Connectors',
        href: '/dashboard/connectors',
        icon: Link2,
    },
    {
        title: 'Funnel Diagnosis',
        href: '/dashboard/diagnosis',
        icon: Activity,
    },
    {
        title: 'Forecast & Scenarios',
        href: '/dashboard/forecast',
        icon: TrendingUp,
    },
    {
        title: 'Experiments',
        href: '/dashboard/experiments',
        icon: FlaskConical,
    },
    {
        title: 'Funnels',
        href: '/dashboard/funnels',
        icon: GitBranch,
    },
    {
        title: 'Learnings',
        href: '/dashboard/learnings',
        icon: BookOpen,
    },
    {
        title: 'Velocity',
        href: '/dashboard/velocity',
        icon: Zap,
    },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r bg-gray-50/40 h-screen sticky top-0 hidden md:flex flex-col">
            <div className="p-6 border-b">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <span className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-black">G</span>
                    GrowthOS
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                            )}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.title}
                            {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => signOut({ callbackUrl: '/' })}
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
