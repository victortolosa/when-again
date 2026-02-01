'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { generateUniqueGradient } from '@/lib/utils/gradient-generator';
import { cn } from '@/lib/utils';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';
import { GradientPicker } from '@/components/ui/params/GradientPicker';
import { ColorPicker } from '@/components/ui/params/ColorPicker';
import { ImageUploader } from '@/components/ui/params/ImageUploader';

// Zod Schema
const trackerSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    target_date: z.date(),
    type: z.enum(['since', 'till']),
    category: z.string().optional(),
    color_theme: z.string(),
    image_url: z.string().optional(),
    cropped_image_url: z.string().optional(),
    display_units: z.array(z.enum(['years', 'months', 'days', 'auto'])).optional(),
    gradient_config: z.any().optional(), // GradientConfig type is complex for zod, using any or custom validation if needed
});

type TrackerFormSchema = z.infer<typeof trackerSchema>;

interface TrackerFormProps {
    onSubmit: (data: TrackerFormData, croppedFile?: File, originalFile?: File) => void;
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
    // Initialize with local midnight date to avoid timezone issues
    const getInitialDate = useCallback(() => {
        if (initialData?.target_date) return initialData.target_date;
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    }, [initialData?.target_date]);

    const {
        register,
        control,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<TrackerFormSchema>({
        resolver: zodResolver(trackerSchema),
        defaultValues: {
            title: initialData?.title || '',
            target_date: getInitialDate(),
            type: initialData?.type || 'since',
            category: initialData?.category || '',
            color_theme: initialData?.color_theme || COLOR_THEMES[9],
            image_url: initialData?.image_url,
            cropped_image_url: initialData?.cropped_image_url,
            display_units: initialData?.display_units || ['auto'],
            gradient_config: initialData?.gradient_config,
        },
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cropped_image_url || initialData?.image_url || null);
    const [imageError, setImageError] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    // eslint-disable-next-line react-hooks/incompatible-library
    const formValues = watch();

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (open) {
            reset({
                title: initialData?.title || '',
                target_date: getInitialDate(),
                type: initialData?.type || 'since',
                category: initialData?.category || '',
                color_theme: initialData?.color_theme || COLOR_THEMES[9],
                image_url: initialData?.image_url,
                cropped_image_url: initialData?.cropped_image_url,
                display_units: initialData?.display_units || ['auto'],
                gradient_config: initialData?.gradient_config,
            });
            setImagePreview(initialData?.cropped_image_url || initialData?.image_url || null);
            setSelectedFile(null);
            setOriginalFile(null);
            setImageError(null);
        }
    }, [open, initialData, reset, getInitialDate]);

    const onSubmitHandler = (data: TrackerFormSchema) => {
        // Only generate a new gradient if one doesn't exist and there's no image
        let gradientConfig = data.gradient_config;
        if (!imagePreview && !gradientConfig) {
            // Generate gradient with harmonious colors based on title + timestamp
            const colorSeed = data.title + Date.now().toString();
            gradientConfig = generateUniqueGradient(colorSeed);
        }

        onSubmit({
            ...data,
            gradient_config: gradientConfig,
        } as TrackerFormData, selectedFile || undefined, originalFile || undefined);

        setOpen(false);
    };

    const handleImageSelect = () => {
        // This is handled by ImageUploader via onCropComplete usually, 
        // but initial file selection is passed here if needed before crop
        // We might not need this if we rely solely on crop complete
    };

    const handleCropComplete = (croppedFile: File, original: File) => {
        setSelectedFile(croppedFile);
        setOriginalFile(original);
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(croppedFile);
    };

    const handleImageRemove = () => {
        setSelectedFile(null);
        setOriginalFile(null);
        setImagePreview(null);
        setValue('image_url', undefined);
        setValue('cropped_image_url', undefined);
        setImageError(null);
    };

