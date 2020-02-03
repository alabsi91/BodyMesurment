
const cacheName = 'cache-v1'
const resourcesToPrecache = [
    '/',
    '/index.html',
    '/style.css',
    'script.js',
    '/jquery.min.js',
    '/b1.jpg',
];

self.addEventListener('install', event => {
    console.log('Install event');
    self.skipWaiting();
    event.waitUntil(
        caches.open(cacheName)
        .then(cache => {
            return cache.addAll(resourcesToPrecache)
        })
    )
})

self.addEventListener('activate', event => {
    console.log('Activate event')
})

self.addEventListener('fetch', event => {
    console.log('Fetch intercepted for ', event.request.url)
    event.respondWith(caches.match(event.request)
    .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
    })
    )
})
