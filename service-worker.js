const OLD_CACHE_PREFIX = "bathroom-planner";
self.addEventListener("install", event => {
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith(OLD_CACHE_PREFIX)).map(k => caches.delete(k)));
      await self.registration.unregister();
    } catch (e) {}
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", () => {});
