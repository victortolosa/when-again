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
    image_url?: string;
    display_units?: ('years' | 'months' | 'days')[];
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface TrackerFormData {
    title: string;
    target_date: Date;
    type: 'since' | 'till';
    category: string;
    color_theme: string;
    image_url?: string;
    display_units?: ('years' | 'months' | 'days')[];
}

// Event Types - Items that repeat based on recurrence rules
export interface Event {
    id: string;
    user_id: string;
    title: string;
    start_date: Timestamp;
    recurrence_rule: string; // iCal RRule format (e.g., "FREQ=MONTHLY;BYMONTHDAY=1")
    category: string;
    color_theme: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface EventFormData {
    title: string;
    start_date: Date;
    recurrence_rule: string;
    category: string;
    color_theme: string;
}

// Daily Entry Types - User-generated journal content for specific days
export interface DailyEntry {
    id: string;
    user_id: string;
    date: Timestamp; // Normalized to midnight UTC
    image_url: string;
    notes: string;
    mood_rating?: number; // 1-5
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface DailyEntryFormData {
    date: Date;
    image_url?: string;
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

// Color themes for trackers/events
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
