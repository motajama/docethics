# Skin System

The UI theme layer is controlled by CSS custom properties (variables) applied at runtime.

## Skin concept

A skin definition contains:

- optional font metadata
- a `vars` object with CSS variable assignments

Example:

```js
skinLibrary['msdos'] = {
  fontUrl: '...',
  vars: {
    '--bg': '#000',
    '--text': '#0f0',
    '--accent': '#39ff14'
  }
};
```

---

## Common variable groups

- surface/background colors
- text colors
- accent and UI states
- borders and separators
- link states
- typography controls

Link-related variables often include:

- `--link`
- `--link-hover`
- `--link-visited`
- `--link-bg-hover`

---

## Applying a skin

```js
applySkin('msdos');
```

If creating a new skin, keep contrast and readability in mind for both desktop and mobile.

---

## Design approach

- no CSS recompilation
- no framework lock-in
- complete control through variable mapping
