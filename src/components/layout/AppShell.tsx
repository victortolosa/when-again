'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
    { href: '/milestones', label: 'Milestones', icon: '📈' },
    { href: '/countdowns', label: 'Countdowns', icon: '⏳' },
    { href: '/recurring', label: 'Recurring', icon: '🔄' },
];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Auth page renders directly without AppShell wrapper
    if (pathname === '/auth') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center space-y-6 p-8">
                    <h1 className="text-5xl font-bold text-violet-400">
                        DateKeeper
                    </h1>
                    <p className="text-slate-400 max-w-md">
                        Track habits, count down to events, and journal your days with beautiful visuals.
                    </p>
                    <Link href="/auth">
                        <Button size="lg" className="bg-violet-600 hover:bg-violet-500">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-violet-500">
                        DateKeeper
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                pathname === item.href
                                    ? 'bg-primary/10 text-primary'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-medium">
                            {user.displayName?.[0] || user.email?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {user.displayName || 'User'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => signOut()}
                    >
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="flex-1 flex flex-col">
                <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
                    <h1 className="text-xl font-bold text-violet-500">
                        DateKeeper
                    </h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        ☰
                    </Button>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 overflow-auto">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden flex border-t bg-card">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex-1 flex flex-col items-center gap-1 py-3 transition-colors',
                                pathname === item.href
                                    ? 'text-primary'
                                    : 'text-muted-foreground'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
