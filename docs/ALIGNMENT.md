# Translation alignment (Urdu Geo + WEB)

Verified join key: **book ID (1–66) + chapter + verse number**

Both data repos use Bible SuperSearch numbering. All 66 books share the same `chapter_count` in `books.json`.

Full scan of all 1,189 chapters last verified: **2026-07-04**.

## Summary

| Check | Result |
|-------|--------|
| Books | 66 / 66 aligned by `id` |
| Chapter counts per book | All match — no missing chapters |
| Chapter files | Same paths `chapters/{bookId}/{chapter}.json` |
| Verse join | By integer `verse` field in each chapter |
| Chapters with different verse counts | **145 of 1,189** (~12%) |
| Verse numbers with English text but no Urdu | **439** |
| Verse numbers with Urdu text but no English | **4** |

## Why the differences exist

**No Scripture is missing.** The differences come from two translation practices, not data errors:

1. **Condensed repetitive passages (accounts for nearly all 439 English-only verses).**
   The Urdu Geo Version intentionally summarizes highly repetitive Old Testament list
   passages — censuses, genealogies, identical offerings, town lists — into fewer verses,
   and skips the verse numbering ahead so references stay aligned with standard Bibles.
   Example: Numbers 7 (twelve leaders bringing identical offerings) has 89 verses in
   English but 28 in Urdu; the Urdu verse numbers jump 18 → 24 → 30 → 48 → 54 → 72 → 84,
   with each Urdu verse summarizing the span it covers. Concentrated in:
   - Numbers 1, 4, 7, 26, 29, 31, 33 (censuses, offerings, itineraries — ~190 of the 439)
   - 1 Chronicles genealogies (esp. ch. 8)
   - Joshua 13–21 town-by-town territory lists
   - Ezekiel 48 tribal allotments (15 verses condensed)

2. **Verse-boundary shifts (the small 1–3 verse differences, and all 4 Urdu-only verses).**
   The same sentence is split across two verse numbers in one translation and kept as one
   in the other. The 4 Urdu-only verse numbers are chapter-seam differences:
   3 John 14/15, Revelation 12:18 (WEB counts it as 13:1), and the Romans 16 doxology
   (Urdu numbers it 25–27; this WEB text ends at 25).

The New Testament is essentially fully aligned: only 6 NT chapters differ, each by 1–3
verse numbers.

## App behavior

- Fetches Urdu and English chapter JSON for the **same** `bookId` and `chapter`.
- Throws if `book` or `chapter` fields disagree between files.
- Merges verses `1..max(urduCount, englishCount)`.
- Missing side renders as Urdu-only or English-only row (class `verse-pair--partial`).
- So every verse number is always readable in at least one language.

## Full list of chapters with different verse counts

Format: `Book chapter: Urdu verses vs English verses`.

### Genesis (10)
- Genesis 2: 24 vs 25 · Genesis 8: 21 vs 22 · Genesis 20: 17 vs 18
- Genesis 23: 18 vs 20 · Genesis 24: 66 vs 67 · Genesis 25: 32 vs 34
- Genesis 35: 28 vs 29 · Genesis 36: 39 vs 43 · Genesis 41: 56 vs 57
- Genesis 44: 33 vs 34

### Exodus (6)
- Exodus 25: 37 vs 40 · Exodus 26: 36 vs 37 · Exodus 27: 20 vs 21
- Exodus 36: 37 vs 38 · Exodus 37: 28 vs 29 · Exodus 38: 30 vs 31

### Leviticus (8)
- Leviticus 3: 14 vs 17 · Leviticus 11: 40 vs 47 · Leviticus 13: 58 vs 59
- Leviticus 14: 55 vs 57 · Leviticus 15: 30 vs 33 · Leviticus 17: 15 vs 16
- Leviticus 24: 22 vs 23 · Leviticus 25: 54 vs 55

### Numbers (16)
- Numbers 1: 41 vs 54 · Numbers 4: 39 vs 49 · Numbers 5: 29 vs 31
- Numbers 7: 28 vs 89 · Numbers 11: 34 vs 35 · Numbers 14: 44 vs 45
- Numbers 15: 40 vs 41 · Numbers 16: 49 vs 50 · Numbers 26: 34 vs 65
- Numbers 28: 27 vs 31 · Numbers 29: 19 vs 40 · Numbers 31: 41 vs 54
- Numbers 32: 41 vs 42 · Numbers 33: 26 vs 56 · Numbers 35: 30 vs 34
- Numbers 36: 12 vs 13

### Deuteronomy (6)
- Deuteronomy 9: 28 vs 29 · Deuteronomy 19: 20 vs 21 · Deuteronomy 28: 66 vs 68
- Deuteronomy 29: 28 vs 29 · Deuteronomy 31: 29 vs 30 · Deuteronomy 32: 51 vs 52

### Joshua (6)
- Joshua 6: 26 vs 27 · Joshua 13: 30 vs 33 · Joshua 14: 13 vs 15
- Joshua 16: 8 vs 10 · Joshua 19: 48 vs 51 · Joshua 21: 37 vs 45

