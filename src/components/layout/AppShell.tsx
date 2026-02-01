'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { SortSettings } from '@/lib/types';

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

const navItems = [
    { href: '/milestones', label: 'Milestones', icon: '📅' },
    { href: '/countdowns', label: 'Countdowns', icon: '⏳' },
    { href: '/reminders', label: 'Remember', icon: '🧠' },
];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
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
                <div className="p-6 border-b flex items-center justify-between">
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

            {/* Mobile Layout - No Header */}
            <div className="flex-1 flex flex-col">
                {/* Main Content */}
                <main className="flex-1 overflow-auto pb-24 md:pb-8">
                    <SettingsContext.Provider value={{
                        showCategories,
                        setShowCategories: toggleCategories,
                        sortSettings,
                        setSortSettings: updateSortSettings
                    }}>
                        {children}
                    </SettingsContext.Provider>
                </main>

                {/* iOS 18 Liquid Glass SVG Filters */}
                <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
                    <filter id="glass-refraction">
                        <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="2" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
                    </filter>
                </svg>

                {/* Mobile Bottom Nav - Custom Liquid Glass Effect */}
                <nav
                    className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[58%] max-w-[234px] flex justify-center items-center px-5 py-3 rounded-full border-[0.5px] border-white/30 backdrop-blur-[2px] bg-black/5 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),_0_20px_40px_rgba(0,0,0,0.6)] z-50 ring-[0.5px] ring-white/10 gap-10"
                    style={{ filter: 'url(#glass-refraction)' }}
                >
                    {/* Specular highlight for the top edge */}
                    <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-80" />

                    {/* Subtle interior gloss */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />

                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex flex-col items-center gap-1 transition-all duration-300',
                                pathname === item.href
                                    ? 'text-violet-300 scale-110'
                                    : 'text-white/50 hover:text-white/80 active:scale-95'
                            )}
                        >
                            <span className="text-2xl filter drop-shadow-md">{item.icon}</span>
                            {pathname === item.href && (
                                <span className="absolute -bottom-2 w-1 h-1 rounded-full bg-violet-400" />
                            )}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
