const CACHE_NAME = 'group-form-v1.1.1'; // update this version on changes
const urlsToCache = [
  './',
  './',
  './style.css', // include your stylesheet if any
  './script.js', // include your JS file
  './favicon.ico',
  './manifest.json',
  './admin.js',
  './dashboard.html',
  './admin.html,
  './styles.css,
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // activate immediately
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim(); // take control of all pages
});

// Fetch event
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
