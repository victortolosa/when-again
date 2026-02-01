'use client';

import { MeshGradient } from '@mesh-gradient/react';
import { useMemo } from 'react';
import { GradientConfig } from '@/lib/types';

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
    // Create a stable key based on actual color values to prevent unnecessary re-renders
    const colorKey = useMemo(() => {
        if (gradientConfig?.colors) {
            return gradientConfig.colors.join(',');
        }
        return color || 'default';
    }, [color, gradientConfig]);

    // Use stored seed if available, otherwise generate from color key
    const seed = useMemo(() => {
        // If gradient config has a seed, use it
        if (gradientConfig?.seed !== undefined) {
            return gradientConfig.seed;
        }

        // Otherwise, generate a deterministic seed from the color key
        let hash = 0;
        for (let i = 0; i < colorKey.length; i++) {
            const char = colorKey.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0; // Convert to 32-bit integer
        }
        return Math.abs(hash);
    }, [colorKey, gradientConfig]);

    const colors = useMemo((): [string, string, string, string] => {
        // If gradient config is provided, use it (new behavior)
        if (gradientConfig?.colors) {
            return gradientConfig.colors;
        }

        // Otherwise, generate from single color (legacy behavior)
        if (!color) {
            // Fallback to default gradient
            return ['#1e293b', '#0f172a', '#020617', '#000000'];
        }

        const hsl = hexToHsl(color);

        // Base is darker for readability (max 30% lightness)
        const baseDark = hslToHex(hsl.h, hsl.s, Math.min(hsl.l, 25));

        // Complimentary color (180 degrees shift), saturated but dark
        const compHue = (hsl.h + 180) % 360;
        const compliment = hslToHex(compHue, Math.max(hsl.s, 70), Math.min(hsl.l, 20));

        // Very dark primary
        const primaryDarker = hslToHex(hsl.h, hsl.s, Math.min(hsl.l, 10));

        // Deep dark compliment
        const compDarker = hslToHex(compHue, hsl.s, Math.min(hsl.l, 5));

        return [baseDark, compliment, primaryDarker, compDarker];
    }, [color, gradientConfig]);

    return (
        <div className={className} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <MeshGradient
                options={{
                    colors,
                    isStatic: true,
                    seed
                }}
                className="w-full h-full"
            />
            {/* Grainy texture overlay */}
            <div
                className="absolute inset-0 pointer-events-none opacity-40"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    mixBlendMode: 'overlay'
                }}
            />
        </div>
    );
}
