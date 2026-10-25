---
id: tic-b925
status: closed
type: task
priority: 1
assignee: Philipp Brumm
tags:
    - architecture
created: 2026-10-25T19:41:43.835206Z
---
# Deepen GitHub page module

GitHub markup knowledge (selectors, classes, insertion point) is split across content.tsx, lib/github-layout.ts, waitForElement.ts; same selector duplicated. renderTako subscribes to store on every mount and never unsubscribes. Most recent churn (layout/mount/double-render fixes) lives here.

## Design

One module owns all GitHub selectors + mount() -> container, setWide(bool), restore(). content.tsx keeps only start gate (visibility, enabled, token) and message handling. Delete unused onElementRemoval.

## Acceptance Criteria

All GitHub selectors in one file; mount/restore idempotent; store subscription cleaned up on stop; tests against saved GitHub HTML fixture.

