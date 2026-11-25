// Đổi VERSION mỗi lần sửa file để máy khách tải bản mới.
const VERSION = 'rubik-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './lib/cube.js', './lib/solve.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Stale-while-revalidate: trả bản cache ngay, cập nhật nền. Cũng cache cubing.js (CDN) lần đầu có mạng.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') c.put(e.request, r.clone()); return r; });
    return hit || net.catch(() => hit);
  }));
});
