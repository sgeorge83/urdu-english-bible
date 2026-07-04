const CACHE_NAME = "urdu-english-bible-v16";
// Bible text and fonts live in a separate cache that survives app updates,
// so downloaded chapters are never wiped by an app-shell version bump.
const DATA_CACHE = "urdu-english-bible-data-v1";

const FONT_HOSTS = ["fonts.googleapis.com", "fonts.gstatic.com"];

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
  "./js/offline-download.js",
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
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== DATA_CACHE)
          .map((k) => caches.delete(k))
      )
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
  const isFont = FONT_HOSTS.includes(url.hostname);

  // Scripture text never changes: cache-first in the persistent data cache.
  if (isBibleJson || isFont) {
    event.respondWith(
      caches.open(DATA_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        const response = await fetch(event.request);
        if (response.ok || response.type === "opaque") {
          cache.put(event.request, response.clone());
        }
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
