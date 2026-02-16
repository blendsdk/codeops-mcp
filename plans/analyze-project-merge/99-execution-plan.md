# Execution Plan: Analyze Project Merge/Augment

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: 2026-02-16
> **Progress**: 0/12 tasks (0%)

## Overview

Implement smart merge behavior for the `analyze_project` tool so it never overwrites an existing `.clinerules/project.md`. Instead, it reads the existing file, compares with a fresh scan, and returns a merged document preserving user customizations.

**🚨 Update this document after EACH completed task!**

---

## Implementation Phases

| Phase | Title                          | Sessions | Est. Time |
| ----- | ------------------------------ | -------- | --------- |
| 1     | Types & Section Parser         | 1        | 45 min    |
| 2     | Merge Engine                   | 1        | 60 min    |
| 3     | Entry Point & Tool Description | 1        | 20 min    |
| 4     | Tests                          | 1        | 60 min    |

**Total: 1-2 sessions, ~3 hours**

---

## Phase 1: Types & Section Parser

### Session 1.1: Add Types and Parsing Functions

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.
- Split large files into smaller, logically grouped files.
- Max AI output: 60K tokens. Max AI input: 200K tokens.

**Reference**: [Merge Engine Spec](03-merge-engine.md)
**Objective**: Define new types and implement section parser + classifier

**Tasks**:

| #     | Task                                                     | File                          |
| ----- | -------------------------------------------------------- | ----------------------------- |
| 1.1.1 | Add `ParsedSection`, `SectionMergeStrategy`, `MergeChange` types | `src/types/index.ts`          |
| 1.1.2 | Implement `parseProjectMdSections()` function            | `src/tools/analyze-project.ts` |
| 1.1.3 | Implement `classifySection()` with section classification constants | `src/tools/analyze-project.ts` |

**Deliverables**:
- [ ] New types exported from `src/types/index.ts`
- [ ] `parseProjectMdSections` correctly splits markdown into sections
- [ ] `classifySection` correctly classifies all known section headers
- [ ] All verification passing

**Verify**: `clear && yarn build && yarn test`

---

## Phase 2: Merge Engine

### Session 2.1: Implement Merge Logic

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.
- Split large files into smaller, logically grouped files.
- Max AI output: 60K tokens. Max AI input: 200K tokens.

**Reference**: [Merge Engine Spec](03-merge-engine.md)
**Objective**: Implement the core merge engine and supporting functions

**Tasks**:

| #     | Task                                                     | File                          |
| ----- | -------------------------------------------------------- | ----------------------------- |
| 2.1.1 | Implement `readExistingProjectMd()` function             | `src/tools/analyze-project.ts` |
| 2.1.2 | Implement `generateFreshSection()` — extracts individual auto-update sections from fresh analysis | `src/tools/analyze-project.ts` |
| 2.1.3 | Implement `mergeAutoUpdateSection()` — line-level merge for auto-update sections, preserving user edits | `src/tools/analyze-project.ts` |
| 2.1.4 | Implement `mergeProjectMd()` — orchestrates full merge across all sections | `src/tools/analyze-project.ts` |
| 2.1.5 | Implement `formatChangeLog()` — generates change log header | `src/tools/analyze-project.ts` |

**Deliverables**:
- [ ] `readExistingProjectMd` reads existing file or returns null
- [ ] `mergeProjectMd` correctly merges existing + fresh analysis
- [ ] Change log accurately reflects detected changes
- [ ] User-customized sections preserved verbatim
- [ ] Auto-update sections refreshed with fresh data
- [ ] All verification passing

**Verify**: `clear && yarn build && yarn test`

---

## Phase 3: Entry Point & Tool Description

### Session 3.1: Wire Up and Update Descriptions

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.

**Reference**: [Merge Engine Spec](03-merge-engine.md)
**Objective**: Modify the entry point to use merge path and update tool description

**Tasks**:

| #     | Task                                                     | File                          |
| ----- | -------------------------------------------------------- | ----------------------------- |
| 3.1.1 | Modify `analyzeProject()` entry point to check for existing file and branch to merge or fresh path | `src/tools/analyze-project.ts` |
| 3.1.2 | Update `analyze_project` tool description in MCP server to reflect merge behavior | `src/index.ts` |

