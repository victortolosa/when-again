import { Timestamp } from 'firebase/firestore';

// Tracker Types - Items that count UP or DOWN from a specific date
export interface Tracker {
    id: string;
    user_id: string;
    title: string;
    target_date: Timestamp;
    type: 'since' | 'till';
    category: string;
    color_theme: string;
    gradient_config?: GradientConfig; // New: stores unique gradient colors
    image_url?: string;
    cropped_image_url?: string;
    display_units?: ('years' | 'months' | 'days' | 'auto')[];
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface TrackerFormData {
    title: string;
    target_date: Date;
    type: 'since' | 'till';
    category: string;
    color_theme: string;
    gradient_config?: GradientConfig;
    image_url?: string;
    cropped_image_url?: string;
    display_units?: ('years' | 'months' | 'days' | 'auto')[];
}

// Gradient configuration for backgrounds
export interface GradientConfig {
    colors: [string, string, string, string];
    seed?: number; // Seed for mesh gradient pattern consistency
}

// Sort options for trackers
export type SortField = 'date' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface SortSettings {
    field: SortField;
    direction: SortDirection;
}

// Reminder Types - Simple reminder notes with dates (separate from trackers)
export interface Reminder {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    date: Timestamp;
    notify_before?: number | null;
    category: string;
    color_theme: string;
    gradient_config?: GradientConfig;
    image_url?: string;
    cropped_image_url?: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface ReminderFormData {
    title: string;
    description?: string;
    date: Date;
    notify_before?: number | null;
    category: string;
    color_theme: string;
    gradient_config?: GradientConfig;
    image_url?: string;
    cropped_image_url?: string;
}



// Daily Entry Types - User-generated journal content for specific days
export interface DailyEntry {
    id: string;
    user_id: string;
    date: Timestamp; // Normalized to midnight UTC
    image_url: string;
    cropped_image_url?: string;
    notes: string;
    mood_rating?: number; // 1-5
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface DailyEntryFormData {
    date: Date;
    image_url?: string;
    cropped_image_url?: string;
    user_id: string;
    notes?: string;
    mood_rating?: number;
}

// Category type for grouping
export interface Category {
    id: string;
    name: string;
    color: string;
}

// Default categories
export const DEFAULT_CATEGORIES = [
    { id: 'health', name: 'Health', color: '#22c55e' },
    { id: 'finance', name: 'Finance', color: '#3b82f6' },
    { id: 'travel', name: 'Travel', color: '#f59e0b' },
    { id: 'work', name: 'Work', color: '#8b5cf6' },
    { id: 'personal', name: 'Personal', color: '#ec4899' },
    { id: 'chores', name: 'Chores', color: '#6b7280' },
    { id: 'bills', name: 'Bills', color: '#ef4444' },
] as const;

// Color themes for trackers
export const COLOR_THEMES = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#eab308', // yellow
    '#84cc16', // lime
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#0ea5e9', // sky
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#d946ef', // fuchsia
    '#ec4899', // pink
    '#f43f5e', // rose
] as const;
