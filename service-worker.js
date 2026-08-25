self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil((async()=>{try{for(const k of await caches.keys())await caches.delete(k);await self.registration.unregister()}catch(_){}})()));
