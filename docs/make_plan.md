# Implementation Plan Creation & Execution

## **TRIGGER KEYWORD: `make_plan`**

When the user types "make_plan", execute the comprehensive workflow below to create a detailed, multi-document implementation plan for any software development feature or task.

## **TRIGGER KEYWORD: `exec_plan [feature-name] [--ask-commit | --no-commit | --auto-commit]`**

When the user types "exec_plan [feature-name]", execute the implementation plan at `plans/[feature-name]/99-execution-plan.md`.

**Commit mode flags** (optional — see "Commit Behavior During Plan Execution" section for full details):

| Flag | Behavior |
|------|----------|
| *(no flag)* / `--ask-commit` | **Default.** Ask the user after each verified task whether to commit. |
| `--no-commit` | Never commit, never ask. Pure implementation only. |
| `--auto-commit` | Automatically commit and push after each verified task. |

---

## **Project-Specific Configuration**

This file contains **universal rules** that work for any software project. For project-specific settings, read `.clinerules/project.md` which defines:

- Build, test, and verify commands
- Package manager and toolchain
- Project structure (monorepo vs single-repo)
- Language and framework conventions
- Commit scope conventions

**If `.clinerules/project.md` does not exist**, detect project settings from manifest files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `docker-compose.yml`, etc.) and use sensible defaults.

---

## **🚨 CRITICAL: No Raw Git Commands in Plans 🚨**

Generated plans must **never** contain raw git commands. All git operations must reference the `gitcm` or `gitcmp` protocol from `git-commands.md`. Plan documents must not include `git add`, `git commit`, `git push`, or any `bash` code blocks containing git commands. The `-m` flag is **BANNED** — see `git-commands.md` for the full protocol and rationale.

---

## **🚨 CRITICAL: Script-First Execution During Plan Execution 🚨**

During plan execution, any ad-hoc commands, tests, validation scripts, or debugging must use **script files** — never inline command-line scripts. See `agents.md` — Script-First Execution rule (Rule 8) and No Complex Command Chaining rule (Rule 12) for the full policy, naming conventions, and cleanup protocol.

---

## **🚨 CRITICAL: Commit Behavior During Plan Execution 🚨**

**By default, the agent NEVER automatically commits or pushes code.** The user must always have the opportunity to review changes before they are committed to the git repository.

### Commit Modes

The `exec_plan` command supports three commit modes:

| Mode | Flag | Behavior |
|------|------|----------|
| **Ask (default)** | *(no flag)* or `--ask-commit` | After each verified task, present the user with commit options via `ask_followup_question`. The user chooses what to do. |
| **No-commit** | `--no-commit` | Never commit, never ask. Pure implementation only. The user handles all git operations themselves. |
| **Auto-commit** | `--auto-commit` | Automatically commit and push via `gitcmp` after each verified task. No prompts. (Previous default behavior.) |

### Ask-Commit Mode (Default) — Prompt Protocol

After each task completes and verification passes, the agent **MUST** use `ask_followup_question` with the following selectable options:

**Prompt:**
> *"Task X.X.X complete, verification passing. How would you like to proceed?"*

**Options (provided via `ask_followup_question`):**

1. **"Commit and push"** — Commit and push via `gitcmp` protocol, then continue to next task
2. **"Commit only (no push)"** — Commit via `gitcm` protocol, then continue to next task
3. **"Skip, continue to next task"** — No commit, continue implementing. Ask again after the next task.
4. **"Skip all, commit at the end"** — No commit, **stop asking** for the remainder of the plan. At plan completion, present the final commit prompt (see below).

If the user selects option 4, the agent remembers this preference and does not prompt again until the plan is fully complete.

### End-of-Plan Commit Reminder

When all tasks are complete and there are uncommitted changes, the agent **MUST** present a final commit prompt using `ask_followup_question`:

**Prompt:**
> *"All tasks complete. You have uncommitted changes. How would you like to proceed?"*

**Options:**

1. **"Commit and push"** — Commit and push all changes via `gitcmp`
2. **"Commit only (no push)"** — Commit all changes via `gitcm`
3. **"Don't commit"** — Leave changes uncommitted. User will handle git manually.

### No-Commit Mode

When `--no-commit` is specified:

- ✅ Agent implements tasks, runs verification, updates the execution plan — everything as normal
- ✅ No git operations whatsoever (no staging, no commits, no pushes)
- ✅ No prompts asking about commits
- ✅ Session summaries note `Commit mode: no-commit — no commits made`
- ✅ At plan completion, a single informational note: *"Plan complete. Commit mode was no-commit — changes are uncommitted."*

### Auto-Commit Mode

When `--auto-commit` is specified:

- ✅ After each verified task, automatically commit and push via `gitcmp` protocol
- ✅ No prompts — fully automated
- ✅ This was the previous default behavior
- ✅ Follow the commit message format defined in the "Commit Protocol" section below

