// V3.0.0 intentionally has no offline cache. Remove any legacy worker/cache so GitHub Pages updates are visible immediately.
self.addEventListener("install",e=>{self.skipWaiting();});
self.addEventListener("activate",e=>e.waitUntil((async()=>{try{for(const k of await caches.keys())await caches.delete(k);await self.registration.unregister();await self.clients.claim()}catch(_){}})()));
