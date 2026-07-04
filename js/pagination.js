/**
 * Split merged verses into horizontal Kindle-style pages using a hidden measure column.
 */
export function buildVerseElement(verse, settings, highlightColor) {
  const el = document.createElement("article");
  el.className = "verse-pair";
  el.dataset.verse = String(verse.verse);
  if (verse.chapter != null) {
    el.dataset.chapter = String(verse.chapter);
  }

  const num = document.createElement("div");
  num.className = "verse-num";
  num.textContent = verse.showChapter ? `${verse.chapter}:${verse.verse}` : String(verse.verse);
  el.appendChild(num);

  if (verse.urdu) {
    const urdu = document.createElement("p");
    urdu.className = "verse-urdu";
    urdu.dir = "rtl";
    urdu.lang = "ur";
    urdu.textContent = verse.urdu;
    el.appendChild(urdu);
  }

  if (verse.english) {
    const english = document.createElement("p");
    english.className = "verse-english";
    english.dir = "ltr";
    english.lang = "en";
    english.textContent = verse.english;
    el.appendChild(english);
  }

  if (!verse.urdu || !verse.english) {
    el.classList.add("verse-pair--partial");
  }

  if (highlightColor) {
    el.style.setProperty("--highlight", highlightColor);
    el.classList.add("verse-pair--highlighted");
  }

  return el;
}

function pageHasContent(inner) {
  return inner.querySelector(".verse-pair") !== null;
}

export function paginateVerses(verses, measureEl, pageHeight, settings, highlightMap) {
  measureEl.innerHTML = "";
  measureEl.style.setProperty("--reader-font-size", `${settings.fontSize}px`);
  measureEl.style.setProperty("--reader-margin", settings.marginPadding ?? "18px");
  measureEl.classList.toggle("text-justified", settings.justified);

  const pages = [];
  let inner = document.createElement("div");
  inner.className = "reader-page-inner";
  measureEl.appendChild(inner);

  const usableHeight = Math.max(pageHeight - 4, 120);

  for (const verse of verses) {
    const highlightKey = verse.showChapter ? `${verse.chapter}:${verse.verse}` : verse.verse;
    const color = highlightMap?.get(highlightKey);
    const block = buildVerseElement(verse, settings, color);
    inner.appendChild(block);

    while (inner.scrollHeight > usableHeight && inner.childElementCount > 1) {
      inner.removeChild(block);
      pages.push(inner.innerHTML);
      inner = document.createElement("div");
      inner.className = "reader-page-inner";
      measureEl.innerHTML = "";
      measureEl.appendChild(inner);
      inner.appendChild(block);
    }
  }

  if (pageHasContent(inner)) {
    pages.push(inner.innerHTML);
  }

  measureEl.innerHTML = "";
  return pages.length ? pages : [];
}
