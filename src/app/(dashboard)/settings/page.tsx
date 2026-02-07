'use client';

import { useSettings } from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Moon, Sun, Monitor, BellRing, CheckCircle, XCircle } from 'lucide-react';
import { isSupported as notificationsSupported, getPermissionStatus, requestPermission } from '@/lib/notifications';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
    const { showCategories, setShowCategories, sortSettings, setSortSettings } = useSettings();
    const { user, signOut } = useAuth();
    const { theme, setTheme } = useTheme();
    const [permStatus, setPermStatus] = useState<NotificationPermission | 'unsupported'>('default');

    useEffect(() => {
        setPermStatus(getPermissionStatus());
    }, []);

    const handleEnableNotifications = async () => {
        const result = await requestPermission();
        setPermStatus(result);
    };

    return (
        <div className="space-y-6 p-4 sm:p-6 pb-24">
            <div>
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your preferences and account
                </p>
            </div>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Display</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Show Categories</p>
                            <p className="text-sm text-muted-foreground">
                                Display category labels on tracker cards
                            </p>
                        </div>
                        <Button
                            variant={showCategories ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setShowCategories(!showCategories)}
                        >
                            {showCategories ? 'On' : 'Off'}
                        </Button>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Theme</h2>
                <div className="flex gap-2">
                    <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('light')}
                        className="flex-1"
                    >
                        <Sun className="mr-2 h-4 w-4" />
                        Light
                    </Button>
                    <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                        className="flex-1"
                    >
                        <Moon className="mr-2 h-4 w-4" />
                        Dark
                    </Button>
                    <Button
                        variant={theme === 'system' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('system')}
                        className="flex-1"
                    >
                        <Monitor className="mr-2 h-4 w-4" />
                        System
                    </Button>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Push Notifications</p>
                            <p className="text-sm text-muted-foreground">
                                Get notified when reminders and countdowns are due
                            </p>
                        </div>
                        {permStatus === 'unsupported' ? (
                            <p className="text-sm text-muted-foreground">Not supported</p>
                        ) : permStatus === 'granted' ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4" />
                                Enabled
                            </span>
                        ) : permStatus === 'denied' ? (
                            <div className="text-right">
                                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-destructive">
                                    <XCircle className="h-4 w-4" />
                                    Blocked
                                </span>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Enable in browser settings
                                </p>
                            </div>
                        ) : (
                            <Button size="sm" onClick={handleEnableNotifications}>
                                <BellRing className="mr-2 h-4 w-4" />
                                Enable
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Sorting</h2>
                <div className="space-y-6">
                    <div className="space-y-3">
                        <p className="font-medium">Sort By</p>
                        <div className="flex gap-2">
                            <Button
                                variant={sortSettings.field === 'date' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortSettings({ ...sortSettings, field: 'date' })}
                                className="flex-1"
                            >
                                Date
                            </Button>
                            <Button
                                variant={sortSettings.field === 'created_at' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortSettings({ ...sortSettings, field: 'created_at' })}
                                className="flex-1"
                            >
                                Created At
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="font-medium">Direction</p>
                        <div className="flex gap-2">
                            <Button
                                variant={sortSettings.direction === 'asc' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortSettings({ ...sortSettings, direction: 'asc' })}
                                className="flex-1"
                            >
                                Ascending
                            </Button>
                            <Button
                                variant={sortSettings.direction === 'desc' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSortSettings({ ...sortSettings, direction: 'desc' })}
                                className="flex-1"
                            >
                                Descending
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-lg font-medium">
                            {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">
                                {user?.displayName || 'User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={() => signOut()}
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                </div>
            </Card>
        </div>
    );
}
