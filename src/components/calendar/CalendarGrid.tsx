'use client';

import { useMemo, useState } from 'react';
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Event as EventType, DailyEntry, Tracker } from '@/lib/types';
import { getEventOccurrences } from '@/lib/utils/recurrence';
import { cn } from '@/lib/utils';

interface CalendarGridProps {
    events: EventType[];
    entries: DailyEntry[];
    trackers?: Tracker[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
    onDayClick: (date: Date) => void;
    selectedDate?: Date | null;
}

export function CalendarGrid({
    events,
    entries,
    trackers = [],
    currentDate,
    onDateChange,
    onDayClick,
    selectedDate,
}: CalendarGridProps) {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Pre-compute event occurrences for the visible month
    const eventOccurrences = useMemo(() => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(currentDate);
        const calendarStart = startOfWeek(monthStart);
        const calendarEnd = endOfWeek(monthEnd);

        const occurrences = new Map<string, EventType[]>();

        events.forEach((event) => {
            const dates = getEventOccurrences(event, calendarStart, calendarEnd);
            dates.forEach((date) => {
                const key = format(date, 'yyyy-MM-dd');
                if (!occurrences.has(key)) occurrences.set(key, []);
                occurrences.get(key)!.push(event);
            });
        });

        return { occurrences, calendarStart, calendarEnd };
    }, [events, currentDate]);

    const { occurrences: occurrencesMap, calendarStart, calendarEnd } = eventOccurrences;
    const days = useMemo(() => eachDayOfInterval({ start: calendarStart, end: calendarEnd }), [calendarStart, calendarEnd]);

    // Map trackers by their target date
    const trackersByDate = useMemo(() => {
        const map = new Map<string, Tracker[]>();
        trackers.forEach((tracker) => {
            const key = format(tracker.target_date.toDate(), 'yyyy-MM-dd');
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(tracker);
        });
        return map;
    }, [trackers]);

    // Map entries by date
    const entriesByDate = useMemo(() => {
        const map = new Map<string, DailyEntry>();
        entries.forEach((entry) => {
            const key = format(entry.date.toDate(), 'yyyy-MM-dd');
            map.set(key, entry);
        });
        return map;
    }, [entries]);

    const today = new Date();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDateChange(subMonths(currentDate, 1))}
                    >
                        ← Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDateChange(new Date())}
                    >
                        Today
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDateChange(addMonths(currentDate, 1))}
                    >
                        Next →
                    </Button>
                </div>
            </div>

            {/* Calendar Grid */}
            <Card className="p-4 overflow-hidden">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekdays.map((day) => (
                        <div
                            key={day}
                            className="text-center text-sm font-medium text-muted-foreground py-2"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const dayEvents = occurrencesMap.get(dateKey) || [];
                        const dayTrackers = trackersByDate.get(dateKey) || [];
                        const entry = entriesByDate.get(dateKey);
                        const isCurrentMonth = isSameMonth(day, currentDate);
                        const isToday = isSameDay(day, today);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);

                        return (
                            <button
                                key={dateKey}
                                onClick={() => onDayClick(day)}
                                className={cn(
                                    'relative aspect-square p-1 rounded-lg transition-all',
                                    'hover:bg-accent hover:scale-105',
                                    'focus:outline-none focus:ring-2 focus:ring-primary',
                                    isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                                    isToday && 'ring-2 ring-primary',
                                    isSelected && 'bg-primary/20'
                                )}
                            >
                                {/* Background image from entry */}
                                {entry?.image_url && (
                                    <div
                                        className="absolute inset-0 rounded-lg bg-cover bg-center opacity-40"
                                        style={{ backgroundImage: `url(${entry.image_url})` }}
                                    />
                                )}

                                {/* Day number */}
                                <div
                                    className={cn(
                                        'relative z-10 text-sm font-medium',
                                        isCurrentMonth ? 'text-foreground' : 'text-muted-foreground',
                                        isToday && 'text-primary font-bold'
                                    )}
                                >
                                    {format(day, 'd')}
                                </div>

                                {/* Event and Tracker dots */}
                                {(dayEvents.length > 0 || dayTrackers.length > 0) && (
                                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5 z-10">
                                        {/* Tracker dots (milestones) - shown as squares */}
                                        {dayTrackers.slice(0, 2).map((tracker, i) => (
                                            <div
                                                key={`tracker-${i}`}
                                                className="w-1.5 h-1.5 rounded-sm"
                                                style={{ backgroundColor: tracker.color_theme }}
                                                title={tracker.title}
                                            />
                                        ))}
                                        {/* Event dots (recurring) - shown as circles */}
                                        {dayEvents.slice(0, 3 - Math.min(dayTrackers.length, 2)).map((event, i) => (
                                            <div
                                                key={`event-${i}`}
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: event.color_theme }}
                                                title={event.title}
                                            />
                                        ))}
                                        {(dayEvents.length + dayTrackers.length) > 3 && (
                                            <div className="text-[8px] text-muted-foreground">
                                                +{(dayEvents.length + dayTrackers.length) - 3}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Note indicator */}
                                {entry?.notes && !entry.image_url && (
                                    <div className="absolute top-1 right-1 text-[10px] z-10">
                                        📝
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
