
const cacheName = 'cache-v1'
const resourcesToPrecache = [
    '/',
    'style.css',
    'b1.jpg',
    'https://fonts.googleapis.com/css?family=Fira+Sans&display=swap',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js',
]


self.addEventListener('install', event => {
    console.log('Install event');
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
    event.respondWith(caches.match(event, request)
    .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
    })
    )
})
