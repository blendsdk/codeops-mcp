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

**If `.clinerules/project.md` does not exist**, detect project settings from manifest files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `docker-compose.yml`, `pom.xml`, `build.gradle`, `CMakeLists.txt`, `*.sln`, `*.csproj`). Use only facts detected from these files — do NOT invent or assume settings that cannot be read from the project's manifest files.

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

When a plan is based on an RD, the `01-requirements.md` plan document MUST reference the source:

```markdown
> **Source**: [RD-XX](../../requirements/RD-XX-feature-name.md)
```

---

## **Part 1: Creating Plans (`make_plan`)**

### **Phase 1: Information Gathering (MANDATORY)**

**Before creating ANY plan documents, you MUST:**

#### 1.1 Ask Clarifying Questions

> **🚨 ZERO-AMBIGUITY RULE — ACTIVE FROM THE FIRST QUESTION 🚨**
>
> This rule applies to **ALL decisions without exception** — design choices, technical architecture, behavioral specifications, scope boundaries, edge case handling, error messages, naming conventions, file structure, document organization, wording, AND formatting. If the AI must choose between two or more options for ANYTHING, the user decides.
>
> Every question you ask MUST yield a **concrete, specific, unambiguous answer**. Do NOT accept vague responses. Do NOT fill gaps with your own assumptions. Do NOT infer intent. Do NOT proceed with "reasonable defaults" unless the user explicitly chose them. If the user's answer is unclear, ask again with sharper options. If the user says "I'm not sure," lay out the options with trade-offs and guide them to a decision — but the DECISION must be theirs, not yours. See **Phase 1C: Zero-Ambiguity Gate** below for the formal enforcement mechanism.

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

Present findings and confirm before proceeding. During scope confirmation, begin compiling the **Ambiguity Register** — a formal inventory of every gap, ambiguity, unstated assumption, and open question discovered so far. This register will be finalized and enforced in **Phase 1C**.

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

### **Phase 1C: Zero-Ambiguity Gate — 🚨 NON-NEGOTIABLE HARD GATE 🚨**

**This gate MUST be passed before ANY plan document is created. There are NO exceptions, NO overrides, and NO "good enough" thresholds. This is the most important quality gate in the entire planning process.**

#### Why This Gate Exists

Plans built on ambiguity produce implementations built on guesswork. When the AI guesses, the user gets code they didn't ask for, behaviors they didn't expect, and architectures they didn't choose. Every single item in every plan document must trace back to an **explicit, user-confirmed decision**. If the AI cannot point to a specific user answer for any design choice, technical detail, behavioral specification, edge case handling, or scope boundary — it has failed this gate.

#### The Ambiguity Register

Before proceeding to Phase 2, the agent MUST compile and present an **Ambiguity Register** — a formal, numbered inventory of every identified gap, ambiguity, unstated assumption, undefined behavior, and open question.

**The agent must systematically hunt for ambiguities across ALL of these categories:**

| Category | What to Look For |
|----------|-----------------|
| **Feature gaps** | Features mentioned but not fully specified, unclear feature interactions, undefined workflows |
| **Behavioral gaps** | Undefined "what happens when..." scenarios, missing error handling, unspecified state transitions |
| **Scope ambiguities** | Features that could go either way, unclear boundaries between in-scope and out-of-scope |
| **Technical unknowns** | Architecture or technology choices not yet decided, unresolved implementation approaches |
| **Edge cases** | Boundary conditions, failure modes, concurrent access, empty/null states, overflow |
| **Integration points** | Unclear interfaces between components, undefined API contracts, missing data flow specifications |
| **Data & state questions** | Unclear data models, undefined ownership, missing validation rules, unspecified formats |
| **Security & compliance** | Unaddressed threat vectors, undefined auth flows, missing data protection decisions |
| **Non-functional gaps** | Missing performance targets, undefined scalability approach, unspecified availability requirements |
| **UX & presentation** | Undefined user-facing text, missing error messages, unspecified display formats, unclear navigation flows |
| **Stakeholder conflicts** | Competing needs between user types, unresolved priority disputes, unclear permission boundaries |
| **Naming & terminology** | Unconfirmed file names, directory structures, class/function names, API endpoint paths, domain terms used inconsistently |

