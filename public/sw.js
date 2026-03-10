/* ============================================================
   AutoPro Libya — Service Worker  (Phase 13 PWA)
   ============================================================ */
const CACHE_NAME = 'autopro-v1';
const API_CACHE = 'autopro-api-v1';
const OFFLINE_PAGE = '/offline.html';

const STATIC_ASSETS = [
    '/',
    '/marketplace',
    '/calculator',
    '/shipping',
    '/wallet',
    '/auth',
    OFFLINE_PAGE,
];

/* ── Install ── */
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Cache static assets (ignore failures for individual files)
            return Promise.allSettled(STATIC_ASSETS.map(url => cache.add(url)));
        }).then(() => self.skipWaiting())
    );
});

/* ── Activate ── */
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME && k !== API_CACHE)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

/* ── Fetch Strategy ── */
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET and non-http requests
    if (request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // API routes → Network First, fallback to cache
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(API_CACHE).then(c => c.put(request, clone));
                    return res;
                })
                .catch(() => caches.match(request).then(cached => cached || new Response(
                    JSON.stringify({ error: 'offline', message: 'لا يوجد اتصال بالإنترنت' }),
                    { status: 503, headers: { 'Content-Type': 'application/json' } }
                )))
        );
        return;
    }

    // Static assets → Cache First
    if (url.pathname.match(/\.(js|css|png|jpg|webp|svg|ico|woff2?)$/)) {
        event.respondWith(
            caches.match(request).then(cached => cached || fetch(request).then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(request, clone));
                return res;
            }))
        );
        return;
    }

    // HTML navigation → Network First
    event.respondWith(
        fetch(request)
            .then(res => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(request, clone));
                return res;
            })
            .catch(() => caches.match(request) || caches.match(OFFLINE_PAGE))
    );
});

/* ── Push Notifications ── */
self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || 'أوتو برو 🚗', {
            body: data.body || 'لديك إشعار جديد',
            icon: data.icon || '/icons/icon-192.png',
            badge: data.badge || '/icons/icon-72.png',
            tag: data.tag || 'autopro-notification',
            data: data.url || '/',
            actions: data.actions || [],
            vibrate: [200, 100, 200],
            dir: 'rtl',
            lang: 'ar',
        })
    );
});

/* ── Notification Click ── */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            const existing = list.find(c => c.url.includes(url) && 'focus' in c);
            if (existing) return existing.focus();
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
