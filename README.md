# NYU Guest Registration (Modern UI)

A browser userscript that replaces the default [NYU Visitor Host portal](https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php) with a cleaner interface for preregistering guests. It runs entirely in your browser and talks to the same NYU/IDENTIGY backend as the official page.

**Features:** single-guest and bulk registration, building autocomplete, guest history, custom calendar date pickers, visitor list sync, dark/light theme.

---

## Install (recommended for most users)

You need **Google Chrome** (or another Chromium browser) and a userscript manager. [Tampermonkey](https://www.tampermonkey.net/) is the most common choice.

### Step 1 — Install Tampermonkey

1. Open the [Tampermonkey page in the Chrome Web Store](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo).
2. Click **Add to Chrome** and confirm.

### Step 2 — Install this userscript

**Option A — One-click (easiest)**  
With Tampermonkey enabled, open this link:

**[Install NYU Guest Registration v1.0](https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js)**

Tampermonkey should show an installation prompt. Click **Install**.

**Option B — Install from URL**  
1. Click the Tampermonkey icon in Chrome → **Dashboard**.  
2. Open the **Utilities** tab.  
3. Under **Install from URL**, paste:

   `https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js`

4. Click **Install**.

**Option C — Manual copy**  
1. Open [`NYU-Modern-Guest-Registration.user.js`](NYU-Modern-Guest-Registration.user.js) in this repository.  
2. Copy the entire file.  
3. Tampermonkey → **Dashboard** → **+** (Create new script).  
4. Paste, then **File → Save** (or `Cmd+S` / `Ctrl+S`).

### Step 3 — Use it

1. Go to the [NYU Visitors Host portal](https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php).  
2. Log in with your NYU credentials (including Duo MFA).  
3. The modern dashboard appears automatically over the legacy page.

Tampermonkey will check for updates automatically when you install from the GitHub URL (via `@updateURL` in the script header).

### Alternative: Violentmonkey

[Violentmonkey](https://violentmonkey.github.io/) works the same way: install the extension, then open the [install link](https://github.com/kyunghyuncho/nyu-guest-registration/raw/main/NYU-Modern-Guest-Registration.user.js).

---

## What gets installed?

| File | Purpose |
|------|---------|
| `NYU-Modern-Guest-Registration.user.js` | **Install this** in Tampermonkey |
| `userscript.js` | Identical build output (alternate filename) |
| `index.html`, `app.js`, `style.css` | Source for local UI testing |
| `scripts/build-userscript.mjs` | Rebuilds the userscript after source edits |

---

## Local development (optional)

To preview the UI without logging into NYU:

```bash
open index.html
```

Mock mode uses sample buildings and stores test registrations in your browser’s `localStorage`.

After editing `index.html`, `style.css`, or `app.js`, rebuild the userscript:

```bash
node scripts/build-userscript.mjs
```

---

## Bulk registration formats

Paste one guest per line, for example:

```
Jane Doe, jane@example.com
Bob Smith <bob@gmail.com>
Alice, Wonder, alice@company.com
```

---

## License

MIT — see [LICENSE](LICENSE).
