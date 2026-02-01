// Service Worker for PWA offline support

const CACHE_NAME = 'metta-sutta-v1';
const RUNTIME_CACHE = 'metta-sutta-runtime-v1';

// Assets to cache
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
];

// Network timeout
const NETWORK_TIMEOUT = 3000; // 3 seconds

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response; // Cache hit
      }

      // Network fallback with timeout
      return fetch(request).then((networkResponse) => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(networkResponse), NETWORK_TIMEOUT);
        });
      }).catch(() => {
        // Network error - return error page
        return caches.match('/offline.html');
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
