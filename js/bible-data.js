import { ENGLISH_BASE, ENGLISH_BOOK_NAMES, URDU_BASE } from "./config.js";

function verseMap(chapter) {
  return new Map(chapter.verses.map((v) => [v.verse, v.text]));
}

/**
 * Merge Urdu Geo + WEB chapters by numeric book id, chapter, and verse.
 * Both repos use Bible SuperSearch IDs 1–66; verses align by verse number.
 */
export function mergeChapters(urduChapter, englishChapter) {
  const bookId = urduChapter.book;

  if (englishChapter.book !== bookId) {
    throw new Error(
      `Book ID mismatch: Urdu ${urduChapter.book}, English ${englishChapter.book}`
    );
  }
  if (urduChapter.chapter !== englishChapter.chapter) {
    throw new Error(
      `Chapter mismatch: Urdu ${urduChapter.chapter}, English ${englishChapter.chapter}`
    );
  }

  const urduByVerse = verseMap(urduChapter);
  const englishByVerse = verseMap(englishChapter);
  const maxVerse = Math.max(
    urduChapter.verse_count ?? urduChapter.verses.length,
    englishChapter.verse_count ?? englishChapter.verses.length
  );

  const verses = [];
  for (let verse = 1; verse <= maxVerse; verse += 1) {
    const urdu = urduByVerse.get(verse) ?? null;
    const english = englishByVerse.get(verse) ?? null;
    verses.push({ verse, urdu, english });
  }

  return {
    bookId,
    bookNameEnglish: ENGLISH_BOOK_NAMES[bookId] ?? englishChapter.book_name,
    bookNameUrdu: urduChapter.book_name,
    chapter: urduChapter.chapter,
    verses,
  };
}

export async function fetchMergedChapter(bookId, chapter) {
  const [urduRes, englishRes] = await Promise.all([
    fetch(`${URDU_BASE}/chapters/${bookId}/${chapter}.json`),
    fetch(`${ENGLISH_BASE}/chapters/${bookId}/${chapter}.json`),
  ]);

  if (!urduRes.ok || !englishRes.ok) {
    throw new Error(`Chapter not found: book ${bookId}, chapter ${chapter}`);
  }

  const urduChapter = await urduRes.json();
  const englishChapter = await englishRes.json();

  return mergeChapters(urduChapter, englishChapter);
}

export function countWords(chapter) {
  let words = 0;
  for (const v of chapter.verses) {
    if (v.urdu) words += v.urdu.split(/\s+/).filter(Boolean).length;
    if (v.english) words += v.english.split(/\s+/).filter(Boolean).length;
  }
  return words;
}

/**
 * Fetch and merge only the verses covered by a reading-plan passage spec list.
 */
export async function fetchMergedPassage(passageSpecs, meta = {}) {
  if (!passageSpecs?.length) {
    throw new Error("No passage references provided");
  }

  const chapterCache = new Map();
  const verses = [];

  for (const spec of passageSpecs) {
    const cacheKey = `${spec.bookId}:${spec.chapter}`;
    if (!chapterCache.has(cacheKey)) {
      chapterCache.set(cacheKey, await fetchMergedChapter(spec.bookId, spec.chapter));
    }

    const chapter = chapterCache.get(cacheKey);
    const maxVerse = chapter.verses.reduce((max, verse) => Math.max(max, verse.verse), 0);
    const verseStart = spec.verseStart ?? 1;
    const verseEnd = spec.verseEnd ?? maxVerse;

    for (const verse of chapter.verses) {
      if (verse.verse < verseStart || verse.verse > verseEnd) continue;
      if (!verse.urdu && !verse.english) continue;
      verses.push({
        verse: verse.verse,
        urdu: verse.urdu,
        english: verse.english,
        chapter: spec.chapter,
        bookId: spec.bookId,
      });
    }
  }

  if (!verses.length) {
    throw new Error("Passage has no readable verses");
  }

  const firstSpec = passageSpecs[0];
  const firstChapter = chapterCache.get(`${firstSpec.bookId}:${firstSpec.chapter}`);
  const chaptersUsed = new Set(verses.map((verse) => verse.chapter));
  const multiChapter = chaptersUsed.size > 1;

  for (const verse of verses) {
    verse.showChapter = multiChapter;
  }

  return {
    bookId: firstSpec.bookId,
    bookNameEnglish: firstSpec.bookName,
    bookNameUrdu: firstChapter?.bookNameUrdu ?? firstSpec.bookName,
    chapter: firstSpec.chapter,
    referenceLabel: meta.referenceLabel ?? passageSpecs.map((spec) => spec.label).join("; "),
    verses,
    isPassage: true,
    multiChapter,
    planContext: meta.planContext ?? null,
  };
}
