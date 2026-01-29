import { initializeApp, getApps, getApp as getFirebaseAppInstance, FirebaseApp } from 'firebase/app';
import { getAuth as getAuthInstance, Auth } from 'firebase/auth';
import { getFirestore as getFirestoreInstance, Firestore } from 'firebase/firestore';
import { getStorage as getStorageInstance, FirebaseStorage } from 'firebase/storage';
import { getAnalytics as getAnalyticsInstance, Analytics, isSupported } from 'firebase/analytics';

// Next.js uses process.env for environment variables.
// Static access is safer for prerendering and bundling.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate Firebase configuration
function validateFirebaseConfig() {
    const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
    const missingKeys = requiredKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

    if (missingKeys.length > 0) {
        console.error('Missing Firebase configuration:', missingKeys);
        return false;
    }
    return true;
}

// Lazy initialization for SSR compatibility
let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;
let dbInstance: Firestore | undefined;
let storageInstance: FirebaseStorage | undefined;
let analyticsInstance: Analytics | undefined;

export function getApp(): FirebaseApp {
    // In Next.js, Firebase should only be initialized on the client side
    // unless using firebase-admin on the server.
    if (typeof window === 'undefined') {
        // Return a dummy or handle server-side gracefully if needed
        if (getApps().length > 0) return getFirebaseAppInstance();
        return initializeApp(firebaseConfig);
    }

    if (!app) {
        try {
            if (!validateFirebaseConfig()) {
                throw new Error('Invalid Firebase configuration. Please check your environment variables.');
            }
            app = getApps().length === 0 ? initializeApp(firebaseConfig) : getFirebaseAppInstance();
        } catch (error) {
            console.error('Failed to initialize Firebase:', error);
            throw error;
        }
    }
    return app;
}

export function getFirebaseAuth(): Auth {
    if (!authInstance) {
        authInstance = getAuthInstance(getApp());
    }
    return authInstance;
}

export function getFirebaseDb(): Firestore {
    if (!dbInstance) {
        dbInstance = getFirestoreInstance(getApp());
    }
    return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (!storageInstance) {
        storageInstance = getStorageInstance(getApp());
    }
    return storageInstance;
}

export async function getFirebaseAnalytics(): Promise<Analytics | undefined> {
    if (!analyticsInstance && typeof window !== 'undefined') {
        const supported = await isSupported();
        if (supported) {
            analyticsInstance = getAnalyticsInstance(getApp());
        }
    }
    return analyticsInstance;
}

// Named exports for convenience - lazy initialization to prevent errors
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

export const auth = typeof window !== 'undefined'
    ? new Proxy({} as Auth, {
        get: (target, prop: string | symbol) => {
            if (!_auth) _auth = getFirebaseAuth();
            return ((_auth as unknown) as Record<string | symbol, unknown>)[prop];
        }
    })
    : ({} as Auth);

export const db = typeof window !== 'undefined'
    ? new Proxy({} as Firestore, {
        get: (target, prop: string | symbol) => {
            if (!_db) _db = getFirebaseDb();
            return ((_db as unknown) as Record<string | symbol, unknown>)[prop];
        }
    })
    : ({} as Firestore);

export const storage = typeof window !== 'undefined'
    ? new Proxy({} as FirebaseStorage, {
        get: (target, prop: string | symbol) => {
            if (!_storage) _storage = getFirebaseStorage();
            return ((_storage as unknown) as Record<string | symbol, unknown>)[prop];
        }
    })
    : ({} as FirebaseStorage);

export default typeof window !== 'undefined' ? getApp() : {} as FirebaseApp;
