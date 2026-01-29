import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import {
    getEntriesForMonth,
    getEntryForDate,
    createOrUpdateEntry,
    deleteEntry,
} from '@/lib/db/entries';
import { DailyEntryFormData } from '@/lib/types';

export function useMonthEntries(year: number, month: number, enabled: boolean = true) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['entries', user?.uid, year, month],
        queryFn: () => getEntriesForMonth(user!.uid, year, month),
        enabled: !!user && enabled,
    });
}

export function useDayEntry(date: Date | null) {
    const { user } = useAuth();

    return useQuery({
        queryKey: ['entry', user?.uid, date?.toISOString()],
        queryFn: () => getEntryForDate(user!.uid, date!),
        enabled: !!user && !!date,
    });
}

export function useSaveEntry() {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: DailyEntryFormData) => createOrUpdateEntry(user!.uid, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entry'] });
        },
    });
}

export function useDeleteEntry() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteEntry(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['entries'] });
            queryClient.invalidateQueries({ queryKey: ['entry'] });
        },
    });
}
