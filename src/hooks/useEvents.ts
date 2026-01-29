import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from '@/lib/db/events';
import { EventFormData } from '@/lib/types';

export function useEvents() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['events', user?.uid],
        queryFn: async () => {
            console.log('Fetching events for user:', user?.uid);
            const events = await getEvents(user!.uid);
            console.log('Fetched events:', events.length, events);
            return events;
        },
        enabled: !!user,
    });
}

export function useCreateEvent() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: EventFormData) => createEvent(user!.uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

export function useUpdateEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<EventFormData> }) =>
            updateEvent(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}

export function useDeleteEvent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteEvent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });
}
