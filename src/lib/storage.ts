import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import heic2any from 'heic2any';

/**
 * Upload an image to Firebase Storage
 * @param file - The file to upload
 * @param userId - The user's ID for organizing storage
 * @param date - The date for the entry (used in path)
 * @returns The download URL for the uploaded image
 */
export async function uploadEntryImage(
    file: File,
    userId: string,
    date: Date
): Promise<string> {
    const storage = getFirebaseStorage();

    // Convert HEIC to JPEG if needed
    const processedFile = await convertToJpegIfHeic(file);

    // Create a unique filename
    const dateString = date.toISOString().split('T')[0];
    const extension = processedFile.name.split('.').pop() || 'jpg';
    const filename = `${dateString}-${Date.now()}.${extension}`;

    // Create the storage reference
    const storageRef = ref(storage, `entries/${userId}/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, processedFile, {
        contentType: processedFile.type,
        cacheControl: 'public,max-age=31536000',
    });

    // Get and return the download URL
    return getDownloadURL(snapshot.ref);
}

/**
 * Convert HEIC file to JPEG if necessary
 * @param file - The file to check and potentially convert
 * @returns The converted File or the original File
 */
export async function convertToJpegIfHeic(file: File): Promise<File> {
    if (
        file.type === 'image/heic' ||
        file.name.toLowerCase().endsWith('.heic')
    ) {
        try {
            const result = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8,
            });

            const blob = Array.isArray(result) ? result[0] : result;
            const newName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';

            return new File([blob], newName, {
                type: 'image/jpeg',
                lastModified: Date.now(),
            });
        } catch (error) {
            console.error('HEIC conversion failed:', error);
            return file;
        }
    }
    return file;
}

/**
 * Delete an image from Firebase Storage
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteEntryImage(imageUrl: string): Promise<void> {
    try {
        const storage = getFirebaseStorage();
        // Extract the path from the URL and create a reference
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        // Ignore errors if the file doesn't exist
        console.warn('Failed to delete image:', error);
    }
}

/**
 * Compress and resize an image before upload
 * @param file - The original file
 * @param maxWidth - Maximum width in pixels
 * @param quality - JPEG quality (0-1)
 * @returns A compressed Blob
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                // Calculate new dimensions (only downscale, never upscale)
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Failed to get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Failed to compress image'));
                        }
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });
}

/**
 * Upload a milestone image to Firebase Storage
 * @param file - The file to upload
 * @param userId - The user's ID for organizing storage
 * @param milestoneId - The milestone ID
 * @returns The download URL for the uploaded image
 */
export async function uploadMilestoneImage(
    file: File,
    userId: string,
    milestoneId: string
): Promise<string> {
    const storage = getFirebaseStorage();

    // Convert HEIC to JPEG if needed
    const processedFile = await convertToJpegIfHeic(file);

    // Create a unique filename
    const extension = processedFile.name.split('.').pop() || 'jpg';
    const filename = `${milestoneId}-${Date.now()}.${extension}`;

    // Create the storage reference
    const storageRef = ref(storage, `milestones/${userId}/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, processedFile, {
        contentType: processedFile.type,
        cacheControl: 'public,max-age=31536000',
    });

    // Get and return the download URL
    return getDownloadURL(snapshot.ref);
}

/**
 * Delete a milestone image from Firebase Storage
 * @param imageUrl - The full URL of the image to delete
 */
export async function deleteMilestoneImage(imageUrl: string): Promise<void> {
    try {
        const storage = getFirebaseStorage();
        // Extract the path from the URL and create a reference
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);
    } catch (error) {
        // Ignore errors if the file doesn't exist
        console.warn('Failed to delete milestone image:', error);
    }
}

/**
 * Compress a milestone image with optimized settings
 * @param file - The original file
 * @returns A compressed Blob
 */
export async function compressMilestoneImage(file: File): Promise<Blob> {
    return compressImage(file, 1920, 0.85);
}
