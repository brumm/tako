---
id: tic-15a0
status: open
type: task
priority: 3
assignee: Philipp Brumm
tags:
  - architecture
created: 2026-10-25T19:41:43.899534Z
---

# Preview as single resolved query

What a file previews as is smeared across Preview.tsx render branches, two extension parsers (getFileType, TextPreview), useRawFile, useHighlightedFile.

## Design

usePreview(file) -> image{src} | empty | markdown{html} | code{html, lines} | unknown. Preview.tsx only switches on result.

## Acceptance Criteria

One extension parser; preview kinds testable without rendering.