### Context Window at 90% — Commit Behavior

When context reaches 90% and the agent needs to wrap up and `/compact`:

| Commit Mode | Behavior at 90% Context |
|-------------|------------------------|
| **Ask (default)** | Present the commit prompt with options before `/compact` |
| **No-commit** | Do NOT commit. Note uncommitted changes in session summary, then `/compact` |
| **Auto-commit** | Commit via `gitcmp`, then `/compact` |

Files are always saved to disk regardless of commit mode — no work is lost.

---

## **Integration with Requirements Documents**

When a `requirements/` directory exists in the project and contains RD documents (created by `make_requirements` from `requirements.md`), `make_plan` can use them as input:

### How It Works

1. **Detection**: When `make_plan` starts, check if `requirements/` exists with `RD-XX-*.md` files
2. **Offer**: If RDs exist, ask the user: *"I found requirement documents in `requirements/`. Would you like to base this plan on a specific RD?"*
3. **If user selects an RD**: Read the RD document and use it as the primary input. Phase 1 (Information Gathering) is simplified — the agent reads the RD instead of full ad-hoc Q&A, but still analyzes the current codebase state (Phase 1.2)
4. **If user declines**: Proceed with standard Phase 1 information gathering as usual

### What Changes When an RD Is Provided

| Phase 1 Step | Without RD (standard) | With RD |
|---|---|---|
| 1.1 Ask Clarifying Questions | Full interview | Minimal — RD already answers most questions |
| 1.2 Analyze Current Implementation | Full analysis | Same — always needed |
| 1.3 Confirm Scope | Present findings for confirmation | Present RD summary + current state for confirmation |

### What Stays the Same

- All plan document templates (00-index through 99-execution-plan)
- Phase 2 (Create Plan Documents) — unchanged
- Phase 3 (Quality Checklist) — unchanged
- Plan execution (`exec_plan`) — completely unchanged
- `make_plan` continues to work perfectly without any requirements documents

> **Note:** Requirements documents may originate from `make_requirements` (forward engineering) or from `retro_requirements` → `make_requirements` (reverse engineering). `make_plan` treats them identically.

### Plan Document Cross-Reference

When a plan is based on an RD, the `01-requirements.md` plan document should reference the source:

```markdown
> **Source**: [RD-XX](../../requirements/RD-XX-feature-name.md)
```

---

## **Part 1: Creating Plans (`make_plan`)**

### **Phase 1: Information Gathering (MANDATORY)**

**Before creating ANY plan documents, you MUST:**

#### 1.1 Ask Clarifying Questions

Always ask the user about:

1. **Feature Scope**
   - What is the feature/task to be implemented?
   - What should it do? What should it NOT do?
   - Are there any explicit scope boundaries?

2. **Technical Context**
   - Which parts of the codebase are affected?
   - Are there existing implementations to reference?
   - Are there any architectural constraints?

3. **Dependencies**
   - Does this depend on other features?
   - Are there external dependencies?
   - What must be completed before starting?

4. **Success Criteria**
   - How do we know when it's done?
   - What tests are required?
   - What documentation is needed?

#### 1.2 Analyze Current Implementation

Before planning:

1. ✅ **Read relevant source files** — Understand existing code
2. ✅ **Identify affected components** — Map impacted areas (packages, modules, services, configs)
3. ✅ **Check for similar patterns** — Find reference implementations in the codebase
4. ✅ **Note any technical debt** — Document existing issues that may affect the plan
5. ✅ **Review project documentation** — Check specs, READMEs, `.clinerules/project.md`, etc.
6. ✅ **Read technical architecture docs** — If `docs/index.md` exists with `techdocs: true` frontmatter, read relevant architecture sections (system overview, data model, API design) to understand existing patterns and constraints before planning changes (see `techdocs.md`)

#### 1.3 Confirm Scope with User

Present findings and confirm before proceeding:

```markdown
## Scope Confirmation

**Feature:** [Name]

**What's IN scope:**
- Item 1
- Item 2

**What's OUT of scope:**
- Item 1
- Item 2

**Key Decisions Needed:**
- Decision 1: [Options A, B, C]
- Decision 2: [Options X, Y]

Please confirm or adjust before I create the plan.
```

---

### **Phase 1B: Pre-Implementation Re-evaluation**

**IMPORTANT:** Before creating plan documents, and again before starting each phase during execution, re-evaluate to ensure nothing was missed:

