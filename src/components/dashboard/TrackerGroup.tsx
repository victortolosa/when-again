'use client';

import { Tracker } from '@/lib/types';
import { TrackerCard } from './TrackerCard';

interface TrackerGroupProps {
    category: string;
    trackers: Tracker[];
    onEdit?: (tracker: Tracker) => void;
    onDelete?: (trackerId: string) => void;
    defaultCollapsed?: boolean;
}

export function TrackerGroup({
    category,
    trackers,
    onEdit,
    onDelete,
    defaultCollapsed = false,
}: TrackerGroupProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    if (trackers.length === 0) return null;

    return (
        <div className="space-y-3">
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors w-full"
            >
                <span className={`transform transition-transform ${collapsed ? '' : 'rotate-90'}`}>
                    ▶
                </span>
                <span className="uppercase tracking-wider">{category || 'Uncategorized'}</span>
                <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                    {trackers.length}
                </span>
            </button>

            {!collapsed && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {trackers.map((tracker) => (
                        <TrackerCard
                            key={tracker.id}
                            tracker={tracker}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

import { useState } from 'react';
