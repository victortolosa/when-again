import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    getReminders,
    createReminder,
    updateReminder,
    deleteReminder,
} from '@/lib/db/reminders';
import { ReminderFormData } from '@/lib/types';
import { ensureReminderHasGradient } from '@/lib/utils/gradient-migration';
import { logger } from '@/lib/logger';

export function useReminders() {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['reminders', user?.uid],
        queryFn: async () => {
            const reminders = await getReminders(user!.uid);
            logger.debug('Fetched reminders', { count: reminders.length });

            // Ensure all reminders have gradients (migration for existing items)
            const remindersWithGradients = reminders.map(reminder => ensureReminderHasGradient(reminder));

            // Save gradients for items that didn't have them or need seed migration
            const itemsToUpdate = remindersWithGradients.filter((reminder, index) => {
                const original = reminders[index];
                const migrated = reminder;

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
                    itemsToUpdate.map(reminder =>
                        updateReminder(reminder.id, { gradient_config: reminder.gradient_config })
                    )
                ).catch(err => logger.error('Failed to migrate reminder gradients', err));
            }

            // Sort by date (ascending - soonest first)
            const sortedReminders = [...remindersWithGradients].sort((a, b) => {
                return a.date.toMillis() - b.date.toMillis();
            });

            return sortedReminders;
        },
        enabled: !!user,
    });
}

export function useCreateReminder() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ReminderFormData) => {
            if (!user) {
                throw new Error('User not authenticated');
            }
            const result = await createReminder(user.uid, data);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['reminders'],
                refetchType: 'active',
            });
        },
        onError: (error) => {
            logger.error('Reminder mutation error', error);
        },
    });
}

export function useUpdateReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<ReminderFormData> }) =>
            updateReminder(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}

export function useDeleteReminder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, imageUrl, croppedImageUrl }: { id: string; imageUrl?: string; croppedImageUrl?: string }) =>
            deleteReminder(id, imageUrl, croppedImageUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders'] });
        },
    });
}
