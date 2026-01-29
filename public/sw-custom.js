// Custom service worker additions
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Handle fetch errors gracefully
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch((error) => {
      // If offline and requesting a page, show offline page
      if (event.request.mode === 'navigate') {
        return caches.match('/offline') || fetch(event.request);
      }
      throw error;
    })
  );
});

// Clean up old caches on activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete old caches (implement your cache versioning strategy)
            return cacheName.startsWith('workbox-') === false;
          })
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});
