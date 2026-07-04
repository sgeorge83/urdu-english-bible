import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const urduRoot = "C:/Users/SharoonGeorge/Projects/urdu-bible-data";
const engRoot = "C:/Users/SharoonGeorge/Projects/english-bible-data";

const urduBooks = JSON.parse(readFileSync(join(urduRoot, "books.json"), "utf8"));
const engBooks = JSON.parse(readFileSync(join(engRoot, "books.json"), "utf8"));

const urduById = Object.fromEntries(urduBooks.map((b) => [b.id, b]));
const engById = Object.fromEntries(engBooks.map((b) => [b.id, b]));

const chapterMismatches = [];
const oneSideOnly = [];
const idMismatches = [];

for (let bookId = 1; bookId <= 66; bookId += 1) {
  const uBook = urduById[bookId];
  const eBook = engById[bookId];
  if (!uBook || !eBook) {
    idMismatches.push({ bookId, issue: "missing book metadata" });
    continue;
  }
  if (uBook.chapter_count !== eBook.chapter_count) {
    idMismatches.push({
      bookId,
      issue: "chapter_count",
      urdu: uBook.chapter_count,
      english: eBook.chapter_count,
    });
  }

  for (let chapter = 1; chapter <= uBook.chapter_count; chapter += 1) {
    const urduChapter = JSON.parse(
      readFileSync(join(urduRoot, "chapters", String(bookId), `${chapter}.json`), "utf8")
    );
    const engChapter = JSON.parse(
      readFileSync(join(engRoot, "chapters", String(bookId), `${chapter}.json`), "utf8")
    );

    if (urduChapter.book !== bookId || engChapter.book !== bookId) {
      idMismatches.push({ bookId, chapter, issue: "book field in chapter file" });
    }
    if (urduChapter.chapter !== chapter || engChapter.chapter !== chapter) {
      idMismatches.push({ bookId, chapter, issue: "chapter field in chapter file" });
    }

    if (urduChapter.verse_count !== engChapter.verse_count) {
      chapterMismatches.push({
        bookId,
        chapter,
        urdu: urduChapter.verse_count,
        english: engChapter.verse_count,
      });
    }

    const urduVerses = new Set(urduChapter.verses.map((v) => v.verse));
    const engVerses = new Set(engChapter.verses.map((v) => v.verse));
    const maxVerse = Math.max(urduChapter.verse_count, engChapter.verse_count);
    for (let verse = 1; verse <= maxVerse; verse += 1) {
      const hasUrdu = urduVerses.has(verse);
      const hasEnglish = engVerses.has(verse);
      if (hasUrdu !== hasEnglish) {
        oneSideOnly.push({ bookId, chapter, verse, hasUrdu, hasEnglish });
      }
    }
  }
}

console.log(JSON.stringify({
  books: 66,
  idMismatches: idMismatches.length,
  chapterCountMismatches: chapterMismatches.length,
  versesOnOneSideOnly: oneSideOnly.length,
  sampleChapterMismatches: chapterMismatches.slice(0, 10),
  sampleOneSideOnly: oneSideOnly.slice(0, 10),
}, null, 2));
