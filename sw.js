
const cacheName = 'cache-v1'
const resourcesToPrecache = [
    '/',
    '/index.html',
    '/style.css',
    'script.js',
    '/jquery.min.js',
    '/b1.jpg',
    '/user.png',
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            return cache.addAll(resourcesToPrecache)
        })
    )
})

self.addEventListener('activate', event => {
})

self.addEventListener('fetch', event => {
    event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
    })
    )
})
