'use client';

import { Event as EventType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { describeRecurrence } from '@/lib/utils/recurrence';
import { format } from 'date-fns';

interface EventCardProps {
    event: EventType;
    onEdit?: (event: EventType) => void;
    onDelete?: (eventId: string) => void;
}

export function EventCard({ event, onEdit, onDelete }: EventCardProps) {
    const startDate = event.start_date.toDate();
    const recurrenceText = describeRecurrence(event.recurrence_rule);

    return (
        <Card
            className="group relative overflow-hidden transition-all hover:shadow-lg"
            style={{
                borderLeftWidth: '4px',
                borderLeftColor: event.color_theme
            }}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{event.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                            🔄 {recurrenceText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Started: {format(startDate, 'MMM d, yyyy')}
                        </p>
                        {event.category && (
                            <span
                                className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full"
                                style={{
                                    backgroundColor: `${event.color_theme}20`,
                                    color: event.color_theme
                                }}
                            >
                                {event.category}
                            </span>
                        )}
                    </div>

                    <div className="text-right shrink-0">
                        <div
                            className="text-3xl"
                            style={{ color: event.color_theme }}
                        >
                            📅
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(event)}
                        >
                            ✏️
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => onDelete(event.id)}
                        >
                            🗑️
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
