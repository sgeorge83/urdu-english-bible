import { loadBooks, getBook } from "./books.js";
import { fetchMergedChapter } from "./bible-data.js";
import {
  addHighlight,
  getHighlightForVerse,
  listHighlights,
  removeHighlight,
} from "./highlights.js";
import { paginateVerses } from "./pagination.js";
import { countWordsInVerses, readingStats } from "./progress.js";
import { ENGLISH_BOOK_NAMES } from "./config.js";
import { loadSettings, saveSettings, marginPadding, DEFAULT_SETTINGS } from "./settings.js";

const HIGHLIGHT_COLORS = [
  { id: "yellow", value: "rgba(255, 214, 102, 0.45)" },
  { id: "green", value: "rgba(144, 238, 168, 0.45)" },
  { id: "blue", value: "rgba(153, 204, 255, 0.45)" },
];

const state = {
  books: [],
  route: parseRoute(),
  settings: loadSettings(),
  chapter: null,
  pages: [],
  pageIndex: 0,
  highlights: new Map(),
  totalWords: 0,
};

const els = {
  screens: {},
  libraryList: document.getElementById("library-list"),
  chapterTitle: document.getElementById("chapter-title"),
  chapterSubtitle: document.getElementById("chapter-subtitle"),
  chapterGrid: document.getElementById("chapter-grid"),
  readerShell: document.getElementById("reader-shell"),
  readerHeaderEn: document.getElementById("reader-header-en"),
  readerHeaderUr: document.getElementById("reader-header-ur"),
  pageTrack: document.getElementById("page-track"),
  readerFooter: document.getElementById("reader-footer"),
  measure: document.getElementById("measure"),
  aaSheet: document.getElementById("aa-sheet"),
  notebookList: document.getElementById("notebook-list"),
  loader: document.getElementById("global-loader"),
  error: document.getElementById("global-error"),
};

function parseRoute() {
  const hash = location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  if (parts[0] === "read" && parts[1] && parts[2]) {
    return { name: "read", bookId: Number(parts[1]), chapter: Number(parts[2]) };
  }
  if (parts[0] === "book" && parts[1]) {
    return { name: "book", bookId: Number(parts[1]) };
  }
  if (parts[0] === "notebook") {
    return { name: "notebook" };
  }
  return { name: "library" };
}

function navigate(route) {
  const path =
    route.name === "read"
      ? `#/read/${route.bookId}/${route.chapter}`
      : route.name === "book"
        ? `#/book/${route.bookId}`
        : route.name === "notebook"
          ? "#/notebook"
          : "#/";
  if (location.hash !== path) location.hash = path;
  state.route = route;
  render();
}

function showScreen(name) {
  document.querySelectorAll("[data-screen]").forEach((el) => {
    el.hidden = el.dataset.screen !== name;
  });
  document.body.dataset.screen = name;
}

function setLoading(on) {
  els.loader.hidden = !on;
}

function setError(message) {
  if (!message) {
    els.error.hidden = true;
    els.error.textContent = "";
    return;
  }
  els.error.hidden = false;
  els.error.textContent = message;
}

function applyTheme() {
  document.documentElement.dataset.theme = state.settings.theme;
  document.documentElement.style.setProperty("--reader-font-size", `${state.settings.fontSize}px`);
  document.documentElement.style.setProperty("--reader-margin", marginPadding(state.settings.margin));
  document.documentElement.classList.toggle("text-justified", state.settings.justified);
}

async function init() {
  document.querySelectorAll("[data-screen]").forEach((el) => {
    els.screens[el.dataset.screen] = el;
  });

  bindChrome();
  applyTheme();
  bindAaControls();

  try {
    setLoading(true);
    state.books = await loadBooks();
    setError("");
  } catch (err) {
    setError(err.message || "Failed to load Bible catalog");
  } finally {
    setLoading(false);
  }

  window.addEventListener("hashchange", () => {
    state.route = parseRoute();
    render();
  });

  render();
}

