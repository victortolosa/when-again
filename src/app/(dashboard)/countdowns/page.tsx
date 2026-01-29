'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerCard } from '@/components/dashboard/TrackerCard';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { useTrackers, useCreateTracker, useUpdateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';
import { uploadMilestoneImage, deleteMilestoneImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/components/layout/AppShell';

export default function CountdownsPage() {
    const { showCategories } = useSettings();
    const { user } = useAuth();
    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const createTracker = useCreateTracker();
    const updateTracker = useUpdateTracker();
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


    const handleCreateTracker = async (data: TrackerFormData, file?: File) => {
        try {
            // Create tracker first to get ID
            const trackerId = await new Promise<string>((resolve, reject) => {
                createTracker.mutate(
                    { ...data, image_url: undefined },
                    {
                        onError: reject,
                        onSuccess: (id) => resolve(id),
                    }
                );
            });

            // If file provided: upload → update tracker with image_url
            if (file && user) {
                const imageUrl = await uploadMilestoneImage(file, user.uid, trackerId);
                try {
                    await new Promise<void>((resolve, reject) => {
                        updateTracker.mutate(
                            { id: trackerId, data: { image_url: imageUrl } },
                            {
                                onError: reject,
                                onSuccess: () => resolve(),
                            }
                        );
                    });
                } catch (dbError) {
                    // Cleanup orphan image if DB update failed
                    await deleteMilestoneImage(imageUrl);
                    throw dbError;
                }
            }
        } catch (error) {
            console.error('Error creating countdown:', error);
            alert(`Failed to create countdown: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteTracker = async (id: string) => {
        const tracker = trackers.find((t) => t.id === id);

        if (confirm('Are you sure you want to delete this countdown?')) {
            try {
                deleteTracker.mutate({ id, imageUrl: tracker?.image_url });
            } catch (error) {
                console.error('Error deleting countdown:', error);
            }
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
                        {countdowns.map((tracker) => (
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
