const CACHE_NAME = "iolgregister-v7"; // Changed version
const urlsToCache = [
  "/", 
  "/index.html",
  "/style.css",
  "/script.js",
"/admin.html",
"/main.css",
"/main.js",
"/admin.js",
"/admin1.js",
"/admin2.js",
  "/images/logo.png",
  // Add other important assets here
];

// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
