// Name & version for your cache
const CACHE_NAME = "site-cache-v2";
const ASSETS = [
  "/", // homepage
  "/index.html",
  "/styles.css",
  "/script.js",
  "/images/logo.png",
  // Add other important assets here
];

// Install event - caching assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim(); // Control clients immediately
});

// Fetch event - network first, fallback to cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Save new version in cache
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, resClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request)) // If offline, use cache
  );
});















/*const CACHE_NAME = "iolgregister-v2.3.4";
const urlsToCache = [
  "https://slide-t.github.io/iolgregister/",
  "https://slide-t.github.io/iolgregister/index.html",
  "https://slide-t.github.io/iolgregister/main.html",
  "https://slide-t.github.io/iolgregister/style.css",
  "https://slide-t.github.io/iolgregister/script.js",
  "https://fonts.googleapis.com/css2?family=Roboto&display=swap",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match("https://slide-t.github.io/iolgregister/index.html")
        )
      );
    })
  );
});







/*
const CACHE_NAME = 'iolg-cache-v1.1.2';
const urlsToCache = [
  'index.html',
  'admin.html',
  'downloadable.html',
  'manifest.json',
  'style.css',
  'script.js',
  'icons/icon-192.png',
  'icons/icon-512.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
