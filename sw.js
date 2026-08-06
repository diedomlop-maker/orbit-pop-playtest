const CACHE = 'orbit-pop-v18';
const root = new URL('./', self.registration.scope);
const assetUrl = path => new URL(path, root).toString();
const ASSETS = [
  '',
  'index.html',
  'manifest.webmanifest',
  'icon.svg',
  'assets/index.css?v=0.15.0',
  'assets/app.js?v=0.15.0',
  'assets/mediterranean-arena.png',
].map(assetUrl);
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => event.waitUntil(
  caches.keys()
    .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()),
));
self.addEventListener('fetch', event => {
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(assetUrl('index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
    if (response.ok && new URL(event.request.url).origin === self.location.origin) {
      caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    }
    return response;
  })));
});