function bindChrome() {
  document.getElementById("btn-notebook").addEventListener("click", () => navigate({ name: "notebook" }));
  document.getElementById("btn-back-library").addEventListener("click", () => navigate({ name: "library" }));
  document.getElementById("btn-back-chapters").addEventListener("click", () => {
    if (state.route.name === "read") {
      navigate({ name: "book", bookId: state.route.bookId });
    }
  });
  document.getElementById("btn-aa").addEventListener("click", () => {
    els.aaSheet.hidden = !els.aaSheet.hidden;
  });
  document.getElementById("btn-close-aa").addEventListener("click", () => {
    els.aaSheet.hidden = true;
  });

  document.getElementById("btn-prev-page").addEventListener("click", () => goPage(state.pageIndex - 1));
  document.getElementById("btn-next-page").addEventListener("click", () => goPage(state.pageIndex + 1));

  els.pageTrack.addEventListener("click", (e) => {
    const pair = e.target.closest(".verse-pair");
    if (!pair || state.route.name !== "read") return;
    handleVerseTap(Number(pair.dataset.verse));
  });

  setupSwipe(els.pageTrack);
  setupLongPress(els.pageTrack);
}

function bindAaControls() {
  const fontSlider = document.getElementById("font-size");
  fontSlider.value = state.settings.fontSize;
  fontSlider.addEventListener("input", () => {
    state.settings.fontSize = Number(fontSlider.value);
    document.getElementById("font-size-label").textContent = `${state.settings.fontSize}px`;
    persistSettingsAndRepaginate();
  });

  document.querySelectorAll("[data-theme-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.theme = btn.dataset.themeBtn;
      document.querySelectorAll("[data-theme-btn]").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      persistSettingsAndRepaginate();
    });
  });

  document.querySelectorAll("[data-margin-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.settings.margin = btn.dataset.marginBtn;
      document.querySelectorAll("[data-margin-btn]").forEach((b) => {
        b.classList.toggle("active", b === btn);
      });
      persistSettingsAndRepaginate();
    });
  });

  document.getElementById("justify-toggle").checked = state.settings.justified;
  document.getElementById("justify-toggle").addEventListener("change", (e) => {
    state.settings.justified = e.target.checked;
    persistSettingsAndRepaginate();
  });

  document.querySelectorAll("[data-theme-btn]").forEach((b) => {
    b.classList.toggle("active", b.dataset.themeBtn === state.settings.theme);
  });
  document.querySelectorAll("[data-margin-btn]").forEach((b) => {
    b.classList.toggle("active", b.dataset.marginBtn === state.settings.margin);
  });
}

function persistSettingsAndRepaginate() {
  saveSettings(state.settings);
  applyTheme();
  if (state.route.name === "read" && state.chapter) {
    repaginate();
  }
}

async function render() {
  setError("");
  applyTheme();

  if (state.route.name === "library") {
    showScreen("library");
    renderLibrary();
    return;
  }

  if (state.route.name === "book") {
    showScreen("chapters");
    renderChapters(state.route.bookId);
    return;
  }

  if (state.route.name === "notebook") {
    showScreen("notebook");
    await renderNotebook();
    return;
  }

  if (state.route.name === "read") {
    showScreen("reader");
    await renderReader(state.route.bookId, state.route.chapter);
  }
}

function renderLibrary() {
  els.libraryList.innerHTML = "";
  const otHeading = document.createElement("h2");
  otHeading.className = "section-label";
  otHeading.textContent = "Old Testament";
  els.libraryList.appendChild(otHeading);

  let currentSection = "ot";
  for (const book of state.books) {
    if (book.testament === "nt" && currentSection === "ot") {
      const ntHeading = document.createElement("h2");
      ntHeading.className = "section-label";
      ntHeading.textContent = "New Testament";
      els.libraryList.appendChild(ntHeading);
      currentSection = "nt";
    }

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "book-row";
    btn.innerHTML = `
      <span class="book-row__english">${escapeHtml(book.nameEnglish)}</span>
      <span class="book-row__urdu" dir="rtl" lang="ur">${escapeHtml(book.nameUrdu)}</span>
    `;
    btn.addEventListener("click", () => navigate({ name: "book", bookId: book.id }));
    els.libraryList.appendChild(btn);
  }
}