**Deliverables**:
- [ ] `analyzeProject` uses merge path when existing file found
- [ ] `analyzeProject` uses fresh path when no existing file (unchanged behavior)
- [ ] Tool description updated
- [ ] All verification passing

**Verify**: `clear && yarn build && yarn test`

---

## Phase 4: Tests

### Session 4.1: Unit and Integration Tests

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.

**Reference**: [Testing Strategy](07-testing-strategy.md)
**Objective**: Comprehensive test coverage for all new merge functionality

**Tasks**:

| #     | Task                                                     | File                                              |
| ----- | -------------------------------------------------------- | ------------------------------------------------- |
| 4.1.1 | Create test file with fixtures (string constants for various project.md variants) | `src/__tests__/tools/analyze-project-merge.test.ts` |
| 4.1.2 | Add unit tests for `parseProjectMdSections` and `classifySection` | `src/__tests__/tools/analyze-project-merge.test.ts` |
| 4.1.3 | Add integration tests for merge workflow (preserve, update, change log, edge cases) | `src/__tests__/tools/analyze-project-merge.test.ts` |
| 4.1.4 | Verify all existing tests still pass (regression check)  | Run `yarn test`                                   |

**Deliverables**:
- [ ] Test fixtures defined for all scenarios
- [ ] Unit tests for parser and classifier
- [ ] Integration tests for full merge workflow
- [ ] All existing tests pass (no regressions)
- [ ] `yarn build && yarn test` fully green

**Verify**: `clear && yarn build && yarn test`

---

## Task Checklist (All Phases)

### Phase 1: Types & Section Parser
- [ ] 1.1.1 Add `ParsedSection`, `SectionMergeStrategy`, `MergeChange` types to `src/types/index.ts`
- [ ] 1.1.2 Implement `parseProjectMdSections()` in `src/tools/analyze-project.ts`
- [ ] 1.1.3 Implement `classifySection()` with section classification constants

### Phase 2: Merge Engine
- [ ] 2.1.1 Implement `readExistingProjectMd()` function
- [ ] 2.1.2 Implement `generateFreshSection()` for individual auto-update sections
- [ ] 2.1.3 Implement `mergeAutoUpdateSection()` for line-level merge
- [ ] 2.1.4 Implement `mergeProjectMd()` orchestrator
- [ ] 2.1.5 Implement `formatChangeLog()`

### Phase 3: Entry Point & Tool Description
- [ ] 3.1.1 Modify `analyzeProject()` to branch merge/fresh
- [ ] 3.1.2 Update tool description in `src/index.ts`

### Phase 4: Tests
- [ ] 4.1.1 Create test file with fixtures
- [ ] 4.1.2 Unit tests for parser and classifier
- [ ] 4.1.3 Integration tests for merge workflow
- [ ] 4.1.4 Regression check — all existing tests pass

---

## Session Protocol

### Starting a Session

1. Reference this plan: "Implement Phase X, Session X.X per `plans/analyze-project-merge/99-execution-plan.md`"

### Ending a Session

1. Run the project's verify command: `clear && yarn build && yarn test`
2. If verification passes, commit using the `gitcmp` protocol (see `git-commands.md`)
3. Compact the conversation with `/compact`

### Between Sessions

1. Review completed tasks in this checklist
2. Mark completed items with [x]
3. Start new conversation for next session
4. Run `exec_plan analyze-project-merge` to continue

---

## Dependencies

```
Phase 1 (Types & Parser)
    ↓
Phase 2 (Merge Engine)
    ↓
Phase 3 (Entry Point & Wiring)
    ↓
Phase 4 (Tests)
```

---

## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ All verification passing (`clear && yarn build && yarn test`)
3. ✅ No warnings/errors
4. ✅ Documentation updated (plan documents)
5. ✅ Code reviewed (if applicable)
6. ✅ **Post-completion:** Ask user to re-analyze project and update `.clinerules/project.md`
