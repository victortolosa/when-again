'use client';

import { Tracker } from '@/lib/types';
import { differenceInDays, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg",
                tracker.image_url && "bg-transparent"
            )}
            style={{
                borderLeftWidth: '4px',
                borderLeftColor: tracker.color_theme
            }}
        >
            {/* Full Background Image */}
            {tracker.image_url && (
                <div className="absolute inset-0 z-0">
                    <img
                        src={tracker.image_url}
                        alt={tracker.title}
                        className="w-full h-full object-cover"
                        onError={(e) => e.currentTarget.style.display = 'none'}
                    />
                    {/* Dark overlay for text contrast */}
                    <div className="absolute inset-0 bg-black/60" />
                </div>
            )}

            <CardContent className="p-4 sm:p-6 relative z-10 pr-12">
                {/* Text content with white/light colors for contrast */}
                <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                        <h3
                            className={cn(
                                "font-semibold text-base sm:text-lg truncate",
                                tracker.image_url && "text-white"
                            )}
                            style={tracker.image_url ? {
                                textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)'
                            } : undefined}
                        >
                            {tracker.title}
                        </h3>
                        <p
                            className={cn(
                                "text-xs sm:text-sm mt-1",
                                tracker.image_url ? "text-white/90" : "text-muted-foreground"
                            )}
                            style={tracker.image_url ? {
                                textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)'
                            } : undefined}
                        >
                            {tracker.type === 'since' ? 'Started' : 'Target'}: {formattedDate}
                        </p>
                        {tracker.category && (
                            <span
                                className={cn(
                                    "inline-block mt-2 px-2 py-1 text-xs rounded-full",
                                    tracker.image_url
                                        ? "bg-white/25 text-white backdrop-blur-sm"
                                        : ""
                                )}
                                style={tracker.image_url ? {
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                } : {
                                    backgroundColor: `${tracker.color_theme}20`,
                                    color: tracker.color_theme
                                }}
                            >
                                {tracker.category}
                            </span>
                        )}
                    </div>

                    <div className="text-right shrink-0 pr-2">
                        <div
                            className={cn(
                                "text-3xl sm:text-4xl font-bold tabular-nums",
                                tracker.image_url && "text-white"
                            )}
                            style={tracker.image_url ? {
                                textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 4px 12px rgba(0,0,0,0.7)'
                            } : { color: tracker.color_theme }}
                        >
                            {Math.abs(displayDays)}
                        </div>
                        <div
                            className={cn(
                                "text-xs sm:text-sm whitespace-nowrap",
                                tracker.image_url ? "text-white/90" : "text-muted-foreground"
                            )}
                            style={tracker.image_url ? {
                                textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)'
                            } : undefined}
                        >
                            {tracker.type === 'since'
                                ? (displayDays >= 0 ? 'days ago' : 'days until')
                                : (isPast ? 'days past' : 'days left')
                            }
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
                                    className={cn(
                                        "h-8 w-8 p-0 touch-manipulation",
                                        tracker.image_url
                                            ? "bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
                                            : "hover:bg-accent"
                                    )}
                                    aria-label="Open menu"
                                >
                                    ⋮
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                                {onEdit && (
                                    <DropdownMenuItem
                                        onClick={() => onEdit(tracker)}
                                        className="cursor-pointer"
                                    >
                                        <span className="mr-2">✏️</span>
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                )}
                                {onDelete && (
                                    <DropdownMenuItem
                                        onClick={() => onDelete(tracker.id)}
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
