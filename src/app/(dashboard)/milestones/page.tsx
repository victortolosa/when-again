'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerCard } from '@/components/dashboard/TrackerCard';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { useTrackers, useCreateTracker, useUpdateTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';
import { uploadMilestoneImage, deleteMilestoneImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/components/layout/AppShell';
import { ViewSettings } from '@/components/dashboard/ViewSettings';

export default function MilestonesPage() {
    const router = useRouter();
    const { showCategories } = useSettings();
    const { user } = useAuth();
    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const createTracker = useCreateTracker();
    const updateTracker = useUpdateTracker();

    // Filter for milestones (type: 'since')
    const milestones = useMemo(
        () => trackers.filter((t) => t.type === 'since'),
        [trackers]
    );

    // Group milestones by category
    const milestoneGroups = useMemo(() => {
        const groups: Record<string, Tracker[]> = {};
        milestones.forEach((item) => {
            const category = item.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
        });
        return groups;
    }, [milestones]);


    const handleCreateTracker = async (data: TrackerFormData, croppedFile?: File, originalFile?: File) => {
        try {
            // Create tracker first to get ID (without image_url)
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
            if (croppedFile && originalFile && user) {
                const { imageUrl, originalImageUrl } = await uploadMilestoneImage(croppedFile, originalFile, user.uid, trackerId);
                try {
                    await new Promise<void>((resolve, reject) => {
                        updateTracker.mutate(
                            { id: trackerId, data: { image_url: originalImageUrl, cropped_image_url: imageUrl } },
                            {
                                onSuccess: () => resolve(),
                                onError: reject,
                            }
                        );
                    });
                } catch (dbError) {
                    // Cleanup orphan images if DB update failed
                    await deleteMilestoneImage(originalImageUrl, imageUrl);
                    throw dbError;
                }
            }

            console.log('Milestone created successfully');
        } catch (error) {
            console.error('Error creating milestone:', error);
            alert(`Failed to create milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleTrackerClick = (tracker: Tracker) => {
        router.push(`/trackers/${tracker.id}`);
    };



    if (trackersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading milestones...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Milestones</h1>
                <div className="flex items-center gap-2">
                    <ViewSettings />
                    <TrackerForm
                        onSubmit={handleCreateTracker}
                        initialData={{ type: 'since' }}
                        trigger={<Button className="touch-manipulation"><span className="hidden sm:inline">+ New Milestone</span><span className="sm:hidden">+</span></Button>}
                        title="Create Milestone"
                    />

                </div>
            </div>

            <div className="space-y-6">
                {milestones.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No milestones yet</p>
                        <p className="text-sm mt-2">Track days since important events like quitting habits or starting new ones!</p>
                    </div>
                ) : showCategories ? (
                    <div className="space-y-8">
                        {Object.entries(milestoneGroups).map(([category, items]) => (
                            <TrackerGroup
                                key={category}
                                category={category}
                                trackers={items}
                                onTrackerClick={handleTrackerClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {milestones.map((tracker) => (
                            <TrackerCard
                                key={tracker.id}
                                tracker={tracker}
                                onClick={() => handleTrackerClick(tracker)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
