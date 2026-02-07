'use client';

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import getCroppedImg from '@/lib/utils/cropUtils';

interface ImageCropperProps {
    image: string;
    aspect?: number;
    originalFile?: File;
    onCropComplete: (croppedFile: File, originalFile: File) => void;
    onCancel: () => void;
    open: boolean;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
    image,
    aspect = 4 / 3,
    originalFile,
    onCropComplete,
    onCancel,
    open,
}) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

    const onCropChange = (crop: { x: number; y: number }) => {
        setCrop(crop);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    interface CroppedArea {
        x: number;
        y: number;
        width: number;
        height: number;
    }

    const onCropCompleteInternal = useCallback(
        (_croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleSave = async () => {
        try {
            if (!croppedAreaPixels) return;

            const croppedBlob = await getCroppedImg(
                image,
                croppedAreaPixels,
                0,
                { horizontal: false, vertical: false },
                1920, // maxWidth
                0.85 // quality
            );
            if (croppedBlob) {
                const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
                    type: 'image/jpeg',
                });

                let resolvedOriginalFile = originalFile;
                if (!resolvedOriginalFile) {
                    // Create original file from the input data URL
                    // We assume it's a data URL since it comes from FileReader in the parent
                    const originalResponse = await fetch(image);
                    const originalBlob = await originalResponse.blob();
                    resolvedOriginalFile = new File([originalBlob], 'original-image.jpg', {
                        type: originalBlob.type,
                    });
                }

                onCropComplete(croppedFile, resolvedOriginalFile);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
            <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>
                <div className="relative flex-1 bg-black/5 min-h-[300px]">
                    <Cropper
                        image={image}
                        crop={crop}
                        zoom={zoom}
                        aspect={aspect}
                        onCropChange={onCropChange}
                        onCropComplete={onCropCompleteInternal}
                        onZoomChange={onZoomChange}
                    />
                </div>
                <DialogFooter className="p-6 gap-2 bg-background border-t">
                    <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave} className="flex-1">
                        Apply Crop
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ImageCropper;
