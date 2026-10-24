// Network-first: use fresh files when online and cached copies when offline.
const CACHE_NAME = "lingoguess-pwa-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Allow installation even if an optional file or icon is not uploaded yet.
    await Promise.all(APP_SHELL.map(async (path) => {
      try { await cache.add(new Request(path, { cache: "reload" })); }
      catch (error) { console.warn("Not precached:", path, error); }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith("lingoguess-pwa-") && key !== CACHE_NAME)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const appRoot = new URL("./", self.registration.scope);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(appRoot.pathname)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      // Go to the network first, not the HTTP cache, to pick up new deployments.
      const response = await fetch(request, { cache: "no-cache" });
      if (response.ok && response.type === "basic") {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await cache.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        const home = await cache.match("./index.html") || await cache.match("./");
        if (home) return home;
      }
      return Response.error();
    }
  })());
});
