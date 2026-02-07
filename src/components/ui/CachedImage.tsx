'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { refreshFirebaseDownloadUrl } from '@/lib/storage';
import { getFirebaseStorage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Global session cache to track loaded images
const imageCache = new Set<string>();

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
}

/**
 * A component that provides smooth fade-in transitions for images
 * and skips the animation if the image was already loaded in this session.
 */
export function CachedImage({
    src,
    alt,
    className,
    containerClassName,
    onLoad,
    onError,
    ...props
}: CachedImageProps) {
    const [resolvedSrc, setResolvedSrc] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAlreadyCached, setIsAlreadyCached] = useState(false);
    // Track blob URLs to revoke them on unmount
    const blobUrlRef = useRef<string | null>(null);

    // Cleanup blob URL on unmount or change
    useEffect(() => {
        return () => {
            if (blobUrlRef.current) {
                URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = null;
            }
        };
    }, [src]); // Re-run if src changes

    useEffect(() => {
        // Reset state
        setResolvedSrc(null);
        setIsLoaded(false);
        setIsAlreadyCached(false);

        const fetchAndCreateBlob = async (url: string) => {
            try {
                // If we've already validated this URL in this session, we could skip fetch?
                // But for now, let's allow browser cache to handle the data, but use fetch to catch 403s.
                // Note: 'no-cors' mode produces opaque response which fails blob(). 'cors' is needed.
                // Firebase Storage supports CORS.
                const response = await fetch(url, { method: 'GET', mode: 'cors' });

                if (!response.ok) {
                    // This catches 403 (Forbidden) and 404 (Not Found)
                    // silently without browser console error (mostly).
                    // console.debug('Image fetch failed:', response.status, url);
                    return; // Stays null, no error shown
                }

                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                // Revoke old blob
                if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
                blobUrlRef.current = objectUrl;

                setResolvedSrc(objectUrl);

                const cached = imageCache.has(url);
                setIsAlreadyCached(cached);
                setIsLoaded(cached); // Or true immediately since we have the data?
                // If we have the blob, it's loaded.
                setIsLoaded(true);

                imageCache.add(url);
            } catch (err) {
                // Network error or CORS error
                console.warn('Silent image load failure:', err);
            }
        };

        const resolve = async () => {
            if (!src) return;

            let candidateUrl = src;

            // Handle Storage Paths
            if (!src.startsWith('http') && !src.startsWith('blob:') && !src.startsWith('data:')) {
                try {
                    const storage = getFirebaseStorage();
                    candidateUrl = await getDownloadURL(ref(storage, src));
                } catch (err: any) {
                    if (err?.code === 'storage/object-not-found') return;
                    console.error('Failed to resolve path:', err);
                    return;
                }
            }

            // Now fetch as blob to verify access
            await fetchAndCreateBlob(candidateUrl);
        };

        resolve();
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    if (!resolvedSrc) {
        return null;
    }

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={resolvedSrc}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-all duration-700 ease-out",
                    isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-105 blur-lg",
                    className
                )}
                onLoad={handleLoad}
                onError={(e) => {
                    // Should rarely happen with blob strategy
                    if (onError) onError(e);
                }}
                {...props}
            />
        </div>
    );
}
