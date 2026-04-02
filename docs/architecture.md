# Architecture

## High-level overview

The runtime is intentionally simple and split into clearly scoped modules:

- `data/*.json` → content model
- `js/app.js` → orchestration and UI behavior
- `js/markup-engine.js` → text parsing and HTML transformation
- `js/skin-engine.js` → runtime theming
- `js/ascii-chart.js` → text chart utility
- `styles/main.css` → presentation layer

---

## Runtime flow

1. Load selected language JSON.
2. Render top-level sections.
3. Parse markup in each content block.
4. Bind interaction handlers (accordion, sidebox, navigation).
5. Apply active skin variables.
6. Update responsive behavior based on viewport.

---

## Sidebox flow

Sideboxes are triggered by inline links in content:

```text
$Label|id$
```

Interaction sequence:

1. User clicks inline trigger.
2. App resolves `id` in `section.subsections`.
3. Sidebox HTML is rendered.
4. UI scrolls/focuses to keep context visible.

---

## Section behavior

- accordion-based expansion/collapse
- dynamic height calculations
- state-driven class updates
- responsive layout with mobile-specific adjustments

---

## Design principles

- no framework dependency
- predictable module boundaries
- readable data-first authoring
- separation of data, rendering, and presentation
