# Getting Started

## 1) Get the project

```bash
git clone <repository-url>
cd docethics
```

If you already have the files, cloning is optional.

## 2) Open the application

Open `docethics.html` in a modern web browser.

No install, bundler, or build pipeline is required.

## 3) Edit content

All textual content and section structure lives in:

- `data/cs.json`
- `data/en.json`
- `data/ua.json`

Start by editing one language file, refresh the page, and verify output.

## 4) Extend structure

You can safely:

- add top-level sections
- add sidebox entries under `subsections`
- update headings and paragraphs
- add markup inside paragraph strings

## 5) Customize visual style

- Global styling: `styles/main.css`
- Theme definitions: `js/skin-engine.js`

## 6) Optional exports

If your workflow uses export helpers, review `js/export-library.js`.

---

## Typical Use Cases

- teaching modules
- ethics frameworks
- research maps
- interactive essays
- public knowledge interfaces
