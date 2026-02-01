/**
 * PWA utilities for service worker management and offline detection
 */

export function isPWA(): boolean {
  if (typeof window === 'undefined') return false;
  // Fix for iOS Safari standalone mode
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches ||
    nav.standalone === true;
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export async function unregisterServiceWorkers(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((reg) => reg.unregister()));
  console.log('All service workers unregistered');
}

export async function clearAllCaches(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return;
  }

  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('All caches cleared');
}

export async function getCurrentServiceWorker(): Promise<ServiceWorker | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  return registration?.active || null;
}

export async function forceServiceWorkerUpdate(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
    console.log('Service worker update check initiated');
  }
}

export function addNetworkStatusListener(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => { };
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

export async function getCacheSize(): Promise<number> {
  if (typeof window === 'undefined' || !('caches' in window)) {
    return 0;
  }

  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Development utilities
export const pwaDebug = {
  logServiceWorkerState: async (): Promise<void> => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      console.log('No service worker registered');
      return;
    }

    console.log('Service Worker State:', {
      installing: registration.installing?.state,
      waiting: registration.waiting?.state,
      active: registration.active?.state,
    });
  },

  logCacheContents: async (): Promise<void> => {
    const cacheNames = await caches.keys();
    console.log('Cache Names:', cacheNames);

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      console.log(`${name}:`, keys.map((k) => k.url));
    }
  },

  logPWAInfo: (): void => {
    console.log('PWA Info:', {
      isPWA: isPWA(),
      isOnline: isOnline(),
      serviceWorkerSupported: 'serviceWorker' in navigator,
      cacheSupported: 'caches' in window,
      notificationSupported: 'Notification' in window,
    });
  },
};
