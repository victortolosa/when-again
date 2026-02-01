'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { generateRandomGradient } from '@/lib/utils/gradient-generator';
import { GradientConfig } from '@/lib/types';
import { MeshGradient } from '@mesh-gradient/react';

interface GradientPickerProps {
    value?: GradientConfig;
    onChange: (config: GradientConfig) => void;
    colorTheme?: string;
    onRegenerate?: () => void;
}

export function GradientPicker({ value, onChange, colorTheme, onRegenerate }: GradientPickerProps) {
    const handleRegenerate = () => {
        if (onRegenerate) {
            onRegenerate();
        } else {
            const newGradient = generateRandomGradient();
            onChange(newGradient);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label>Background Gradient</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRegenerate}
                >
                    🎨 Regenerate
                </Button>
            </div>
            <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border">
                {value?.colors ? (
                    <MeshGradient
                        options={{
                            colors: value.colors,
                            isStatic: true,
                            seed: value.seed
                        }}
                        className="w-full h-full"
                    />
                ) : (
                    <div
                        className="w-full h-full"
                        style={{ backgroundColor: colorTheme || '#3b82f6' }}
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-medium drop-shadow-lg">
                        Preview
                    </span>
                </div>
            </div>
            <p className="text-xs text-muted-foreground">
                Don&apos;t like it? Click &quot;Regenerate&quot; for a new gradient
            </p>
        </div>
    );
}
