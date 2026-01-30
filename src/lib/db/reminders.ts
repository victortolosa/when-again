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

const COLLECTION_NAME = 'reminders';

export async function getReminders(userId: string): Promise<Reminder[]> {
    console.log('getReminders: Querying for userId:', userId);
    const db = getFirebaseDb();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        );

        console.log('getReminders: Executing query...');
        const snapshot = await getDocs(q);
        console.log('getReminders: Query returned', snapshot.docs.length, 'documents');

        const reminders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Reminder[];

        console.log('getReminders: Mapped reminders:', reminders);
        return reminders;
    } catch (error) {
        console.error('getReminders: Error fetching reminders:', error);
        throw error;
    }
}

export async function createReminder(
    userId: string,
    data: ReminderFormData
): Promise<string> {
    console.log('createReminder called with userId:', userId);
    console.log('createReminder data:', data);

    const db = getFirebaseDb();
    console.log('Firestore instance:', db);

    const reminderData = {
        user_id: userId,
        title: data.title,
        description: data.description || null,
        date: Timestamp.fromDate(data.date),
        category: data.category,
        color_theme: data.color_theme,
        gradient_config: data.gradient_config,
        image_url: data.image_url || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    console.log('Writing to Firestore:', reminderData);

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), reminderData);
        console.log('Document created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Firestore write error:', error);
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
    if (data.image_url !== undefined) updateData.image_url = data.image_url || null;

    await updateDoc(docRef, updateData);
}

export async function deleteReminder(reminderId: string, imageUrl?: string): Promise<void> {
    const db = getFirebaseDb();

    // Delete the image from storage if it exists
    if (imageUrl) {
        await deleteMilestoneImage(imageUrl);
    }

    // Delete the Firestore document
    await deleteDoc(doc(db, COLLECTION_NAME, reminderId));
}
