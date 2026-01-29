'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerCard } from '@/components/dashboard/TrackerCard';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { useTrackers, useCreateTracker, useUpdateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';
import { uploadMilestoneImage, deleteMilestoneImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/components/layout/AppShell';
import { sortTrackers } from '@/lib/utils/sorting';

export default function MilestonesPage() {
    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
    const { showCategories } = useSettings();
    const { user } = useAuth();
    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const createTracker = useCreateTracker();
    const updateTracker = useUpdateTracker();
    const deleteTracker = useDeleteTracker();

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


    const handleCreateTracker = async (data: TrackerFormData, file?: File) => {
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

            console.log('Milestone created successfully');
        } catch (error) {
            console.error('Error creating milestone:', error);
            alert(`Failed to create milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleEditTracker = (tracker: Tracker) => {
        setEditingTracker(tracker);
    };

    const handleUpdateTracker = async (data: TrackerFormData, file?: File) => {
        if (!editingTracker) return;

        try {
            let imageUrl = data.image_url;
            const oldImageUrl = editingTracker.image_url;

            // If new file: upload → delete old image if exists
            if (file && user) {
                imageUrl = await uploadMilestoneImage(file, user.uid, editingTracker.id);

                if (oldImageUrl) {
                    await deleteMilestoneImage(oldImageUrl);
                }
            }
            // If image removed: delete old image
            else if (!data.image_url && oldImageUrl) {
                await deleteMilestoneImage(oldImageUrl);
                imageUrl = undefined;
            }

            // Update tracker with new/removed image_url
            try {
                await new Promise<void>((resolve, reject) => {
                    updateTracker.mutate(
                        { id: editingTracker.id, data: { ...data, image_url: imageUrl } },
                        {
                            onError: reject,
                            onSuccess: () => resolve(),
                        }
                    );
                });
            } catch (dbError) {
                // If we JUST uploaded a new image and the DB update failed, clean it up
                if (file && user && imageUrl) {
                    await deleteMilestoneImage(imageUrl);
                }
                throw dbError;
            }

            console.log('Milestone updated successfully');
            setEditingTracker(null);
        } catch (error) {
            console.error('Error updating milestone:', error);
            alert(`Failed to update milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteTracker = async (id: string) => {
        const tracker = trackers.find(t => t.id === id);

        if (confirm('Are you sure you want to delete this milestone?')) {
            try {
                // Delete tracker (which will also delete the image via db function)
                await new Promise<void>((resolve, reject) => {
                    deleteTracker.mutate(
                        { id, imageUrl: tracker?.image_url },
                        {
                            onError: reject,
                            onSuccess: () => resolve(),
                        }
                    );
                });
            } catch (error) {
                console.error('Error deleting milestone:', error);
                alert(`Failed to delete milestone: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    if (trackersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading milestones...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Milestones</h1>
                <div className="flex items-center gap-2">
                    <TrackerForm
                        onSubmit={handleCreateTracker}
                        initialData={{ type: 'since' }}
                        trigger={<Button className="touch-manipulation"><span className="hidden sm:inline">+ New Milestone</span><span className="sm:hidden">+</span></Button>}
                        title="Create Milestone"
                    />
                    {editingTracker && (
                        <TrackerForm
                            key={editingTracker.id}
                            onSubmit={handleUpdateTracker}
                            initialData={{
                                title: editingTracker.title,
                                target_date: editingTracker.target_date.toDate(),
                                type: editingTracker.type,
                                category: editingTracker.category || '',
                                color_theme: editingTracker.color_theme,
                                image_url: editingTracker.image_url,
                                display_units: editingTracker.display_units,
                            }}
                            open={true}
                            onOpenChange={(open) => !open && setEditingTracker(null)}
                            title="Edit Milestone"
                        />
                    )}
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
                                onEdit={handleEditTracker}
                                onDelete={handleDeleteTracker}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {milestones.map((tracker) => (
                            <TrackerCard
                                key={tracker.id}
                                tracker={tracker}
                                onEdit={handleEditTracker}
                                onDelete={handleDeleteTracker}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
