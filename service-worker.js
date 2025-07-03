// PanguPlay PWA Service Worker
const CACHE_NAME = "panguplay-v0703251900";
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
  "/PanguPlay/ply-logo.png",
  "/PanguPlay/icon-192.png",
  "/PanguPlay/icon-512.png",
  "/PanguPlay/orientation-lock.js",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/9.4.1/swiper-bundle.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/plyr/3.7.8/plyr.min.css",
  "https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1"
  // Add more assets as needed
];

// Install event - Cache assets when the service worker is installed
self.addEventListener("install", event => {
  self.skipWaiting(); // Force activate new SW immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app shell and assets');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - Clean up old caches when new service worker activates
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      console.log('Service Worker now controls all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Improved cache strategy
self.addEventListener("fetch", event => {
  // Skip cross-origin requests and video files
  if (!event.request.url.startsWith(self.location.origin) ||
      event.request.url.match(/\.(mp4|webm|m3u8)$/)) {
    return fetch(event.request);
  }

  // For CDN resources (already in urlsToCache), use cache-first strategy
  if (event.request.url.includes('cdnjs.cloudflare.com') || 
      event.request.url.includes('gstatic.com')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .then(response => {
              // Cache the fetched response for future
              return caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
                return response;
              });
            });
        })
    );
    return;
  }

  // For app pages (HTML), use network-first with cache fallback
  if (event.request.url.endsWith('.html') || 
      event.request.url.endsWith('/PanguPlay/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache the latest version
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, use cached version
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/PanguPlay/index.html');
            });
        })
    );
    return;
  }

  // For all other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200) {
              return response;
            }
            
            // Cache the fetched response
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
          });
      })
  );
});

// Add basic notification support
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const notification = event.data.json();
  const title = notification.title || 'New on PanguPlay';
  const options = {
    body: notification.body || 'Check out new content!',
    icon: '/PanguPlay/icon-192.png',
    badge: '/PanguPlay/favicon.png'
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/PanguPlay/')
  );
});