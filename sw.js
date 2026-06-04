const CACHE_NAME = 'mallorca-cycling-v2';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/tailwind.min.css',
    './js/app.js',
    './js/filters.js',
    './js/map.js',
    './js/modal.js',
    './js/router.js',
    './js/stravaApi.js',
    './js/translations.js',
    './js/ui.js',
    './js/utils.js',
    './data/puertos.json',
    './data/ca.json',
    './data/en.json',
    './data/es.json',
    './media/icon.svg',
    './media/mallorcaCyclingLogo.webp'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            })
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    // Només gestionem peticions GET
    if (event.request.method !== 'GET') return;

    // Ignorar peticions que no siguin HTTP o HTTPS (ex: extensions de Chrome)
    if (!event.request.url.startsWith('http')) return;

    // Estratègia "Cache First" per als actius estàtics amb fallback a la xarxa
    // A més a més, es guarden a la memòria cau les noves peticions amb èxit (com les imatges)
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(response => {
                // Comprovem si la resposta és vàlida per ser emmagatzemada
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                // Clonem la resposta perquè el cos només es pot consumir una vegada
                const responseToCache = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            }).catch(() => {
                // Aquest bloc catch s'executa quan hi ha una excepció a la xarxa (ex: mode offline)
                // Es podria retornar una resposta fallback d'offline genèrica aquí.
            });
        })
    );
});
