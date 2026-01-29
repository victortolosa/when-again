import { RRule, rrulestr, Options } from 'rrule';
import { Event } from '@/lib/types';

/**
 * Parses an iCal RRule string and returns occurrences within a date range
 */
export function getEventOccurrences(
    event: Event,
    startDate: Date,
    endDate: Date
): Date[] {
    try {
        const rule = rrulestr(event.recurrence_rule, {
            dtstart: event.start_date.toDate(),
        });

        return rule.between(startDate, endDate, true);
    } catch (error) {
        console.error('Error parsing recurrence rule:', error);
        return [];
    }
}

/**
 * Gets all events that occur on a specific date
 */
export function getEventsForDate(
    events: Event[],
    date: Date
): { event: Event; occurrence: Date }[] {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const results: { event: Event; occurrence: Date }[] = [];

    for (const event of events) {
        const occurrences = getEventOccurrences(event, startOfDay, endOfDay);
        for (const occurrence of occurrences) {
            results.push({ event, occurrence });
        }
    }

    return results;
}

/**
 * Creates a recurrence rule for common patterns
 */
export function createRecurrenceRule(
    pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly',
    options?: {
        interval?: number;
        byWeekday?: number[];
        byMonthday?: number;
        count?: number;
        until?: Date;
    }
): string {
    const ruleOptions: Partial<Options> = {};

    switch (pattern) {
        case 'daily':
            ruleOptions.freq = RRule.DAILY;
            break;
        case 'weekly':
            ruleOptions.freq = RRule.WEEKLY;
            break;
        case 'biweekly':
            ruleOptions.freq = RRule.WEEKLY;
            ruleOptions.interval = 2;
            break;
        case 'monthly':
            ruleOptions.freq = RRule.MONTHLY;
            break;
        case 'yearly':
            ruleOptions.freq = RRule.YEARLY;
            break;
    }

    if (options?.interval) ruleOptions.interval = options.interval;
    if (options?.byWeekday) ruleOptions.byweekday = options.byWeekday;
    if (options?.byMonthday) ruleOptions.bymonthday = options.byMonthday;
    if (options?.count) ruleOptions.count = options.count;
    if (options?.until) ruleOptions.until = options.until;

    const rule = new RRule(ruleOptions);
    return rule.toString();
}

/**
 * Common recurrence rule presets
 */
export const RECURRENCE_PRESETS = {
    daily: 'FREQ=DAILY',
    weekly: 'FREQ=WEEKLY',
    biweekly: 'FREQ=WEEKLY;INTERVAL=2',
    monthly: 'FREQ=MONTHLY',
    monthlyFirst: 'FREQ=MONTHLY;BYMONTHDAY=1',
    yearly: 'FREQ=YEARLY',
    weekdays: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR',
    weekends: 'FREQ=WEEKLY;BYDAY=SA,SU',
} as const;

/**
 * Human-readable description of a recurrence rule
 */
export function describeRecurrence(rruleString: string): string {
    try {
        const rule = rrulestr(rruleString);
        return rule.toText();
    } catch {
        return 'Custom recurrence';
    }
}
