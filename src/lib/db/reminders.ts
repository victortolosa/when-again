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
import { Reminder, ReminderFormData } from '@/lib/types';
import { deleteMilestoneImage } from '@/lib/storage';
import { logger } from '@/lib/logger';

const COLLECTION_NAME = 'reminders';
const normalizeOptionalString = (value?: string | null) => (value ? value : null);

export async function getReminders(userId: string): Promise<Reminder[]> {
    const db = getFirebaseDb();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        );

        const snapshot = await getDocs(q);

        const reminders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Reminder[];

        return reminders;
    } catch (error) {
        logger.error('Failed to fetch reminders', error);
        throw error;
    }
}

export async function createReminder(
    userId: string,
    data: ReminderFormData
): Promise<string> {
    const db = getFirebaseDb();

    const reminderData = {
        user_id: userId,
        title: data.title,
        description: data.description || null,
        date: Timestamp.fromDate(data.date),
        category: data.category,
        color_theme: data.color_theme,
        gradient_config: data.gradient_config || null,
        image_url: data.image_url || null,
        cropped_image_url: data.cropped_image_url || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), reminderData);
        return docRef.id;
    } catch (error) {
        logger.error('Failed to create reminder', error);
        throw error;
    }
}

export async function updateReminder(
    reminderId: string,
    data: Partial<ReminderFormData>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, reminderId);

    const updateData: Record<string, unknown> = {
        updated_at: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.date !== undefined) updateData.date = Timestamp.fromDate(data.date);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.color_theme !== undefined) updateData.color_theme = data.color_theme;
    if (data.gradient_config !== undefined) updateData.gradient_config = data.gradient_config;
    if (Object.prototype.hasOwnProperty.call(data, 'image_url')) {
        updateData.image_url = normalizeOptionalString(data.image_url);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'cropped_image_url')) {
        updateData.cropped_image_url = normalizeOptionalString(data.cropped_image_url);
    }

    await updateDoc(docRef, updateData);
}

export async function deleteReminder(reminderId: string, imageUrl?: string, croppedImageUrl?: string): Promise<void> {
    const db = getFirebaseDb();

    // Delete the image from storage if it exists
    if (imageUrl || croppedImageUrl) {
        await deleteMilestoneImage(imageUrl, croppedImageUrl);
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, COLLECTION_NAME, reminderId));
}
