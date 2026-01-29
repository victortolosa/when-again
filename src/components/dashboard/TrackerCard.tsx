'use client';

import { Tracker } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TrackerCardProps {
    tracker: Tracker;
    onEdit?: (tracker: Tracker) => void;
    onDelete?: (trackerId: string) => void;
}

export function TrackerCard({ tracker, onEdit, onDelete }: TrackerCardProps) {
    const targetDate = tracker.target_date.toDate();
    const today = new Date();
    const daysDiff = differenceInDays(today, targetDate);

    // For "since" trackers, positive means days ago
    // For "till" trackers, we flip the sign (negative means days until)
    const displayDays = tracker.type === 'since' ? daysDiff : -daysDiff;
    const isPast = displayDays < 0;

    const formattedDate = format(targetDate, 'MMM d, yyyy');

    return (
        <Card
            className="group relative overflow-hidden transition-all hover:shadow-lg"
            style={{
                borderLeftWidth: '4px',
                borderLeftColor: tracker.color_theme
            }}
        >
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{tracker.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {tracker.type === 'since' ? 'Started' : 'Target'}: {formattedDate}
                        </p>
                        {tracker.category && (
                            <span
                                className="inline-block mt-2 px-2 py-0.5 text-xs rounded-full"
                                style={{
                                    backgroundColor: `${tracker.color_theme}20`,
                                    color: tracker.color_theme
                                }}
                            >
                                {tracker.category}
                            </span>
                        )}
                    </div>

                    <div className="text-right shrink-0">
                        <div
                            className="text-4xl font-bold tabular-nums"
                            style={{ color: tracker.color_theme }}
                        >
                            {Math.abs(displayDays)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {tracker.type === 'since'
                                ? (displayDays >= 0 ? 'days ago' : 'days until')
                                : (isPast ? 'days past' : 'days left')
                            }
                        </div>
                    </div>
                </div>

                {/* Actions - Hidden by default, shown on hover */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    {onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(tracker)}
                        >
                            ✏️
                        </Button>
                    )}
                    {onDelete && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => onDelete(tracker.id)}
                        >
                            🗑️
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
