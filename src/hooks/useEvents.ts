import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
} from '@/lib/db/events';
import { EventFormData } from '@/lib/types';
import { ensureEventHasGradient } from '@/lib/utils/gradient-migration';
import { useSettings } from '@/components/layout/AppShell';

export function useEvents() {
    const { user } = useAuth();
    const { sortSettings } = useSettings();

    return useQuery({
        queryKey: ['events', user?.uid, sortSettings],
        queryFn: async () => {
            console.log('Fetching events for user:', user?.uid);
            const events = await getEvents(user!.uid);
            console.log('Fetched events:', events.length, events);

            // Ensure all events have gradients (migration for existing items)
            const eventsWithGradients = events.map(event => ensureEventHasGradient(event));

            // Save gradients for items that didn't have them or need seed migration
            const itemsToUpdate = eventsWithGradients.filter((event, index) => {
                const original = events[index];
                const migrated = event;

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
                    itemsToUpdate.map(event =>
                        updateEvent(event.id, { gradient_config: event.gradient_config })
                    )
                ).catch(err => console.error('Failed to migrate gradients:', err));
            }

            // Client-side sorting
            const sortedEvents = [...eventsWithGradients].sort((a, b) => {
                const direction = sortSettings.direction === 'asc' ? 1 : -1;

                if (sortSettings.field === 'date') {
                    const dateA = a.start_date.toMillis();
                    const dateB = b.start_date.toMillis();
                    return (dateA - dateB) * direction;
                }

                if (sortSettings.field === 'created_at') {
                    const dateA = a.created_at?.toMillis() || 0;
                    const dateB = b.created_at?.toMillis() || 0;
                    return (dateA - dateB) * direction;
                }

                return 0;
            });

            return sortedEvents;
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
