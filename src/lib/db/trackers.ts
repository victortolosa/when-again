import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { Tracker, TrackerFormData } from '@/lib/types';
import { deleteMilestoneImage } from '@/lib/storage';
import { logger } from '@/lib/logger';

const COLLECTION_NAME = 'trackers';
const normalizeOptionalString = (value?: string | null) => (value ? value : null);

export async function getTrackers(userId: string): Promise<Tracker[]> {
    const db = getFirebaseDb();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);

        const trackers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Tracker[];

        return trackers;
    } catch (error) {
        logger.error('Failed to fetch trackers', error);
        throw error;
    }
}

export async function createTracker(
    userId: string,
    data: TrackerFormData
): Promise<string> {
    const db = getFirebaseDb();

    const trackerData = {
        user_id: userId,
        title: data.title,
        target_date: Timestamp.fromDate(data.target_date),
        type: data.type,
        category: data.category,
        color_theme: data.color_theme,
        gradient_config: data.gradient_config || null,
        image_url: data.image_url || null,
        cropped_image_url: data.cropped_image_url || null,
        display_units: data.display_units || ['days'],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), trackerData);
        return docRef.id;
    } catch (error) {
        logger.error('Failed to create tracker', error);
        throw error;
    }
}

export async function updateTracker(
    trackerId: string,
    data: Partial<TrackerFormData>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, trackerId);

    const updateData: Record<string, unknown> = {
        updated_at: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.target_date !== undefined) updateData.target_date = Timestamp.fromDate(data.target_date);
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.color_theme !== undefined) updateData.color_theme = data.color_theme;
    if (data.gradient_config !== undefined) updateData.gradient_config = data.gradient_config;
    if (Object.prototype.hasOwnProperty.call(data, 'image_url')) {
        updateData.image_url = normalizeOptionalString(data.image_url);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cropped_image_url')) {
        updateData.cropped_image_url = normalizeOptionalString(data.cropped_image_url);
    }
    if (data.display_units !== undefined) updateData.display_units = data.display_units;

    await updateDoc(docRef, updateData);
}

export async function deleteTracker(trackerId: string, imageUrl?: string, croppedImageUrl?: string): Promise<void> {
    const db = getFirebaseDb();

    // Delete the image from storage if it exists
    if (imageUrl || croppedImageUrl) {
        await deleteMilestoneImage(imageUrl, croppedImageUrl);
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, COLLECTION_NAME, trackerId));
}
