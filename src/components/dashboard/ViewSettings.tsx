'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSettings } from '@/components/layout/AppShell';
import { SortField, SortDirection } from '@/lib/types';
import { Check, Settings } from 'lucide-react';

export function ViewSettings() {
    const { showCategories, setShowCategories, sortSettings, setSortSettings } = useSettings();

    const updateSortSettings = (settings: typeof sortSettings) => {
        setSortSettings(settings);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-white/10 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    aria-label="View settings"
                >
                    <Settings className="h-4 w-4" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-gray-950 border-white/10 text-gray-300 p-2">
                <DropdownMenuItem
                    onClick={() => setShowCategories(!showCategories)}
                    className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md"
                >
                    {showCategories ? (
                        <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                    ) : (
                        <span className="mr-2 w-4" />
                    )}
                    <span>Show Categories</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <DropdownMenuLabel className="text-gray-500 font-semibold px-3 py-2 text-xs uppercase tracking-wider">Sort By</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={sortSettings.field}
                    onValueChange={(value) => updateSortSettings({ ...sortSettings, field: value as SortField })}
                >
                    <DropdownMenuRadioItem value="date" className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md">Date</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="created_at" className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md">Created At</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <DropdownMenuLabel className="text-gray-500 font-semibold px-3 py-2 text-xs uppercase tracking-wider">Direction</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={sortSettings.direction}
                    onValueChange={(value) => updateSortSettings({ ...sortSettings, direction: value as SortDirection })}
                >
                    <DropdownMenuRadioItem value="asc" className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md">Ascending</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="desc" className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md">Descending</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator className="bg-white/10 my-2" />
                <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-2.5 px-3 rounded-md">
                        <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                        <span>General Settings</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
