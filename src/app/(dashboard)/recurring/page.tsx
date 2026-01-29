'use client';

import { useMemo, useState } from 'react';
import { EventCard } from '@/components/dashboard/EventCard';
import { EventForm } from '@/components/dashboard/EventForm';
import { useEvents, useCreateEvent, useDeleteEvent } from '@/hooks/useEvents';
import { Event as EventType, EventFormData } from '@/lib/types';

export default function RecurringPage() {
    const { data: events = [], isLoading: eventsLoading } = useEvents();
    const createEvent = useCreateEvent();
    const deleteEvent = useDeleteEvent();

    // Group events by category  
    const eventGroups = useMemo(() => {
        const groups: Record<string, EventType[]> = {};
        events.forEach((event) => {
            const category = event.category || 'Uncategorized';
            if (!groups[category]) groups[category] = [];
            groups[category].push(event);
        });
        return groups;
    }, [events]);

    const handleCreateEvent = (data: EventFormData) => {
        createEvent.mutate(data, {
            onError: (error) => {
                console.error('Error creating event:', error);
                alert(`Failed to create event: ${error.message}`);
            },
            onSuccess: () => {
                console.log('Event created successfully');
            },
        });
    };

    const handleDeleteEvent = (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            deleteEvent.mutate(id);
        }
    };

    if (eventsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading recurring events...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Recurring</h1>
                <div className="flex items-center gap-2 sm:gap-4">
                    <EventForm onSubmit={handleCreateEvent} />
                </div>
            </div>

            <div className="space-y-6">
                {events.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">No recurring events yet</p>
                        <p className="text-sm mt-2">Set up reminders for rent, meetings, or any repeating events!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(eventGroups).map(([category, items]) => (
                            <div key={category} className="space-y-3">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    {category}
                                    <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded-full">
                                        {items.length}
                                    </span>
                                </h3>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((event) => (
                                        <EventCard
                                            key={event.id}
                                            event={event}
                                            onDelete={handleDeleteEvent}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
