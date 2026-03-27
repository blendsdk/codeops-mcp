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

Generated plans must **never** contain raw git commands. All git operations must reference the `gitcm` or `gitcmp` protocol defined in `git-commands.md`.

### Required

- ✅ Reference `gitcm` (commit) or `gitcmp` (commit and push) protocol by name
- ✅ Describe commit steps in prose (e.g., "commit using the `gitcmp` protocol")
- ✅ Show commit message **format** in plain (non-`bash`) code blocks when needed

### Prohibited

- ❌ `git add .` or any `git add` command
- ❌ `git commit -m "..."` or any `git commit` command — **the `-m` flag is BANNED**
- ❌ `git push` or any `git push` command
- ❌ Any `bash` code block that contains git commands

### Reminder: File-Based Commit Messages Are Mandatory

The `gitcm`/`gitcmp` protocols require commit messages to be **written to a file** (`/tmp/git_commit_msg.txt`) using `write_to_file` and committed with `git commit -F`. This is because inline `-m` messages fail due to shell escaping, length limits, and multi-line formatting. See `git-commands.md` for full details.

> This rule applies to **all** plan documents, execution plan templates, session protocols, and auto-commit instructions. See the "No Loose Git Commands" section in `git-commands.md` for the full rationale.

---

## **🚨 CRITICAL: Script-First Execution During Plan Execution 🚨**

During plan execution, any ad-hoc commands, tests, validation scripts, or debugging must use **script files** — never inline command-line scripts.

### Required

- ✅ Create script files in `scripts/` for any non-trivial commands during execution
- ✅ Use appropriate prefixes: `test-`, `verify-`, `debug-`, `tmp-`, `run-`
- ✅ Clean up temporary scripts (prefixed with `tmp-`) after use
- ✅ Reference `agents.md` Rule 8 (Script-First Execution) for the full policy

### Prohibited

- ❌ `node -e "..."` or `python -c "..."` or any inline code evaluation
- ❌ Complex multi-line commands pasted directly into the terminal
- ❌ `bash -c "..."` for multi-line logic

> This ensures all ad-hoc work during plan execution is debuggable, reusable, and doesn't break due to shell escaping issues. See `agents.md` Rule 8 and Rule 12 for full details.

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

If the execution plan doesn't exist → **STOP**, suggest running `make_plan` first.

#### Step 2: Execute Tasks

For each task in order:

