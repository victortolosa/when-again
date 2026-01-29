'use client';

import { useState, useEffect } from 'react';
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
    onSubmit: (data: TrackerFormData, file?: File) => void;
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
        image_url: initialData?.image_url || undefined,
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    // Update image preview when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData?.image_url) {
            setImagePreview(initialData.image_url);
        }
    }, [initialData?.image_url]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type - accept common web formats only
        const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!acceptedTypes.includes(file.type.toLowerCase())) {
            if (file.type === 'image/heic' || file.type === 'image/heif') {
                setImageError('HEIC format not supported. Please convert to JPG or PNG first.');
            } else {
                setImageError('Please select JPG, PNG, WebP, or GIF format');
            }
            return;
        }

        // Validate file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
            setImageError('Image size must be less than 10MB');
            return;
        }

        setImageError(null);
        setSelectedFile(file);

        // Create preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image_url: undefined });
        setImageError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ ...formData, image_url: imagePreview || undefined }, selectedFile || undefined);
        setOpen(false);
        // Reset form with local midnight date
        const today = new Date();
        setFormData({
            title: '',
            target_date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            type: 'since',
            category: '',
            color_theme: COLOR_THEMES[9],
            image_url: undefined,
        });
        setSelectedFile(null);
        setImagePreview(null);
        setImageError(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>+ New Tracker</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
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
                                className="flex-1 min-h-[44px] touch-manipulation"
                                onClick={() => setFormData({ ...formData, type: 'since' })}
                            >
                                📈 Days Since
                            </Button>
                            <Button
                                type="button"
                                variant={formData.type === 'till' ? 'default' : 'outline'}
                                className="flex-1 min-h-[44px] touch-manipulation"
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
                        <Label>Category (Optional)</Label>
                        <div className="flex flex-wrap gap-2">
                            {/* None button */}
                            <Button
                                type="button"
                                variant={!formData.category ? 'default' : 'outline'}
                                size="sm"
                                className="min-h-[36px] touch-manipulation"
                                onClick={() => setFormData({ ...formData, category: '' })}
                            >
                                None
                            </Button>

                            {/* Default categories */}
                            {DEFAULT_CATEGORIES.map((cat) => (
                                <Button
                                    key={cat.id}
                                    type="button"
                                    variant={formData.category === cat.name ? 'default' : 'outline'}
                                    size="sm"
                                    className="min-h-[36px] touch-manipulation"
                                    onClick={() => setFormData({ ...formData, category: cat.name })}
                                >
                                    {cat.name}
                                </Button>
                            ))}

                            {/* Show custom category button if it exists and isn't in default list */}
                            {formData.category && !DEFAULT_CATEGORIES.some(cat => cat.name === formData.category) && (
                                <Button
                                    type="button"
                                    variant="default"
                                    size="sm"
                                    className="min-h-[36px] touch-manipulation"
                                    onClick={() => setFormData({ ...formData, category: '' })}
                                >
                                    {formData.category} ✕
                                </Button>
                            )}
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
                                            setFormData({ ...formData, category: customCategory.trim() });
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
                                        setFormData({ ...formData, category: customCategory.trim() });
                                        setCustomCategory('');
                                    }
                                }}
                                disabled={!customCategory.trim()}
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {/* Color Theme */}
                    <div className="space-y-2">
                        <Label>Color</Label>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {COLOR_THEMES.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-label={`Select ${color} color`}
                                    className={cn(
                                        'w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 transition-transform hover:scale-110 touch-manipulation',
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

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Image (Optional)</Label>
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-40 sm:h-48 object-cover rounded-md"
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 min-h-[36px] touch-manipulation"
                                    onClick={handleRemoveImage}
                                >
                                    Remove
                                </Button>
                            </div>
                        ) : (
                            <Input
                                type="file"
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                onChange={handleFileSelect}
                                className="cursor-pointer"
                            />
                        )}
                        {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                    </div>

                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={!formData.title || uploadingImage}
                            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                        >
                            {uploadingImage ? 'Uploading...' : (initialData ? 'Save Changes' : 'Create Tracker')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