**Ambiguity Register Template:**

```markdown
## Ambiguity Register: [Feature Name]

> **Status**: ❌ GATE BLOCKED — [X] items unresolved
> *(When all resolved, change to: ✅ GATE PASSED — all [X] items resolved)*
> **Last Updated**: [Date]

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|----------------|-------------------|---------------|--------|
| 1 | Behavioral | [Specific ambiguity] | [Option A / Option B / Option C] | [User's answer] | ✅ Resolved |
| 2 | Scope | [Specific ambiguity] | [Option A / Option B] | — | ❌ Open |
| 3 | Technical | [Specific ambiguity] | [Option A / Option B / Option C] | [User's answer] | ✅ Resolved |

### Resolution Notes

**AR-1:** [Expanded context for the decision if needed]
**AR-2:** [Pending — presented to user, awaiting answer]
```

#### Gate Enforcement Rules

**🚫 ABSOLUTELY PROHIBITED — The agent MUST NOT do any of the following while the gate is blocked:**

- ❌ Create any plan document (`00-index.md`, `01-requirements.md`, etc.)
- ❌ Write any technical specification
- ❌ Define any task in an execution plan
- ❌ Make any design decision on the user's behalf
- ❌ Use phrases like "we'll assume...", "by default...", "a reasonable approach would be..."
- ❌ Proceed with a partially resolved register

**✅ REQUIRED — The gate opens ONLY when ALL of these conditions are met:**

1. ✅ Every row in the Ambiguity Register has Status = "✅ Resolved"
2. ✅ Every resolution contains the **user's explicit decision** (not the AI's recommendation accepted by silence)
3. ✅ The user has reviewed and confirmed the complete register (for registers with >15 items, present in batches by category — user confirms each batch, then gives final confirmation: "I have reviewed and confirmed all [X] items")
4. ✅ Zero items are deferred — every item has a concrete answer (the user must decide; "figure it out later" is NOT accepted — explain the consequences and guide the user to a decision NOW)
5. ✅ The register header has been updated to `✅ GATE PASSED — all [X] items resolved`

**User dismissals:** If the user says "that's not ambiguous, the answer is obviously X" — that IS a valid resolution. Record it as: `✅ Resolved — User: "[their stated answer]"`. The AI cannot dismiss items on its own; only the user can.

**Zero-ambiguity register:** If the systematic review finds ZERO ambiguities, the register file is STILL created and saved to disk with header: `✅ GATE PASSED — 0 ambiguities identified (systematic review completed)`. This proves the gate was executed.

#### No-Deferral Policy

**Deferrals and delegations are NOT permitted.** Every ambiguity must be resolved with a concrete decision before the gate opens.

**If the user says "I don't know" or "decide later":**

1. **Explain** why the decision matters and what happens if it's wrong
2. **Present** the available options with clear trade-offs and consequences
3. **Recommend** an option with your rationale (you CAN recommend — you CANNOT decide)
4. **Guide** the user to make an explicit choice
5. **Record** the user's choice in the register — not your recommendation

**If the user says "you decide" or "I trust you, just pick one":**

1. **Refuse politely** — "I can recommend, but the decision must be yours"
2. **Present** the options with your recommendation clearly marked
3. **Wait** for the user to explicitly say "I choose [option]"
4. **Record** the user's explicit choice — never record "AI decided" or "delegated to AI"

The user MUST make the call. The AI MUST NOT make the call for them. Delegation to the AI is not permitted.

#### Register Persistence

The Ambiguity Register is saved as a permanent file alongside the plan documents:

- **Location:** `plans/[feature-name]/00-ambiguity-register.md`
- **Purpose:** Audit trail — every decision in every plan document is traceable to this register
- **Survives crashes:** If the session crashes mid-planning, the register persists on disk

#### Traceability Requirement

Every decision in the final plan documents MUST include a back-reference to the Ambiguity Register entry that resolved it:

```markdown
> **Decision per AR #7:** User chose Option B — time-based cache invalidation with 5-minute TTL.
```

This creates an unbroken chain: **user question → user answer → register entry → plan document**.

