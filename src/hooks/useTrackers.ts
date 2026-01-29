import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    getTrackers,
    createTracker,
    updateTracker,
    deleteTracker,
} from '@/lib/db/trackers';
import { TrackerFormData } from '@/lib/types';

export function useTrackers() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['trackers', user?.uid],
        queryFn: async () => {
            console.log('Fetching trackers for user:', user?.uid);
            const trackers = await getTrackers(user!.uid);
            console.log('Fetched trackers:', trackers.length, trackers);
            return trackers;
        },
        enabled: !!user,
    });
}

export function useCreateTracker() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: TrackerFormData) => {
            console.log('Creating tracker with user:', user?.uid);
            console.log('Tracker data:', data);
            if (!user) {
                throw new Error('User not authenticated');
            }
            const result = await createTracker(user.uid, data);
            console.log('Tracker created with ID:', result);
            return result;
        },
        onSuccess: () => {
            console.log('Invalidating trackers query cache');
            queryClient.invalidateQueries({
                queryKey: ['trackers'],
                refetchType: 'active',
            });
        },
        onError: (error) => {
            console.error('Mutation error:', error);
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
        mutationFn: (id: string) => deleteTracker(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['trackers'] });
        },
    });
}
