const CACHE_NAME = "panguplay-v0511251139";
const urlsToCache = [
  "/PanguPlay/",
  "/PanguPlay/index.html",
  "/PanguPlay/movies.html",
  "/PanguPlay/shows.html",
  "/PanguPlay/dubbed.html",
  "/PanguPlay/player.html",
  "/PanguPlay/720p.html",
  "/PanguPlay/request.html",
  "/PanguPlay/images/twitter-image.jpg",
  "/PanguPlay/images/og-image.jpg",
  "/PanguPlay/favicon.png",
  "/PanguPlay/manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.js"
  // Add more assets as needed
];

self.addEventListener("install", event => {
  self.skipWaiting(); // Force activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))
    )
  );
  self.clients.claim();
});