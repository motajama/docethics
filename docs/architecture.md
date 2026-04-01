# Architecture

---

## Overview

The system is composed of:

- JSON → data layer
- app.js → controller
- markup-engine.js → parser
- skin-engine.js → UI layer
- CSS → presentation

---

## Flow

1. Load JSON
2. Build sections
3. Apply markup
4. Attach events
5. Render UI

---

## Sideboxes

Triggered by:

$label|id$

Flow:

- click
- find subsection
- render sidebox
- scroll into view

---

## Sections

- accordion-based
- dynamic height calculation
- responsive layout

---

## Mobile behavior

- sidebox moves below content
- click outside closes it
- scroll to top on open

---

## Design principles

- no frameworks
- minimal JS
- readable structure
- separation of concerns
