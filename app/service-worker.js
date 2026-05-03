const VERSION = '0.0.0';

self.addEventListener('install', (event) => {
    const base = self.registration.scope;

    event.waitUntil(
        caches.open('v1').then((cache) =>
            fetch(base + '.?v=' + VERSION).then((response) => {
                if (response.ok) {
                    return cache.put(base, response);
                }
            })
        )
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => response || fetch(event.request))
    );
});