function renderChapters(bookId) {
  const book = getBook(state.books, bookId);
  if (!book) {
    setError("Book not found");
    navigate({ name: "library" });
    return;
  }

  els.chapterTitle.textContent = `${book.nameEnglish} · ${book.nameUrdu}`;
  els.chapterSubtitle.textContent = `${book.chapterCount} chapters`;
  els.chapterGrid.innerHTML = "";

  for (let ch = 1; ch <= book.chapterCount; ch += 1) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chapter-cell";
    btn.textContent = ch;
    btn.addEventListener("click", () => navigate({ name: "read", bookId, chapter: ch }));
    els.chapterGrid.appendChild(btn);
  }
}

async function loadChapterHighlights(bookId, chapter) {
  const all = await listHighlights();
  const map = new Map();
  for (const h of all) {
    if (h.bookId === bookId && h.chapter === chapter) {
      map.set(h.verse, h.color);
    }
  }
  state.highlights = map;
}

async function renderReader(bookId, chapter) {
  const book = getBook(state.books, bookId);
  if (!book) {
    setError("Book not found");
    return;
  }

  els.readerHeaderEn.textContent = `${book.nameEnglish} ${chapter}`;
  els.readerHeaderUr.textContent = `${book.nameUrdu} ${chapter}`;

  try {
    setLoading(true);
    state.chapter = await fetchMergedChapter(bookId, chapter);
    await loadChapterHighlights(bookId, chapter);
    state.totalWords = countWordsInVerses(state.chapter.verses);
    state.pageIndex = 0;
    repaginate();
  } catch (err) {
    setError(err.message || "Failed to load chapter");
  } finally {
    setLoading(false);
  }
}

function repaginate() {
  if (!state.chapter) return;

  const viewport = document.querySelector(".reader-viewport");
  const pageHeight = viewport ? viewport.clientHeight : 480;
  const measureHost = els.measure.parentElement;
  if (viewport && measureHost) {
    measureHost.style.width = `${viewport.clientWidth}px`;
    measureHost.style.height = `${pageHeight}px`;
  }
  const settings = {
    ...state.settings,
    marginPadding: marginPadding(state.settings.margin),
  };

  state.pages = paginateVerses(
    state.chapter.verses,
    els.measure,
    pageHeight,
    settings,
    state.highlights
  );

  if (state.pageIndex >= state.pages.length) {
    state.pageIndex = Math.max(0, state.pages.length - 1);
  }

  renderPages();
  updateFooter();
}

function renderPages() {
  els.pageTrack.innerHTML = "";
  state.pages.forEach((html, index) => {
    const page = document.createElement("div");
    page.className = "reader-page";
    page.dataset.page = String(index);
    page.innerHTML = html;
    if (index === state.pageIndex) page.classList.add("reader-page--active");
    els.pageTrack.appendChild(page);
  });
  els.pageTrack.style.transform = `translateX(-${state.pageIndex * 100}%)`;
}

function goPage(index) {
  if (index < 0 || index >= state.pages.length) return;
  state.pageIndex = index;
  els.pageTrack.querySelectorAll(".reader-page").forEach((p, i) => {
    p.classList.toggle("reader-page--active", i === index);
  });
  els.pageTrack.style.transform = `translateX(-${index * 100}%)`;
  updateFooter();
}

