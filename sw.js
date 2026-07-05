/* Coach OS Service Worker — offline-first app shell caching */
const CACHE = 'coachos-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
// Network-first for HTML (always get updates when online), cache-first for the rest
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Never cache-intercept the Apps Script sync backend, even if it's ever called via GET —
  // static CDN assets (fonts, Chart.js) are still allowed through the cache-first path below.
  const origin = new URL(e.request.url).origin;
  if (origin.endsWith('script.google.com') || origin.endsWith('googleusercontent.com')) return;
  const isHTML = e.request.mode === 'navigate' || e.request.destination === 'document';
  if (isHTML) {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return r;
      }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
    );
  } else {
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => {}))
    );
  }
});
