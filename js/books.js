import { ENGLISH_BASE, OT_BOOK_COUNT, URDU_BASE } from "./config.js";

let cachedBooks = null;

export async function loadBooks() {
  if (cachedBooks) return cachedBooks;

  const [urduRes, englishRes] = await Promise.all([
    fetch(`${URDU_BASE}/books.json`),
    fetch(`${ENGLISH_BASE}/books.json`),
  ]);

  if (!urduRes.ok || !englishRes.ok) {
    throw new Error("Failed to load book lists");
  }

  const urduBooks = await urduRes.json();
  const englishBooks = await englishRes.json();
  const englishById = Object.fromEntries(englishBooks.map((b) => [b.id, b]));

  cachedBooks = urduBooks
    .slice()
    .sort((a, b) => a.id - b.id)
    .map((urduBook) => {
      const englishBook = englishById[urduBook.id];
      if (!englishBook) {
        throw new Error(`Missing English metadata for book ${urduBook.id}`);
      }
      if (urduBook.chapter_count !== englishBook.chapter_count) {
        console.warn(
          `Chapter count mismatch book ${urduBook.id}: Urdu ${urduBook.chapter_count}, English ${englishBook.chapter_count}`
        );
      }
      return {
        id: urduBook.id,
        nameUrdu: urduBook.name,
        nameEnglish: englishBook.name,
        chapterCount: urduBook.chapter_count,
        testament: urduBook.id <= OT_BOOK_COUNT ? "ot" : "nt",
      };
    });

  return cachedBooks;
}

export function getBook(books, bookId) {
  return books.find((b) => b.id === bookId) ?? null;
}

/**
 * Next/previous chapter for continuous reading.
 * Crosses book boundaries (e.g. John 21 → Acts 1).
 * Returns null at Genesis 1 (prev) or Revelation 22 (next).
 */
export function getAdjacentChapter(books, bookId, chapter, direction) {
  const book = getBook(books, bookId);
  if (!book) return null;

  if (direction === "next") {
    if (chapter < book.chapterCount) {
      return { bookId, chapter: chapter + 1, startPage: "first" };
    }
    const nextBook = getBook(books, bookId + 1);
    if (nextBook) {
      return { bookId: nextBook.id, chapter: 1, startPage: "first" };
    }
    return null;
  }

  if (chapter > 1) {
    return { bookId, chapter: chapter - 1, startPage: "last" };
  }
  const prevBook = getBook(books, bookId - 1);
  if (prevBook) {
    return { bookId: prevBook.id, chapter: prevBook.chapterCount, startPage: "last" };
  }
  return null;
}
