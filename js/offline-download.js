import { loadBooks } from "./books.js";
import { ENGLISH_BASE, URDU_BASE } from "./config.js";

// Must match DATA_CACHE in sw.js — survives app-shell cache version bumps.
const DATA_CACHE = "urdu-english-bible-data-v1";
const FLAG_KEY = "offlineBibleDownloaded";

export function isOfflineDownloaded() {
  return localStorage.getItem(FLAG_KEY) === "yes";
}

async function cacheUrl(cache, url) {
  const existing = await cache.match(url);
  if (existing) return;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed (${response.status})`);
  }
  await cache.put(url, response);
}

/**
 * Download every chapter of both translations into the persistent data cache.
 * onProgress(doneChapters, totalChapters) fires as each chapter completes.
 * Safe to re-run: already-cached chapters are skipped, so an interrupted
 * download resumes where it left off.
 */
export async function downloadFullBible(onProgress) {
  if (!("caches" in window)) {
    throw new Error("Offline storage is not supported in this browser");
  }

  const books = await loadBooks();
  const cache = await caches.open(DATA_CACHE);

  await cacheUrl(cache, `${URDU_BASE}/books.json`);
  await cacheUrl(cache, `${ENGLISH_BASE}/books.json`);

  const chapters = [];
  for (const book of books) {
    for (let ch = 1; ch <= book.chapterCount; ch += 1) {
      chapters.push({ bookId: book.id, chapter: ch });
    }
  }

  const total = chapters.length;
  let done = 0;
  const queue = [...chapters];

  const worker = async () => {
    while (queue.length) {
      const item = queue.shift();
      if (!item) break;
      await cacheUrl(cache, `${URDU_BASE}/chapters/${item.bookId}/${item.chapter}.json`);
      await cacheUrl(cache, `${ENGLISH_BASE}/chapters/${item.bookId}/${item.chapter}.json`);
      done += 1;
      onProgress?.(done, total);
    }
  };

  await Promise.all(Array.from({ length: 6 }, worker));

  localStorage.setItem(FLAG_KEY, "yes");
  return { total };
}
