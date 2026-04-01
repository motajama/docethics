# Ethical Compass Engine

An open, modular, and reusable frontend engine for building interactive ethical guides, learning maps, and structured knowledge interfaces.

Originally developed for a documentary ethics project, this engine provides a universal framework for presenting complex, multi-layered content in a structured, transparent, and accessible way.

---

## Purpose

This project is designed as a tool for:

- educators
- researchers
- artists
- students
- activists

It enables the creation of structured, interactive materials without relying on commercial platforms or opaque systems.

The focus is not only on presentation, but on thinking, orientation, and ethical reflection.

---

## Core Principles

- openness and transparency
- non-commercial knowledge sharing
- accessibility and clarity
- minimal dependencies
- full control over content and structure

---

## What This Project Is

This repository contains a modular frontend system composed of several independent but cooperating parts:

### Application Layer

- app.js  
  Handles rendering, navigation, interaction logic, sections, and sideboxes.

### Content Layer

- JSON files (cs.json, en.json, ua.json)  
  Define the entire structure and content of the application.

### Markup Engine

- markup-engine.js  
  A custom lightweight parser designed for structured academic and educational text.

### Skin System

- skin-engine.js  
  Provides theme switching via CSS variables.

### Visualization

- ascii-chart.js  
  Generates lightweight ASCII-based charts without dependencies.

### Styling

- main.css  
  A variable-driven design system supporting theming and responsiveness.

---

## Key Features

- SVG-based compass navigation
- Expandable accordion sections
- Dynamic sideboxes triggered by inline links
- JSON-driven content architecture
- Multilingual support
- Fully client-side (no backend required)
- Responsive and accessible UI

---

## Project Structure

/
├── docethics.html
├── app.js
├── markup-engine.js
├── skin-engine.js
├── ascii-chart.js
├── main.css
├── /data
│   ├── cs.json
│   ├── en.json
│   └── ua.json
└── /docs
    ├── index.md
    ├── getting-started.md
    ├── json-structure.md
    ├── markup.md
    ├── skins.md
    ├── ascii-charts.md
    └── architecture.md

---

## Documentation

Detailed documentation is available in the /docs directory.

Start here:

/docs/index.md

---

## Quick Start

1. Clone the repository  
2. Open docethics.html  
3. Edit /data/*.json  

No build step required.

---

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)  
https://creativecommons.org/licenses/by-nc/4.0/

---

## Author

Jan Motal