1. **✅ Completeness** — Are all requirements covered? Any missing edge cases?
2. **✅ Context & Reasoning** — Can you explain WHY each phase exists and what problem it solves?
3. **✅ Task Granularity** — Are tasks small enough (2-4 hours)? Can each be tested independently?
4. **✅ Dependencies** — Are all dependencies documented? No circular dependencies?
5. **✅ Testing** — Does every task have testing/validation requirements?
6. **✅ Architecture** — Will any implementation exceed 500 lines? Is splitting planned?
7. **✅ Scope Boundaries** — Are changes properly scoped? Do new files follow existing patterns?
8. **✅ No Dead Code** — Will the implementation leave any unused parameters, functions, classes, or modules? Plan for cleanup. (See `code.md` rule 4)
9. **✅ Security** — Has every user input path been identified? Are injection prevention, authentication, authorization, rate limiting, and data protection addressed? (See `code.md` rules 32-34)

**When to Re-evaluate:**
- ✅ Before creating plan documents (now)
- ✅ After completing each phase (before starting next)
- ✅ When requirements change
- ✅ When discovering new technical constraints

---

### **Phase 2: Create Plan Documents**

#### 2.1 Folder Structure

Create plans in: `plans/[feature-name]/`

```
plans/
└── [feature-name]/
    ├── 00-index.md            # Overview and navigation
    ├── 01-requirements.md     # Requirements and scope
    ├── 02-current-state.md    # Current implementation analysis
    ├── 03-[component-1].md    # Technical spec for component 1
    ├── 04-[component-2].md    # Technical spec for component 2
    ├── ...                    # Additional component docs as needed
    ├── 07-testing-strategy.md # Test cases and verification
    └── 99-execution-plan.md   # Phases, sessions, task checklist
```

#### 2.2 Document Templates

---

##### **00-index.md** — Index and Overview

```markdown
# [Feature Name] Implementation Plan

> **Feature**: [Brief description]
> **Status**: Planning Complete
> **Created**: [Date]
> **CodeOps Version**: [Current codeops-mcp version from package.json]

## Overview

[2-3 paragraph description of what this feature does and why it's needed]

## Document Index

| #   | Document                                   | Description                             |
| --- | ------------------------------------------ | --------------------------------------- |
| 00  | [Index](00-index.md)                       | This document — overview and navigation |
| 01  | [Requirements](01-requirements.md)         | Feature requirements and scope          |
| 02  | [Current State](02-current-state.md)       | Analysis of current implementation      |
| 03  | [Component Name](03-component.md)          | Technical specification                 |
| ... | ...                                        | ...                                     |
| 07  | [Testing Strategy](07-testing-strategy.md) | Test cases and verification             |
| 99  | [Execution Plan](99-execution-plan.md)     | Phases, sessions, and task checklist    |

## Quick Reference

### Usage Examples

[Code examples showing the feature in use]

### Key Decisions

| Decision     | Outcome   |
| ------------ | --------- |
| [Decision 1] | [Outcome] |
| [Decision 2] | [Outcome] |

## Related Files

[List of key files that will be created or modified]
```

---

##### **01-requirements.md** — Requirements and Scope

```markdown
# Requirements: [Feature Name]

> **Document**: 01-requirements.md
> **Parent**: [Index](00-index.md)

## Feature Overview

[Detailed description of the feature]

## Functional Requirements

### Must Have

- [ ] Requirement 1
- [ ] Requirement 2

### Should Have

- [ ] Requirement 1

### Won't Have (Out of Scope)

- Exclusion 1
- Exclusion 2

## Technical Requirements

### Performance

- [Performance requirements]

### Compatibility

- [Compatibility requirements]

### Security

- [Security requirements]

## Scope Decisions

| Decision   | Options Considered | Chosen | Rationale |
| ---------- | ------------------ | ------ | --------- |
| [Decision] | A, B, C            | B      | [Why]     |

## Acceptance Criteria

1. [ ] Criterion 1
2. [ ] Criterion 2
3. [ ] All tests pass
4. [ ] Documentation updated
```

---

##### **02-current-state.md** — Current State Analysis

```markdown
# Current State: [Feature Name]

> **Document**: 02-current-state.md
> **Parent**: [Index](00-index.md)

## Existing Implementation

### What Exists

[Description of current relevant code]

### Relevant Files

| File             | Purpose   | Changes Needed |
| ---------------- | --------- | -------------- |
| `path/to/file`   | [Purpose] | [Changes]      |

### Code Analysis

[Key code snippets and analysis]

## Gaps Identified

### Gap 1: [Name]

**Current Behavior:** [What happens now]
**Required Behavior:** [What should happen]
**Fix Required:** [What needs to change]

## Dependencies

### Internal Dependencies

- [List internal dependencies]

### External Dependencies

- [List external dependencies]

## Risks and Concerns

| Risk   | Likelihood   | Impact       | Mitigation |
| ------ | ------------ | ------------ | ---------- |
| [Risk] | High/Med/Low | High/Med/Low | [Strategy] |
```

---

