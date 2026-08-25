# Microsoft Store Launch — Listing Content and Runbook

Everything needed to publish **Urdu English Bible** on the Microsoft Store.
The Windows app is a PWA hosted-web package wrapping https://urduenglishbible.wordonair.com/ (same site as the Play Store TWA).

The product name is reserved in Partner Center. Microsoft Store signs the package; you do not need a Windows code-signing certificate. Generate the `.msixbundle` in PWABuilder using the identity in section 0 (values must match **exactly**, including spaces).

---

## 0. Product identity (paste into PWABuilder)

Reserved product: **Urdu English Bible**. Store ID: `9PD8J39KRQTT`.

| Partner Center field | PWABuilder Windows field | Value |
|---|---|---|
| Package/Identity/Name | Package ID | `WordOnAirLabs.UrduEnglishBible` |
| Package/Identity/Publisher | Publisher ID | `CN=5144E98A-1B05-48A3-97EA-086D7DF840DF` |
| Package/Properties/PublisherDisplayName | Publisher display name | `WordOnAir Labs` |
| Package Family Name (PFN) | (info only) | `WordOnAirLabs.UrduEnglishBible_qqb79hr8arjg0` |

Do not change Package ID or Publisher ID. A mismatch causes Partner Center to reject the upload.

---

## 1. Store listing text (copy-paste into Partner Center)

**App name** (must match the reserved product name):

```
Urdu English Bible
```

**Short description** (keep under ~100 characters if the form is shorter):

```
Read the Bible in Urdu & English, verse by verse. Free, offline, no ads.
```

**Description:**

```
Read the Holy Bible in Urdu and English together, verse by verse — کتابِ مقدّس

Urdu English Bible pairs the Urdu Geo Version with the World English Bible (WEB) in a clean, Kindle-style reader. Every verse appears in Urdu (Nastaliq script, right-to-left) with its English translation directly below it, so you can read, compare, and study both languages at once.

FEATURES

• Complete Bible — all 66 books, Old and New Testament, in both languages
• Verse-by-verse parallel reading — Urdu above, English below
• Offline reading — download the full Bible once and read anywhere, no internet needed
• Kindle-style reader — page-turn navigation, adjustable font size, day / sepia / night themes, margins, justified text
• Daily Reading Plan — the Book of Common Prayer plan with progress tracking
• Highlights and Notebook — mark verses and keep notes, stored privately on your device
• Book names in both English and Urdu for easy navigation
• Completely free — no ads, no account, no data collection

ABOUT THE TRANSLATIONS

• Urdu Geo Version — a clear, modern Urdu translation of the Bible
• World English Bible (WEB) — a trusted, modern-English public domain translation

PRIVACY

This app collects no personal data. There is no sign-up, no tracking, and no ads. Your highlights, notes, and reading progress stay on your own device.

A project of WordOnAir Labs.
```

---

## 2. Graphics checklist

| Asset | Spec | Status |
|---|---|---|
| App / Store icon | Square PNG (512×512 exists) | Have (`icons/icon-512.png`, `store/icon-512.png`) |
| Desktop screenshots | 1–10 images, landscape PNG/JPG, typically **1366×768** or **1920×1080** | Capture on Windows (see below) |
| Phone / tablet shots | Portrait assets in `store/screenshots/` | Play Store assets; optional extra for other device families |

Capture **desktop landscape** shots from the live site in a browser window (or the sideload PWA): Library, Reader (John 1), Night theme (Psalm 23), Reading Plan, Aa settings.

Do **not** reuse only 9:16 phone screenshots for the Windows Store listing.

---

## 3. Partner Center form answers

