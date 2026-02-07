'use client';

import React, { ReactNode, useState, useContext, useEffect, useRef, createContext } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { Bell, Calendar, Moon, Sun, Timer } from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { SortSettings } from '@/lib/types';
import { NotificationContext, useNotificationBadge } from '@/contexts/NotificationContext';

export { useNotificationBadge };

function NotificationBridge({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const BridgeInner = useRef<React.ComponentType<{ children: ReactNode }> | null>(null);

    useEffect(() => {
        import('./NotificationBridgeInner').then((mod) => {
            BridgeInner.current = mod.default;
            setMounted(true);
        });
    }, []);

    if (!mounted || !BridgeInner.current) {
        return (
            <NotificationContext.Provider value={{ dueCount: 0 }}>
                {children}
            </NotificationContext.Provider>
        );
    }

    const Inner = BridgeInner.current;
    return <Inner>{children}</Inner>;
}

// Context for settings
interface SettingsContextType {
    showCategories: boolean;
    setShowCategories: (show: boolean) => void;
    sortSettings: SortSettings;
    setSortSettings: (settings: SortSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within AppShell');
    }
    return context;
}

const navItems: { href: string; label: string; icon: LucideIcon }[] = [
    { href: '/milestones', label: 'Milestones', icon: Calendar },
    { href: '/countdowns', label: 'Countdowns', icon: Timer },
    { href: '/reminders', label: 'Remember', icon: Bell },
];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
    const { theme, setTheme } = useTheme();
    const [showCategories, setShowCategories] = useState(false);
    const [sortSettings, setSortSettingsState] = useState<SortSettings>({
        field: 'date',
        direction: 'desc'
    });

    // Load initial state from localStorage
    useEffect(() => {
        const savedCategories = localStorage.getItem('showCategories');
        if (savedCategories === 'true') {
            setTimeout(() => setShowCategories(true), 0);
        }

        // Load sort settings
        const savedSort = localStorage.getItem('sortSettings');
        if (savedSort) {
            try {
                const parsed = JSON.parse(savedSort);
                setTimeout(() => setSortSettingsState(parsed), 0);
            } catch (error) {
                console.error('Failed to parse sort settings:', error);
            }
        }
    }, []);

    // Save to localStorage whenever state changes
    const toggleCategories = (show: boolean) => {
        setShowCategories(show);
        localStorage.setItem('showCategories', String(show));
    };

    const updateSortSettings = (settings: SortSettings) => {
        setSortSettingsState(settings);
        localStorage.setItem('sortSettings', JSON.stringify(settings));
    };

    // Auth page renders directly without AppShell wrapper
    if (pathname === '/auth') {
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="space-y-6 text-center">
                    <div className="relative">
                        <div className="w-16 h-16 mx-auto rounded-full border-4 border-muted border-t-primary animate-spin" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-muted rounded mx-auto animate-pulse" />
                        <div className="h-3 w-24 bg-muted/60 rounded mx-auto animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center space-y-6 p-8">
                    <h1 className="text-5xl font-bold text-primary">
                        DateKeeper
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Track habits, count down to events, and journal your days with beautiful visuals.
                    </p>
                    <Link href="/auth">
                        <Button size="lg">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <SettingsContext.Provider value={{
            showCategories,
            setShowCategories: toggleCategories,
            sortSettings,
            setSortSettings: updateSortSettings
        }}>
            <NotificationBridge>
                <AuthenticatedLayout user={user} signOut={signOut} theme={theme} setTheme={setTheme} pathname={pathname}>
                    {children}
                </AuthenticatedLayout>
            </NotificationBridge>
        </SettingsContext.Provider>
    );
}

function AuthenticatedLayout({
    children,
    user,
    signOut,
    theme,
    setTheme,
    pathname,
}: {
    children: ReactNode;
    user: { displayName: string | null; email: string | null };
    signOut: () => void;
    theme: string | undefined;
    setTheme: (t: string) => void;
    pathname: string;
}) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card">
                <div className="p-6 border-b flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">
                        DateKeeper
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        aria-label="Toggle theme"
                    >
                        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
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
                            aria-current={pathname === item.href ? 'page' : undefined}
                        >
                            <item.icon className="h-5 w-5" aria-hidden="true" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 px-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
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

            {/* Mobile Layout - No Header */}
            <div className="flex-1 flex flex-col">
                {/* Main Content */}
                <main className="flex-1 overflow-auto pb-24 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Nav */}
                <nav
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-auto flex justify-center items-center px-5 py-3 rounded-full border border-transparent backdrop-blur-sm z-50 gap-10 nav-glass"
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center gap-1 transition-all duration-300',
                                pathname === item.href
                                    ? 'text-primary scale-110'
                                    : 'text-muted-foreground hover:text-foreground active:scale-95'
                            )}
                            aria-label={item.label}
                            aria-current={pathname === item.href ? 'page' : undefined}
                        >
                            <item.icon className="h-6 w-6" aria-hidden="true" />
                            <span className="sr-only">{item.label}</span>
                            {pathname === item.href && (
                                <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary" />
                            )}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
