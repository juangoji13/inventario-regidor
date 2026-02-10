// Service Worker para Inventario Regidor PWA
const CACHE_NAME = 'inventario-regidor-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
    console.log('[SW] Instalando Service Worker...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Cacheando recursos principales');
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[SW] Error al cachear:', err);
            })
    );
    self.skipWaiting();
});

// Activación del Service Worker
self.addEventListener('activate', event => {
    console.log('[SW] Activando Service Worker...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Estrategia: Network First, fallback to Cache
// Para datos dinámicos de Supabase, siempre intentamos red primero
self.addEventListener('fetch', event => {
    const { request } = event;

    // Ignorar requests a APIs externas de Supabase (siempre ir a la red)
    if (request.url.includes('supabase.co') ||
        request.url.includes('/api/config')) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then(response => {
                // Si la respuesta es válida, clonarla y guardarla en caché
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Si falla la red, intentar con caché
                return caches.match(request).then(cachedResponse => {
                    if (cachedResponse) {
                        console.log('[SW] Sirviendo desde caché:', request.url);
                        return cachedResponse;
                    }
                    // Si no hay caché, retornar página offline básica para navegación
                    if (request.mode === 'navigate') {
                        return caches.match('/index.html');
                    }
                });
            })
    );
});