**The ONLY items exempt from AR # back-references are:**
- **(a)** Universally obvious facts with exactly one possible interpretation (e.g., "TypeScript files use `.ts` extension")
- **(b)** Formatting choices with zero semantic impact (markdown syntax, whitespace, line breaks)

**When in doubt, it is NOT an exception — add it to the register.** The AI must NEVER classify a decision as "obvious" to avoid the register. If the AI hesitates even briefly about whether something is obvious, it goes in the register.

#### Surface-During-Authoring Rule

Even after the gate passes, if the agent discovers **NEW ambiguities** while writing plan documents in Phase 2:

1. **STOP writing immediately** — do not finish the current paragraph, sentence, or bullet point
2. **Add** the new ambiguity to the Ambiguity Register with the next sequential number
3. **Present** it to the user with options and trade-offs
4. **Wait** for the user's explicit decision
5. **Record** the resolution in the register
6. **Only then** resume writing

This is NOT optional. The agent must NEVER "make a reasonable choice and move on." Every new ambiguity, no matter how small, goes through the register.

#### Interaction with `grill_me`

Phase 1C fires **regardless** of how Phase 1 was conducted — including when `grill_me` was used before `make_plan`. The grill-me shared understanding feeds INTO the register as pre-resolved context, but does NOT replace the formal gate. The AI must still systematically scan all 12 categories and compile the register. Many items may already be resolved thanks to grill-me — those get recorded as `✅ Resolved` with a note referencing the grill-me session.

#### Interaction with `upgrade_plan`

When plans are upgraded via `upgrade_plan`, the Zero-Ambiguity Gate applies to any **new decisions** introduced during the upgrade. Existing resolved decisions from the original register are preserved. Only new or changed items go through the register.

---

### **Phase 2: Create Plan Documents**

#### 2.1 Folder Structure

Create plans in: `plans/[feature-name]/`

