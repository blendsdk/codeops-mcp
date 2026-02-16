# Analyze Project Merge/Augment Implementation Plan

> **Feature**: Smart merge for `analyze_project` — never overwrite existing `project.md`
> **Status**: Planning Complete
> **Created**: 2026-02-16

## Overview

Currently, the `analyze_project` tool always generates a brand-new `project.md` from scratch. If a user has already customized their `.clinerules/project.md` (filled in `[TODO]` placeholders, added special rules, coding conventions, etc.), running `analyze_project` again produces output that, when saved, overwrites all those manual edits.

This feature changes the behavior so that when an existing `.clinerules/project.md` is found, the tool reads it, compares it with a fresh project scan, and returns a **merged document** that preserves user customizations while updating auto-detectable fields. A change log at the top summarizes what was updated.

When no existing `project.md` is found, the current fresh-generation behavior is preserved unchanged.

## Document Index

| #   | Document                                                  | Description                                  |
| --- | --------------------------------------------------------- | -------------------------------------------- |
| 00  | [Index](00-index.md)                                      | This document — overview and navigation      |
| 01  | [Requirements](01-requirements.md)                        | Feature requirements and scope               |
| 02  | [Current State](02-current-state.md)                      | Analysis of current implementation           |
| 03  | [Merge Engine](03-merge-engine.md)                        | Technical spec for the merge/augment logic   |
| 07  | [Testing Strategy](07-testing-strategy.md)                | Test cases and verification                  |
| 99  | [Execution Plan](99-execution-plan.md)                    | Phases, sessions, and task checklist         |

## Quick Reference

### Usage (no change to API)

```typescript
// Same call — behavior changes based on whether project.md exists
analyzeProject({ projectPath: '/path/to/project' });
```

### Key Decisions

| Decision                              | Outcome                                                    |
| ------------------------------------- | ---------------------------------------------------------- |
| Section-based merge vs full rewrite   | Section-based merge — preserves user-edited sections       |
| How to detect user edits              | Compare against auto-generated patterns + `[TODO]` markers |
| Where to show changes                 | Change log header at top of merged output                  |
| Merge granularity                     | Line-level within auto-update sections, section-level for preserved sections |

## Related Files

| File                             | Action    |
| -------------------------------- | --------- |
| `src/tools/analyze-project.ts`   | Modified  |
| `src/types/index.ts`             | Modified  |
| `src/index.ts`                   | Modified  |
| `src/__tests__/tools/analyze-project-merge.test.ts` | Created |
