# Implementation Plan Creation & Execution

## **TRIGGER KEYWORD: `make_plan`**

When the user types "make_plan", execute the comprehensive workflow below to create a detailed, multi-document implementation plan for any software development feature or task.

## **TRIGGER KEYWORD: `exec_plan [feature-name]`**

When the user types "exec_plan [feature-name]", execute the implementation plan at `plans/[feature-name]/99-execution-plan.md`.

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
4. ✅ Auto-commit if verification passes (use `gitcmp` protocol from `git-commands.md`)
5. ✅ Report session summary

---

## **🚨 CRITICAL: Session Execution Rules (AUTO-INCLUDED IN EVERY PHASE) 🚨**

**These rules are AUTOMATICALLY APPLIED to every execution session. They do NOT need to be manually injected.**

### **Context Window Management**

- ✅ **Continue implementing** — do NOT wrap the session until you reach **90% of the 200K context window**
- ✅ If you reach 90%, wrap up the session then `/compact`
- ✅ Use the `gitcmp` protocol to stage all changes and create a git commit before continuing in a new session
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
| 90%+ | STOP — wrap session, commit, `/compact` |

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

## **🚨 CRITICAL: Auto-Commit on Successful Task Completion 🚨**

### When to Auto-Commit

Auto-commit is **MANDATORY** when ALL of these conditions are met:

1. ✅ Task or session is successfully complete
2. ✅ All verification passes (project's verify command)
3. ✅ Execution plan has been updated

### Commit Protocol

Use the `gitcm` or `gitcmp` protocol from `git-commands.md`:

```bash
# 1. Run project's verify command (from .clinerules/project.md)
# Example: clear && yarn build && yarn test
# Example: clear && cargo build && cargo test
# Example: clear && docker compose config && docker compose build

# 2. If verification passes, use gitcm/gitcmp protocol to commit
# Commit message format:
# feat([scope]): [task description]
#
# - [Specific change 1]
# - [Specific change 2]
# - Verification: passing
#
# Ref: plans/[feature-name]/99-execution-plan.md
# Task: [X.X.X]
```

### When NOT to Auto-Commit

- ❌ Verification is failing (tests, build, lint errors)
- ❌ Task is only partially complete
- ❌ Context limit reached mid-task (commit only after completing the current task)

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
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.
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
- If 90% reached: wrap up, commit via `gitcmp`, then `/compact`.
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

```bash
# 1. Start agent settings (if scripts/agent.sh exists)
clear && scripts/agent.sh start

# 2. Reference this plan
# "Implement Phase X, Session X.X per plans/[feature-name]/99-execution-plan.md"
```

### Ending a Session

```bash
# 1. Run project's verify command (from .clinerules/project.md)

# 2. If verification passes, commit using gitcm/gitcmp protocol

# 3. End agent settings (if scripts/agent.sh exists)
clear && scripts/agent.sh finished

# 4. Compact conversation
/compact
```

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
**Commit:** [hash] or "Committed successfully"
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
4. Commit completed work, then `/compact`

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
| `exec_plan [feature]` | Execute `plans/[feature]/99-execution-plan.md` |
| `/compact` | Compact context after session ends |
| `gitcm` | Commit after successful verification |
| `gitcmp` | Commit and push after successful verification |

**Session Flow:**
```
exec_plan [feature] → implement tasks → update plan → verify → commit → /compact → exec_plan [feature]
```

---

## **🚨 CRITICAL: Post-Plan-Completion Project Re-Analysis 🚨**

**When ALL tasks in an execution plan are complete, the agent MUST perform this final step.**

### Protocol

After the final task is marked complete and all verification passes:

1. ✅ **Ask the user:** *"The plan is complete. Would you like to re-analyze the project to update `.clinerules/project.md` with the latest project state?"*
2. ✅ If user **confirms**:
   - Run `analyze_project` with the project root path
   - Save the generated output to `.clinerules/project.md`
   - Review and preserve any manual customizations (description, naming conventions, special rules) from the existing `project.md`
   - Commit the updated `project.md` using `gitcmp`
3. ✅ If user **declines**: Skip — plan execution is complete

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
