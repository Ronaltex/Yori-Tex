// Service Worker — YORI-TEX
// ⚠️ Cambiar CACHE_VERSION cada vez que publiques cambios en GitHub
const CACHE_VERSION = 'yoritex-v2026-06-13';
const ASSETS = ['./manifest.json', './icon-192.png', './icon-512.png'];
// index.html NO se cachea: siempre se sirve desde la red para garantizar sync

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // index.html: SIEMPRE red primero, sin caché (crítico para sync entre navegadores)
  if(url.pathname.endsWith('/') || url.pathname.endsWith('index.html')){
    e.respondWith(
      fetch(e.request, { cache: 'no-store' }).catch(() => caches.match(e.request))
    );
    return;
  }
  // Resto de assets: red primero, caché como fallback
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
