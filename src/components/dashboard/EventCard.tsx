'use client';

import { Event as EventType } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
            <CardContent className="p-4 sm:p-6 pr-12">
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg truncate">{event.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 capitalize">
                            🔄 {recurrenceText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Started: {format(startDate, 'MMM d, yyyy')}
                        </p>
                        {event.category && (
                            <span
                                className="inline-block mt-2 px-2 py-1 text-xs rounded-full"
                                style={{
                                    backgroundColor: `${event.color_theme}20`,
                                    color: event.color_theme
                                }}
                            >
                                {event.category}
                            </span>
                        )}
                    </div>

                    <div className="text-right shrink-0 pr-2">
                        <div
                            className="text-3xl sm:text-4xl"
                            style={{ color: event.color_theme }}
                        >
                            📅
                        </div>
                    </div>
                </div>

                {/* Action menu - always visible on mobile, hover on desktop */}
                {(onEdit || onDelete) && (
                    <div className="absolute top-1 right-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 hover:bg-accent touch-manipulation"
                                    aria-label="Open menu"
                                >
                                    ⋮
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {onEdit && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(event)}
                                        className="cursor-pointer"
                                    >
                                        <span className="mr-2">✏️</span>
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(event.id)}
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                    >
                                        <span className="mr-2">🗑️</span>
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
