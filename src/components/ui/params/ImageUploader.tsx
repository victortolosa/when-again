'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { convertToJpegIfHeic } from '@/lib/storage';
import ImageCropper from '@/components/ui/ImageCropper';
import { CachedImage } from '@/components/ui/CachedImage';

interface ImageUploaderProps {
    imagePreview: string | null;
    imageError: string | null;
    onImageSelect: (file: File) => void;
    onImageRemove: () => void;
    onError: (error: string | null) => void;
    onCropComplete: (croppedFile: File, originalFile: File) => void;
}

export function ImageUploader({
    imagePreview,
    imageError,
    onImageSelect,
    onImageRemove,
    onError,
    onCropComplete,
}: ImageUploaderProps) {
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        onError(null);

        try {
            // Convert HEIC to JPEG if needed
            const processedFile = await convertToJpegIfHeic(file);

            // Validate file type
            const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!acceptedTypes.includes(processedFile.type.toLowerCase())) {
                onError('Please select JPG, PNG, WebP, or GIF format');
                return;
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (processedFile.size > maxSize) {
                onError('Image size must be less than 10MB');
                return;
            }

            onImageSelect(processedFile);

            // Create temporary preview for the cropper
            const reader = new FileReader();
            reader.onload = (event) => {
                setTempImage(event.target?.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(processedFile);
        } catch (error) {
            console.error('File processing failed:', error);
            onError('Failed to process image file');
        }
    };

    const handleCropCompleteInternal = (croppedFile: File, originalFile: File) => {
        onCropComplete(croppedFile, originalFile);
        setIsCropping(false);
        setTempImage(null);
    };

    const handleCropCancel = () => {
        setIsCropping(false);
        setTempImage(null);
    };

    return (
        <div className="space-y-2">
            <Label>Image (Optional)</Label>
            {imagePreview ? (
                <div className="relative">
                    <CachedImage
                        src={imagePreview}
                        alt="Preview"
                        className="w-full aspect-[4/3] object-cover rounded-md"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 min-h-[36px] touch-manipulation"
                        onClick={onImageRemove}
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

            {tempImage && (
                <ImageCropper
                    image={tempImage}
                    open={isCropping}
                    onCropComplete={handleCropCompleteInternal}
                    onCancel={handleCropCancel}
                    aspect={4 / 3}
                />
            )}
        </div>
    );
}
