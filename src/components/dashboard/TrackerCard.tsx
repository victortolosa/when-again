'use client';

import { Tracker } from '@/lib/types';
import { differenceInDays, differenceInMonths, differenceInYears, format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/layout/AppShell';
import { MeshGradientBackground } from '@/components/ui/MeshGradientBackground';

interface TrackerCardProps {
    tracker: Tracker;
    onEdit?: (tracker: Tracker) => void;
    onDelete?: (trackerId: string) => void;
}

export function TrackerCard({ tracker, onEdit, onDelete }: TrackerCardProps) {
    const { } = useSettings();
    const targetDate = tracker.target_date.toDate();
    const today = new Date();

    // Use selected display units or default to days
    const displayUnits = tracker.display_units || ['days'];

    const daysDiff = differenceInDays(today, targetDate);
    const totalDaysAbs = Math.abs(daysDiff);

    // Build parts with priority ordering (year > month > day)
    interface Part {
        value: string;
        label: string;
        priority: number;
    }

    const partsWithPriority: Part[] = [];

    if (displayUnits.includes('years')) {
        const years = totalDaysAbs / 365.25;
        const formattedYears = (years > 0 && years < 10) ? years.toFixed(1).replace(/\.0$/, '') : Math.round(years).toString();
        partsWithPriority.push({
            value: formattedYears,
            label: formattedYears === '1' ? 'year' : 'years',
            priority: 3,
        });
    }
    if (displayUnits.includes('months')) {
        const months = totalDaysAbs / 30.4375;
        const formattedMonths = (months > 0 && months < 10) ? months.toFixed(1).replace(/\.0$/, '') : Math.round(months).toString();
        partsWithPriority.push({
            value: formattedMonths,
            label: formattedMonths === '1' ? 'month' : 'months',
            priority: 2,
        });
    }
    if (displayUnits.includes('days')) {
        partsWithPriority.push({
            value: totalDaysAbs.toString(),
            label: totalDaysAbs === 1 ? 'day' : 'days',
            priority: 1,
        });
    }

    if (partsWithPriority.length === 0) {
        partsWithPriority.push({
            value: '0',
            label: displayUnits[0] || 'days',
            priority: 1,
        });
    }

    // Sort by priority (highest first)
    const sortedParts = [...partsWithPriority].sort((a, b) => b.priority - a.priority);

    const formattedDate = format(targetDate, 'MM/dd/yyyy');

    return (
        <Card
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg aspect-video",
                (tracker.image_url || true) && "bg-transparent"
            )}
        >
            {/* Mesh Gradient Background - Use stored gradient or fall back to color */}
            {!tracker.image_url && (
                <MeshGradientBackground
                    gradientConfig={tracker.gradient_config}
                    color={tracker.color_theme}
                />
            )}

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

            <CardContent
                className={cn(
                    "relative z-10 h-full flex flex-col",
                    "p-5 sm:p-7"
                )}
            >
                {/* Top section: Title (left) and Menu (right) */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h3
                            className={cn(
                                "font-semibold text-2xl sm:text-3xl leading-tight text-white line-clamp-2",
                            )}
                            style={{
                                textShadow: '0 2px 4px rgba(0,0,0,0.4), 0 4px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            {tracker.title}
                        </h3>
                        {tracker.category && (
                            <span
                                className={cn(
                                    "inline-block px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full mt-2",
                                    (tracker.image_url || true)
                                        ? "bg-white/20 text-white backdrop-blur-sm border border-white/10"
                                        : "bg-muted text-muted-foreground"
                                )}
                            >
                                {tracker.category}
                            </span>
                        )}
                    </div>

                    {/* Action menu */}
                    {(onEdit || onDelete) && (
                        <div className="shrink-0 -mr-2 -mt-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-8 w-8 p-0 touch-manipulation",
                                            (tracker.image_url || true)
                                                ? "bg-transparent hover:bg-white/20 text-white"
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
                </div>

                {/* Bottom section: Date (left) and Duration (right) */}
                <div className="mt-auto flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p
                            className={cn(
                                "text-[10px] sm:text-xs font-medium uppercase tracking-wider text-white/80",
                            )}
                            style={{
                                textShadow: '0 1px 3px rgba(0,0,0,0.3)'
                            }}
                        >
                            {formattedDate}
                        </p>
                    </div>



                    <div className="flex flex-col items-end shrink-0 gap-1">
                        {/* Single unit or multi-unit display */}
                        {sortedParts.length === 1 ? (
                            <div className="flex flex-col items-end">
                                <div
                                    className="font-bold tabular-nums leading-[0.85] text-right text-white text-4xl sm:text-6xl"
                                    style={{
                                        textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    {sortedParts[0].value}
                                </div>

                                <div className="flex items-baseline gap-1 justify-end mt-1">
                                    <span
                                        className="font-semibold text-right text-white text-sm sm:text-base"
                                        style={{
                                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {sortedParts[0].label} ago
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* High priority item on top */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    <div
                                        className="font-bold tabular-nums leading-[0.85] text-right text-white text-4xl sm:text-6xl"
                                        style={{
                                            textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {sortedParts[0].value}
                                    </div>
                                    <span
                                        className="font-semibold text-right text-white text-sm sm:text-base"
                                        style={{
                                            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                        }}
                                    >
                                        {sortedParts[0].label}
                                    </span>
                                </div>

                                {/* Remaining items on same line */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    {/* "OR" prefix for 2 items, or "OR" + slash separator for 3 items */}
                                    {sortedParts.length >= 2 && (
                                        <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                                            OR
                                        </span>
                                    )}

                                    {sortedParts.slice(1).map((part, index) => (
                                        <div key={index + 1} className="flex items-baseline gap-1">
                                            {/* Show "/" separator before last item if there are 3 total */}
                                            {sortedParts.length === 3 && index === 1 && (
                                                <span className="text-gray-400 font-medium">/</span>
                                            )}

                                            <div
                                                className="font-bold tabular-nums leading-[0.85] text-right text-white text-lg sm:text-2xl"
                                                style={{
                                                    textShadow: '0 4px 12px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {part.value}
                                            </div>
                                            <span
                                                className="font-semibold text-right text-white text-xs sm:text-sm"
                                                style={{
                                                    textShadow: '0 2px 8px rgba(0,0,0,0.3)'
                                                }}
                                            >
                                                {part.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
