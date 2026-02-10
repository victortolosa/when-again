'use client';

import { MeshGradient } from '@mesh-gradient/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { GradientConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface MeshGradientBackgroundProps {
    color?: string;
    gradientConfig?: GradientConfig;
    className?: string;
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
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only render WebGL canvas for cards visible in the viewport.
    // iOS Safari limits active WebGL contexts to ~8-16; this keeps
    // the count to whatever fits on screen (typically 3-6 cards).
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { rootMargin: '100px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // CSS radial-gradient fallback for SSR / off-screen cards
    const cssFallback = useMemo(() => ({
        background: `
            radial-gradient(ellipse at 25% 40%, ${colors[0]}, transparent 65%),
            radial-gradient(ellipse at 75% 65%, ${colors[1]}, transparent 65%),
            radial-gradient(ellipse at 55% 20%, ${colors[2]}, transparent 65%),
            ${colors[3]}`
    }), [colors]);

    if (!mounted) {
        return (
            <div
                className={cn("absolute inset-0 z-0 bg-background", className)}
                style={{ backgroundColor: color || '#0f172a' }}
            />
        );
    }

    return (
        <div ref={containerRef} className={cn("absolute inset-0 z-0", className)}>
            {isVisible ? (
                <MeshGradient
                    options={{ colors, isStatic: true, seed }}
                    className="w-full h-full"
                />
            ) : (
                <div className="absolute inset-0" style={cssFallback} />
            )}
            {/* Grainy texture overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-noise mix-blend-overlay" />
            {/* Strong light-mode lift to brighten gradients while preserving dark mode depth */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/92 via-white/86 to-white/78 dark:from-transparent dark:via-transparent dark:to-transparent" />
        </div>
    );
}
