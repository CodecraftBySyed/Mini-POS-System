// Bump cache version to force service worker update when changed
const CACHE = 'mini-pos-v2';
const ASSETS = [
  './',
  './index.html',
  './products.html',
  './pos.html',
  './reports.html',
  './manifest.json',
  './css/style.css',
  './js/db.js',
  './js/shared.js',
  './js/dashboard.js',
  './js/products.js',
  './js/pos.js',
  './js/reports.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // CDN resources must not be cached here due to CORS restrictions.
  // Use local compiled CSS instead (css/style.css is already included above).
];

self.addEventListener('install', (event) => {
  // Try to cache all assets but don't fail installation if some external
  // resources are unavailable (e.g., CORS-blocked CDN). We already
  // prefer local files (css/style.css) so it's safe to ignore individual failures.
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.allSettled(
        ASSETS.map((asset) => cache.add(asset).catch(() => {
          // ignore individual asset cache errors
        }))
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  
  event.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          const resClone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, resClone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