### Judges (8)
- Judges 1: 35 vs 36 · Judges 3: 30 vs 31 · Judges 4: 23 vs 24
- Judges 6: 39 vs 40 · Judges 7: 24 vs 25 · Judges 9: 56 vs 57
- Judges 19: 29 vs 30 · Judges 20: 45 vs 48

### Ruth (1)
- Ruth 1: 20 vs 22

### 1 Samuel (9)
- 1 Samuel 3: 20 vs 21 · 1 Samuel 4: 19 vs 22 · 1 Samuel 9: 24 vs 27
- 1 Samuel 14: 51 vs 52 · 1 Samuel 17: 56 vs 58 · 1 Samuel 18: 29 vs 30
- 1 Samuel 23: 28 vs 29 · 1 Samuel 25: 41 vs 44 · 1 Samuel 30: 28 vs 31

### 2 Samuel (7)
- 2 Samuel 3: 37 vs 39 · 2 Samuel 4: 11 vs 12 · 2 Samuel 6: 22 vs 23
- 2 Samuel 9: 12 vs 13 · 2 Samuel 15: 36 vs 37 · 2 Samuel 21: 20 vs 22
- 2 Samuel 23: 36 vs 39

### 1 Kings (10)
- 1 Kings 1: 51 vs 53 · 1 Kings 5: 17 vs 18 · 1 Kings 6: 37 vs 38
- 1 Kings 7: 47 vs 51 · 1 Kings 8: 64 vs 66 · 1 Kings 9: 27 vs 28
- 1 Kings 10: 27 vs 29 · 1 Kings 15: 32 vs 34 · 1 Kings 17: 23 vs 24
- 1 Kings 20: 42 vs 43

### 2 Kings (4)
- 2 Kings 10: 34 vs 36 · 2 Kings 15: 37 vs 38 · 2 Kings 22: 18 vs 20
- 2 Kings 23: 36 vs 37

### 1 Chronicles (12)
- 1 Chronicles 2: 53 vs 55 · 1 Chronicles 4: 42 vs 43 · 1 Chronicles 6: 79 vs 81
- 1 Chronicles 8: 29 vs 40 · 1 Chronicles 9: 43 vs 44 · 1 Chronicles 11: 45 vs 47
- 1 Chronicles 15: 28 vs 29 · 1 Chronicles 17: 26 vs 27 · 1 Chronicles 23: 29 vs 32
- 1 Chronicles 24: 30 vs 31 · 1 Chronicles 26: 30 vs 32 · 1 Chronicles 29: 29 vs 30

### 2 Chronicles (6)
- 2 Chronicles 3: 15 vs 17 · 2 Chronicles 7: 20 vs 22 · 2 Chronicles 8: 16 vs 18
- 2 Chronicles 9: 29 vs 31 · 2 Chronicles 34: 31 vs 33 · 2 Chronicles 35: 26 vs 27

### Ezra (5)
- Ezra 2: 68 vs 70 · Ezra 7: 27 vs 28 · Ezra 8: 35 vs 36
- Ezra 9: 14 vs 15 · Ezra 10: 41 vs 44

### Nehemiah (3)
- Nehemiah 5: 18 vs 19 · Nehemiah 7: 71 vs 73 · Nehemiah 12: 46 vs 47

### Esther (2)
- Esther 2: 22 vs 23 · Esther 9: 26 vs 32

### Proverbs (1)
- Proverbs 26: 27 vs 28

### Isaiah (2)
- Isaiah 22: 23 vs 25 · Isaiah 59: 20 vs 21

### Jeremiah (6)
- Jeremiah 27: 19 vs 22 · Jeremiah 29: 31 vs 32 · Jeremiah 32: 43 vs 44
- Jeremiah 34: 21 vs 22 · Jeremiah 39: 17 vs 18 · Jeremiah 43: 12 vs 13

### Ezekiel (6)
- Ezekiel 1: 26 vs 28 · Ezekiel 4: 15 vs 17 · Ezekiel 40: 48 vs 49
- Ezekiel 41: 23 vs 26 · Ezekiel 42: 15 vs 20 · Ezekiel 48: 20 vs 35

### Amos (1)
- Amos 8: 13 vs 14

### Haggai (1)
- Haggai 1: 13 vs 15

### Zechariah (2)
- Zechariah 1: 20 vs 21 · Zechariah 12: 12 vs 14

### New Testament (6)
- Mark 9: 47 vs 50 · Luke 1: 79 vs 80 · Romans 14: 23 vs 26
- Romans 16: 27 vs 25 (Urdu has more) · 2 Corinthians 13: 13 vs 14
- 3 John 1: 15 vs 14 (Urdu has more) · Revelation 12: 18 vs 17 (Urdu has more)

## Sample aligned chapter

John 3: both repos report 36 verses; verse 16 pairs correctly.

Run `node scripts/validate-alignment.mjs` for a full report on your machine.
