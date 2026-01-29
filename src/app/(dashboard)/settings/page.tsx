'use client';

import { useSettings } from '@/components/layout/AppShell';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
    const { showCategories, setShowCategories } = useSettings();
    const { user, signOut } = useAuth();

    return (
        <div className="space-y-6">
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
                <h2 className="text-xl font-semibold mb-4">Account</h2>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 pb-4 border-b">
                        <div className="w-12 h-12 rounded-full bg-violet-500 flex items-center justify-center text-white text-lg font-medium">
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
