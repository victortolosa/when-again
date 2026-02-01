import { intervalToDuration, differenceInDays, isBefore } from 'date-fns';

export interface TimePart {
    value: string;
    label: string;
    priority: number;
}

/**
 * Returns time parts for AUTO display logic:
 * - > 12 months: Years and Days
 * - < 1 year but > 1 month: Months and Days
 * - < 1 month: Just Days
 */
export function getAutoTimeParts(today: Date, targetDate: Date): TimePart[] {
    const isPast = isBefore(targetDate, today);
    const start = isPast ? targetDate : today;
    const end = isPast ? today : targetDate;

    const duration = intervalToDuration({ start, end });
    const years = duration.years || 0;
    const months = duration.months || 0;
    const days = duration.days || 0;

    if (years > 0) {
        const parts: TimePart[] = [
            {
                value: years.toString(),
                label: years === 1 ? 'year' : 'years',
                priority: 3
            }
        ];

        if (months > 0) {
            parts.push({
                value: months.toString(),
                label: months === 1 ? 'month' : 'months',
                priority: 2
            });
        }

        return parts;
    } else if (months > 0) {
        const parts: TimePart[] = [
            {
                value: months.toString(),
                label: months === 1 ? 'month' : 'months',
                priority: 2
            }
        ];

        if (days > 0) {
            parts.push({
                value: days.toString(),
                label: days === 1 ? 'day' : 'days',
                priority: 1
            });
        }

        return parts;
    } else {
        // Just days (use differenceInDays for accuracy if < 1 month)
        const totalDaysAbs = Math.abs(differenceInDays(today, targetDate));
        return [
            {
                value: totalDaysAbs.toString(),
                label: totalDaysAbs === 1 ? 'day' : 'days',
                priority: 1,
            }
        ];
    }
}

/**
 * Returns all non-zero time parts for a full breakdown:
 * - Years, Months, and Days
 */
export function getFullTimeParts(today: Date, targetDate: Date): TimePart[] {
    const isPast = isBefore(targetDate, today);
    const start = isPast ? targetDate : today;
    const end = isPast ? today : targetDate;

    const duration = intervalToDuration({ start, end });
    const parts: TimePart[] = [];

    if (duration.years && duration.years > 0) {
        parts.push({
            value: duration.years.toString(),
            label: duration.years === 1 ? 'year' : 'years',
            priority: 3
        });
    }

    if (duration.months && duration.months > 0) {
        parts.push({
            value: duration.months.toString(),
            label: duration.months === 1 ? 'month' : 'months',
            priority: 2
        });
    }

    if (duration.days && duration.days > 0) {
        parts.push({
            value: duration.days.toString(),
            label: duration.days === 1 ? 'day' : 'days',
            priority: 1
        });
    }

    // Fallback if exactly the same day
    if (parts.length === 0) {
        parts.push({
            value: '0',
            label: 'days',
            priority: 1
        });
    }

    return parts;
}
