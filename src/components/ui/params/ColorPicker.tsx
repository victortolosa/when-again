'use client';

import { Label } from '@/components/ui/label';
import { COLOR_THEMES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
    value: string;
    onChange: (color: string) => void;
    label?: string;
}

export function ColorPicker({ value, onChange, label = 'Color' }: ColorPickerProps) {
    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
                {COLOR_THEMES.map((color) => (
                    <button
                        key={color}
                        type="button"
                        aria-label={`Select ${color} color`}
                        className={cn(
                            'w-10 h-10 sm:w-11 sm:h-11 rounded-full border-2 transition-transform hover:scale-110 touch-manipulation',
                            value === color
                                ? 'border-foreground scale-110'
                                : 'border-transparent'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => onChange(color)}
                    />
                ))}
            </div>
        </div>
    );
}