    // Derived state for category UI
    // Derived state for category UI

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!isControlled && (
                <DialogTrigger asChild>
                    {trigger || <Button>+ New Tracker</Button>}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmitHandler)} className="space-y-4 sm:space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 pt-4">
                            {/* Type */}
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <div className="flex gap-2">
                                    <Controller
                                        name="type"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant={field.value === 'since' ? 'default' : 'outline'}
                                                    className="flex-1 min-h-[44px] touch-manipulation"
                                                    onClick={() => field.onChange('since')}
                                                >
                                                    📈 Days Since
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={field.value === 'till' ? 'default' : 'outline'}
                                                    className="flex-1 min-h-[44px] touch-manipulation"
                                                    onClick={() => field.onChange('till')}
                                                >
                                                    ⏳ Days Until
                                                </Button>
                                            </>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Quit Smoking, Vacation"
                                    {...register('title')}
                                />
                                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">
                                    {formValues.type === 'since' ? 'Start Date' : 'Target Date'}
                                </Label>
                                <Controller
                                    name="target_date"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            id="date"
                                            type="date"
                                            value={formatDateForInput(field.value)}
                                            onChange={(e) => {
                                                const [year, month, day] = e.target.value.split('-').map(Number);
                                                const localDate = new Date(year, month - 1, day);
                                                field.onChange(localDate);
                                            }}
                                        />
                                    )}
                                />
                            </div>

                            {/* Image Upload */}
                            <ImageUploader
                                imagePreview={imagePreview}
                                imageError={imageError}
                                onImageSelect={handleImageSelect}
                                onImageRemove={handleImageRemove}
                                onError={setImageError}
                                onCropComplete={handleCropComplete}
                            />
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4 pt-4">
                            {/* Display Units */}
                            <div className="space-y-4">
                                <Label>Display Units</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Controller
                                        name="display_units"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                {/* Auto Option */}
                                                <Button
                                                    type="button"
                                                    variant={field.value?.includes('auto') ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="min-h-[36px] touch-manipulation capitalize"
                                                    onClick={() => {
                                                        const isSelected = field.value?.includes('auto');
                                                        if (isSelected) {
                                                            field.onChange(['days']); // Default back to days if unselected
                                                        } else {
                                                            field.onChange(['auto']); // 'auto' is exclusive
                                                        }
                                                    }}
                                                >
                                                    Auto
                                                </Button>

                                                {/* Manual Options - Disabled if Auto is selected, or clears Auto if clicked */}
                                                {(['years', 'months', 'days'] as const).map((unit) => {
                                                    const current = field.value || [];
                                                    const isSelected = current.includes(unit);
                                                    const isAutoSelected = current.includes('auto');

                                                    return (
                                                        <Button
                                                            key={unit}
                                                            type="button"
                                                            variant={isSelected ? 'default' : 'outline'}
                                                            size="sm"
                                                            className={cn(
                                                                "min-h-[36px] touch-manipulation capitalize",
                                                                isAutoSelected && "opacity-50"
                                                            )}
                                                            onClick={() => {
                                                                // If clicking a manual unit, remove 'auto' and handle toggling
                                                                let next = current.filter(u => u !== 'auto');

                                                                if (isSelected) {
                                                                    // prevent empty selection
                                                                    if (next.length > 1) {
                                                                        next = next.filter(u => u !== unit);
                                                                    }
                                                                } else {
                                                                    next = [...next, unit];
                                                                }
                                                                field.onChange(next);
                                                            }}
                                                        >
                                                            {unit}
                                                        </Button>
                                                    );
                                                })}
                                            </>
                                        )}
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    Choose which units to show on the tracker card.
                                </p>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <Label>Category (Optional)</Label>
                                <div className="flex flex-wrap gap-2">
                                    <Controller
                                        name="category"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant={!field.value ? 'default' : 'outline'}
                                                    size="sm"
                                                    className="min-h-[36px] touch-manipulation"
                                                    onClick={() => field.onChange('')}
                                                >
                                                    None
                                                </Button>

                                                {DEFAULT_CATEGORIES.map((cat) => (
                                                    <Button
                                                        key={cat.id}
                                                        type="button"
                                                        variant={field.value === cat.name ? 'default' : 'outline'}
                                                        size="sm"
                                                        className="min-h-[36px] touch-manipulation"
                                                        onClick={() => field.onChange(cat.name)}
                                                    >
                                                        {cat.name}
                                                    </Button>
                                                ))}

                                                {/* Show custom category button if it exists and isn't in default list */}
                                                {field.value && !DEFAULT_CATEGORIES.some(cat => cat.name === field.value) && (
                                                    <Button
                                                        type="button"
                                                        variant="default"
                                                        size="sm"
                                                        className="min-h-[36px] touch-manipulation"
                                                        onClick={() => field.onChange('')}
                                                    >
                                                        {field.value} ✕
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    />
                                </div>

                                {/* Custom category input */}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Add custom category..."
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (customCategory.trim()) {
                                                    setValue('category', customCategory.trim());
                                                    setCustomCategory('');
                                                }
                                            }
                                        }}
                                        className="flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="min-h-[36px] touch-manipulation"
                                        onClick={() => {
                                            if (customCategory.trim()) {
                                                setValue('category', customCategory.trim());
                                                setCustomCategory('');
                                            }
                                        }}
                                        disabled={!customCategory.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>

                            {/* Gradient Picker - Only show if editing and no image */}
                            {initialData && !imagePreview && (
                                <Controller
                                    name="gradient_config"
                                    control={control}
                                    render={({ field }) => (
                                        <GradientPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            colorTheme={formValues.color_theme}
                                        />
                                    )}
                                />
                            )}

                            {/* Color Theme */}
                            <Controller
                                name="color_theme"
                                control={control}
                                render={({ field }) => (
                                    <ColorPicker
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!formValues.title || isSubmitting}
                            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                        >
                            {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Tracker')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
