# Translation alignment (Urdu Geo + WEB)

Verified join key: **book ID (1–66) + chapter + verse number**

Both data repos use Bible SuperSearch numbering. All 66 books share the same `chapter_count` in `books.json`.

## Summary

| Check | Result |
|-------|--------|
| Books | 66 / 66 aligned by `id` |
| Chapter counts per book | All match |
| Chapter files | Same paths `chapters/{bookId}/{chapter}.json` |
| Verse join | By integer `verse` field in each chapter |
| Chapters with different verse counts | ~145 (translation versification) |
| Verse numbers on one side only | Subset of the above; app shows available text |

## App behavior

- Fetches Urdu and English chapter JSON for the **same** `bookId` and `chapter`.
- Throws if `book` or `chapter` fields disagree between files.
- Merges verses `1..max(urduCount, englishCount)`.
- Missing side renders as Urdu-only or English-only row (class `verse-pair--partial`).

## Sample aligned chapter

John 3: both repos report 36 verses; verse 16 pairs correctly.

Run `node scripts/validate-alignment.mjs` for a full report on your machine.
