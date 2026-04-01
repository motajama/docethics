# Markup Engine

A custom lightweight markup language.

---

## Headings

```bash

# Heading
## Subheading

```

---

## Paragraphs

Each array item = one paragraph.

Manual break:

```bash
§
```

---

## Lists

```bash

- item
- item

1. first
2. second

```

---

## Emphasis

```bash

**bold**
*italic*

```

---

## Links

```bash

[text](https://example.com)

```

---

## Internal Links (sidebox)

```bash

$Label|target_id$

```

---

## Non-breaking space

```bash

word~word

```

Escape:

```bash

\~

```

---

## Example

```bash

"content": [
  "# Title",
  "Text with $link|id$",
  "- item 1\n- item 2"
]

```

---

## Design Philosophy

- readable in JSON
- minimal syntax
- predictable output
- safe rendering
