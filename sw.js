// Supabase cutover: replace the old offline handler without deleting stored data.
// No responses or credentials are cached. Network failures remain visible.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if(event.request.method==='GET' && new URL(event.request.url).origin===self.location.origin){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
  }
});
