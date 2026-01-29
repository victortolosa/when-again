'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerCard } from '@/components/dashboard/TrackerCard';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { useTrackers, useCreateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';
import { useSettings } from '@/components/layout/AppShell';

export default function CountdownsPage() {
    const { showCategories } = useSettings();
    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const createTracker = useCreateTracker();
    const deleteTracker = useDeleteTracker();

    // Filter for countdowns (type: 'till')
    const countdowns = useMemo(
        () => trackers.filter((t) => t.type === 'till'),
        [trackers]
    );

    // Group countdowns by category
    const countdownGroups = useMemo(() => {
        const groups: Record<string, Tracker[]> = {};
        countdowns.forEach((item) => {
            const category = item.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
        });
        return groups;
    }, [countdowns]);

    // Sort countdowns chronologically (most recent first)
    const sortedCountdowns = useMemo(() => {
        return [...countdowns].sort((a, b) =>
            b.target_date.toDate().getTime() - a.target_date.toDate().getTime()
        );
    }, [countdowns]);

    const handleCreateTracker = (data: TrackerFormData) => {
        createTracker.mutate(data);
    };

    const handleDeleteTracker = (id: string) => {
        if (confirm('Are you sure you want to delete this countdown?')) {
            deleteTracker.mutate({ id });
        }
    };

    if (trackersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading countdowns...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Countdowns</h1>
                <TrackerForm
                    onSubmit={handleCreateTracker}
                    initialData={{ type: 'till' }}
                    trigger={<Button className="touch-manipulation"><span className="hidden sm:inline">+ New Countdown</span><span className="sm:hidden">+</span></Button>}
                    title="Create Countdown"
                />
            </div>

            <div className="space-y-6">
                {countdowns.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No countdowns yet</p>
                        <p className="text-sm mt-2">Count down to vacations, deadlines, or exciting events!</p>
                    </div>
                ) : showCategories ? (
                    <div className="space-y-8">
                        {Object.entries(countdownGroups).map(([category, items]) => (
                            <TrackerGroup
                                key={category}
                                category={category}
                                trackers={items}
                                onDelete={handleDeleteTracker}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {sortedCountdowns.map((tracker) => (
                            <TrackerCard
                                key={tracker.id}
                                tracker={tracker}
                                onDelete={handleDeleteTracker}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
