# Skin System

The UI is controlled via CSS variables.

---

## Concept

Each skin defines:

{
  '--bg': '#111',
  '--text': '#eee',
  '--accent': '#39ff14'
}

---

## Supported variables

- colors
- fonts
- links
- borders
- UI states

---

## Links

Skins define:

- --link
- --link-hover
- --link-visited
- --link-bg-hover

---

## Example

skinLibrary['msdos'] = {
  fontUrl: '...',
  vars: {
    '--bg': '#000',
    '--text': '#0f0',
    '--accent': '#39ff14'
  }
};

---

## How to apply

applySkin('msdos');

---

## Philosophy

- no CSS rewriting
- no frameworks
- full control via variables