function updateFooter() {
  const { percent, minutesLeft } = readingStats(
    state.totalWords,
    state.pageIndex + 1,
    state.pages.length
  );
  const book = getBook(state.books, state.route.bookId);
  const en = book ? `${book.nameEnglish} ${state.route.chapter}` : "";
  const ur = book ? `${book.nameUrdu} ${state.route.chapter}` : "";
  els.readerFooter.textContent = `${en} · ${ur} · Page ${state.pageIndex + 1} of ${state.pages.length} · ${minutesLeft} min left · ${percent}% read`;
}

function setupSwipe(el) {
  let startX = 0;
  el.addEventListener(
    "touchstart",
    (e) => {
      startX = e.changedTouches[0].screenX;
    },
    { passive: true }
  );
  el.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].screenX - startX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0) goPage(state.pageIndex + 1);
      else goPage(state.pageIndex - 1);
    },
    { passive: true }
  );
}

function setupLongPress(el) {
  let timer = null;
  el.addEventListener("touchstart", (e) => {
    const pair = e.target.closest(".verse-pair");
    if (!pair) return;
    const verse = Number(pair.dataset.verse);
    timer = setTimeout(() => openHighlightMenu(verse), 550);
  });
  el.addEventListener("touchend", () => clearTimeout(timer));
  el.addEventListener("touchmove", () => clearTimeout(timer));
}

function handleVerseTap(verse) {
  if (state.route.name !== "read") return;
  openHighlightMenu(verse);
}

async function openHighlightMenu(verse) {
  const existing = await getHighlightForVerse(state.route.bookId, state.route.chapter, verse);
  const verseData = state.chapter.verses.find((v) => v.verse === verse);
  if (!verseData) return;

  const choice = window.prompt(
    `Verse ${verse}\n\nEnter color: yellow, green, blue\nOr type "remove" to delete highlight\nOr type a short note after color (e.g. yellow: my note)`,
    existing ? "remove" : "yellow"
  );
  if (choice === null) return;

  const trimmed = choice.trim().toLowerCase();
  if (trimmed === "remove" && existing) {
    await removeHighlight(existing.id);
    state.highlights.delete(verse);
    repaginate();
    return;
  }

  const match = trimmed.match(/^(yellow|green|blue)(?::(.+))?$/);
  if (!match) return;

  const colorDef = HIGHLIGHT_COLORS.find((c) => c.id === match[1]);
  if (!colorDef) return;

  if (existing) await removeHighlight(existing.id);

  await addHighlight({
    bookId: state.route.bookId,
    chapter: state.route.chapter,
    verse,
    color: colorDef.value,
    colorName: colorDef.id,
    note: match[2]?.trim() || "",
    previewUrdu: verseData.urdu || "",
    previewEnglish: verseData.english || "",
    reference: `${ENGLISH_BOOK_NAMES[state.route.bookId]} ${state.route.chapter}:${verse}`,
  });

  state.highlights.set(verse, colorDef.value);
  repaginate();
}

async function renderNotebook() {
  const items = await listHighlights();
  els.notebookList.innerHTML = "";

  if (!items.length) {
    const empty = document.createElement("p");
    empty.className = "empty-note";
    empty.textContent = "No highlights yet. Long-press a verse in the reader to save one.";
    els.notebookList.appendChild(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement("article");
    card.className = "notebook-card";
    card.style.borderLeftColor = item.color;
    card.innerHTML = `
      <h3>${escapeHtml(item.reference)}</h3>
      ${item.previewUrdu ? `<p class="notebook-urdu" dir="rtl" lang="ur">${escapeHtml(item.previewUrdu)}</p>` : ""}
      ${item.previewEnglish ? `<p class="notebook-en">${escapeHtml(item.previewEnglish)}</p>` : ""}
      ${item.note ? `<p class="notebook-note">${escapeHtml(item.note)}</p>` : ""}
    `;
    card.addEventListener("click", () => {
      navigate({ name: "read", bookId: item.bookId, chapter: item.chapter });
    });
    els.notebookList.appendChild(card);
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

window.addEventListener("resize", () => {
  if (state.route.name === "read" && state.chapter) {
    repaginate();
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}

init();