##### **03-XX-[component].md** — Component Technical Specification

```markdown
# [Component Name]: [Feature Name]

> **Document**: 03-[component].md
> **Parent**: [Index](00-index.md)

## Overview

[What this component does and why]

## Architecture

### Current Architecture

[Describe current state]

### Proposed Changes

[Describe what changes]

## Implementation Details

### New Types/Interfaces

[Type definitions — use project's language]

### New Functions/Methods

[Function signatures with documentation]

### Integration Points

[How this connects to other components]

## Code Examples

### Example 1: [Name]

[Code example]

### Example 2: [Name]

[Code example]

## Error Handling

| Error Case | Handling Strategy |
| ---------- | ----------------- |
| [Error]    | [Strategy]        |

## Testing Requirements

- Unit tests for [specific functionality]
- Integration tests for [interactions]
```

**Component document sizing:**

- **Option 1:** Create one `03-XX-[component].md` per major component
- **Option 2:** Create multiple `03-XX-[component]-[sub].md` per sub-component

Choose based on estimated size — each document should be manageable within AI context limits (< 30K tokens to write).

---

##### **07-testing-strategy.md** — Testing Strategy

```markdown
# Testing Strategy: [Feature Name]

> **Document**: 07-testing-strategy.md
> **Parent**: [Index](00-index.md)

## Testing Overview

### Coverage Goals

- Unit tests: [X]% coverage
- Integration tests: Key workflows covered
- E2E tests: Complete feature verification

## Test Categories

### Unit Tests

| Test        | Description      | Priority     |
| ----------- | ---------------- | ------------ |
| [Test name] | [What it tests]  | High/Med/Low |

### Integration Tests

| Test        | Components    | Description   |
| ----------- | ------------- | ------------- |
| [Test name] | [Components]  | [Description] |

### End-to-End Tests

| Scenario    | Steps    | Expected Result |
| ----------- | -------- | --------------- |
| [Scenario]  | [Steps]  | [Result]        |

## Test Data

### Fixtures Needed

[List test fixtures]

### Mock Requirements

[List any mocks needed — prefer real objects when possible]

## Verification Checklist

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] No regressions in existing tests
- [ ] Test coverage meets goals
```

---

### **Phase 3: Quality Checklist**

Before finalizing plan documents, run this checklist:

**✅ Completeness**
- [ ] All requirements captured
- [ ] All affected components identified
- [ ] All scope decisions documented
- [ ] All dependencies mapped

**✅ Granularity**
- [ ] Tasks are 2-4 hours max each
- [ ] Each task has clear deliverables
- [ ] Each task is independently testable

**✅ Dependencies**
- [ ] Phase dependencies documented
- [ ] Task dependencies documented
- [ ] No circular dependencies
- [ ] Dependency order is logical

**✅ Testing**
- [ ] Every component has test requirements
- [ ] E2E tests planned
- [ ] Test coverage goals defined

**✅ No Dead Code (per `code.md` rule 4)**
- [ ] No unused parameters (except interface contracts, overrides, and framework-required signatures)
- [ ] No unused functions, classes, or modules
- [ ] No unreachable code or commented-out blocks
- [ ] Language-specific dead code tooling enabled (if available)

**✅ Security-First (per `code.md` rules 32-34) — 🚨 NON-NEGOTIABLE**
- [ ] All user input validated and sanitized server-side
- [ ] Injection prevention addressed (SQL, XSS, command injection, path traversal)
- [ ] Authentication & authorization properly designed
- [ ] Rate limiting planned for public and authentication endpoints
- [ ] No hardcoded secrets or credentials — secrets management strategy defined
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Error responses expose no internal details (no stack traces, no DB schemas)
- [ ] Infrastructure hardened (non-root containers, minimal base images, no secrets in images/CI)
- [ ] Security test cases included in testing strategy

**✅ Format**
- [ ] All documents follow templates
- [ ] Tables are properly formatted
- [ ] Task numbers follow convention (Phase.Session.Task)
- [ ] Checkboxes included for tracking

---

### **Phase 4: Present Plan Summary**

After creating the plan, present:

```markdown
## Plan Created: [Feature Name]

**Location:** `plans/[feature-name]/`

**Documents Created:**
- 00-index.md ✅
- 01-requirements.md ✅
- 02-current-state.md ✅
- [additional docs] ✅
- 07-testing-strategy.md ✅
- 99-execution-plan.md ✅

**Summary:**
- Total Phases: X
- Total Sessions: X
- Estimated Time: X-X hours

**To Begin Implementation:**
Run `exec_plan [feature-name]` to start executing the plan.
```

---

## **Part 2: Executing Plans (`exec_plan [feature-name]`)**

### **Execution Protocol**

#### Step 1: Load the Plan

