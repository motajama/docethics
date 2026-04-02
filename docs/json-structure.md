# JSON Structure

The application is fully data-driven. A language file is a single JSON document with three primary blocks:

```json
{
  "meta": {},
  "sections": [],
  "info": {}
}
```

---

## `meta`

Defines document-level settings.

```json
"meta": {
  "title": "Main title",
  "subtitle": "Optional subtitle",
  "dir": "ltr"
}
```

- `title` (string, required)
- `subtitle` (string, optional)
- `dir` (`"ltr"` or `"rtl"`, required for correct layout direction)

---

## `sections`

An ordered array of primary content blocks.

```json
{
  "id": "section-id",
  "title": "Section title",
  "short": "Short description",
  "content": ["Paragraph 1", "Paragraph 2"],
  "subsections": {}
}
```

Field notes:

- `id`: unique stable identifier used by navigation and linking
- `title`: visible section heading
- `short`: short label/preview text
- `content`: **must be an array of strings**
- `subsections`: dictionary of sidebox entries keyed by ID

---

## `subsections` (sideboxes)

Inline links in content (`$Label|target_id$`) open entries from this object.

```json
"subsections": {
  "target_id": {
    "title": "Sidebox title",
    "content": ["Paragraph"]
  }
}
```

Rules:

- key (`target_id`) must match link target in content
- each `content` value is an array of paragraph strings

---

## `info`

Optional informational block displayed before or after sections.

```json
"info": {
  "position": "start",
  "title": "Info title",
  "content": ["Paragraph"]
}
```

`position` options:

- `start` → render before section list
- `end` → render after section list

---

## Validation Checklist

- `content` fields are arrays, not plain strings
- section IDs are unique
- sidebox target IDs exist
- JSON is valid UTF-8 and syntactically correct
