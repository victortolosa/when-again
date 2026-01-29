'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { EventFormData, DEFAULT_CATEGORIES, COLOR_THEMES } from '@/lib/types';
import { RECURRENCE_PRESETS } from '@/lib/utils/recurrence';
import { cn } from '@/lib/utils';

interface EventFormProps {
    onSubmit: (data: EventFormData) => void;
    initialData?: Partial<EventFormData>;
    trigger?: React.ReactNode;
    title?: string;
}

const recurrenceOptions = [
    { label: 'Daily', value: RECURRENCE_PRESETS.daily },
    { label: 'Weekly', value: RECURRENCE_PRESETS.weekly },
    { label: 'Biweekly', value: RECURRENCE_PRESETS.biweekly },
    { label: 'Monthly', value: RECURRENCE_PRESETS.monthly },
    { label: '1st of Month', value: RECURRENCE_PRESETS.monthlyFirst },
    { label: 'Yearly', value: RECURRENCE_PRESETS.yearly },
    { label: 'Weekdays', value: RECURRENCE_PRESETS.weekdays },
    { label: 'Weekends', value: RECURRENCE_PRESETS.weekends },
];

export function EventForm({
    onSubmit,
    initialData,
    trigger,
    title = 'Create Recurring Event',
}: EventFormProps) {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState<EventFormData>({
        title: initialData?.title || '',
        start_date: initialData?.start_date || new Date(),
        recurrence_rule: initialData?.recurrence_rule || RECURRENCE_PRESETS.monthly,
        category: initialData?.category || '',
        color_theme: initialData?.color_theme || COLOR_THEMES[5], // Default to green
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setOpen(false);
        // Reset form
        setFormData({
            title: '',
            start_date: new Date(),
            recurrence_rule: RECURRENCE_PRESETS.monthly,
            category: '',
            color_theme: COLOR_THEMES[5],
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>+ New Event</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="event-title">Title</Label>
                        <Input
                            id="event-title"
                            placeholder="e.g., Rent Due, Team Meeting"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label htmlFor="start-date">Start Date</Label>
                        <Input
                            id="start-date"
                            type="date"
                            value={formData.start_date.toISOString().split('T')[0]}
                            onChange={(e) =>
                                setFormData({ ...formData, start_date: new Date(e.target.value) })
                            }
                            required
                        />
                    </div>

                    {/* Recurrence */}
                    <div className="space-y-2">
                        <Label>Recurrence Pattern</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {recurrenceOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    type="button"
                                    variant={formData.recurrence_rule === option.value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, recurrence_rule: option.value })}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <div className="flex flex-wrap gap-2">
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <Button
                                    key={cat.id}
                                    type="button"
                                    variant={formData.category === cat.name ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFormData({ ...formData, category: cat.name })}
                                >
                                    {cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Color Theme */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_THEMES.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    className={cn(
                                        'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                                        formData.color_theme === color
                                            ? 'border-foreground scale-110'
                                            : 'border-transparent'
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setFormData({ ...formData, color_theme: color })}
                                />
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={!formData.title}>
                            {initialData ? 'Save Changes' : 'Create Event'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
