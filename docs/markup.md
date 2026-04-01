# Markup Engine

A custom lightweight markup language.

---

## Headings

# Heading
## Subheading

---

## Paragraphs

Each array item = one paragraph.

Manual break:

§

---

## Lists

- item
- item

1. first
2. second

---

## Emphasis

**bold**
*italic*

---

## Links

[text](https://example.com)

---

## Internal Links (sidebox)

$Label|target_id$

---

## Non-breaking space

word~word

Escape:

\~

---

## Example

"content": [
  "# Title",
  "Text with $link|id$",
  "- item 1\n- item 2"
]

---

## Design Philosophy

- readable in JSON
- minimal syntax
- predictable output
- safe rendering
