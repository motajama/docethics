# Markup Engine

The project includes a lightweight custom markup parser for text stored in JSON arrays.

## Headings

```text
# Heading
## Subheading
```

## Paragraphs and line breaks

Each item in a `content` array is treated as one logical block.

Manual line break marker:

```text
§
```

## Lists

```text
- bullet item
- bullet item

1. first
2. second
```

## Emphasis

```text
**bold**
*italic*
```

## External links

```text
[text](https://example.com)
```

## Internal sidebox links

```text
$Label|target_id$
```

- `Label` is rendered clickable text
- `target_id` must exist in `subsections`

## Non-breaking spaces

```text
word~word
```

Escape sequence:

```text
\~
```

---

## JSON Usage Example

```json
"content": [
  "# Title",
  "Paragraph with $More|details_box$",
  "- item 1\n- item 2"
]
```

---

## Design Goals

- readable inline notation in JSON
- deterministic output
- low syntax overhead
- safe rendering behavior
