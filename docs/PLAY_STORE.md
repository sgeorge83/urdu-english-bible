# Play Store Launch — Listing Content and Runbook

Everything needed to publish the app as **com.wordonair.urduenglishbible** on Google Play.
The Android app is a Trusted Web Activity (TWA) wrapping https://urduenglishbible.wordonair.com/.

---

## 1. Store listing text (copy-paste into Play Console)

**App name** (max 30 characters):

```
Urdu English Bible
```

**Short description** (max 80 characters):

```
Read the Bible in Urdu & English, verse by verse. Free, offline, no ads.
```

**Full description** (max 4000 characters):

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
| App icon | 512 x 512 PNG, max 1 MB | Have (`icons/icon-512.png`) |
| Feature graphic | 1024 x 500 PNG/JPG | Draft generated — crop/resize to exactly 1024x500 before upload |
| Phone screenshots | 2-8 images, PNG/JPG, 9:16 portrait recommended (e.g. 1080x1920) | Capture from the live site or your phone |
| Tablet screenshots (7" and 10") | Optional but recommended | Optional |

Screenshot ideas: Library (bilingual book list), Reader (Urdu + English verses), Reading Plan dashboard, Night theme, Aa settings sheet.

---

## 3. Play Console form answers

| Form | Answer |
|---|---|
| App category | Books & Reference |
| Free or paid | Free |
| Contains ads | No |
| Privacy policy URL | `https://urduenglishbible.wordonair.com/privacy.html` |
| App access | All functionality available without special access (no login) |
| Data safety | **No data collected, no data shared.** All user data (highlights, notes, progress) is stored on-device only. |
| Content rating questionnaire | Category: Reference/News/Educational. No violence, sexuality, profanity, drugs, gambling, or user interaction. Expected rating: Everyone / PEGI 3 |
| Target audience | 13 and over (avoids the stricter Families policy; the app has no child-directed content claims) |
| News app | No |
| COVID-19 apps | No |
| Government app | No |
| Financial features | None |
| Health apps | No |
| Countries | All countries (or prioritize: Pakistan, India, US, UK, Canada, UAE, Saudi Arabia, Australia) |

---

## 4. Launch runbook (in order)

### A. One-time setup (browser only, ~15 minutes)

1. **Add repo secrets** — GitHub repo → Settings → Secrets and variables → Actions:
   - `KEYSTORE_PASSWORD` — invent a long password, save it in a password manager
   - `KEY_PASSWORD` — invent a second password, save it too
   - If these passwords are ever lost the upload key can still be reset via Play App Signing, but don't lose them.
2. **Generate the signing key** — Actions tab → "Android - Generate signing keystore (run once)" → Run workflow.
   - It commits an *encrypted* keystore to `android/android.keystore.gpg` (safe in the public repo).
   - Open the run's **Summary** and copy the **SHA-256 fingerprint**.
3. **Update assetlinks** — edit `.well-known/assetlinks.json` (GitHub web editor is fine): replace
   `REPLACE_WITH_UPLOAD_KEY_SHA256_FROM_KEYSTORE_WORKFLOW` with the fingerprint from step 2. Commit — Pages redeploys automatically.
   - Verify it's live: https://urduenglishbible.wordonair.com/.well-known/assetlinks.json

### B. Build the app (browser only, ~10 minutes)

4. Actions tab → "Android - Build signed AAB" → Run workflow.
5. When it finishes, download the **android-release** artifact (contains `app-release-bundle.aab`).

### C. Play Console (after Google verifies your developer account)

6. **Create app** — name "Urdu English Bible", default language English (US), App, Free.
7. **Complete "Set up your app"** — paste the answers from section 3 above and the listing text from section 1; upload icon, feature graphic, screenshots.
8. **Internal testing** (optional, instant) — upload the AAB, add your own Gmail as tester, install on your phone, verify: fullscreen (no browser bar — needs step 10 first), offline download, reading plan, highlights.
9. **Closed testing** (mandatory for new personal accounts) — create a closed track, upload the AAB, add 15-16 testers' emails (need ≥12 opted-in continuously for **14 days**). Share the opt-in link with testers.
10. **Add Google's signing fingerprint** — Play Console → Test and release → App integrity → App signing → copy the **SHA-256** of the *app signing key certificate* → paste it as the second entry in `.well-known/assetlinks.json` (replacing the PLAY placeholder). Commit. Without this, the published app shows a browser address bar.
11. **Run the 14-day closed test** — testers must stay opted in for 14 consecutive days. Ask them to actually open the app a few times.
12. **Apply for production access** — Play Console prompts a short questionnaire about your testing.
13. **Production release** — promote the build to Production, select countries, submit for review (up to ~7 days). Launch.

### D. Future updates

- Edit the site → push → Pages deploys → users get the update automatically (it's a TWA; no new APK needed for content/UI changes).
- Only rebuild and re-upload the AAB when changing app-level things (icon, name, colors, TWA behavior): bump `appVersionCode` and `appVersionName` in `twa-manifest.json`, run the build workflow, upload the new AAB.

---

## 5. Files involved

| File | Purpose |
|---|---|
| `twa-manifest.json` | Bubblewrap/TWA config — app ID, name, colors, version |
| `.github/workflows/android-keystore.yml` | One-time signing key generation (encrypted, committed) |
| `.github/workflows/build-android.yml` | Builds the signed AAB on demand |
| `.well-known/assetlinks.json` | Proves domain ownership; removes the browser bar |
| `privacy.html` | Privacy policy (required by Play) |
| `android/android.keystore.gpg` | Encrypted signing keystore (created by the keystore workflow) |
