import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    getDocs,
    Timestamp,
    serverTimestamp,
} from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { DailyEntry, DailyEntryFormData } from '@/lib/types';
import { startOfDay } from 'date-fns';

const COLLECTION_NAME = 'daily_entries';

// Normalize date to midnight UTC for consistent storage
function normalizeDate(date: Date): Date {
    return startOfDay(date);
}

export async function getEntriesForMonth(
    userId: string,
    year: number,
    month: number
): Promise<DailyEntry[]> {
    const db = getFirebaseDb();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);

    const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate))
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as DailyEntry[];
}

export async function getEntryForDate(
    userId: string,
    date: Date
): Promise<DailyEntry | null> {
    const db = getFirebaseDb();
    const normalizedDate = normalizeDate(date);

    const q = query(
        collection(db, COLLECTION_NAME),
        where('user_id', '==', userId),
        where('date', '==', Timestamp.fromDate(normalizedDate))
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        ...doc.data(),
    } as DailyEntry;
}

export async function createEntry(
    userId: string,
    data: DailyEntryFormData
): Promise<string> {
    const db = getFirebaseDb();
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        user_id: userId,
        date: Timestamp.fromDate(normalizeDate(data.date)),
        image_url: data.image_url || '',
        notes: data.notes || '',
        mood_rating: data.mood_rating,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    });

    return docRef.id;
}

export async function updateEntry(
    entryId: string,
    data: Partial<DailyEntryFormData>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, entryId);

    const updateData: Record<string, unknown> = {
        updated_at: serverTimestamp(),
    };

    if (data.image_url !== undefined) updateData.image_url = data.image_url;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.mood_rating !== undefined) updateData.mood_rating = data.mood_rating;

    await updateDoc(docRef, updateData);
}

export async function createOrUpdateEntry(
    userId: string,
    data: DailyEntryFormData
): Promise<string> {
    const existingEntry = await getEntryForDate(userId, data.date);

    if (existingEntry) {
        await updateEntry(existingEntry.id, data);
        return existingEntry.id;
    }

    return createEntry(userId, data);
}

export async function deleteEntry(entryId: string): Promise<void> {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION_NAME, entryId));
}
