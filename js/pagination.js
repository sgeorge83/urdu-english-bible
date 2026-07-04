/**
 * Split merged verses into horizontal Kindle-style pages using a hidden measure column.
 */
export function buildVerseElement(verse, settings, highlightColor) {
  const el = document.createElement("article");
  el.className = "verse-pair";
  el.dataset.verse = String(verse.verse);

  const num = document.createElement("div");
  num.className = "verse-num";
  num.textContent = verse.verse;
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

export function paginateVerses(verses, measureEl, pageHeight, settings, highlightMap) {
  measureEl.innerHTML = "";
  measureEl.style.setProperty("--reader-font-size", `${settings.fontSize}px`);
  measureEl.style.setProperty("--reader-margin", settings.marginPadding ?? "18px");
  measureEl.classList.toggle("text-justified", settings.justified);

  const pages = [];
  let currentPage = document.createElement("div");
  currentPage.className = "reader-page-inner";
  measureEl.appendChild(currentPage);

  for (const verse of verses) {
    const color = highlightMap?.get(verse.verse);
    const block = buildVerseElement(verse, settings, color);
    currentPage.appendChild(block);

    if (measureEl.scrollHeight > pageHeight && currentPage.childElementCount > 1) {
      currentPage.removeChild(block);
      pages.push(currentPage.innerHTML);
      currentPage = document.createElement("div");
      currentPage.className = "reader-page-inner";
      measureEl.innerHTML = "";
      measureEl.appendChild(currentPage);
      currentPage.appendChild(block);
    }
  }

  if (currentPage.childElementCount > 0) {
    pages.push(currentPage.innerHTML);
  }

  measureEl.innerHTML = "";
  return pages.length ? pages : ['<div class="reader-page-inner"></div>'];
}
