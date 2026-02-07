"use client";

import { useState, useEffect } from 'react';
import { Reminder } from '@/lib/types';
import { formatDisplayDate } from '@/lib/utils/date';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { MeshGradientBackground } from '@/components/ui/MeshGradientBackground';
import { CachedImage } from '@/components/ui/CachedImage';
import { Calendar } from 'lucide-react';

interface ReminderCardProps {
    reminder: Reminder;
    onEdit?: (reminder: Reminder) => void;
    onDelete?: (reminderId: string) => void;
}

export function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
    const reminderDate = reminder.date.toDate();
    const [today, setToday] = useState<Date | null>(null);

    useEffect(() => {
        setToday(new Date());
    }, []);

    // Return early or show skeletal/loading state if dates aren't ready to prevent hydration mismatch
    // But since we need to render the card structure, we just default daysDiff to 0 or null and handle it in render
    const daysDiff = today
        ? Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    const formattedDate = formatDisplayDate(reminderDate);

    const imageSrc = reminder.cropped_image_url || reminder.image_url || null;

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all hover:shadow-sm flex flex-col",
            (reminder.cropped_image_url || reminder.image_url) ? "aspect-[16/8]" : "aspect-[16/6]"
        )}>
            <MeshGradientBackground gradientConfig={reminder.gradient_config} color={reminder.color_theme} />

            {imageSrc && failedSrc !== imageSrc && (
                <div className="absolute inset-0 z-0">
                    <CachedImage
                        src={imageSrc}
                        alt={reminder.title}
                        className="w-full h-full object-cover"
                        onError={() => setFailedSrc(imageSrc)}
                    />
                    <div className="absolute inset-0 bg-white/75 dark:bg-black/40" />
                </div>
            )}

            <CardContent className="relative z-10 p-3 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                        <h4 className={cn(
                            "text-sm font-semibold mb-0.5 line-clamp-1",
                            "text-black dark:text-white"
                        )}>{reminder.title}</h4>
                        {reminder.category && (
                            <div className={cn(
                                "text-[10px] line-clamp-1",
                                "text-black/80 dark:text-white/80"
                            )}>{reminder.category}</div>
                        )}
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "h-6 w-6 p-0",
                                            "text-black/80 hover:text-black dark:text-white/80 dark:hover:text-white"
                                        )}
                                        aria-label="Open menu"
                                    >
                                        ⋮
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-36">
                                    {onEdit && (
                                        <DropdownMenuItem onClick={() => onEdit(reminder)}>Edit</DropdownMenuItem>
                                    )}
                                    {onDelete && (
                                        <DropdownMenuItem onClick={() => onDelete(reminder.id)} className="text-destructive">Delete</DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {reminder.description && (
                    <p className={cn(
                        "text-xs mb-1 line-clamp-1",
                        "text-black/90 dark:text-white/90"
                    )}>{reminder.description}</p>
                )}

                <div className="flex items-center justify-between gap-2 text-[11px] mt-auto">
                    <div className={cn(
                        "flex items-center gap-1",
                        "text-black/80 dark:text-white/80"
                    )}>
                        <Calendar className="h-3 w-3" aria-hidden="true" />
                        <span>{formattedDate}</span>
                    </div>
                    <div className={cn('font-medium tabular-nums px-1.5 py-0 rounded-full',
                        daysDiff < 0 ? 'bg-green-500/20 text-green-300' :
                            daysDiff === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                                'bg-blue-500/20 text-blue-300'
                    )}>
                        {daysDiff > 0 ? `${daysDiff}d` : daysDiff === 0 ? 'today' : `${Math.abs(daysDiff)}d ago`}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
