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
import { Event, EventFormData } from '@/lib/types';

const COLLECTION_NAME = 'events';

export async function getEvents(userId: string): Promise<Event[]> {
    console.log('getEvents: Querying for userId:', userId);
    const db = getFirebaseDb();

    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('user_id', '==', userId),
            orderBy('start_date', 'asc')
        );

        console.log('getEvents: Executing query...');
        const snapshot = await getDocs(q);
        console.log('getEvents: Query returned', snapshot.docs.length, 'documents');

        const events = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Event[];

        console.log('getEvents: Mapped events:', events);
        return events;
    } catch (error) {
        console.error('getEvents: Error fetching events:', error);
        throw error;
    }
}

export async function createEvent(
    userId: string,
    data: EventFormData
): Promise<string> {
    console.log('createEvent called with userId:', userId);
    console.log('createEvent data:', data);

    const db = getFirebaseDb();
    const eventData = {
        user_id: userId,
        title: data.title,
        start_date: Timestamp.fromDate(data.start_date),
        recurrence_rule: data.recurrence_rule,
        category: data.category,
        color_theme: data.color_theme,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    console.log('Writing event to Firestore:', eventData);

    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), eventData);
        console.log('Event created with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('Firestore write error:', error);
        throw error;
    }
}

export async function updateEvent(
    eventId: string,
    data: Partial<EventFormData>
): Promise<void> {
    const db = getFirebaseDb();
    const docRef = doc(db, COLLECTION_NAME, eventId);

    const updateData: Record<string, unknown> = {
        updated_at: serverTimestamp(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.start_date !== undefined) updateData.start_date = Timestamp.fromDate(data.start_date);
    if (data.recurrence_rule !== undefined) updateData.recurrence_rule = data.recurrence_rule;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.color_theme !== undefined) updateData.color_theme = data.color_theme;

    await updateDoc(docRef, updateData);
}

export async function deleteEvent(eventId: string): Promise<void> {
    const db = getFirebaseDb();
    await deleteDoc(doc(db, COLLECTION_NAME, eventId));
}
