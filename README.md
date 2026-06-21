# NYU Guest Registration — Modern Front-End Portal

An academically rigorous, high-productivity front-end wrapper for the NYU Visitor Registration system powered by **IDENTIGY CSGoldWeb** (`https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php`). 

This project aims to substitute the substandard, high-friction default user interface with a modern, responsive, and ergonomic dashboard featuring advanced productivity tools:
* **Intellectual Autocomplete Suggestion Engine**: Caches guest identities locally inside the browser (`localStorage`) to autocomplete fields dynamically and eliminate redundant keyboard inputs.
* **Quick Duplicator Chip Dock**: Offers one-click replication of frequently registered visitors.
* **High-Productivity Bulk Registration Parser**: Allows batch registration of arbitrary user lists directly copy-pasted from tools (e.g., Outlook, Gmail, Excel) using standard formats (e.g. `First Last <email@domain.com>`), completely bypassing tedious CSV download/edit/upload workflows.
* **Sleek Premium Design Language**: Built with rich HSL theme tokens, glassmorphic backdrop-filters, custom micro-animations, and fluid transitions tailored to a native Dark/Light appearance.

---

## 1. System Architecture & File Structure

The project resides in a dedicated git worktree, containing the following files:

* [index.html](file:///Users/kyunghyuncho/Repos/nyu-guest-registration-modern/index.html): The standalone static mockup representation of the guest dashboard, featuring forms, bulk inputs, and visitor list containers.
* [style.css](file:///Users/kyunghyuncho/Repos/nyu-guest-registration-modern/style.css): Custom CSS framework utilizing modern variables, responsive layout grids, and animations.
* [app.js](file:///Users/kyunghyuncho/Repos/nyu-guest-registration-modern/app.js): Application logic handling event bindings, bulk parses, autocomplete history, and local mock database bindings for development.
* [userscript.js](file:///Users/kyunghyuncho/Repos/nyu-guest-registration-modern/userscript.js): The unified wrapper compiled for browser extension managers (e.g., Tampermonkey, Violentmonkey). It bundles the HTML, CSS, and JS logic to execute directly in the domain context, bypassing CORS restrictions.

---

## 2. API Contract Specification

Through reverse-engineering the IDENTIGY backend, the following critical communication nodes were discovered and mapped:

### A. Building Metadata Query
* **URL**: `POST /common/local_vm_data.php`
* **Content-Type**: `application/json`
* **JSON Payload**:
  ```json
  {
    "__sesstok": "<CSRF_TOKEN>",
    "action": "getBuildingList",
    "pid": "<PATRON_ID>",
    "iug": "0",
    "pageID": "-1"
  }
  ```
* **Response**: Returns a JSON array containing building records with an internal ID and dynamic `PAGEID` parameter:
  ```json
  [
    {
      "BUILDING_ID": "28",
      "BUILDING_NAME": "60 5th Ave",
      "ADDRESS_SIMPLE": "60 5th Ave",
      "PAGEID": "Jcc7bRea8eN4861Y"
    }
  ]
  ```

### B. Visitor Preregistration
* **URL**: `POST /patron/VisitorManagement/visitorshost_save.php`
* **Content-Type**: `application/x-www-form-urlencoded; charset=UTF-8`
* **Headers**: `X-Requested-With: XMLHttpRequest`
* **Payload Fields**:
  - `action`: `Register`
  - `__sesstok`: Global security session token.
  - `first` / `last`: Visitor's names.
  - `local_cdEmail`: Visitor's email.
  - `local_VisitorType`: `Visitor` or `Vendor`.
  - `buildingID1` / `buildingName1`: Selected building ID and name.
  - `pageID[]`: Dynamic page ID matching the selected building (e.g. `PAGEID` field in building query).
  - `entryDate` / `exitDate`: Timestamps formatted strictly as `YYYYMMDDHH24MISS` (e.g. `20260621090000`).
  - `client_tz`: Browser timezone offset in hours.

---

## 3. How to Use the Tampermonkey Wrapper

To overlay the modern front-end onto the NYU guest portal, follow these steps:

1. **Install Browser Extension**: Ensure you have [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) installed in Google Chrome.
2. **Create New Script**: Open the extension dashboard, click **"Create a new script..."** (or "+").
3. **Copy Compiled Script**: Paste the entire contents of the file [userscript.js](file:///Users/kyunghyuncho/Repos/nyu-guest-registration-modern/userscript.js) into the editor.
4. **Save**: Press `Ctrl+S` (or `Cmd+S` on macOS) to save the script.
5. **Log In to NYU**: Navigate to [NYU Visitors Host Portal](https://nyu.identigy.io/patron/VisitorManagement/VisitorsHost.php).
6. **Execution**: Complete your Multi-Factor Authentication (MFA/Duo). Once logged in, the UserScript will automatically hide the old form layout and inject this beautiful, high-efficiency dashboard interface.

---

## 4. Local Testing & Development

You can run the dashboard interface locally to test the design and client-side logic without sending real API requests.

1. Open `index.html` directly in your Chrome browser (or spin up a lightweight HTTP server).
2. The code in `app.js` will automatically detect a non-live environment and switch to **Mock Mode**.
3. In Mock Mode:
   - Autocomplete will query a static list of NYU buildings (e.g., Center for Data Science, Bobst Library, Courant Institute).
   - Registrations, checkouts, and deletions will be simulated and stored in your browser's `localStorage` so the UI remains interactive and stateful across refreshes.