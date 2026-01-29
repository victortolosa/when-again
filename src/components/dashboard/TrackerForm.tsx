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
import { TrackerFormData, DEFAULT_CATEGORIES, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TrackerFormProps {
    onSubmit: (data: TrackerFormData) => void;
    initialData?: Partial<TrackerFormData>;
    trigger?: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

// Helper to format date for input (avoids timezone issues)
function formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function TrackerForm({
    onSubmit,
    initialData,
    trigger,
    title = 'Create Tracker',
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: TrackerFormProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;
    // Initialize with local midnight date to avoid timezone issues
    const getInitialDate = () => {
        if (initialData?.target_date) return initialData.target_date;
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const [formData, setFormData] = useState<TrackerFormData>({
        title: initialData?.title || '',
        target_date: getInitialDate(),
        type: initialData?.type || 'since',
        category: initialData?.category || '',
        color_theme: initialData?.color_theme || COLOR_THEMES[9], // Default to blue
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        setOpen(false);
        // Reset form with local midnight date
        const today = new Date();
        setFormData({
            title: '',
            target_date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            type: 'since',
            category: '',
            color_theme: COLOR_THEMES[9],
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>+ New Tracker</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Quit Smoking, Vacation"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={formData.type === 'since' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setFormData({ ...formData, type: 'since' })}
                            >
                                📈 Days Since
                            </Button>
                            <Button
                                type="button"
                                variant={formData.type === 'till' ? 'default' : 'outline'}
                                className="flex-1"
                                onClick={() => setFormData({ ...formData, type: 'till' })}
                            >
                                ⏳ Days Until
                            </Button>
                        </div>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">
                            {formData.type === 'since' ? 'Start Date' : 'Target Date'}
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={formatDateForInput(formData.target_date)}
                            onChange={(e) => {
                                // Create date at local midnight to avoid timezone issues
                                const [year, month, day] = e.target.value.split('-').map(Number);
                                const localDate = new Date(year, month - 1, day);
                                setFormData({ ...formData, target_date: localDate });
                            }}
                            required
                        />
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
                            {initialData ? 'Save Changes' : 'Create Tracker'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
