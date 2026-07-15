const CACHE_NAME = 'yoritex-v18-20260714-formato-whatsapp';
const APP_SHELL = ['./', './index.html', './manifest.json', './logo-yori-tex-plano.png'];
const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyA58LjJd3R28quWhTDlU4TXHVxK5e6eIxg',
  authDomain: 'yori-tex.firebaseapp.com',
  projectId: 'yori-tex',
  storageBucket: 'yori-tex.firebasestorage.app',
  messagingSenderId: '249055898385',
  appId: '1:249055898385:web:01b09ed80cbe8be413bab0'
};

importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.15.0/firebase-messaging-compat.js');
firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging();

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if(event.request.method !== 'GET') return;
  const isPage = event.request.mode === 'navigate';
  if(isPage){
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
      return response;
    }).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if(response.ok && new URL(event.request.url).origin === self.location.origin){
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  })));
});

/* Legacy generic push handler; Firebase Messaging handles production pushes below.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) { data = {body:event.data?.text() || ''}; }
  event.waitUntil(self.registration.showNotification(data.title || 'YORI-TEX', {
    body: data.body || 'Tienes una nueva notificación.',
    icon: './logo-yori-tex-plano.png', badge: './logo-yori-tex-plano.png', tag: data.tag || 'yoritex-push',
    data: {url: data.url || './'}
  }));
});
*/

messaging.onBackgroundMessage(payload => {
  const data = payload.data || {};
  return self.registration.showNotification(data.title || 'YORI-TEX', {
    body: data.body || 'Tienes una nueva notificacion.',
    icon: './logo-yori-tex-plano.png', badge: './logo-yori-tex-plano.png', tag: data.tag || 'yoritex-fcm',
    data: {url: data.url || './'}
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || './';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list => {
    const abierta = list.find(client => 'focus' in client);
    const destino = new URL(url, self.registration.scope).href;
    return abierta ? abierta.navigate(destino).then(() => abierta.focus()) : clients.openWindow(destino);
  }));
});
