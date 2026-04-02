# Ethical Compass Engine

A modular, frontend-only engine for building interactive ethical guides, learning maps, and structured knowledge interfaces.

Originally created for documentary ethics work, the project provides a transparent and reusable way to publish complex, layered content without backend services or proprietary platforms.

---

## Purpose

This project helps teams create public-facing knowledge interfaces for:

- education
- research
- cultural projects
- civic initiatives
- self-directed learning

The emphasis is not only on presentation, but also on orientation, reflection, and traceable structure.

---

## Core Principles

- Open and inspectable structure
- Non-commercial knowledge sharing
- Accessibility and readability
- Minimal dependencies
- Full editorial control over content

---

## Features

- SVG compass navigation
- Accordion sections with nested sideboxes
- Inline sidebox references (`$Label|target_id$`)
- JSON-driven multilingual content
- Runtime skin switching through CSS variables
- Lightweight ASCII chart rendering
- Fully client-side runtime (no build step, no backend)

---

## Repository Structure

```text
.
├── docethics.html
├── data/
│   ├── cs.json
│   ├── en.json
│   └── ua.json
├── docs/
│   ├── architecture.md
│   ├── ascii-charts.md
│   ├── getting-started.md
│   ├── index.md
│   ├── json-structure.md
│   ├── markup.md
│   └── skins.md
├── js/
│   ├── app.js
│   ├── ascii-chart.js
│   ├── export-library.js
│   ├── markup-engine.js
│   └── skin-engine.js
└── styles/
    └── main.css
```

---

## Quick Start

1. Clone or download the repository.
2. Open `docethics.html` in a browser.
3. Edit content in `data/*.json`.
4. Adjust visuals in `styles/main.css` and `js/skin-engine.js`.

---

## Documentation

See the documentation hub: [`docs/index.md`](./docs/index.md).

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)  
https://creativecommons.org/licenses/by-nc/4.0/

---

## Author

Jan Motal
