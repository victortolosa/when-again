'use client';

import { MeshGradient } from '@mesh-gradient/react';
import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { GradientConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MeshGradientBackgroundProps {
    color?: string;
    gradientConfig?: GradientConfig;
    className?: string;
}

// ── WebGL context pool ──
// iOS Safari limits active WebGL contexts to ~8-16. We render MeshGradient
// (WebGL canvas) one batch at a time, capture each canvas as a static image,
// then release the context so the next card can render.
let _active = 0;
const _MAX = 4;
const _queue: (() => void)[] = [];

function acquireSlot(): Promise<void> {
    if (_active < _MAX) {
        _active++;
        return Promise.resolve();
    }
    return new Promise(resolve => _queue.push(() => { _active++; resolve(); }));
}

function releaseSlot() {
    _active = Math.max(0, _active - 1);
    const next = _queue.shift();
    if (next) next();
}

/**
 * Convert hex color to HSL
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL back to hex
 */
function hslToHex(h: number, s: number, l: number): string {
    const lightness = l / 100;
    const a = s * Math.min(lightness, 1 - lightness) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

export function MeshGradientBackground({ color, gradientConfig, className }: MeshGradientBackgroundProps) {
    const colorKey = useMemo(() => {
        if (gradientConfig?.colors) {
            return gradientConfig.colors.join(',');
        }
        return color || 'default';
    }, [color, gradientConfig]);

    const seed = useMemo(() => {
        if (gradientConfig?.seed !== undefined) {
            return gradientConfig.seed;
        }
        let hash = 0;
        for (let i = 0; i < colorKey.length; i++) {
            const char = colorKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0;
        }
        return Math.abs(hash);
    }, [colorKey, gradientConfig]);

    const colors = useMemo((): [string, string, string, string] => {
        if (gradientConfig?.colors) {
            return gradientConfig.colors;
        }

        if (!color) {
            return ['#1e293b', '#0f172a', '#020617', '#000000'];
        }

        const hsl = hexToHsl(color);
        const baseDark = hslToHex(hsl.h, hsl.s, Math.min(hsl.l, 25));
        const compHue = (hsl.h + 180) % 360;
        const compliment = hslToHex(compHue, Math.max(hsl.s, 70), Math.min(hsl.l, 20));
        const primaryDarker = hslToHex(hsl.h, hsl.s, Math.min(hsl.l, 10));
        const compDarker = hslToHex(compHue, hsl.s, Math.min(hsl.l, 5));

        return [baseDark, compliment, primaryDarker, compDarker];
    }, [color, gradientConfig]);

    const [mounted, setMounted] = useState(false);
    const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
    const [canRender, setCanRender] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const slotHeldRef = useRef(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Acquire a WebGL slot, then allow the MeshGradient canvas to mount
    useEffect(() => {
        if (!mounted || snapshotUrl) return;

        let cancelled = false;
        acquireSlot().then(() => {
            if (cancelled) { releaseSlot(); return; }
            slotHeldRef.current = true;
            setCanRender(true);
        });

        return () => {
            cancelled = true;
            if (slotHeldRef.current) {
                releaseSlot();
                slotHeldRef.current = false;
            }
            setCanRender(false);
        };
    }, [mounted, snapshotUrl, colorKey]);

    // Once MeshGradient initializes, capture canvas → static image, release slot
    const handleInit = useCallback(() => {
        requestAnimationFrame(() => {
            const canvas = wrapperRef.current?.querySelector('canvas');
            if (canvas && canvas.width > 0) {
                try {
                    setSnapshotUrl(canvas.toDataURL());
                } catch {
                    // WebGL context already lost — CSS fallback stays
                }
            }
            if (slotHeldRef.current) {
                releaseSlot();
                slotHeldRef.current = false;
            }
            setCanRender(false);
        });
    }, []);

    // CSS radial-gradient fallback that approximates the mesh look
    const cssFallback = useMemo(() => ({
        background: `
            radial-gradient(ellipse at 25% 40%, ${colors[0]}, transparent 65%),
            radial-gradient(ellipse at 75% 65%, ${colors[1]}, transparent 65%),
            radial-gradient(ellipse at 55% 20%, ${colors[2]}, transparent 65%),
            ${colors[3]}`
    }), [colors]);

    const overlays = (
        <>
            {/* Grainy texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-noise mix-blend-overlay" />
            {/* Strong light-mode lift to brighten gradients while preserving dark mode depth */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/92 via-white/86 to-white/78 dark:from-transparent dark:via-transparent dark:to-transparent" />
        </>
    );

    if (!mounted) {
        return (
            <div
                className={cn("absolute inset-0 z-0", className)}
                style={cssFallback}
            />
        );
    }

    // Captured snapshot — WebGL context already released
    if (snapshotUrl) {
        return (
            <div className={cn("absolute inset-0 z-0", className)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={snapshotUrl} alt="" className="w-full h-full object-cover" />
                {overlays}
            </div>
        );
    }

    // WebGL slot acquired — render canvas briefly to capture
    if (canRender) {
        return (
            <div ref={wrapperRef} className={cn("absolute inset-0 z-0", className)}>
                <MeshGradient
                    options={{ colors, isStatic: true, seed }}
                    className="w-full h-full"
                    onInit={handleInit}
                />
                {overlays}
            </div>
        );
    }

    // Waiting for a WebGL slot — show CSS approximation
    return (
        <div className={cn("absolute inset-0 z-0", className)} style={cssFallback}>
            {overlays}
        </div>
    );
}