1. Implement the task following technical specifications
2. Run verification (project's verify command from `project.md`)
3. Update `99-execution-plan.md` — mark task complete with `[x]`
4. Continue until all tasks complete OR context window reaches 90%

#### Step 3: Session Wrap-Up

1. ✅ Complete current task before stopping
2. ✅ Update execution plan with all completed tasks
3. ✅ Run project's verify command (see `.clinerules/project.md`)
4. ✅ Handle commit based on the active **commit mode** (see "Commit Behavior During Plan Execution" section):
   - **Ask (default):** Present commit options to the user via `ask_followup_question`
   - **No-commit:** Skip — no commit, no prompt
   - **Auto-commit:** Commit and push via `gitcmp` protocol
5. ✅ Report session summary

---

## **🚨 CRITICAL: Session Execution Rules (AUTO-INCLUDED IN EVERY PHASE) 🚨**

**These rules are AUTOMATICALLY APPLIED to every execution session. They do NOT need to be manually injected.**

### **Context Window Management**

- ✅ **Continue implementing** — do NOT wrap the session until you reach **90% of the 200K context window**
- ✅ If you reach 90%, wrap up the session then `/compact`
- ✅ Before `/compact`, handle commit based on the active **commit mode** (see "Commit Behavior During Plan Execution"):
  - **Ask (default):** Present commit options to the user
  - **No-commit:** Skip — note uncommitted changes in session summary
  - **Auto-commit:** Commit and push via `gitcmp`
- ❌ NEVER include raw git commands (`git add`, `git commit`, `git push`) in generated plans — always reference `gitcm`/`gitcmp` protocol
- ❌ Do NOT stop early at 50-70% — maximize each session's output

### **File Creation Rules**

- ✅ Split files into smaller, logically grouped files to prevent AI context limits
- ✅ If creating a large class (>500 lines), split using inheritance chains or composition patterns (see `code.md`)
- ✅ Maximum AI output limit: **60K tokens**. Maximum AI input limit: **200K tokens**
- ✅ Plan file sizes accordingly — no single file should require >30K tokens to write

### **Context Threshold Protocol**

| Context Usage | Action |
|---------------|--------|
| 0-70% | Continue implementing tasks normally |
| 70-80% | Continue, but assess if current task can be completed |
| 80-90% | Complete current task, then wrap up |
| 90%+ | STOP — wrap session, handle commit per active commit mode, `/compact` |

---

## **🚨 CRITICAL: Real-Time Progress Updates 🚨**

**You MUST update `99-execution-plan.md` after completing EACH task. This is NON-NEGOTIABLE.**

### Update Protocol

1. ✅ Update IMMEDIATELY after each task completion — do not batch updates
2. ✅ Use `replace_in_file` to change `[ ]` to `[x]` with timestamp
3. ✅ Update "Last Updated" and "Progress" in document header

### Task Completion Format

```markdown
- [x] 1.1.1 Task description ✅ (completed: YYYY-MM-DD HH:MM)
```

### Enforcement

**Before proceeding to the NEXT task, you MUST have:**

1. ✅ Marked the current task complete in `99-execution-plan.md`
2. ✅ Updated the progress counter
3. ✅ Updated the "Last Updated" timestamp

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

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, handle commit per active commit mode, then `/compact`.
- Commit mode is determined by `exec_plan` flags: `--ask-commit` (default), `--no-commit`, `--auto-commit`.
- Split large files into smaller, logically grouped files.
- Max AI output: 60K tokens. Max AI input: 200K tokens.

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

**⚠️ Session Execution Rules:**
- Continue implementing until 90% of the 200K context window is reached.
- If 90% reached: wrap up, handle commit per active commit mode, then `/compact`.
- Commit mode is determined by `exec_plan` flags: `--ask-commit` (default), `--no-commit`, `--auto-commit`.
- Split large files into smaller, logically grouped files.
- Max AI output: 60K tokens. Max AI input: 200K tokens.

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

1. Start agent settings (if `scripts/agent.sh` exists): run `clear && scripts/agent.sh start`
2. Reference this plan: "Implement Phase X, Session X.X per `plans/[feature-name]/99-execution-plan.md`"

### Ending a Session

1. Run the project's verify command (from `.clinerules/project.md`)
2. Handle commit based on the active **commit mode**:
   - **Ask (default):** Present commit options to the user via `ask_followup_question`
   - **No-commit:** Skip — no commit, no prompt
   - **Auto-commit:** If verification passes, commit and push via `gitcmp` protocol
3. End agent settings (if `scripts/agent.sh` exists): run `clear && scripts/agent.sh finished`
4. Compact the conversation with `/compact`

> ⚠️ **Do NOT use raw git commands.** Always use the `gitcm` or `gitcmp` protocol from `git-commands.md`.
> ⚠️ Commit mode is set via `exec_plan` flags: `--ask-commit` (default), `--no-commit`, `--auto-commit`.

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
4. ✅ Documentation updated
5. ✅ Code reviewed (if applicable)
6. ✅ **Post-completion:** Ask user to re-analyze project and update `.clinerules/project.md`
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

## **Integration with Other Rules**

When creating and executing plans:

- ✅ Follow **code.md** for coding standards and quality requirements
- ✅ Follow **testing.md** for test commands and workflow
- ✅ Follow **git-commands.md** for `gitcm`/`gitcmp` commit protocol
- ✅ Follow **plans.md** for task granularity and formatting rules
- ✅ Follow **agents.md** for general AI agent behavior rules
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
2. ✅ **Ask the user:** *"The plan is complete. Would you like to re-analyze the project to update `.clinerules/project.md` with the latest project state?"*
3. ✅ If user **confirms**:
   - Run `analyze_project` with the project root path
   - Save the generated output to `.clinerules/project.md`
   - Review and preserve any manual customizations (description, naming conventions, special rules) from the existing `project.md`
   - Commit the updated `project.md` using `gitcmp` (ask user first if in ask-commit or no-commit mode)
4. ✅ If user **declines**: Skip — plan execution is complete

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
4. ✅ Documentation updated
5. ✅ Code reviewed (if applicable)
6. ✅ **Post-completion:** Ask user to re-analyze project and update `.clinerules/project.md`
```
