const CACHE_NAME = 'mowtracker-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/calendar',
  '/styles.css',
  '/logo.png',
  '/manifest.json',
  '/favicon.ico',
  '/calendar/add-appointment',
  '/jobs', // if you have a route listing jobs
  '/customers', // if you have a route listing customers
];

// Install event – cache essential files
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// Activate event – cleanup old caches if needed
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event – serve from cache if offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).catch(() => {
        return caches.match('/');
      });
    })
  );
});
