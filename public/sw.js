const CACHE_NAME = "strikewave-v2";
const STATIC_ASSETS = ["/", "/inventory", "/guide", "/settings", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/") || url.hostname !== self.location.hostname) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cached) =>
      cached || fetch(event.request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
    )
  );
});

// Receive scheduled notification requests from the page
self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "SCHEDULE_NOTIFICATION") return;
  const { delay, title, body, icon } = event.data;
  if (typeof delay !== "number" || delay <= 0 || delay > 86400000) return;
  setTimeout(() => {
    self.registration.showNotification(title || "🎣 StrikeWave", {
      body: body || "Bite window opening now!",
      icon: icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: "bite-alert",
      renotify: true,
    });
  }, delay);
});

// Handle notification click — open the app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