1. ✅ Read: `plans/[feature-name]/99-execution-plan.md`
2. ✅ Find incomplete tasks (unchecked `[ ]` items)
3. ✅ Read supporting technical specs in `plans/[feature-name]/`
4. ✅ Determine starting point: first incomplete phase/session/task

If the execution plan doesn't exist → **STOP** and handle as follows:

| Condition | Action |
|-----------|--------|
| `plans/` directory doesn't exist | STOP — suggest running `make_plan` first |
| `plans/[feature-name]/` doesn't exist | STOP — suggest running `make_plan` first, or check for typos in the feature name |
| `plans/[feature-name]/` exists but `99-execution-plan.md` is missing | STOP — the plan is incomplete. Suggest recreating it with `make_plan` |
| `99-execution-plan.md` exists but has no tasks | STOP — the plan is empty. Suggest recreating it with `make_plan` |
| All tasks are already marked `[x]` | Report: "All tasks are already complete." Suggest re-analyzing the project |

#### Version Check (Auto-Suggest)

After successfully loading the plan, check the version stamp:

1. Read `00-index.md` or `99-execution-plan.md`
2. Look for `> **CodeOps Version**: X.Y.Z`
3. Compare against the current codeops-mcp version

| Condition | Action |
|-----------|--------|
| Version stamp matches current version | Proceed normally — plan is current |
| Version stamp is older than current version | **Suggest:** "This plan was created with CodeOps vX.Y.Z (current: vA.B.C). Consider running `upgrade_plan [feature-name]` to upgrade to current standards. Proceed anyway?" |
| No version stamp found | **Suggest:** "This plan has no version stamp (created before versioning was introduced). Consider running `upgrade_plan [feature-name]` to upgrade to current standards. Proceed anyway?" |

This is a **suggestion only** — the user can choose to proceed without upgrading.

#### Step 2: Execute Tasks

For each task in order:

