'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { ReminderFormData, DEFAULT_CATEGORIES, COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';
import { convertToJpegIfHeic } from '@/lib/storage';
import { generateUniqueGradient, generateRandomGradient } from '@/lib/utils/gradient-generator';
import { MeshGradient } from '@mesh-gradient/react';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from '@/components/ui/tabs';
import ImageCropper from '@/components/ui/ImageCropper';

interface ReminderFormProps {
    onSubmit: (data: ReminderFormData, croppedFile?: File, originalFile?: File) => void;
    initialData?: Partial<ReminderFormData>;
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

export function ReminderForm({
    onSubmit,
    initialData,
    trigger,
    title = 'Create Memory',
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: ReminderFormProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setUncontrolledOpen;

    // Initialize with local midnight date to avoid timezone issues
    const getInitialDate = () => {
        if (initialData?.date) return initialData.date;
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth(), today.getDate());
    };

    const [formData, setFormData] = useState<ReminderFormData>({
        title: initialData?.title || '',
        description: initialData?.description || '',
        date: getInitialDate(),
        category: initialData?.category || '',
        color_theme: initialData?.color_theme || COLOR_THEMES[9], // Default to blue
        image_url: initialData?.image_url || undefined,
        gradient_config: initialData?.gradient_config,
    });

    const handleRegenerateGradient = () => {
        // Generate new gradient with random harmonious colors and mesh seed
        const newGradient = generateRandomGradient();
        setFormData({ ...formData, gradient_config: newGradient });
    };

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cropped_image_url || initialData?.image_url || null);
    const [uploadingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [customCategory, setCustomCategory] = useState('');

    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    // Update image preview when initialData changes (for edit mode)
    useEffect(() => {
        if (initialData?.cropped_image_url || initialData?.image_url) {
            setTimeout(() => {
                setImagePreview(initialData.cropped_image_url || initialData.image_url || null);
                setFormData(prev => ({
                    ...prev,
                    image_url: initialData.image_url,
                    cropped_image_url: initialData.cropped_image_url
                }));
            }, 0);
        }
    }, [initialData?.cropped_image_url, initialData?.image_url]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImageError(null);

        try {
            // Convert HEIC to JPEG if needed
            const processedFile = await convertToJpegIfHeic(file);

            // Validate file type
            const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!acceptedTypes.includes(processedFile.type.toLowerCase())) {
                setImageError('Please select JPG, PNG, WebP, or GIF format');
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (processedFile.size > maxSize) {
                setImageError('Image size must be less than 10MB');
                return;
            }

            // Create temporary preview for the cropper
            const reader = new FileReader();
            reader.onload = (event) => {
                setTempImage(event.target?.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error('File processing failed:', error);
            setImageError('Failed to process image file');
        }
    };

    const handleCropComplete = (croppedFile: File, originalFile: File) => {
        setSelectedFile(croppedFile);
        setOriginalFile(originalFile);
        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(croppedFile);
        setIsCropping(false);
        setTempImage(null);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setTempImage(null);
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setOriginalFile(null);
        setImagePreview(null);
        setFormData({ ...formData, image_url: undefined, cropped_image_url: undefined });
        setImageError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Only generate a new gradient if one doesn't exist and there's no image
        let gradientConfig = formData.gradient_config;
        if (!imagePreview && !gradientConfig) {
            // Generate gradient with harmonious colors based on title + timestamp
            const colorSeed = formData.title + Date.now().toString();
            gradientConfig = generateUniqueGradient(colorSeed);
        }

        onSubmit({
            ...formData,
            gradient_config: gradientConfig,
        }, selectedFile || undefined, originalFile || undefined);

        setOpen(false);
        // Reset form with local midnight date
        const today = new Date();
        setFormData({
            title: '',
            description: '',
            date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            category: '',
            color_theme: COLOR_THEMES[9],
            image_url: undefined,
            gradient_config: undefined,
        });
        setSelectedFile(null);
        setOriginalFile(null);
        setImagePreview(null);
        setImageError(null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || <Button>+ New Memory</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="details">Details</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-4 pt-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Change air filter, Doctor appointment"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Add notes or details about this reminder..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="resize-none"
                                />
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={formatDateForInput(formData.date)}
                                    onChange={(e) => {
                                        // Create date at local midnight to avoid timezone issues
                                        const [year, month, day] = e.target.value.split('-').map(Number);
                                        const localDate = new Date(year, month - 1, day);
                                        setFormData({ ...formData, date: localDate });
                                    }}
                                    required
                                />
                            </div>

                            {/* Image Upload */}
                            <div className="space-y-2">
                                <Label>Image (Optional)</Label>
                                {imagePreview ? (
                                    <div className="relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="w-full aspect-[4/3] object-cover rounded-md"
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
                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif"
                                        onChange={handleFileSelect}
                                        className="cursor-pointer"
                                    />
                                )}
                                {imageError && <p className="text-xs text-destructive">{imageError}</p>}
                            </div>
                        </TabsContent>

                        <TabsContent value="details" className="space-y-4 pt-4">
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

                            {/* Gradient Preview & Regenerate - Only show if editing and no image */}
                            {initialData && !imagePreview && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Background Gradient</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleRegenerateGradient}
                                        >
                                            🎨 Regenerate
                                        </Button>
                                    </div>
                                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
                                        {formData.gradient_config?.colors ? (
                                            <MeshGradient
                                                options={{
                                                    colors: formData.gradient_config.colors,
                                                    isStatic: true,
                                                    seed: formData.gradient_config.seed
                                                }}
                                                className="w-full h-full"
                                            />
                                        ) : (
                                            <div
                                                className="w-full h-full"
                                                style={{ backgroundColor: formData.color_theme }}
                                            />
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium drop-shadow-lg">
                                                Preview
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Don&apos;t like it? Click &quot;Regenerate&quot; for a new gradient
                                    </p>
                                </div>
                            )}

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
                            disabled={!formData.title || uploadingImage}
                            className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                        >
                            {uploadingImage ? 'Uploading...' : (initialData ? 'Save Changes' : 'Create Memory')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {tempImage && (
                <ImageCropper
                    image={tempImage}
                    open={isCropping}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspect={4 / 3}
                />
            )}
        </Dialog>
    );
}
