'use client';

import { KeyboardEvent, useState } from 'react';
import { Tracker } from '@/lib/types';
import { differenceInDays } from 'date-fns';
import { formatDisplayDate, getAutoTimeParts } from '@/lib/utils/date';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useSettings } from '@/components/layout/AppShell';
import { MeshGradientBackground } from '@/components/ui/MeshGradientBackground';
import { CachedImage } from '@/components/ui/CachedImage';

interface TrackerCardProps {
    tracker: Tracker;
    onClick?: () => void;
}

export function TrackerCard({ tracker, onClick }: TrackerCardProps) {
    // const { } = useSettings(); // Removed unused hook

    const targetDate = tracker.target_date.toDate();
    const today = new Date();

    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    // Use selected display units or default to days
    const displayUnits = tracker.display_units || ['auto'];

    const daysDiff = differenceInDays(today, targetDate);
    const totalDaysAbs = Math.abs(daysDiff);

    // Build parts with priority ordering (year > month > day)
    interface Part {
        value: string;
        label: string;
        priority: number;
    }

    const partsWithPriority: Part[] = [];

    const isAuto = displayUnits.includes('auto');

    if (isAuto) {
        const parts = getAutoTimeParts(today, targetDate);
        partsWithPriority.push(...parts);
    } else {
        // Manual logic (existing)
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

    // For AUTO display with exactly two parts, we use special "and" formatting
    const multilineParts = (isAuto && sortedParts.length === 2) ? sortedParts : null;

    const formattedDate = formatDisplayDate(targetDate);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onClick();
        }
    };

    const imageSrc = tracker.cropped_image_url || tracker.image_url || null;
    const hasImage = Boolean(imageSrc);
    const isMilestone = tracker.type === 'since';
    const cardAspectClass = isMilestone
        ? (hasImage ? 'aspect-[5/3]' : 'aspect-[5/2] sm:aspect-[5/3]')
        : (hasImage ? 'aspect-[4/3]' : 'aspect-[2/1]');
    const overlayClass = hasImage ? 'bg-white/75 dark:bg-black/60' : '';
    const primaryTextClass = 'text-black dark:text-white';
    const secondaryTextClass = 'text-black/80 dark:text-white/80';
    const tertiaryTextClass = 'text-black/60 dark:text-white/60';

    return (
        <Card
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            aria-label={onClick ? `Open tracker ${tracker.title}` : undefined}
            className={cn(
                "group relative overflow-hidden transition-all hover:shadow-lg",
                cardAspectClass,
                hasImage && "bg-transparent",
                onClick && "cursor-pointer"
            )}
        >
            {/* Mesh Gradient Background - Use stored gradient or fall back to color */}
            <MeshGradientBackground
                gradientConfig={tracker.gradient_config}
                color={tracker.color_theme}
            />

            {/* Full Background Image */}
            {imageSrc && failedSrc !== imageSrc && (
                <div className="absolute inset-0 z-0">
                    <CachedImage
                        src={imageSrc}
                        alt={tracker.title}
                        className="w-full h-full object-cover"
                        onError={() => setFailedSrc(imageSrc)}
                    />
                    <div className={cn("absolute inset-0", overlayClass)} />
                </div>
            )}

            <CardContent
                className={cn(
                    "relative z-10 h-full flex flex-col",
                    "p-5 sm:p-7"
                )}
            >
                {/* Top section: Title */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className={cn(
                            "font-semibold text-2xl sm:text-3xl leading-tight line-clamp-2",
                            primaryTextClass,
                            "text-shadow-none dark:text-shadow-card"
                        )}>
                            {tracker.title}
                        </h3>
                        {tracker.category && (
                            <span
                                className={cn(
                                    "inline-block px-2 py-1 text-[10px] sm:text-xs font-medium rounded-full mt-2",
                                    "bg-black/10 text-black backdrop-blur-sm border border-black/10 dark:bg-white/20 dark:text-white dark:border-white/10"
                                )}
                            >
                                {tracker.category}
                            </span>
                        )}
                    </div>
                </div>

                {/* Bottom section: Date (left) and Duration (right) */}
                <div className="mt-auto flex items-end justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className={cn(
                            "text-[10px] sm:text-xs font-medium uppercase tracking-wider",
                            secondaryTextClass,
                            "text-shadow-none dark:text-shadow-sm"
                        )}>
                            {formattedDate}
                        </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0 gap-1">
                        {/* Single unit or multi-unit display */}
                        {sortedParts.length === 1 ? (
                            <div className="flex flex-col items-end">
                                <div className={cn(
                                    "font-bold tabular-nums leading-[0.85] text-right text-4xl sm:text-6xl",
                                    primaryTextClass,
                                    "text-shadow-none dark:text-shadow-lg"
                                )}>
                                    {sortedParts[0].value}
                                </div>

                                <div className="flex items-baseline gap-1 justify-end mt-1">
                                    <span className={cn(
                                        "font-semibold text-right text-sm sm:text-base",
                                        primaryTextClass,
                                        "text-shadow-none dark:text-shadow-md"
                                    )}>
                                        {sortedParts[0].label} {tracker.type === 'till' ? 'to go' : 'ago'}
                                    </span>
                                </div>
                            </div>
                        ) : (multilineParts && multilineParts.length === 2 && (
                            <>
                                {/* High priority item on top */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    <div className={cn(
                                        "font-bold tabular-nums leading-[0.85] text-right text-4xl sm:text-6xl",
                                        primaryTextClass,
                                        "text-shadow-none dark:text-shadow-lg"
                                    )}>
                                        {multilineParts[0].value}
                                    </div>
                                    <span className={cn(
                                        "font-semibold text-right text-sm sm:text-base",
                                        primaryTextClass,
                                        "text-shadow-none dark:text-shadow-md"
                                    )}>
                                        {multilineParts[0].label}
                                    </span>
                                </div>

                                {/* Remaining items on same line */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    <span className={cn("font-medium text-xs sm:text-sm mr-1", tertiaryTextClass)}>
                                        and
                                    </span>

                                    {multilineParts.slice(1).map((part, index) => (
                                        <div key={index + 1} className="flex items-baseline gap-1">
                                            <div className={cn(
                                                "font-bold tabular-nums leading-[0.85] text-right text-lg sm:text-2xl",
                                                primaryTextClass,
                                                "text-shadow-none dark:text-shadow-lg"
                                            )}>
                                                {part.value}
                                            </div>
                                            <span className={cn(
                                                "font-semibold text-right text-xs sm:text-sm",
                                                primaryTextClass,
                                                "text-shadow-none dark:text-shadow-md"
                                            )}>
                                                {part.label} {tracker.type === 'till' ? 'to go' : 'ago'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )) || (sortedParts.length > 1 && (
                            <>
                                {/* Manual logic or > 2 parts logic (existing fallback) */}
                                {/* High priority item on top */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    <div className={cn(
                                        "font-bold tabular-nums leading-[0.85] text-right text-4xl sm:text-6xl",
                                        primaryTextClass,
                                        "text-shadow-none dark:text-shadow-lg"
                                    )}>
                                        {sortedParts[0].value}
                                    </div>
                                    <span className={cn(
                                        "font-semibold text-right text-sm sm:text-base",
                                        primaryTextClass,
                                        "text-shadow-none dark:text-shadow-md"
                                    )}>
                                        {sortedParts[0].label} {tracker.type === 'till' ? 'to go' : 'ago'}
                                    </span>
                                </div>

                                {/* Remaining items on same line */}
                                <div className="flex items-baseline gap-1 justify-end">
                                    {/* "OR" prefix for 2 items, or "OR" + slash separator for 3 items */}
                                    {sortedParts.length >= 2 && !isAuto && (
                                        <span className={cn("text-[10px] sm:text-xs font-medium", tertiaryTextClass)}>
                                            OR
                                        </span>
                                    )}

                                    {sortedParts.slice(1).map((part, index) => (
                                        <div key={index + 1} className="flex items-baseline gap-1">
                                            {/* Show "/" separator before last item if there are 3 total */}
                                            {sortedParts.length === 3 && index === 1 && !isAuto && (
                                                <span className={cn("font-medium", tertiaryTextClass)}>/</span>
                                            )}

                                            <div className={cn(
                                                "font-bold tabular-nums leading-[0.85] text-right text-lg sm:text-2xl",
                                                primaryTextClass,
                                                "text-shadow-none dark:text-shadow-lg"
                                            )}>
                                                {part.value}
                                            </div>
                                            <span className={cn(
                                                "font-semibold text-right text-xs sm:text-sm",
                                                primaryTextClass,
                                                "text-shadow-none dark:text-shadow-md"
                                            )}>
                                                {part.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
