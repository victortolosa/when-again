'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { getFirebaseStorage } from '@/lib/firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Session-wide caches so remounts (tab switches, re-sorts, list re-renders)
// show images instantly instead of re-fetching and flashing.
const MAX_CACHED = 100;
const blobCache = new Map<string, string>(); // src -> object URL
const inflight = new Map<string, Promise<string | null>>();
const shownUrls = new Set<string>(); // object URLs already displayed once

function remember(src: string, objectUrl: string) {
    blobCache.set(src, objectUrl);
    if (blobCache.size > MAX_CACHED) {
        const oldest = blobCache.keys().next().value as string;
        const oldUrl = blobCache.get(oldest);
        blobCache.delete(oldest);
        if (oldUrl) {
            shownUrls.delete(oldUrl);
            URL.revokeObjectURL(oldUrl);
        }
    }
}

async function loadImage(src: string): Promise<string | null> {
    const hit = blobCache.get(src);
    if (hit) return hit;
    const pending = inflight.get(src);
    if (pending) return pending;

    const task = (async () => {
        try {
            let candidateUrl = src;
            // Storage paths need resolving to a download URL first
            if (!src.startsWith('http') && !src.startsWith('blob:') && !src.startsWith('data:')) {
                try {
                    candidateUrl = await getDownloadURL(ref(getFirebaseStorage(), src));
                } catch (err: unknown) {
                    if ((err as { code?: string })?.code !== 'storage/object-not-found') {
                        console.error('Failed to resolve path:', err);
                    }
                    return null;
                }
            }
            // Fetch as blob so 403/404 fail quietly instead of showing a broken image
            const response = await fetch(candidateUrl, { method: 'GET', mode: 'cors' });
            if (!response.ok) return null;
            const objectUrl = URL.createObjectURL(await response.blob());
            remember(src, objectUrl);
            return objectUrl;
        } catch (err) {
            console.warn('Silent image load failure:', err);
            return null;
        } finally {
            inflight.delete(src);
        }
    })();
    inflight.set(src, task);
    return task;
}

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
}

/**
 * Image that fades in once, and not at all when it was already shown this
 * session. While a new src resolves, the previous image stays on screen.
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
    const [resolved, setResolved] = useState<{ src: string; url: string } | null>(null);
    const [loadedUrl, setLoadedUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;
        let cancelled = false;
        loadImage(src).then((url) => {
            if (!cancelled && url) setResolved({ src, url });
        });
        return () => {
            cancelled = true;
        };
    }, [src]);

    // Prefer the synchronous cache hit, else whatever last resolved
    const url = blobCache.get(src) ?? resolved?.url ?? null;
    if (!url) return null;

    const isLoaded = shownUrls.has(url) || loadedUrl === url;

    return (
        <div className={cn("relative w-full h-full overflow-hidden", containerClassName)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={url}
                alt={alt}
                className={cn(
                    "w-full h-full object-cover transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none",
                    isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]",
                    className
                )}
                onLoad={(e) => {
                    shownUrls.add(url);
                    setLoadedUrl(url);
                    onLoad?.(e);
                }}
                onError={(e) => onError?.(e)}
                {...props}
            />
        </div>
    );
}
