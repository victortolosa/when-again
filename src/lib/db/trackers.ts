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

const COLLECTION_NAME = 'trackers';

export async function getTrackers(userId: string): Promise<Tracker[]> {
    console.log('getTrackers: Querying for userId:', userId);
    const db = getFirebaseDb();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('user_id', '==', userId),
            orderBy('created_at', 'desc')
        );

        console.log('getTrackers: Executing query...');
        const snapshot = await getDocs(q);
        console.log('getTrackers: Query returned', snapshot.docs.length, 'documents');

        const trackers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Tracker[];

        console.log('getTrackers: Mapped trackers:', trackers);
        return trackers;
    } catch (error) {
        console.error('getTrackers: Error fetching trackers:', error);
        throw error;
    }
}

export async function createTracker(
    userId: string,
    data: TrackerFormData
): Promise<string> {
    console.log('createTracker called with userId:', userId);
    console.log('createTracker data:', data);

    const db = getFirebaseDb();
    console.log('Firestore instance:', db);

    const trackerData = {
        user_id: userId,
        title: data.title,
        target_date: Timestamp.fromDate(data.target_date),
        type: data.type,
        category: data.category,
        color_theme: data.color_theme,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    console.log('Writing to Firestore:', trackerData);

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), trackerData);
        console.log('Document created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Firestore write error:', error);
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

    await updateDoc(docRef, updateData);
}

export async function deleteTracker(trackerId: string): Promise<void> {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION_NAME, trackerId));
}
