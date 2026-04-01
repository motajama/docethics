# JSON Structure

The entire application is driven by JSON.

---

## Root

{
  "meta": {},
  "sections": [],
  "info": {}
}

---

## Meta

"meta": {
  "title": "Title",
  "subtitle": "",
  "dir": "ltr"
}

---

## Sections

{
  "id": "section-id",
  "title": "Title",
  "short": "Short description",
  "content": ["Paragraph 1", "Paragraph 2"],
  "subsections": {}
}

---

## Subsections (sideboxes)

"subsections": {
  "example_id": {
    "title": "Title",
    "content": ["Paragraph"]
  }
}

---

## Info Block

"info": {
  "position": "start",
  "title": "Title",
  "content": ["Paragraph"]
}

### position options:

- "start" → before sections
- "end" → after sections

---

## Important rules

- content MUST be an array
- each item = one paragraph
- markup is processed inside each item