```
plans/
└── [feature-name]/
    ├── 00-ambiguity-register.md # Zero-Ambiguity Gate register (audit trail)
    ├── 00-index.md              # Overview and navigation
    ├── 01-requirements.md       # Requirements and scope
    ├── 02-current-state.md      # Current implementation analysis
    ├── 03-[component-1].md      # Technical spec for component 1
    ├── 04-[component-2].md      # Technical spec for component 2
    ├── ...                      # Additional component docs as needed
    ├── 07-testing-strategy.md   # Test cases and verification
    └── 99-execution-plan.md     # Phases, sessions, task checklist
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

| #   | Document                                                 | Description                                    |
| --- | -------------------------------------------------------- | ---------------------------------------------- |
| AR  | [Ambiguity Register](00-ambiguity-register.md)           | Zero-Ambiguity Gate decisions (audit trail)     |
| 00  | [Index](00-index.md)                                     | This document — overview and navigation         |
| 01  | [Requirements](01-requirements.md)                       | Feature requirements and scope                  |
| 02  | [Current State](02-current-state.md)                     | Analysis of current implementation              |
| 03  | [Component Name](03-component.md)                        | Technical specification                         |
| ... | ...                                                      | ...                                             |
| 07  | [Testing Strategy](07-testing-strategy.md)               | Test cases and verification                     |
| 99  | [Execution Plan](99-execution-plan.md)                   | Phases, sessions, and task checklist            |

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

| Decision   | Options Considered | Chosen | Rationale | AR Ref |
| ---------- | ------------------ | ------ | --------- | ------ |
| [Decision] | A, B, C            | B      | [Why]     | AR #X  |

> **Traceability:** Every scope decision must reference the Ambiguity Register entry (AR #) that resolved it. See `00-ambiguity-register.md`.

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

| Error Case | Handling Strategy | AR Ref |
| ---------- | ----------------- | ------ |
| [Error]    | [Strategy]        | AR #X  |

> **Traceability:** Every error handling strategy and design choice must reference the Ambiguity Register entry (AR #) that resolved it. See `00-ambiguity-register.md`. The only exceptions are universally obvious facts and formatting with zero semantic impact.

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

## 🚨 Specification Test Cases (MANDATORY — NON-NEGOTIABLE)

> **These test cases are derived EXCLUSIVELY from requirements (`01-requirements.md`),
> component specifications (`03-XX-*.md`), API contracts, RFCs, and the Ambiguity Register
> (`00-ambiguity-register.md`). They define the expected behavior BEFORE any
> implementation exists.**
>
> **IMMUTABLE ORACLE RULE:** The agent MUST NOT modify these expectations to match the
> implementation. If the implementation does not match a spec test case, the implementation
> is wrong — not the test. See `testing.md` Rule 10 for the full protocol.
>
> **Every spec test case MUST include a source reference** tracing it to the requirement,
> spec document, or AR entry that defines the expected behavior.

### [Component/Feature 1]

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|-----------------|---------------------------|--------|
| ST-1 | [Concrete input or action] | [Concrete expected output or behavior] | [Req X.X / AR #X / RFC §X] |
| ST-2 | [Concrete input or action] | [Concrete expected output or behavior] | [Req X.X / AR #X] |
| ST-3 | [Error/edge scenario] | [Expected error type and message] | [Req X.X / AR #X] |

### [Component/Feature 2]

| # | Input / Scenario | Expected Output / Behavior | Source |
|---|-----------------|---------------------------|--------|
| ST-4 | [Concrete input or action] | [Concrete expected output or behavior] | [Req X.X / AR #X] |
| ST-5 | [Concrete input or action] | [Concrete expected output or behavior] | [Req X.X / AR #X] |

> **⚠️ AUTHORING RULE:** When writing spec test cases, the plan author MUST derive
> expectations from the specification documents listed above. The author MUST NOT
> imagine or infer what the implementation will produce. If the expected output cannot
> be determined from the specification, this is an ambiguity — add it to the Ambiguity
> Register and resolve with the user before defining the test case.

## Test Categories

### Specification Tests (from ST-cases above)

> Written BEFORE implementation. Filed as `[feature].spec.test.[ext]`.
> See `testing.md` Rule 10 and `code.md` Rule 31.

| Test File | ST Cases Covered | Component |
| --------- | ---------------- | --------- |
| `[feature].spec.test.[ext]` | ST-1, ST-2, ST-3 | [Component 1] |
| `[feature].spec.test.[ext]` | ST-4, ST-5 | [Component 2] |

### Implementation Tests (edge cases, internals)

> Written AFTER implementation. Filed as `[feature].impl.test.[ext]`.

| Test File | Description | Priority |
| --------- | ----------- | -------- |
| `[feature].impl.test.[ext]` | [Edge cases, boundary conditions, internal logic] | High/Med/Low |

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

- [ ] All specification test cases (ST-*) defined with concrete input/output pairs
- [ ] Every ST case traces to a requirement, spec doc, or AR entry
- [ ] Specification tests written BEFORE implementation
- [ ] Specification tests verified to FAIL before implementation (red phase)
- [ ] All specification tests pass after implementation (green phase)
- [ ] Implementation tests written for edge cases and internals
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

**✅ Specification-First Testing (per `testing.md` Rule 10, `code.md` Rule 31) — 🚨 NON-NEGOTIABLE**
- [ ] `07-testing-strategy.md` contains the `🚨 Specification Test Cases` section with concrete ST-cases
- [ ] Every ST-case has concrete input → expected output pairs (not just test names/descriptions)
- [ ] Every ST-case traces to a requirement, spec document, RFC, or AR entry
- [ ] ST-case expectations are derived from specification documents, NOT from imagined implementation behavior
- [ ] `99-execution-plan.md` follows the three-phase task ordering: spec tests → implementation → impl tests
- [ ] Spec test tasks reference ST-cases from `07-testing-strategy.md`
- [ ] Spec test and impl test files use separate naming convention (`*.spec.test.*` and `*.impl.test.*`)
- [ ] Red-phase verification task exists in execution plan (verify spec tests fail before implementation)

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

**✅ Zero-Ambiguity (per Phase 1C) — 🚨 NON-NEGOTIABLE**
- [ ] Ambiguity Register (`00-ambiguity-register.md`) exists and is saved to disk
- [ ] Every register entry has Status = "✅ Resolved" with explicit user decision
- [ ] Zero deferred items — every ambiguity has a concrete answer
- [ ] All decisions in plan documents have AR # back-references (only exceptions: universally obvious facts + zero-semantic-impact formatting)
- [ ] No plan document contains AI-assumed defaults, inferred behaviors, or guessed specifications
- [ ] Surface-during-authoring rule was followed — any new ambiguities discovered during writing were added to the register and resolved with the user

**✅ Execution Plan Completeness — 🚨 NON-NEGOTIABLE**
- [ ] `99-execution-plan.md` contains the `🚨 Master Progress Checklist (All Phases) — MANDATORY` section
- [ ] Master Progress Checklist lists ALL tasks from ALL phases (no tasks omitted)
- [ ] Master Progress Checklist includes the embedded execution rule block instructing agents to update it
- [ ] Every task in the checklist matches the task tables in the phase sections (consistent numbering and descriptions)

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
- 00-ambiguity-register.md ✅ (Zero-Ambiguity Gate — all items resolved)
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

> **🚨 ZERO-AMBIGUITY RULE — ACTIVE DURING EXECUTION 🚨**
>
> The Zero-Ambiguity Gate does not end at planning. During execution, if the agent encounters ANY implementation detail, behavioral question, edge case, or design choice that is not explicitly covered by the plan documents or the Ambiguity Register (`00-ambiguity-register.md`), the agent MUST:
>
> 1. **STOP implementation** — do not guess, do not infer, do not use "reasonable defaults"
> 2. **Present** the ambiguity to the user with options and trade-offs
> 3. **Wait** for the user's explicit decision
> 4. **Record** the new decision in `00-ambiguity-register.md` with the next sequential AR number
> 5. **Only then** resume implementation using the user's decision
>
> This applies to ALL ambiguities — architectural, behavioral, naming, formatting, UX, error handling, EVERYTHING. The agent must NEVER fill gaps by guessing during implementation.
>
> **Runtime register entries:** New AR entries added during execution are tagged with `(runtime)` in the Category column. The register header is updated to: `✅ GATE PASSED — [X] items resolved at planning / [Y] items added during execution`.

For each task in order:

1. Implement the task following technical specifications
2. **🚨 IMMEDIATELY update `99-execution-plan.md`** — mark task complete with `[x]` and timestamp (see "Real-Time Progress Updates" below). This happens BEFORE verification, BEFORE commit, BEFORE anything else. If the agent crashes after this point, progress is preserved.
3. Run verification (project's verify command from `project.md`)
4. **Techdocs check (after each phase):** If `docs/index.md` exists with `techdocs: true` frontmatter and the just-completed phase introduced architectural changes (new components, data entities, API endpoints, integrations, or infrastructure), perform an incremental techdocs update (see `techdocs.md` Phase 6.1)
5. Continue until all tasks complete OR context window reaches 90%

> **🚨 SPECIFICATION-FIRST TASK ORDERING — NON-NEGOTIABLE 🚨**
>
> When executing implementation tasks for any feature, the agent MUST follow the three-phase task ordering defined below. This is enforced at the execution plan level — every generated `99-execution-plan.md` MUST structure feature phases in this order. See `testing.md` Rule 10 for the full Specification-First Testing Protocol.

---

## **🚨 CRITICAL: Specification-First Task Ordering in Execution Plans (NON-NEGOTIABLE) 🚨**

**Every feature implementation phase in `99-execution-plan.md` MUST follow this three-phase task structure.** This prevents tautological testing — where tests mirror the implementation instead of independently verifying it against the specification. See `testing.md` Rule 10 and `code.md` Rule 31.

### Mandatory Task Ordering Per Feature

```
Phase N: [Feature Name]

  Session N.1: Specification Tests (BEFORE implementation)
    N.1.1  Write specification tests from 07-testing-strategy.md ST-cases
           → File: [feature].spec.test.[ext]
           → Source: 07-testing-strategy.md ST-1 through ST-X
           → Agent MUST NOT read implementation logic when writing these tests
    N.1.2  Run spec tests — verify they FAIL (red phase)
           → Document any that pass pre-implementation with justification

  Session N.2: Implementation
    N.2.1  Implement [feature/component] per technical specification
           → File: [implementation files]
           → Reference: 03-XX-[component].md
    N.2.2  Run spec tests — verify they PASS (green phase)
           → If any spec test fails: STOP, fix implementation (NOT the test)

  Session N.3: Implementation Tests & Hardening
    N.3.1  Write implementation tests (edge cases, internals, error paths)
           → File: [feature].impl.test.[ext]
    N.3.2  Full verification (project's verify command)
```

### Why This Ordering Is Non-Negotiable

| Step | What It Prevents |
|------|-----------------|
| **Spec tests BEFORE implementation** | Prevents agent from deriving test expectations from the code it just wrote |
| **Red phase verification** | Proves spec tests are meaningful (they test something that doesn't exist yet) |
| **Spec tests PASS after implementation** | Proves the implementation satisfies the specification |
| **Impl tests AFTER implementation** | These tests CAN be derived from the code (edge cases, internals) — but spec tests cannot |

### Enforcement Rules

**🚫 PROHIBITED — The agent MUST NOT:**

- ❌ Write implementation code before specification tests exist for that feature
- ❌ Skip the spec test phase ("we'll write tests after")
- ❌ Combine spec tests and implementation in the same task
- ❌ Write spec tests and implementation simultaneously
- ❌ Generate an execution plan where implementation tasks come before spec test tasks for the same feature

**✅ REQUIRED — Every generated `99-execution-plan.md` MUST:**

- ✅ Structure each feature phase with the three-session ordering above
- ✅ Include explicit spec test file references (`[feature].spec.test.[ext]`)
- ✅ Include explicit impl test file references (`[feature].impl.test.[ext]`)
- ✅ Reference the ST-cases from `07-testing-strategy.md` in spec test tasks
- ✅ Include red-phase verification as a distinct task

### Adaptation for Small Features

For small features where three separate sessions would be excessive, the agent MAY compress into a single session — but the **task ordering is still mandatory**:

```
Session N.1: [Feature Name]
  N.1.1  Write specification tests (from ST-cases)
  N.1.2  Verify spec tests fail (red phase)
  N.1.3  Implement feature
  N.1.4  Verify spec tests pass (green phase)
  N.1.5  Write implementation tests
  N.1.6  Full verification
```

The order `spec tests → red phase → implement → green phase → impl tests → verify` is NEVER negotiable, regardless of feature size.

---

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

1. ✅ Use `replace_in_file` on `99-execution-plan.md` to change `[ ]` to `[x]` with timestamp **in the Master Progress Checklist section**
2. ✅ Update the "Progress" counter in the document header (e.g., `3/12 tasks (25%)`)
3. ✅ Update the "Last Updated" timestamp

### Master Progress Checklist — Existence Gate

The **Master Progress Checklist** section in `99-execution-plan.md` is **MANDATORY**. Before executing the first task:

1. ✅ **Verify the checklist exists** — look for the `## 🚨 Master Progress Checklist (All Phases) — MANDATORY` section
2. ✅ **If missing:** Reconstruct the checklist from the phase/session/task details in the document. List every task from every phase with `- [ ] X.X.X [Task description]` format, grouped by phase. Add the embedded execution rule block. This MUST be done before any task execution begins.
3. ✅ **If incomplete:** Compare the checklist against all tasks in the phase sections. Add any missing tasks.

The agent MUST NOT execute any task if the Master Progress Checklist does not exist or is incomplete.

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

## 🚨 Master Progress Checklist (All Phases) — MANDATORY

> **⚠️ EXECUTION RULE — APPLIES TO EVERY AGENT EXECUTING THIS PLAN:**
>
> This checklist is the **single source of truth** for tracking progress across all phases.
> The executing agent **MUST** follow these rules without exception:
>
> 1. **After completing each task:** Mark it `[x]` with a timestamp — e.g., `- [x] 1.1.1 Task description ✅ (completed: YYYY-MM-DD HH:MM)`
> 2. **After completing each phase:** Review ALL tasks in that phase and confirm every completed task is marked `[x]` with a timestamp
> 3. **Update the Progress header** (`> **Progress**: X/Y tasks (Z%)`) in this document's frontmatter after every update
> 4. **This checklist MUST exist** — if it is missing or incomplete, the agent must reconstruct it from the phase details above before executing any task
> 5. **Never batch updates** — update immediately after each task, not at the end of a session
>
> Failure to maintain this checklist means progress is invisible after crashes, context resets, or session handoffs.

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

The AI MUST adapt document structure based on the project type:

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
