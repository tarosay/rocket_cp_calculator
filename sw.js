const CACHE_NAME = 'rocket-cp-calculator-v2';
const ASSETS = [
  './',
  './index.html',
  './cpCalculator.js',
  './manifest.json',
  './image/rocket.png',
  './image/icon32.png',
  './image/icon64.png',
  './image/icon128.png',
  './image/icon512.png',
  './image/icon1024.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => (key !== CACHE_NAME ? caches.delete(key) : null)))
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request).then(networkResponse => {
        const cloned = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, cloned));
        return networkResponse;
      })
    )
  );
});