1. Implement the task following technical specifications
2. **🚨 IMMEDIATELY update `99-execution-plan.md`** — mark task complete with `[x]` and timestamp (see "Real-Time Progress Updates" below). This happens BEFORE verification, BEFORE commit, BEFORE anything else. If the agent crashes after this point, progress is preserved.
3. Run verification (project's verify command from `project.md`)
4. **Techdocs check (after each phase):** If `docs/index.md` exists with `techdocs: true` frontmatter and the just-completed phase introduced architectural changes (new components, data entities, API endpoints, integrations, or infrastructure), perform an incremental techdocs update (see `techdocs.md` Phase 6.1)
5. Continue until all tasks complete OR context window reaches 90%

#### Step 3: Session Wrap-Up

1. ✅ Complete current task before stopping
2. ✅ **🚨 FIRST: Update `99-execution-plan.md`** with ALL completed tasks (this MUST happen before anything else — see "Real-Time Execution Plan Updates" section)
3. ✅ Run project's verify command (see `.clinerules/project.md`)
4. ✅ Handle commit based on the active **commit mode** (see "Commit Behavior During Plan Execution" section):
   - **Ask (default):** Present commit options to the user via `ask_followup_question`
   - **No-commit:** Skip — no commit, no prompt
   - **Auto-commit:** Commit and push via `gitcmp` protocol
5. ✅ Report session summary (must include "Execution Plan Updated: ✅")

---

## **🚨 CRITICAL: Session Execution Rules (AUTO-INCLUDED IN EVERY PHASE) 🚨**

**These rules are AUTOMATICALLY APPLIED to every execution session. They do NOT need to be manually injected into plan templates.**

The canonical context window, file creation, and threshold rules are defined in `agents.md` — **Context Window Management** section. Key points for plan execution:

- ✅ **Continue implementing** until **90%** of the 200K context window — do NOT stop early
- ✅ At 90%, wrap up, handle commit per active **commit mode** (see above), then `/compact`
- ✅ Split large files (>500 lines) per `code.md` architecture rules
- ✅ Max AI output: **60K tokens**. Max AI input: **200K tokens**. No single file >30K tokens.
- ❌ NEVER include raw git commands in plans — always reference `gitcm`/`gitcmp`

> **📖 See `agents.md`** for the full Context Threshold Protocol table and File Creation Rules.

---

## **🚨 ULTRA-CRITICAL: Real-Time Execution Plan Updates — MANDATORY 🚨**

**The execution plan (`99-execution-plan.md`) is the SINGLE SOURCE OF TRUTH for progress. It is the user's primary way to track what's done, what's next, and where things stand. You MUST update it after completing EACH task. This is NON-NEGOTIABLE and has ZERO exceptions.**

### Why This Rule Exists — Crash Resilience

AI agent sessions can crash, hit context limits, or be interrupted at any moment. When that happens:

- The user opens `99-execution-plan.md` to see what was accomplished
- If the checklist was not updated, the user sees all `[ ]` and has NO IDEA what was done
- The user must manually inspect the codebase, diff files, and guess at progress
- This is **unacceptable** — the execution plan MUST always reflect reality

**The execution plan is the user's lifeline.** It must be accurate at all times, even if the session ends unexpectedly.

### Update-First Protocol — The Correct Order

The execution plan update happens **IMMEDIATELY** after task implementation — BEFORE verification, BEFORE commit, BEFORE moving to the next task:

```
Implement task → 🚨 UPDATE EXECUTION PLAN → verify → commit → next task
```

**NOT:**

```
❌ Implement task → verify → commit → maybe update plan → maybe forget
❌ Implement task → next task → batch-update later
❌ Implement all tasks → update plan at the end
```

**Rationale:** If the agent crashes during verification or commit, the execution plan already reflects the completed work. The user can always pick up where things left off.

### Update Procedure

For each completed task:

1. ✅ Use `replace_in_file` on `99-execution-plan.md` to change `[ ]` to `[x]` with timestamp
2. ✅ Update the "Progress" counter in the document header (e.g., `3/12 tasks (25%)`)
3. ✅ Update the "Last Updated" timestamp

### Task Completion Format

```markdown
- [x] 1.1.1 Task description ✅ (completed: YYYY-MM-DD HH:MM)
```

### Enforcement — Hard Gates

**🚫 PROHIBITED — The agent MUST NOT do any of the following without first updating the execution plan:**

- ❌ Proceed to the next task
- ❌ Run verification
- ❌ Commit code
- ❌ Call `attempt_completion`
- ❌ End a session or suggest `/compact`
- ❌ Present a session summary

**✅ REQUIRED — Before ANY of the above actions, the agent MUST have:**

1. ✅ Marked the current task complete with `[x]` and timestamp in `99-execution-plan.md`
2. ✅ Updated the progress counter in the document header
3. ✅ Updated the "Last Updated" timestamp

**🚫 SPECIFICALLY: `attempt_completion` is BLOCKED until the execution plan is current.** The agent must verify that `99-execution-plan.md` reflects ALL completed work before calling `attempt_completion`. This is enforced in both this document and `agents.md` Rule 6.

> **📖 See also:** `agents.md` — Rule 5 (Update Task Plan Documents) and Rule 6 (Final Verification Before Completion) for the universal enforcement of this rule across all agent actions.

---

## **🚨 CRITICAL: Commit on Successful Task Completion 🚨**

### When to Commit

Committing is governed by the active **commit mode** (see "Commit Behavior During Plan Execution" section). The commit step is triggered when ALL of these conditions are met:

1. ✅ Task or session is successfully complete
2. ✅ All verification passes (project's verify command)
3. ✅ Execution plan has been updated

**What happens next depends on the commit mode:**

| Commit Mode | Action After Verified Task |
|-------------|---------------------------|
| **Ask (default)** | Present commit options to user via `ask_followup_question` (see prompt protocol above) |
| **No-commit** | Skip — no commit, no prompt |
| **Auto-commit** | Automatically commit and push via `gitcmp` |

### Commit Protocol

When the user approves a commit (ask mode) or auto-commit is active, use the `gitcm` or `gitcmp` protocol from `git-commands.md`:

1. Run the project's verify command (from `.clinerules/project.md`)
2. If verification passes, use the `gitcm` or `gitcmp` protocol to commit

**Commit message format:**

```
feat([scope]): [task description]

- [Specific change 1]
- [Specific change 2]
- Verification: passing

Ref: plans/[feature-name]/99-execution-plan.md
Task: [X.X.X]
```

> ⚠️ **Do NOT use raw git commands.** Always use the `gitcm` or `gitcmp` protocol from `git-commands.md`.
> ⚠️ **The `-m` flag is BANNED.** Write commit messages to `/tmp/git_commit_msg.txt` using `write_to_file`, then commit with `git commit -F /tmp/git_commit_msg.txt`.

### When NOT to Commit (Any Mode)

- ❌ Verification is failing (tests, build, lint errors)
- ❌ Task is only partially complete
- ❌ Context limit reached mid-task (commit only after completing the current task)
- ❌ Commit mode is `--no-commit`

---

## **Execution Plan Template (`99-execution-plan.md`)**

Every generated execution plan MUST follow this template:

````markdown
# Execution Plan: [Feature Name]

> **Document**: 99-execution-plan.md
> **Parent**: [Index](00-index.md)
> **Last Updated**: [YYYY-MM-DD HH:MM]
> **Progress**: 0/X tasks (0%)
> **CodeOps Version**: [Current codeops-mcp version from package.json]

## Overview

[Brief description of the feature implementation]

**🚨 Update this document after EACH completed task!**

---

## Implementation Phases

| Phase | Title           | Sessions | Est. Time |
| ----- | --------------- | -------- | --------- |
| 1     | [Phase 1 Name]  | 1        | XX min    |
| 2     | [Phase 2 Name]  | 1-2      | XX min    |
| ...   | ...             | ...      | ...       |

**Total: X sessions, ~X-X hours**

---

## Phase 1: [Phase Name]

### Session 1.1: [Session Objective]

**Reference**: [Link to technical doc]
**Objective**: [What this session achieves]

**Tasks**:

| #     | Task               | File              |
| ----- | ------------------ | ----------------- |
| 1.1.1 | [Task description] | `path/to/file`    |
| 1.1.2 | [Task description] | `path/to/file`    |

**Deliverables**:
- [ ] Deliverable 1
- [ ] Deliverable 2
- [ ] All verification passing

**Verify**: [Project's verify command from .clinerules/project.md]

---

## Phase 2: [Phase Name]

### Session 2.1: [Session Objective]

...

---

## Task Checklist (All Phases)

### Phase 1: [Phase Name]
- [ ] 1.1.1 [Task]
- [ ] 1.1.2 [Task]

### Phase 2: [Phase Name]
- [ ] 2.1.1 [Task]
- [ ] 2.1.2 [Task]

---

## Session Protocol

### Starting a Session

1. Start agent settings (if `scripts/agent.sh` exists): run `clear && sleep 3 && scripts/agent.sh start`
2. Reference this plan: "Implement Phase X, Session X.X per `plans/[feature-name]/99-execution-plan.md`"

### Ending a Session

1. Run the project's verify command (from `.clinerules/project.md`)
2. Handle commit per the active **commit mode** (see "Commit Behavior During Plan Execution" in `make_plan.md`)
3. End agent settings (if `scripts/agent.sh` exists): run `clear && sleep 3 && scripts/agent.sh finished`
4. Compact the conversation with `/compact`

### Between Sessions

1. Review completed tasks in this checklist
2. Mark completed items with [x]
3. Start new conversation for next session
4. Run `exec_plan [feature-name]` to continue

---

## Dependencies

```
Phase 1
    ↓
Phase 2
    ↓
Phase 3
    ↓
...
```

---

## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ All verification passing (project's verify command)
3. ✅ No warnings/errors
4. ✅ No dead code — no unused parameters, functions, classes, or modules (per `code.md` rule 4)
5. ✅ Security hardened — input validation, injection prevention, auth, rate limiting, data protection (per `code.md` rules 32-34)
6. ✅ Documentation updated
7. ✅ Code reviewed (if applicable)
8. ✅ **Post-completion:** Ask user to re-analyze project and update `.clinerules/project.md`
````

---

## **Session Summary Template**

At the end of each execution session, provide:

```markdown
## Session Complete

**Feature:** [feature-name]
**Execution Plan:** `plans/[feature-name]/99-execution-plan.md`

**Completed This Session:**
- [x] Phase X, Task X.X.X: [description]
- [x] Phase X, Task X.X.X: [description]

**Remaining Work:**
- [ ] Phase X, Task X.X.X: [description]
- [ ] Phase Y: [phase description]

**Execution Plan Updated:** ✅ `99-execution-plan.md` reflects all completed work
**Verification:** [Status — e.g., "All tests passing", "Build successful"]
**Commit Mode:** [ask-commit | no-commit | auto-commit]
**Commit:** [hash] or "Committed successfully" or "Uncommitted — user deferred" or "No-commit mode"
**Context Used:** ~XX%

**To Continue:**
Run `exec_plan [feature-name]` in a new session after `/compact`
```

---

## **Error Handling During Execution**

### If Verification Fails

1. Fix the failing tests/build
2. Verify all checks pass
3. Only then mark task complete

### If Implementation Deviates from Plan

1. Note the deviation in the execution plan
2. Update task descriptions if needed
3. Continue with corrected approach

### If Context Limit Reached Mid-Task

1. ⚠️ Save progress so far
2. Add clear notes about partial completion
3. Mark task as `[~]` (partial) with explanation
4. Handle commit per active commit mode (ask/no-commit/auto-commit), then `/compact`

---

## **Adapting to Project Type**

The AI should adapt document structure based on the project type:

| Project Type       | Typical Components                                |
| ------------------ | ------------------------------------------------- |
| **Web App**        | Frontend, Backend, API, Database, Auth            |
| **API / Backend**  | Endpoints, Services, Data Models, Validation      |
| **Library / SDK**  | Core, Utils, Types, Public API                    |
| **CLI Tool**       | Commands, Arguments, Output, Config               |
| **UI Components**  | Component, Styles, Hooks, Stories, Tests          |
| **Mobile App**     | UI, State, Services, Navigation                   |
| **Compiler**       | Lexer, Parser, Analyzer, Generator                |
| **Microservices**  | Services, Events, Data, Integration               |
| **Infrastructure** | Docker, Nginx, CI/CD, Deployment Scripts          |
| **Database**       | Schema/Migration, Repository, Service, Tests      |
| **Bug Fix**        | Root cause analysis, Fix, Regression test         |
| **Refactoring**    | Current state, New structure, Migration, Tests    |

---

## **Cross-References**

When creating and executing plans:

- ✅ Follow **code.md** for coding standards and quality requirements
- ✅ Follow **testing.md** for test commands and workflow
- ✅ Follow **git-commands.md** for `gitcm`/`gitcmp` commit protocol
- ✅ Follow **agents.md** for general AI agent behavior rules
- ✅ Follow **techdocs.md** for technical architecture documentation updates after phases and plans
- ✅ Follow **upgrade_plan.md** for upgrading outdated plans and requirements
- ✅ Reference **grill_me.md** for deep disambiguation before planning (`grill_me` → `make_plan`)
- ✅ Read **`.clinerules/project.md`** for project-specific commands and conventions

---

## **Summary**

| Trigger | Action |
|---------|--------|
| `make_plan` | Create implementation plan in `plans/[feature]/` |
| `exec_plan [feature]` | Execute plan — default: ask before committing |
| `exec_plan [feature] --ask-commit` | Execute plan — ask before committing (same as default) |
| `exec_plan [feature] --no-commit` | Execute plan — never commit, never ask |
| `exec_plan [feature] --auto-commit` | Execute plan — auto-commit and push after each task |
| `/compact` | Compact context after session ends |
| `gitcm` | Commit after successful verification |
| `gitcmp` | Commit and push after successful verification |
| `upgrade_plan [feature]` | Upgrade an outdated plan to current standards |
| `upgrade_requirements` | Upgrade outdated requirements to current standards |

**Session Flow (default — ask-commit):**
```
exec_plan [feature] → implement tasks → update plan → verify → ask user about commit → /compact → exec_plan [feature]
```

**Session Flow (auto-commit):**
```
exec_plan [feature] --auto-commit → implement tasks → update plan → verify → auto-commit → /compact → exec_plan [feature]
```

**Session Flow (no-commit):**
```
exec_plan [feature] --no-commit → implement tasks → update plan → verify → /compact → exec_plan [feature]
```

---

## **🚨 CRITICAL: Post-Plan-Completion Project Re-Analysis 🚨**

**When ALL tasks in an execution plan are complete, the agent MUST perform this final step.**

### Protocol

After the final task is marked complete and all verification passes:

1. ✅ **Handle end-of-plan commit** per the active commit mode (see "Commit Behavior During Plan Execution"):
   - **Ask (default):** Present the end-of-plan commit prompt with options
   - **No-commit:** Note that changes are uncommitted
   - **Auto-commit:** Already committed per-task — no additional action needed
2. ✅ **Techdocs comprehensive update:** If `docs/index.md` exists with `techdocs: true` frontmatter, perform a comprehensive techdocs update — review all architecture sections against the current codebase, update diagrams, create ADRs for undocumented decisions, and update the VitePress sidebar if new pages were added (see `techdocs.md` Phase 6.2). If techdocs do NOT exist, ask: *"Would you like to create technical architecture documentation for this project?"* — if yes, run `make_techdocs`.
3. ✅ **Ask the user:** *"The plan is complete. Would you like to re-analyze the project to update `.clinerules/project.md` with the latest project state?"*
4. ✅ If user **confirms**:
   - Run `analyze_project` with the project root path
   - Save the generated output to `.clinerules/project.md`
   - Review and preserve any manual customizations (description, naming conventions, special rules) from the existing `project.md`
   - Commit the updated `project.md` using `gitcmp` (ask user first if in ask-commit or no-commit mode)
5. ✅ If user **declines**: Skip — plan execution is complete

### Why This Matters

Implementation plans often introduce new dependencies, change project structure, add frameworks, or modify build/test commands. Re-analyzing the project ensures `.clinerules/project.md` stays accurate and up-to-date, so future AI sessions work with correct toolchain information.

### Template Addition for `99-execution-plan.md`

Every execution plan's **Success Criteria** section must include:

```markdown
## Success Criteria

**Feature is complete when:**

1. ✅ All phases completed
2. ✅ All verification passing (project's verify command)
3. ✅ No warnings/errors
4. ✅ No dead code — no unused parameters, functions, classes, or modules (per `code.md` rule 4)
5. ✅ Security hardened — input validation, injection prevention, auth, rate limiting, data protection (per `code.md` rules 32-34)
6. ✅ Documentation updated
7. ✅ Code reviewed (if applicable)
8. ✅ **Post-completion:** Ask user to re-analyze project and update `.clinerules/project.md`
```
