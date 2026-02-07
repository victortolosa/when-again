export function isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
}

export async function updateBadge(count: number): Promise<void> {
    if (!isSupported()) return;

    if (count > 0) {
        await navigator.setAppBadge(count);
    } else {
        await navigator.clearAppBadge();
    }
}

export async function clearBadge(): Promise<void> {
    if (!isSupported()) return;
    await navigator.clearAppBadge();
}
