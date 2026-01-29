'use client';

import { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrackerGroup } from '@/components/dashboard/TrackerGroup';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { DayDetailModal } from '@/components/calendar/DayDetailModal';
import { useTrackers, useCreateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { useMonthEntries, useDayEntry } from '@/hooks/useEntries';
import { Tracker, TrackerFormData } from '@/lib/types';

export default function CountdownsPage() {
    const [viewMode, setViewMode] = useState<'dashboard' | 'calendar'>('dashboard');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const createTracker = useCreateTracker();
    const deleteTracker = useDeleteTracker();

    const { data: entries = [] } = useMonthEntries(
        currentDate.getFullYear(),
        currentDate.getMonth()
    );
    const { data: selectedEntry } = useDayEntry(selectedDate || new Date());

    // Filter for countdowns (type: 'till')
    const countdowns = useMemo(
        () => trackers.filter((t) => t.type === 'till'),
        [trackers]
    );

    // Group countdowns by category
    const countdownGroups = useMemo(() => {
        const groups: Record<string, Tracker[]> = {};
        countdowns.forEach((item) => {
            const category = item.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(item);
        });
        return groups;
    }, [countdowns]);

    const handleCreateTracker = (data: TrackerFormData) => {
        createTracker.mutate(data);
    };

    const handleDeleteTracker = (id: string) => {
        if (confirm('Are you sure you want to delete this countdown?')) {
            deleteTracker.mutate(id);
        }
    };

    const handleDayClick = (date: Date) => {
        setSelectedDate(date);
    };

    if (trackersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading countdowns...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Countdowns</h1>
                <div className="flex items-center gap-4">
                    <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'dashboard' | 'calendar')} className="w-[300px]">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="dashboard">List View</TabsTrigger>
                            <TabsTrigger value="calendar">Calendar</TabsTrigger>
                        </TabsList>
                    </Tabs>
                    <TrackerForm
                        onSubmit={handleCreateTracker}
                        initialData={{ type: 'till' }}
                        trigger={<Button>+ New Countdown</Button>}
                        title="Create Countdown"
                    />
                </div>
            </div>

            {viewMode === 'dashboard' ? (
                <div className="space-y-6">
                    {countdowns.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p className="text-lg">No countdowns yet</p>
                            <p className="text-sm mt-2">Count down to vacations, deadlines, or exciting events!</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {Object.entries(countdownGroups).map(([category, items]) => (
                                <TrackerGroup
                                    key={category}
                                    category={category}
                                    trackers={items}
                                    onDelete={handleDeleteTracker}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    <CalendarGrid
                        events={[]}
                        entries={entries}
                        currentDate={currentDate}
                        onDateChange={setCurrentDate}
                        onDayClick={handleDayClick}
                        selectedDate={selectedDate}
                    />

                    <DayDetailModal
                        date={selectedDate}
                        events={[]}
                        entry={selectedEntry || null}
                        onClose={() => setSelectedDate(null)}
                    />
                </div>
            )}
        </div>
    );
}
