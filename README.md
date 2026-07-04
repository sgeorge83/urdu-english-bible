# Urdu English Bible

Kindle-style bilingual Bible PWA — **Urdu Geo Version** and **World English Bible (WEB)**, verse by verse.

**Live site:** [https://sgeorge83.github.io/urdu-english-bible/](https://sgeorge83.github.io/urdu-english-bible/)

## Data sources

| Language | Repository | License |
|----------|------------|---------|
| Urdu | [urdu-bible-data](https://github.com/sgeorge83/urdu-bible-data) | CC BY-NC-ND 4.0 |
| English | [english-bible-data](https://github.com/sgeorge83/english-bible-data) | Public Domain |

Both use **Bible SuperSearch book IDs 1–66** and the same chapter file layout: `chapters/{bookId}/{chapter}.json`.

## Verse linking

Parallel text is joined on three keys:

```text
bookId (1–66) + chapter + verse
```

The app fetches both chapter files for the same path and merges each verse number. If one translation lacks a verse number present in the other (~145 chapters differ in total verse count between Urdu Geo and WEB), the app shows the available side only.

Validate alignment locally:

```bash
node scripts/validate-alignment.mjs
```

## Features

- Library with **English + Urdu book names**
- Chapter picker with bilingual title
- Full-screen reader: Urdu (RTL) above English per verse
- **Aa** settings: font size, day/sepia/night, margins, justified text
- Horizontal page pagination with reading-time footer
- Highlights and notebook (IndexedDB, on-device)

## Development

Static files only — open `index.html` via a local server (ES modules):

```bash
npx serve .
```

## Deploy

GitHub Pages workflow deploys on push to `main`. Enable Pages from GitHub repo Settings → Pages → GitHub Actions.

## Attribution

E-GEEK CREATIONS · Urdu Geo Version · World English Bible
