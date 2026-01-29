'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { useTrackers, useCreateTracker, useUpdateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';

export default function MilestonesPage() {
    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);

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

    const handleCreateTracker = (data: TrackerFormData) => {
        createTracker.mutate(data, {
            onError: (error) => {
                console.error('Error creating milestone:', error);
                alert(`Failed to create milestone: ${error.message}`);
            },
            onSuccess: () => {
                console.log('Milestone created successfully');
            },
        });
    };

    const handleEditTracker = (tracker: Tracker) => {
        setEditingTracker(tracker);
    };

    const handleUpdateTracker = (data: TrackerFormData) => {
        if (!editingTracker) return;

        updateTracker.mutate(
            { id: editingTracker.id, data },
            {
                onError: (error) => {
                    console.error('Error updating milestone:', error);
                    alert(`Failed to update milestone: ${error.message}`);
                },
                onSuccess: () => {
                    console.log('Milestone updated successfully');
                    setEditingTracker(null);
                },
            }
        );
    };

    const handleDeleteTracker = (id: string) => {
        if (confirm('Are you sure you want to delete this milestone?')) {
            deleteTracker.mutate(id);
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Milestones</h1>
                <div className="flex items-center gap-4">
                    <TrackerForm
                        onSubmit={handleCreateTracker}
                        initialData={{ type: 'since' }}
                        trigger={<Button>+ New Milestone</Button>}
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
                ) : (
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
                )}
            </div>
        </div>
    );
}
