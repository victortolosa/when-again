'use client';

import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { refreshFirebaseDownloadUrl } from '@/lib/storage';

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
    const [resolvedSrc, setResolvedSrc] = useState(src);
    // Initialize to false to avoid hydration mismatch (server doesn't know about client cache)
    const [isLoaded, setIsLoaded] = useState(false);
    const [isAlreadyCached, setIsAlreadyCached] = useState(false);
    const [error, setError] = useState(false);
    const [didRetry, setDidRetry] = useState(false);

    useEffect(() => {
        setResolvedSrc(src);
        setError(false);
        setDidRetry(false);

        // Check cache strictly on client side
        const cached = imageCache.has(src);
        setIsAlreadyCached(cached);
        setIsLoaded(cached);
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        imageCache.add(resolvedSrc);
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        if (!didRetry) {
            setDidRetry(true);
            const refreshedUrl = await refreshFirebaseDownloadUrl(resolvedSrc);

            if (refreshedUrl && refreshedUrl !== resolvedSrc) {
                setResolvedSrc(refreshedUrl);
                setError(false);
                setIsLoaded(imageCache.has(refreshedUrl));
                return;
            }
        }

        setError(true);
        if (onError) onError(e);
    };

    if (error) {
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
                    isLoaded
                        ? "opacity-100 scale-100 blur-0"
                        : "opacity-0 scale-105 blur-lg",
                    isAlreadyCached && "duration-0", // No animation if already seen in session
                    className
                )}
                onLoad={handleLoad}
                onError={handleError}
                {...props}
            />
        </div>
    );
}
