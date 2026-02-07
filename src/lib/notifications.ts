const STORAGE_PREFIX = 'notified:';

export function isSupported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'Notification' in window &&
        'serviceWorker' in navigator
    );
}

export function getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!isSupported()) return 'unsupported';
    return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (!isSupported()) return 'unsupported';
    const result = await Notification.requestPermission();
    return result;
}

export async function sendNotification(
    title: string,
    options?: NotificationOptions
): Promise<void> {
    if (!isSupported() || Notification.permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        ...options,
    });
}

function getTodayKey(): string {
    return STORAGE_PREFIX + new Date().toISOString().slice(0, 10);
}

export function getNotifiedIds(): Set<string> {
    try {
        const raw = localStorage.getItem(getTodayKey());
        if (!raw) return new Set();
        return new Set(JSON.parse(raw));
    } catch {
        return new Set();
    }
}

export function markNotified(id: string): void {
    const ids = getNotifiedIds();
    ids.add(id);
    localStorage.setItem(getTodayKey(), JSON.stringify([...ids]));
}

export function clearStaleNotifications(): void {
    const todayKey = getTodayKey();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayKey = STORAGE_PREFIX + yesterdayDate.toISOString().slice(0, 10);

    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX) && key !== todayKey && key !== yesterdayKey) {
            localStorage.removeItem(key);
        }
    }
}
