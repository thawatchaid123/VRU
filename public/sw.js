const CACHE_NAME = 'vru-repair-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/update-status',
    '/CSS/Update.css'
];

self.addEventListener('install', event => {
    console.info('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.info('Service Worker: Caching files');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.info('Service Worker: Installation complete');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.info('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.info('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            console.info('Service Worker: Activation complete');
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    // Skip caching for API requests
    if (url.pathname.includes('/VRU-main/get_repair_report.php')) {
        console.info('Service Worker: Fetching API directly:', url.pathname);
        event.respondWith(fetch(event.request));
        return;
    }
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.info('Service Worker: Serving from cache:', url.pathname);
                    return response;
                }
                console.info('Service Worker: Fetching from network:', url.pathname);
                return fetch(event.request).then(networkResponse => {
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    return networkResponse;
                });
            })
    );
});