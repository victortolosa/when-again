'use client';

import { useState, useCallback } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Event as EventType, DailyEntry } from '@/lib/types';
import { getEventsForDate } from '@/lib/utils/recurrence';
import { useSaveEntry } from '@/hooks/useEntries';
import { uploadEntryImage, compressImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DayDetailModalProps {
    date: Date | null;
    events: EventType[];
    entry: DailyEntry | null;
    onClose: () => void;
}

export function DayDetailModal({
    date,
    events,
    entry,
    onClose,
}: DayDetailModalProps) {
    const { user } = useAuth();
    const saveEntry = useSaveEntry();
    const [notes, setNotes] = useState(entry?.notes || '');
    const [imageUrl, setImageUrl] = useState(entry?.image_url || '');
    const [moodRating, setMoodRating] = useState(entry?.mood_rating || 0);
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const dayEvents = date ? getEventsForDate(events, date) : [];

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!user || !date) return;

            setUploading(true);
            try {
                // Compress image before upload
                const compressed = await compressImage(file);
                const compressedFile = new File([compressed], file.name, {
                    type: 'image/jpeg',
                });

                const url = await uploadEntryImage(compressedFile, user.uid, date);
                setImageUrl(url);
            } catch (error) {
                console.error('Upload failed:', error);
            } finally {
                setUploading(false);
            }
        },
        [user, date]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    const handleSave = async () => {
        if (!date) return;

        await saveEntry.mutateAsync({
            date,
            notes,
            image_url: imageUrl,
            mood_rating: moodRating || undefined,
        });

        onClose();
    };

    const moods = ['😢', '😕', '😐', '🙂', '😊'];

    if (!date) return null;

    return (
        <Dialog open={!!date} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{format(date, 'EEEE, MMMM d, yyyy')}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Events for this day */}
                    {dayEvents.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Events</Label>
                            <div className="flex flex-wrap gap-2">
                                {dayEvents.map(({ event }, i) => (
                                    <div
                                        key={i}
                                        className="px-3 py-1.5 rounded-full text-sm flex items-center gap-2"
                                        style={{
                                            backgroundColor: `${event.color_theme}20`,
                                            color: event.color_theme,
                                        }}
                                    >
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: event.color_theme }}
                                        />
                                        {event.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Photo</Label>
                        <div
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={cn(
                                'border-2 border-dashed rounded-lg transition-colors',
                                dragOver ? 'border-primary bg-primary/10' : 'border-muted',
                                imageUrl ? 'p-2' : 'p-8'
                            )}
                        >
                            {imageUrl ? (
                                <div className="relative">
                                    <img
                                        src={imageUrl}
                                        alt="Entry"
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => setImageUrl('')}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center">
                                    {uploading ? (
                                        <div className="animate-pulse">Uploading...</div>
                                    ) : (
                                        <>
                                            <p className="text-muted-foreground mb-2">
                                                Drop an image here or
                                            </p>
                                            <label>
                                                <Button variant="outline" size="sm" asChild>
                                                    <span>Browse Files</span>
                                                </Button>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleFileUpload(file);
                                                    }}
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Journal Entry</Label>
                        <Textarea
                            id="notes"
                            placeholder="How was your day?"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Mood Rating */}
                    <div className="space-y-2">
                        <Label>Mood</Label>
                        <div className="flex gap-2">
                            {moods.map((mood, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => setMoodRating(i + 1)}
                                    className={cn(
                                        'text-2xl p-2 rounded-lg transition-all hover:scale-110',
                                        moodRating === i + 1
                                            ? 'bg-primary/20 ring-2 ring-primary'
                                            : 'hover:bg-muted'
                                    )}
                                >
                                    {mood}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveEntry.isPending}>
                        {saveEntry.isPending ? 'Saving...' : 'Save Entry'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
