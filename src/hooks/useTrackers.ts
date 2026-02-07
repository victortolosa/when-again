import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    getTrackers,
    createTracker,
    updateTracker,
    deleteTracker,
} from '@/lib/db/trackers';
import { TrackerFormData } from '@/lib/types';
import { ensureTrackerHasGradient } from '@/lib/utils/gradient-migration';
import { useSettings } from '@/components/layout/AppShell';
import { logger } from '@/lib/logger';

export function useTrackers() {
    const { user } = useAuth();
    const { sortSettings } = useSettings();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const query = useQuery({
        queryKey: ['trackers', user?.uid, sortSettings.field, sortSettings.direction],
        queryFn: async () => {
            const trackers = await getTrackers(user!.uid);
            logger.debug('Fetched trackers', { count: trackers.length });

            // Ensure all trackers have gradients (migration for existing items)
            const trackersWithGradients = trackers.map(tracker => ensureTrackerHasGradient(tracker));

            // Save gradients for items that didn't have them or need seed migration
            const itemsToUpdate = trackersWithGradients.filter((tracker, index) => {
                const original = trackers[index];
                const migrated = tracker;

                // Need update if no gradient at all
                if (!original.gradient_config && migrated.gradient_config) {
                    return true;
                }

                // Need update if gradient exists but seed is missing
                if (original.gradient_config?.colors &&
                    original.gradient_config?.seed === undefined &&
                    migrated.gradient_config?.seed !== undefined) {
                    return true;
                }

                return false;
            });

            if (itemsToUpdate.length > 0) {
                // Update in background without blocking
                Promise.all(
                    itemsToUpdate.map(tracker =>
                        updateTracker(tracker.id, { gradient_config: tracker.gradient_config })
                    )
                ).catch(err => logger.error('Failed to migrate tracker gradients', err));
            }

            // Client-side sorting
            const sortedTrackers = [...trackersWithGradients].sort((a, b) => {
                const direction = sortSettings.direction === 'asc' ? 1 : -1;

                if (sortSettings.field === 'date') {
                    const dateA = a.target_date.toMillis();
                    const dateB = b.target_date.toMillis();
                    return (dateA - dateB) * direction;
                }

                if (sortSettings.field === 'created_at') {
                    const dateA = a.created_at?.toMillis() || 0;
                    const dateB = b.created_at?.toMillis() || 0;
                    return (dateA - dateB) * direction;
                }

                return 0;
            });

            return sortedTrackers;
        },
        enabled: !!user && mounted, // Only fetch when mounted and authenticated
    });

    // Force loading state during SSR/hydration to avoid mismatch
    if (!mounted) {
        return {
            ...query,
            data: [],
            isLoading: true,
            isPending: true,
        };
    }

    return query;
}

export function useCreateTracker() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TrackerFormData) => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            const result = await createTracker(user.uid, data);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['trackers'],
                refetchType: 'active',
            });
        },
        onError: (error) => {
            logger.error('Tracker mutation error', error);
        },
    });
}

export function useUpdateTracker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TrackerFormData> }) =>
            updateTracker(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trackers'] });
        },
    });
}

export function useDeleteTracker() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, imageUrl, croppedImageUrl }: { id: string; imageUrl?: string; croppedImageUrl?: string }) =>
            deleteTracker(id, imageUrl, croppedImageUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trackers'] });
        },
    });
}
