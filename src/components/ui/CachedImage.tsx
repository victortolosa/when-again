'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

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
    const isAlreadyCached = imageCache.has(src);
    const [isLoaded, setIsLoaded] = useState(isAlreadyCached);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Reset state if src changes
        if (!imageCache.has(src)) {
            setIsLoaded(false);
            setError(false);
        } else {
            setIsLoaded(true);
            setError(false);
        }
    }, [src]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        imageCache.add(src);
        setIsLoaded(true);
        if (onLoad) onLoad(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
                src={src}
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
