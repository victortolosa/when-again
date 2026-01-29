import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from 'firebase/storage';
import { getFirebaseStorage } from '@/lib/firebase';

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

    // Create a unique filename
    const dateString = date.toISOString().split('T')[0];
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${dateString}-${Date.now()}.${extension}`;

    // Create the storage reference
    const storageRef = ref(storage, `entries/${userId}/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
    });

    // Get and return the download URL
    return getDownloadURL(snapshot.ref);
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

                // Calculate new dimensions
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
