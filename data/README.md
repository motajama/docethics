# 📍 Ethical Compass Engine

An open, modular, and reusable frontend engine for building **interactive ethical guides, learning maps, and structured knowledge interfaces**.

Originally developed for a **documentary ethics compass**, this project provides a **universal framework** for presenting complex, multi-layered content in an accessible, interactive, and ethically-oriented way.

---

## 🌱 Project Philosophy

This project is grounded in:

- **Open-source values**
- **Non-commercial knowledge sharing**
- **Ethical design and accessibility**
- **Transparency of structure and meaning**

It is intended as a **tool for educators, researchers, artists, and activists**.

---

## 🧭 What This Project Is

This is not just a website, but a **modular content engine** composed of:

### Core Components

- **app.js** – application logic, rendering, navigation
- **markup-engine.js** – custom markup parser
- **skin-engine.js** – theming system
- **ascii-chart.js** – ASCII visualization engine
- **main.css** – design system

---

## 🧩 Key Features

- Interactive **compass navigation**
- Expandable **accordion sections**
- Dynamic **sideboxes**
- JSON-driven **content**
- Multilingual support
- Fully **client-side**

---

## 📦 Universal Core

The engine is content-agnostic and can be used for:

- education
- research
- artistic projects
- documentation systems
- ethical frameworks

---

# 📄 JSON Structure

```json
{
  "meta": {
    "title": "Title"
  },
  "sections": [],
  "info": {}
}
```

### Sections

```json
{
  "id": "id",
  "title": "Title",
  "short": "Short description",
  "content": ["Paragraph"],
  "subsections": {}
}
```

### Info Block

```json
"info": {
  "position": "start",
  "title": "Info",
  "content": ["Paragraph"]
}
```

---

# ✍️ Markup Engine

### Features

- `#` headings
- lists (`-`, `1.`)
- `**bold**`, `*italic*`
- links `[text](url)`
- internal links `$label|id$`
- non-breaking space `~`
- escape `\~`
- paragraph break `§`

---

## Example

```json
"content": [
  "# Heading",
  "Text with $link|id$",
  "- item 1\n- item 2"
]
```

---

# 🎨 Skin Engine

CSS variable-based system.

### Example

```js
{
  '--bg': '#000',
  '--text': '#fff',
  '--accent': '#39ff14'
}
```

Supports:

- colors
- typography
- links
- UI states

---

# 📊 ASCII Charts

```js
renderAsciiChart([1,2,3])
```

Renders simple text-based charts.

---

# 📱 UX & Accessibility

- keyboard navigation
- ARIA attributes
- responsive layout
- mobile sideboxes
- click-outside closing

---

# ⚙️ Usage

1. Clone repo
2. Open HTML file
3. Edit JSON
4. Customize skins / markup

---

# 📜 License

## Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)

You are free to:

- Share
- Adapt

Under conditions:

- Attribution required
- Non-commercial use only

https://creativecommons.org/licenses/by-nc/4.0/

---

# 🤝 Contribution

Welcome:

- new skins
- accessibility improvements
- markup extensions

---

# 🧠 Author

Jan Motal
