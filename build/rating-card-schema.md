# Rating-card JSON schema (one file per candidate)

Write `data/rating-cards/<slug>.json` only. Do not invent quotes. Render what the Notion card scored.

Locked Decision 14 letters are applied later by the build — do **not** copy a card INTERNAL PROPOSE letter into `appliedLetter`.

```json
{
  "slug": "sandor",
  "name": "Jack Sandor",
  "office": "Council",
  "kind": "chal",
  "notionUrl": "https://app.notion.com/p/…",
  "notionTitle": "Jack Sandor · Council · chal",
  "platformUrl": "https://www.jacksandor.ca/platform",
  "platformLastmod": null,
  "retrieved": "2026-09-02",
  "cardScoredCount": 23,
  "cardRecordCount": 0,
  "doors": [
    {
      "id": "tax",
      "label": "Tax cap",
      "measure": "M66",
      "state": "dash",
      "sentence": null,
      "url": null,
      "date": null
    }
  ],
  "cells": [
    {
      "n": 1,
      "topic": 1,
      "topicName": "Housing that gets built",
      "measure": "M6",
      "what": "housing supply + composition",
      "kind": "scored",
      "mark": "Close",
      "value": 2.0,
      "quote": "The city should make it easier to build Missing Middle housing, so that nobody is forced to choose between living in Victoria and raising a family.",
      "url": "https://www.jacksandor.ca/housing",
      "source": "jacksandor.ca",
      "lastmod": null,
      "retrieved": "2026-09-02"
    }
  ]
}
```

## Rules

- Door `id` values in order: `tax`, `downtown`, `housing`, `bill`, `program`.
- Door `state` is exactly one of: `said`, `record`, `yes`, `dash`.
- Door sentence/url/date are null when state is `dash`.
- Cell `kind`:
  - `scored` only if the answer column is a real mark (Aligned / Close / Partial+ / Partial / Weak / Opposed) **and** there is a clickable http(s) URL **and** a date (lastmod and/or retrieved).
  - `record` if the answer is Record / 📋.
  - `dash` otherwise (including Mentions, empty, — , a mark with no URL+date).
- For `dash` cells: `mark` null, `value` null, `quote` null, `url` null. Do not copy the card’s explanatory “why this is a dash” prose.
- For `scored` / `record`: `quote` is the **verbatim quoted sentence** or the **named vote/decision in one line**. Strip the Q1×Q2 commentary after ` · `.
- `mark` labels: Aligned, Close, Partial+, Partial, Weak, Opposed, Record.
- `value`: 3, 2, 1.5, 1, 0.5, -1, or null for Record.
- `source` is the hostname without `www.` (e.g. `jacksandor.ca`).
- Parse dates from the date column. `retrieved 2026-09-02` → retrieved. `lastmod 17 Jul 2026` → lastmod as `2026-07-17` if parseable, else keep the original phrase.
- 55 cells, topic numbers 1–12 matching the template.
- `flags` (optional): card FLAG notes or `thin verbatim`. Render the cell as written. Do not fill a gap.
- Never include INTERNAL PROPOSE letters, working notes, or banned names.
- Dell dense card is `3cfe245ae5f381fba1a9e2b5e3856be6`. Do not substitute the thinner duplicate.
