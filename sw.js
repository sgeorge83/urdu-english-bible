const CACHE_NAME = "urdu-english-bible-v15";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/tokens.css",
  "./css/app.css",
  "./css/reader.css",
  "./css/plan.css",
  "./data/book-of-common-prayer-plan.json",
  "./js/config.js",
  "./js/books.js",
  "./js/bible-data.js",
  "./js/settings.js",
  "./js/progress.js",
  "./js/highlights.js",
  "./js/pagination.js",
  "./js/about.js",
  "./js/reference-parser.js",
  "./js/reading-plan.js",
  "./js/plan-progress.js",
  "./js/app.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
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
  const isBibleJson =
    url.hostname === "raw.githubusercontent.com" &&
    (url.pathname.includes("/urdu-bible-data/") ||
      url.pathname.includes("/english-bible-data/"));

  if (isBibleJson) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok) cache.put(event.request, response.clone());
        return response;
      })
    );
    return;
  }

  if (event.request.method !== "GET") return;

  // Stale-while-revalidate for the app shell: serve cached copy instantly,
  // refresh it from the network in the background so the next load is current.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response.ok && url.origin === self.location.origin) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
