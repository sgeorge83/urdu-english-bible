import { ENGLISH_BOOK_NAMES } from "./config.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildBookLookup() {
  const lookup = [];
  for (const [id, name] of Object.entries(ENGLISH_BOOK_NAMES)) {
    lookup.push({ id: Number(id), name, pattern: name });
  }
  lookup.push({ id: 19, name: "Psalms", pattern: "Psalm" });
  lookup.push({ id: 1, name: "Genesis", pattern: "Gen." });
  lookup.sort((a, b) => b.pattern.length - a.pattern.length);
  return lookup;
}

const BOOK_LOOKUP = buildBookLookup();
const SINGLE_CHAPTER_BOOK_IDS = new Set([31, 57, 63, 64, 65]);

function matchBook(segment) {
  const trimmed = segment.trim();
  for (const entry of BOOK_LOOKUP) {
    const withRest = new RegExp(`^${escapeRegex(entry.pattern)}\\s+(.+)$`, "i");
    const match = trimmed.match(withRest);
    if (match) {
      return {
        bookId: entry.id,
        bookName: ENGLISH_BOOK_NAMES[entry.id] ?? entry.name,
        rest: match[1].trim(),
      };
    }
    const bookOnly = new RegExp(`^${escapeRegex(entry.pattern)}$`, "i");
    if (bookOnly.test(trimmed)) {
      return {
        bookId: entry.id,
        bookName: ENGLISH_BOOK_NAMES[entry.id] ?? entry.name,
        rest: "",
      };
    }
  }
  return null;
}

function parseRest(bookId, bookName, rest) {
  const specs = [];

  let match = rest.match(/^(\d+)-(\d+):(\d+)$/);
  if (match) {
    const startChapter = Number(match[1]);
    const endChapter = Number(match[2]);
    const endVerse = Number(match[3]);
    for (let chapter = startChapter; chapter < endChapter; chapter += 1) {
      specs.push({
        bookId,
        bookName,
        chapter,
        verseStart: 1,
        verseEnd: null,
        label: `${bookName} ${chapter}`,
      });
    }
    specs.push({
      bookId,
      bookName,
      chapter: endChapter,
      verseStart: 1,
      verseEnd: endVerse,
      label: `${bookName} ${endChapter}:1-${endVerse}`,
    });
    return specs;
  }

  match = rest.match(/^(\d+)-(\d+)$/);
  if (match) {
    const startChapter = Number(match[1]);
    const endChapter = Number(match[2]);
    for (let chapter = startChapter; chapter <= endChapter; chapter += 1) {
      specs.push({
        bookId,
        bookName,
        chapter,
        verseStart: 1,
        verseEnd: null,
        label: `${bookName} ${chapter}`,
      });
    }
    return specs;
  }

  match = rest.match(/^(\d+):(\d+)-(\d+):(\d+)$/);
  if (match) {
    const startChapter = Number(match[1]);
    const startVerse = Number(match[2]);
    const endChapter = Number(match[3]);
    const endVerse = Number(match[4]);

    specs.push({
      bookId,
      bookName,
      chapter: startChapter,
      verseStart: startVerse,
      verseEnd: startChapter === endChapter ? endVerse : null,
      label:
        startChapter === endChapter
          ? `${bookName} ${startChapter}:${startVerse}-${endVerse}`
          : `${bookName} ${startChapter}:${startVerse}-`,
    });

    for (let chapter = startChapter + 1; chapter < endChapter; chapter += 1) {
      specs.push({
        bookId,
        bookName,
        chapter,
        verseStart: 1,
        verseEnd: null,
        label: `${bookName} ${chapter}`,
      });
    }

    if (endChapter > startChapter) {
      specs.push({
        bookId,
        bookName,
        chapter: endChapter,
        verseStart: 1,
        verseEnd: endVerse,
        label: `${bookName} ${endChapter}:1-${endVerse}`,
      });
    }
    return specs;
  }

  match = rest.match(/^(\d+):(\d+)-(\d+)$/);
  if (match) {
    return [
      {
        bookId,
        bookName,
        chapter: Number(match[1]),
        verseStart: Number(match[2]),
        verseEnd: Number(match[3]),
        label: `${bookName} ${match[1]}:${match[2]}-${match[3]}`,
      },
    ];
  }

  match = rest.match(/^(\d+):(\d+)$/);
  if (match) {
    const verse = Number(match[2]);
    return [
      {
        bookId,
        bookName,
        chapter: Number(match[1]),
        verseStart: verse,
        verseEnd: verse,
        label: `${bookName} ${match[1]}:${match[2]}`,
      },
    ];
  }

  match = rest.match(/^(\d+)$/);
  if (match) {
    return [
      {
        bookId,
        bookName,
        chapter: Number(match[1]),
        verseStart: 1,
        verseEnd: null,
        label: `${bookName} ${match[1]}`,
      },
    ];
  }

  throw new Error(`Cannot parse reference segment: ${bookName} ${rest}`);
}

export function parseReferenceString(reference) {
  if (!reference?.trim()) return [];

  const segments = reference.split(";").map((part) => part.trim()).filter(Boolean);
  const specs = [];

  for (const segment of segments) {
    const matched = matchBook(segment);
    if (!matched) {
      throw new Error(`Unknown book in reference: ${segment}`);
    }
    if (!matched.rest) {
      if (!SINGLE_CHAPTER_BOOK_IDS.has(matched.bookId)) {
        throw new Error(`Cannot parse reference segment: ${matched.bookName}`);
      }
      specs.push({
        bookId: matched.bookId,
        bookName: matched.bookName,
        chapter: 1,
        verseStart: 1,
        verseEnd: null,
        label: matched.bookName,
      });
      continue;
    }
    specs.push(...parseRest(matched.bookId, matched.bookName, matched.rest));
  }

  return specs;
}
