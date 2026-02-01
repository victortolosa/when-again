"use client";

import { Reminder } from '@/lib/types';
import { format } from 'date-fns';
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

interface ReminderCardProps {
    reminder: Reminder;
    onEdit?: (reminder: Reminder) => void;
    onDelete?: (reminderId: string) => void;
}

export function ReminderCard({ reminder, onEdit, onDelete }: ReminderCardProps) {
    const reminderDate = reminder.date.toDate();
    const today = new Date();
    const daysDiff = Math.ceil((reminderDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    const formattedDate = format(reminderDate, 'MMM d, yyyy');

    return (
        <Card className={cn(
            "group relative overflow-hidden transition-all hover:shadow-sm flex flex-col",
            (reminder.cropped_image_url || reminder.image_url) ? "aspect-[4/3]" : "aspect-[2/1]"
        )}>
            <MeshGradientBackground gradientConfig={reminder.gradient_config} color={reminder.color_theme} />

            {(reminder.cropped_image_url || reminder.image_url) && (
                <div className="absolute inset-0 z-0">
                    <CachedImage
                        src={reminder.cropped_image_url || reminder.image_url!}
                        alt={reminder.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            <CardContent className="relative z-10 p-4 flex flex-col h-full">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="text-base font-semibold text-white mb-1">{reminder.title}</h4>
                        {reminder.category && (
                            <div className="text-[11px] text-white/80">{reminder.category}</div>
                        )}
                    </div>

                    {(onEdit || onDelete) && (
                        <div className="shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-white/80 hover:text-white" aria-label="Open menu">⋮</Button>
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
                    <p className="text-sm text-white/90 mb-3 line-clamp-3 flex-1">{reminder.description}</p>
                )}

                <div className="flex items-center justify-between gap-2 text-xs mt-auto">
                    <div className="text-white/80 flex items-center gap-1">
                        <span>📅</span>
                        <span>{formattedDate}</span>
                    </div>
                    <div className={cn('font-medium tabular-nums px-2 py-0.5 rounded-full',
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
