import { Tracker, Event as EventType, SortSettings } from '../types';

/**
 * Sorts trackers based on sort settings
 * @param trackers - Array of trackers to sort
 * @param settings - Sort settings (field and direction)
 * @returns Sorted array of trackers
 */
export function sortTrackers(
    trackers: Tracker[],
    settings: SortSettings
): Tracker[] {
    return [...trackers].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        if (settings.field === 'date') {
            aValue = a.target_date.toDate().getTime();
            bValue = b.target_date.toDate().getTime();
        } else {
            aValue = a.created_at.toDate().getTime();
            bValue = b.created_at.toDate().getTime();
        }

        return settings.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
    });
}

/**
 * Sorts events based on sort settings
 * @param events - Array of events to sort
 * @param settings - Sort settings (field and direction)
 * @returns Sorted array of events
 */
export function sortEvents(
    events: EventType[],
    settings: SortSettings
): EventType[] {
    return [...events].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        if (settings.field === 'date') {
            aValue = a.start_date.toDate().getTime();
            bValue = b.start_date.toDate().getTime();
        } else {
            aValue = a.created_at.toDate().getTime();
            bValue = b.created_at.toDate().getTime();
        }

        return settings.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
    });
}
