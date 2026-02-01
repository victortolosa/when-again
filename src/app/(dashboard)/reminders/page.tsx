"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReminderCard } from '@/components/dashboard/ReminderCard';
import { ReminderForm } from '@/components/dashboard/ReminderForm';
import { useReminders, useCreateReminder, useUpdateReminder, useDeleteReminder } from '@/hooks/useReminders';
import { Reminder, ReminderFormData } from '@/lib/types';
import { uploadMilestoneImage, deleteMilestoneImage } from '@/lib/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/components/layout/AppShell';
import { ViewSettings } from '@/components/dashboard/ViewSettings';

export default function RemindersPage() {
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const { showCategories } = useSettings();
    const { user } = useAuth();
    const { data: reminders = [], isLoading: remindersLoading } = useReminders();
    const createReminder = useCreateReminder();
    const updateReminder = useUpdateReminder();
    const deleteReminder = useDeleteReminder();

    const handleCreateReminder = async (data: ReminderFormData, croppedFile?: File, originalFile?: File) => {
        try {
            const reminderId = await new Promise<string>((resolve, reject) => {
                createReminder.mutate(
                    { ...data, image_url: undefined },
                    {
                        onError: reject,
                        onSuccess: (id) => resolve(id),
                    }
                );
            });

            if (croppedFile && originalFile && user) {
                const { imageUrl, originalImageUrl } = await uploadMilestoneImage(croppedFile, originalFile, user.uid, reminderId);
                try {
                    await new Promise<void>((resolve, reject) => {
                        updateReminder.mutate(
                            { id: reminderId, data: { image_url: originalImageUrl, cropped_image_url: imageUrl } },
                            {
                                onError: reject,
                                onSuccess: () => resolve(),
                            }
                        );
                    });
                } catch (dbError) {
                    await deleteMilestoneImage(originalImageUrl, imageUrl);
                    throw dbError;
                }
            }

            console.log('Reminder created successfully');
        } catch (error) {
            console.error('Error creating reminder:', error);
            alert(`Failed to create reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleEditReminder = (reminder: Reminder) => setEditingReminder(reminder);

    const handleUpdateReminder = async (data: ReminderFormData, croppedFile?: File, originalFile?: File) => {
        if (!editingReminder) return;

        try {
            let croppedImageUrl = data.cropped_image_url;
            let originalImageUrl = data.image_url;
            const oldCroppedImageUrl = editingReminder.cropped_image_url;
            const oldOriginalImageUrl = editingReminder.image_url;

            if (croppedFile && originalFile && user) {
                const result = await uploadMilestoneImage(croppedFile, originalFile, user.uid, editingReminder.id);
                croppedImageUrl = result.imageUrl;
                originalImageUrl = result.originalImageUrl;

                if (oldOriginalImageUrl || oldCroppedImageUrl) {
                    await deleteMilestoneImage(oldOriginalImageUrl, oldCroppedImageUrl);
                }
            } else if (!data.cropped_image_url && (oldOriginalImageUrl || oldCroppedImageUrl)) {
                await deleteMilestoneImage(oldOriginalImageUrl, oldCroppedImageUrl);
                croppedImageUrl = undefined;
                originalImageUrl = undefined;
            }

            try {
                await new Promise<void>((resolve, reject) => {
                    updateReminder.mutate(
                        { id: editingReminder.id, data: { ...data, cropped_image_url: croppedImageUrl, image_url: originalImageUrl } },
                        {
                            onError: reject,
                            onSuccess: () => resolve(),
                        }
                    );
                });
            } catch (dbError) {
                if (croppedFile && originalFile && user && croppedImageUrl) {
                    await deleteMilestoneImage(originalImageUrl, croppedImageUrl);
                }
                throw dbError;
            }

            console.log('Reminder updated successfully');
            setEditingReminder(null);
        } catch (error) {
            console.error('Error updating reminder:', error);
            alert(`Failed to update reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleDeleteReminder = async (id: string) => {
        const reminder = reminders.find(r => r.id === id);

        if (confirm('Are you sure you want to delete this memory?')) {
            try {
                await new Promise<void>((resolve, reject) => {
                    deleteReminder.mutate(
                        { id, croppedImageUrl: reminder?.cropped_image_url, imageUrl: reminder?.image_url },
                        {
                            onError: reject,
                            onSuccess: () => resolve(),
                        }
                    );
                });
            } catch (error) {
                console.error('Error deleting reminder:', error);
                alert(`Failed to delete reminder: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    if (remindersLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-pulse text-muted-foreground">Loading reminders...</div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-4">
            <div className="flex items-center justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold">Remember</h1>
                <div className="flex items-center gap-2">
                    <ViewSettings />
                    <ReminderForm
                        onSubmit={handleCreateReminder}
                        trigger={<Button className="touch-manipulation"><span className="hidden sm:inline">+ New Memory</span><span className="sm:hidden">+</span></Button>}
                        title="Create Memory"
                    />
                    {editingReminder && (
                        <ReminderForm
                            key={editingReminder.id}
                            onSubmit={handleUpdateReminder}
                            initialData={{
                                title: editingReminder.title,
                                date: editingReminder.date.toDate(),
                                category: editingReminder.category || '',
                                color_theme: editingReminder.color_theme,
                                image_url: editingReminder.image_url,
                                cropped_image_url: editingReminder.cropped_image_url,
                                description: editingReminder.description || '',
                            }}
                            open={true}
                            onOpenChange={(open) => !open && setEditingReminder(null)}
                            title="Edit Memory"
                        />
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {reminders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">Nothing to remember yet</p>
                        <p className="text-sm mt-2">Create memories for important dates, tasks, and appointments.</p>
                    </div>
                ) : showCategories ? (
                    <div className="space-y-8">
                        {/* Group by category */}
                        {Object.entries(reminders.reduce<Record<string, Reminder[]>>((acc, item) => {
                            const category = item.category || 'Uncategorized';
                            if (!acc[category]) acc[category] = [];
                            acc[category].push(item);
                            return acc;
                        }, {})).map(([category, items]) => (
                            <div key={category} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="uppercase tracking-wider text-sm font-semibold">{category}</h3>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map(item => (
                                        <ReminderCard key={item.id} reminder={item} onEdit={handleEditReminder} onDelete={handleDeleteReminder} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {reminders.map((reminder) => (
                            <ReminderCard key={reminder.id} reminder={reminder} onEdit={handleEditReminder} onDelete={handleDeleteReminder} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
