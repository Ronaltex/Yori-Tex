// Supabase cutover: replace the old offline handler without deleting stored data.
// No responses or credentials are cached. Network failures remain visible.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  if(event.request.method==='GET' && new URL(event.request.url).origin===self.location.origin){
    event.respondWith(fetch(event.request,{cache:'no-store'}));
  }
});

self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil((async()=>{const url=new URL('./',self.registration.scope).href;const windows=await self.clients.matchAll({type:'window',includeUncontrolled:true});const app=windows.find(c=>c.url.startsWith(url));if(app)return app.focus();return self.clients.openWindow(url);})());});

self.addEventListener('push',event=>{event.waitUntil((async()=>{let payload;try{payload=event.data?.json();}catch{}const title=typeof payload?.title==='string'?payload.title.slice(0,120):'YORI-TEX';const body=typeof payload?.body==='string'?payload.body.slice(0,300):'Tienes avisos por revisar en YORITEX.';await self.registration.showNotification(title,{body,tag:payload?.tag==='yoritex-test'?'yoritex-test':'yoritex-daily'});})());});
