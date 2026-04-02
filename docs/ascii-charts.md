# ASCII Charts

The engine includes a minimal text-based chart renderer for lightweight visual summaries.

## Basic usage

```js
renderAsciiChart([3, 5, 2, 8]);
```

## Typical output shape

```text
█
███
█████
```

(Exact output depends on scaling and input values.)

## Styling

Use monospace output to preserve alignment:

```css
pre.ascii-chart {
  font-family: monospace;
}
```

---

## Why ASCII charts

- zero dependencies
- fast rendering
- portable across environments
- useful in low-graphics contexts
- visually consistent with retro/terminal themes

## Good use cases

- quick comparisons
- instructional materials
- compact inline analytics
- logging and diagnostic views