| Form | Answer |
|---|---|
| Product type | **MSIX or PWA app** |
| Category | Books & reference (Education is an acceptable alternative) |
| Free or paid | Free |
| Contains ads / in-app products | No |
| Privacy policy URL | `https://urduenglishbible.wordonair.com/privacy.html` |
| App access | All functionality available without login |
| Data collected | **None.** Highlights, notes, and progress stay on-device |
| Age rating (IARC) | Reference / educational. No violence, sexuality, profanity, drugs, gambling, or user chat. Expected: Everyone / PEGI 3 |
| News / COVID-19 / government / financial / health | No / none |
| Markets | All markets, or prioritize Pakistan, India, US, UK, Canada, UAE, Saudi Arabia, Australia |
| Discoverability | Make this product available and discoverable in the Microsoft Store |
| Restricted capabilities (if warned) | *Needed for PWA Hosted App model, created by pwabuilder.com* |

Publisher display name is **WordOnAir Labs** (already set; see section 0).

---

## 4. Launch runbook (in order)

### A. Developer account (browser, one-time)

1. Use a **personal** Microsoft account (not work or school).
2. Start at [storedeveloper.microsoft.com](https://storedeveloper.microsoft.com/) so you get the current individual onboarding (free in most markets: government ID + selfie). Signing up only via older Partner Center / Visual Studio paths can still show a paid flow.
3. Finish profile setup and open Partner Center.

### B. Reserve the name and copy identity

**Done.** Name **Urdu English Bible** is reserved. Identity is in section 0.

### C. Package with PWA Builder (GitHub Actions)

4. Push the latest `main` (includes `windows/pwabuilder-package.json`).
5. GitHub **Actions** → **Windows - Build Store package** → **Run workflow**.
6. When it finishes, download the **windows-release** artifact. It contains:
    - `*.msixbundle` — modern Windows 10/11 (upload this)
    - `*.classic.appxbundle` — older Windows (upload this too)
    - `*.sideload.msix` — local testing only (**do not** upload; Partner Center rejects it)

The workflow POSTs identity from [windows/pwabuilder-package.json](../windows/pwabuilder-package.json) to PWABuilder’s hosted packager. If the run fails with HTTP 502, wait and re-run.

Optional: install the **sideload** package on your PC and check library, reader, offline download, reading plan, and highlights.

Manual fallback: [pwabuilder.com](https://www.pwabuilder.com) with the URL `https://urduenglishbible.wordonair.com/` and the fields in section 0.

### D. Submit in Partner Center

8. Open product **Urdu English Bible** (`9PD8J39KRQTT`) → **Start your submission**.
9. Fill pricing (free), markets, age rating, listing text from section 1, privacy URL, and desktop screenshots from section 2.
10. **Packages**: upload **both** the `.msixbundle` and the `.classic.appxbundle`.
11. If submission options warn about full trust / restricted capabilities, use the justification in section 3.
12. **Submit for certification**. Review is often 1–2 days; a first submission can take longer.

### E. Future updates

- Edit the site → push to `main` → GitHub Pages deploys → Store users get content/UI on next launch (hosted PWA; no new package).
- Re-package **only** when the [web app manifest](../manifest.json) changes (name, icons, start URL) or Partner Center needs a new Windows package version: bump `version` in [windows/pwabuilder-package.json](../windows/pwabuilder-package.json) (keep `classicPackage.version` lower; versions must be three segments and must not start with `0`), commit, re-run the Windows workflow.
- Never reuse a version that was already uploaded (even in a discarded draft).

---

## 5. Files involved

| File | Purpose |
|---|---|
| `manifest.json` | Web app manifest PWABuilder reads from the live site |
| `sw.js` | Service worker (required for a store-ready PWA) |
| `privacy.html` | Privacy policy URL for Partner Center |
| `icons/icon-512.png` | App icon |
| `store/screenshots/` | Play-oriented shots; also referenced in the web manifest |
| `windows/pwabuilder-package.json` | Package ID, publisher, versions for PWABuilder |
| `.github/workflows/build-windows.yml` | Builds the Store zip on demand |
| `docs/PLAY_STORE.md` | Android listing (same copy, different packaging) |

Do **not** commit generated `.msixbundle` / `.appxbundle` binaries to git.
