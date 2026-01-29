'use client';

import { ReactNode, useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { SortSettings, SortField, SortDirection } from '@/lib/types';

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
    { href: '/milestones', label: 'Milestones', icon: '📈' },
    { href: '/countdowns', label: 'Countdowns', icon: '⏳' },
    // { href: '/recurring', label: 'Recurring', icon: '🔄' }, // Hidden - work in progress
    { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export function AppShell({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const [sortSettings, setSortSettingsState] = useState<SortSettings>({
        field: 'date',
        direction: 'desc'
    });

    // Load initial state from localStorage
    useEffect(() => {
        const savedCategories = localStorage.getItem('showCategories');
        if (savedCategories === 'true') {
            setShowCategories(true);
        }

        // Load sort settings
        const savedSort = localStorage.getItem('sortSettings');
        if (savedSort) {
            try {
                const parsed = JSON.parse(savedSort);
                setSortSettingsState(parsed);
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                aria-label="Settings"
                            >
                                ⚙️
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem
                                onClick={() => toggleCategories(!showCategories)}
                                className="cursor-pointer"
                            >
                                <span className="mr-2 w-4">{showCategories ? '✓' : ' '}</span>
                                <span>Show Categories</span>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={sortSettings.field}
                                onValueChange={(value) => updateSortSettings({ ...sortSettings, field: value as SortField })}
                            >
                                <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="created_at">Created At</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>

                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Direction</DropdownMenuLabel>
                            <DropdownMenuRadioGroup
                                value={sortSettings.direction}
                                onValueChange={(value) => updateSortSettings({ ...sortSettings, direction: value as SortDirection })}
                            >
                                <DropdownMenuRadioItem value="asc">Ascending</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="desc">Descending</DropdownMenuRadioItem>
                            </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
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
                <main className="flex-1 p-4 md:p-8 overflow-auto pb-24 md:pb-8">
                    <SettingsContext.Provider value={{
                        showCategories,
                        setShowCategories: toggleCategories,
                        sortSettings,
                        setSortSettings: updateSortSettings
                    }}>
                        {children}
                    </SettingsContext.Provider>
                </main>

                {/* Mobile Bottom Nav - Fixed with Glass Effect */}
                <nav className="md:hidden fixed bottom-0 left-0 right-0 flex justify-center px-[18px] border-t border-white/10 backdrop-blur-xl bg-gradient-to-t from-black/90 via-gray-950/80 to-gray-900/70 z-50">
                    {/* Noise texture overlay */}
                    <div
                        className="absolute inset-0 opacity-[0.03] pointer-events-none blur-[0.5px]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: '64px 64px',
                        }}
                    />
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'relative flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200',
                                pathname === item.href
                                    ? 'text-violet-400'
                                    : 'text-gray-400 active:text-gray-300'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
