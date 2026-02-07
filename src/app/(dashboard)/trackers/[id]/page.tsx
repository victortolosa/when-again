'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackers, useUpdateTracker, useDeleteTracker } from '@/hooks/useTrackers';
import { Tracker, TrackerFormData } from '@/lib/types';
import { TrackerForm } from '@/components/dashboard/TrackerForm';
import { MeshGradientBackground } from '@/components/ui/MeshGradientBackground';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { formatDisplayDate, getFullTimeParts } from '@/lib/utils/date';
import { uploadMilestoneImage, deleteMilestoneImage } from '@/lib/storage';
import { CachedImage } from '@/components/ui/CachedImage';
import Link from 'next/link';
import { logger } from '@/lib/logger';

export default function TrackerDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { data: trackers = [], isLoading: trackersLoading } = useTrackers();
    const updateTracker = useUpdateTracker();
    const deleteTracker = useDeleteTracker();

    const [editingTracker, setEditingTracker] = useState<Tracker | null>(null);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);

    // Find the specific tracker
    // Note: In a larger app, we would fetch a single tracker by ID
    const tracker = trackers.find(t => t.id === id);
    const isLoading = authLoading || trackersLoading;

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth');
        }
    }, [authLoading, user, router]);

    const imageSrc = tracker?.cropped_image_url || tracker?.image_url || null;

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-muted-foreground">Loading details...</div>
            </div>
        );
    }

    if (!tracker) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Tracker not found</h1>
                    <Link href="/milestones">
                        <Button variant="outline" className="border-border hover:bg-accent">
                            Return to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const returnPath = tracker.type === 'till' ? '/countdowns' : '/milestones';

    const handleUpdateTracker = async (data: TrackerFormData, croppedFile?: File, originalFile?: File) => {
        if (!tracker) return false;

        try {
            let croppedImageUrl = data.cropped_image_url;
            let originalImageUrl = data.image_url;
            const oldCroppedImageUrl = tracker.cropped_image_url;
            const oldOriginalImageUrl = tracker.image_url;
            const shouldDeleteOldImage = !data.cropped_image_url && !data.image_url && (oldOriginalImageUrl || oldCroppedImageUrl);
            let uploadedNewImage = false;

            // Upload new image first; only delete old after DB update succeeds.
            if (croppedFile && originalFile && user) {
                const uploadResult = await uploadMilestoneImage(croppedFile, originalFile, user.uid, tracker.id);
                croppedImageUrl = uploadResult.imageUrl;
                originalImageUrl = uploadResult.originalImageUrl;
                uploadedNewImage = true;
            } else if (shouldDeleteOldImage) {
                croppedImageUrl = undefined;
                originalImageUrl = undefined;
            }

            try {
                await new Promise<void>((resolve, reject) => {
                    updateTracker.mutate(
                        { id: tracker.id, data: { ...data, cropped_image_url: croppedImageUrl, image_url: originalImageUrl } },
                        {
                            onError: reject,
                            onSuccess: () => resolve(),
                        }
                    );
                });

                if ((uploadedNewImage || shouldDeleteOldImage) && (oldOriginalImageUrl || oldCroppedImageUrl)) {
                    await deleteMilestoneImage(oldOriginalImageUrl, oldCroppedImageUrl);
                }
            } catch (dbError) {
                if (uploadedNewImage) {
                    await deleteMilestoneImage(originalImageUrl, croppedImageUrl);
                }
                throw dbError;
            }

            setEditingTracker(null);
            return true;
        } catch (error) {
            logger.error('Error updating tracker', error);
            alert(`Failed to update tracker: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    };

    const handleDeleteTracker = async () => {
        if (!confirm('Are you sure you want to delete this tracker?')) return;

        try {
            await new Promise<void>((resolve, reject) => {
                deleteTracker.mutate(
                    { id: tracker.id, croppedImageUrl: tracker.cropped_image_url, imageUrl: tracker.image_url },
                    {
                        onError: reject,
                        onSuccess: () => resolve(),
                    }
                );
            });
            router.push(returnPath);
        } catch (error) {
            logger.error('Error deleting tracker', error);
            alert('Failed to delete tracker');
        }
    };

    const targetDate = tracker.target_date.toDate();
    const timeParts = getFullTimeParts(new Date(), targetDate);

    return (
        <div className="fixed inset-0 z-[60] md:static md:z-auto min-h-screen bg-background text-white overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <MeshGradientBackground
                    gradientConfig={tracker.gradient_config}
                    color={tracker.color_theme}
                />
                {imageSrc && failedSrc !== imageSrc && (
                    <>
                        <CachedImage
                            src={imageSrc}
                            alt={tracker.title}
                            className="w-full h-full object-cover"
                            onError={() => setFailedSrc(imageSrc)}
                        />
                        <div className="absolute inset-0 bg-black/60" />
                    </>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col p-4 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <Link href={returnPath}>
                        <Button variant="ghost" className="text-white hover:bg-white/20 -ml-4">
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                        </Button>
                    </Link>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 rounded-full h-10 w-10"
                            onClick={() => setEditingTracker(tracker)}
                        >
                            <Edit2 className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-destructive/20 hover:text-destructive rounded-full h-10 w-10"
                            onClick={handleDeleteTracker}
                        >
                            <Trash2 className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 flex flex-col justify-center max-w-2xl">
                    <div className="space-y-6">
                        {tracker.category && (
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white/20 border border-white/10 backdrop-blur-md">
                                {tracker.category}
                            </span>
                        )}

                        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-tight text-shadow-lg">
                            {tracker.title}
                        </h1>

                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-2">
                                {timeParts.map((part, index) => (
                                    <div key={index} className="flex items-baseline gap-3">
                                        <span className="text-6xl sm:text-8xl font-bold tabular-nums tracking-tighter">
                                            {part.value}
                                        </span>
                                        <span className="text-xl sm:text-3xl font-medium text-white/80 text-shadow-sm">
                                            {part.label} {index === timeParts.length - 1 && (tracker.type === 'till' ? 'to go' : 'ago')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-lg text-white/60 font-medium ml-1 mt-4">
                                {formatDisplayDate(targetDate)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingTracker && (
                <TrackerForm
                    key={editingTracker.id}
                    onSubmit={handleUpdateTracker}
                    initialData={{
                        title: editingTracker.title,
                        target_date: editingTracker.target_date.toDate(),
                        type: editingTracker.type,
                        category: editingTracker.category || '',
                        color_theme: editingTracker.color_theme,
                        gradient_config: editingTracker.gradient_config,
                        cropped_image_url: editingTracker.cropped_image_url,
                        image_url: editingTracker.image_url,
                        display_units: editingTracker.display_units,
                    }}
                    open={true}
                    onOpenChange={(open) => !open && setEditingTracker(null)}
                    title="Edit Tracker"
                />
            )}
        </div>
    );
}
