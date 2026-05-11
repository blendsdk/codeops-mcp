# Preflight Review Protocol

## **TRIGGER KEYWORD: `preflight <artifact-reference>`**

When the user types "preflight" followed by an artifact reference, execute a rigorous multi-dimensional quality audit of the specified artifact. The goal is to find every issue, ambiguity, contradiction, gap, and risk — present each with an options analysis and recommendation — and iterate until the artifact passes clean.

**Artifact reference formats:**

| What the User Types | What Gets Reviewed |
|---|---|
| `preflight requirements` | All requirement documents in `requirements/` |
| `preflight requirements RD-03` | A specific requirement document |
| `preflight [feature-name]` | All plan documents in `plans/[feature-name]/` |
| `preflight [feature-name] 03-api-design` | A specific plan document |
| `preflight [file-or-directory-path]` | Any ad-hoc file or directory |

## **TRIGGER KEYWORD: `preflight --continue`**

Resume an interrupted preflight session from saved progress notes (see Session Management).

---

## **Purpose**

Plans and requirements built on ambiguity produce implementations built on guesswork. The Zero-Ambiguity Gates inside `make_plan` and `make_requirements` catch issues **during creation**. But artifacts evolve, context shifts, and fresh eyes catch what the original author missed.

**Preflight is the post-creation safety net.** It reviews an existing artifact with the detachment of a code reviewer who didn't write the code — hunting for every issue the creation process may have missed, introduced, or left insufficiently resolved.

### When to Use

| Workflow Pattern | Description |
|---|---|
| `make_requirements` → **`preflight requirements`** → `make_plan` | Verify requirements before planning |
| `make_plan` → **`preflight [feature]`** → `exec_plan` | Verify plan before execution |
| `make_requirements` → **`preflight requirements`** → `make_plan` → **`preflight [feature]`** → `exec_plan` | Full rigor — preflight at both stages |
| **`preflight [feature]`** (standalone) | Audit any existing artifact at any time |
| `exec_plan` (mid-execution) → **`preflight [feature] 04-phase`** | Spot-check a specific phase before implementing it |

**Preflight is always optional but always valuable.** It can be run at any point, on any artifact, as many times as needed.

---

## **Core Directive**

> **You are a senior technical reviewer performing a formal quality audit. Your job is to find every defect, every gap, every ambiguity, every contradiction, and every risk in this artifact. Be thorough. Be systematic. Be relentless. For every issue you find, analyze the options and present your recommended resolution. Do NOT fix anything silently — every finding must be presented to the user for decision.**

You are NOT a rubber stamp. You are NOT trying to confirm the artifact is good. You are actively trying to **break it** — to find the things that will cause problems during implementation. Assume the artifact has issues until proven otherwise.

---

## **The Protocol**

### Step 1: Load and Understand the Artifact

Before scanning, the agent MUST:

1. **Read the complete artifact** — every document, every section, every line
2. **Identify the artifact type** — requirements set, implementation plan, or ad-hoc document
3. **Load context** — read `.clinerules/project.md` if it exists, understand the project's tech stack, conventions, and constraints
4. **Read the Ambiguity Register** (if one exists) — `requirements/00-ambiguity-register.md` or `plans/[name]/00-ambiguity-register.md`. Understand what decisions were already made and why.

**Present a brief summary before scanning:**

```markdown
## Preflight: [Artifact Name]

**Artifact Type:** [Requirements Set / Implementation Plan / Ad-hoc Document]
**Documents:** [X] files, [Y] total sections
**Ambiguity Register:** [Found — X items resolved / Not found]
**Scope:** [Full scan / Targeted: specific document]

Beginning 12-dimension scan...
```

### Step 2: Execute the 12-Dimension Scan

Systematically review the artifact across ALL 12 dimensions. For each dimension, actively hunt for issues. Do not skim — read with adversarial intent.

#### The 12 Dimensions

| # | Dimension | What to Hunt For |
|---|-----------|-----------------|
| 1 | **Ambiguities** | Vague language, undefined terms, weasel words ("appropriate", "as needed", "etc."), statements with multiple possible interpretations, undefined behaviors |
| 2 | **Implicit Assumptions** | Things the document takes for granted without stating explicitly, assumed technical capabilities, assumed user knowledge, assumed environmental conditions |
| 3 | **Logical Contradictions** | Statements that conflict with each other — across documents, across sections, or even within the same paragraph. Inconsistent decisions, conflicting constraints |
| 4 | **Completeness Gaps** | Missing requirements, unaddressed user journeys, absent error handling, undefined edge cases, features mentioned but never specified, missing acceptance criteria |
| 5 | **Dependency Issues** | Circular dependencies, missing dependencies, dependencies on undefined components, tasks that reference entities not yet created, broken dependency chains |
| 6 | **Feasibility Concerns** | Tasks that may be technically impossible or unrealistic, significantly underestimated complexity, approaches that won't work with the stated tech stack, tasks too large to implement atomically |
| 7 | **Testability** | Requirements or tasks with no clear way to verify success, vague success criteria ("should work well"), missing test specifications, untestable acceptance criteria |
| 8 | **Security Blind Spots** | Missing authentication/authorization checks, unvalidated inputs, exposed sensitive data, unaddressed threat vectors, missing rate limiting, insecure defaults |
| 9 | **Edge Cases** | Boundary conditions not addressed, failure modes not handled, concurrency issues ignored, empty/null/zero states undefined, overflow/underflow scenarios missing |
| 10 | **Scope Creep Indicators** | Items that exceed the stated scope, unbounded tasks ("support all formats"), features that imply entire sub-systems, gold-plating, premature optimization |
| 11 | **Ordering & Sequencing** | Tasks in wrong order, phases that should be swapped, work planned before its dependencies exist, premature optimizations, missing foundation work |
| 12 | **Consistency** | Naming inconsistencies across documents, conflicting conventions, terminology drift (same thing called different names), formatting inconsistencies that obscure meaning |

#### Dimension Adaptation by Artifact Type

Not every dimension carries equal weight for every artifact type. The agent MUST scan all 12 dimensions every time, but the depth of analysis adapts:

| Dimension | Requirements | Plans | Ad-hoc |
|-----------|-------------|-------|--------|
| Ambiguities | 🔥 Deep | 🔥 Deep | 🔥 Deep |
| Implicit Assumptions | 🔥 Deep | 🔥 Deep | Standard |
| Logical Contradictions | 🔥 Deep | 🔥 Deep | Standard |
| Completeness Gaps | 🔥 Deep | 🔥 Deep | Standard |
| Dependency Issues | Standard | 🔥 Deep | Light |
| Feasibility Concerns | Standard | 🔥 Deep | Standard |
| Testability | 🔥 Deep | Standard | Light |
| Security Blind Spots | 🔥 Deep | Standard | Light |
| Edge Cases | 🔥 Deep | Standard | Light |
| Scope Creep Indicators | 🔥 Deep | 🔥 Deep | Standard |
| Ordering & Sequencing | Light | 🔥 Deep | Light |
| Consistency | Standard | Standard | Standard |

- **🔥 Deep** — Exhaustive analysis, actively hunt for issues
- **Standard** — Thorough review, flag anything found
- **Light** — Quick check, flag only obvious issues

### Step 3: Compile the Preflight Report

Every finding gets a formal entry in the **Preflight Report** — a numbered, structured register of all discovered issues.

#### Severity Classification

| Severity | Icon | Meaning | Must Fix? |
|----------|------|---------|-----------|
| **CRITICAL** | 🔴 | Will cause implementation failure, data loss, security breach, or fundamental design flaw | YES — blocks execution |
| **MAJOR** | 🟠 | Will cause significant rework, incorrect behavior, user-facing bugs, or architectural problems | YES — strongly recommended |
| **MINOR** | 🟡 | Will cause friction, tech debt, minor inconsistencies, or suboptimal patterns | Recommended but not blocking |
| **OBSERVATION** | 🔵 | Suggestion for improvement, style preference, or optimization opportunity — not a defect | Optional |

#### Finding Template

For each finding, present:

```markdown
### PF-[NNN]: [Finding Title] [severity-icon] [SEVERITY]

**Dimension:** [Which of the 12 dimensions]
**Location:** [File path + section/line reference]
**The Problem:** [Clear, specific description of what's wrong and WHY it matters]

**Options:**

| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A | [Description] | [Pros] | [Cons] |
| B | [Description] | [Pros] | [Cons] |
| C | [Description] | [Pros] | [Cons] |

**🎯 Recommendation:** Option [X] — [concise rationale]

**User Decision:** ⏳ Pending
```

**Rules for findings:**

- **Every finding MUST have options.** Even if one option is obviously correct, present at least 2 options so the user makes a conscious choice.
- **Every finding MUST have a recommendation.** The agent analyzes and recommends — the user decides.
- **Recommendations MUST include rationale.** Never just say "Option B is better" — explain WHY.
- **Findings are numbered sequentially** — `PF-001`, `PF-002`, etc. Numbers never reuse across iterations.
- **Location must be specific** — not "somewhere in the plan" but "plans/my-feature/03-api-design.md, section 'Error Handling'"

#### Report Header Template

```markdown
## Preflight Report: [Artifact Name]

> **Status**: ❌ REVIEW IN PROGRESS — [X] findings ([C] 🔴, [M] 🟠, [m] 🟡, [O] 🔵)
> **Iteration**: [N] (first scan / re-scan after fixes)
> **Artifact**: [type] at [path]
> **Last Updated**: [Date]

### Summary by Dimension

| # | Dimension | Findings | Highest Severity |
|---|-----------|----------|-----------------|
| 1 | Ambiguities | [count] | [icon] |
| 2 | Implicit Assumptions | [count] | [icon] |
| ... | ... | ... | ... |
| 12 | Consistency | [count] | [icon] |

### Summary by Severity

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 CRITICAL | [N] | [all resolved? / X pending] |
| 🟠 MAJOR | [N] | [all resolved? / X pending] |
| 🟡 MINOR | [N] | [all resolved? / X pending] |
| 🔵 OBSERVATION | [N] | [all resolved? / X pending] |

---

[Individual findings follow]
```

### Step 4: Present Findings and Collect Decisions

After compiling the report:

1. **Present findings grouped by severity** — 🔴 CRITICAL first, then 🟠 MAJOR, then 🟡 MINOR, then 🔵 OBSERVATION
2. **Walk through each finding one at a time** — present the problem, options, and recommendation
3. **Wait for the user's decision** on each finding before proceeding to the next
4. **Record the user's decision** in the finding: `**User Decision:** [their choice]`

**Batch presentation rules:**

- If there are **≤ 5 findings**: Present all at once, let the user respond to each
- If there are **6-15 findings**: Present by severity group (all criticals, then all majors, etc.)
- If there are **> 15 findings**: Present in batches of 5-8, grouped by severity, wait for confirmation between batches

**Agent behavior during resolution:**

| User Says | Agent Response |
|---|---|
| "Fix it per your recommendation" | Record as `✅ Resolved — User accepted recommendation: [Option X]`. Valid resolution. |
| "Go with Option A" | Record as `✅ Resolved — User chose Option A`. |
| "This isn't actually an issue" | Record as `✅ Dismissed — User: "[their reasoning]"`. Valid — only the user can dismiss findings. |
| "I'll fix this later" | Ask: "Can I record this as a known accepted risk? It won't block the pass but will be noted in the report." If yes, record as `⚠️ Accepted Risk — User deferred: "[reason]"`. |
| "You decide" | "I've given my recommendation above. Can you confirm you'd like to go with Option [X]?" — user MUST explicitly confirm. |

### Step 5: Determine Pass/Fail

After all findings have been addressed, evaluate the result:

#### Pass Tiers

| Tier | Criteria | Report Header |
|------|----------|---------------|
| **✅ PASSED — Clean** | Zero findings across all 12 dimensions | `✅ PREFLIGHT PASSED — clean scan, 0 findings` |
| **✅ PASSED** | All 🔴/🟠 resolved. Zero 🟡/🔵 remaining. | `✅ PREFLIGHT PASSED — all [X] findings resolved` |
| **✅ PASSED WITH NOTES** | All 🔴/🟠 resolved. Some 🟡/🔵 explicitly accepted by user. | `✅ PREFLIGHT PASSED WITH NOTES — [X] findings resolved, [Y] minor/observations accepted` |
| **❌ BLOCKED** | Any 🔴/🟠 still unresolved | `❌ PREFLIGHT BLOCKED — [X] critical/major findings unresolved` |

**A clean pass on the first scan is cause for celebration, not suspicion.** If the artifact genuinely has no issues, the agent reports `✅ PASSED — Clean` and does NOT invent findings to justify its existence.

### Step 6: Apply Fixes (If Requested)

After all decisions are collected, the user may ask the agent to apply the fixes:

- **"Apply all fixes"** — Agent modifies the artifact documents per the resolved findings
- **"Apply fixes for PF-003 and PF-007"** — Agent applies specific fixes only
- **"I'll fix them myself"** — Agent does nothing, report serves as a checklist
- **"Apply fixes and re-scan"** — Agent applies fixes, then immediately runs another preflight iteration

The agent MUST NOT apply fixes without explicit user instruction. The preflight protocol is a **review** protocol, not a **modification** protocol. Finding issues and fixing issues are separate steps.

---

## **Iterative Re-scanning**

The preflight protocol is designed to be run **multiple times** on the same artifact. Each run is an **iteration**.

### How Iterations Work

1. **Iteration 1**: Full 12-dimension scan of the original artifact
2. **Fixes applied**: User resolves findings (either manually or via "apply fixes")
3. **Iteration 2+**: Re-scan with focus on:
   - **Verify fixes** — Confirm each resolved finding is actually fixed
   - **Regression check** — Ensure fixes didn't introduce new issues
   - **Fresh scan** — Re-examine all 12 dimensions (fixes may have shifted context)

### Re-scan Numbering

Findings from re-scans continue the sequential numbering from the previous iteration. If Iteration 1 ended at PF-012, Iteration 2 starts at PF-013. This prevents confusion about which findings are from which scan.

### Re-scan Report Header

```markdown
## Preflight Report: [Artifact Name] — Iteration [N]

> **Status**: [status]
> **Previous Iteration**: [X] findings — [all resolved / Y carried forward]
> **This Iteration**: [Z] new findings
> **Carried Forward**: [list of PF-### still open from previous iterations]
```

### Convergence

The iterative loop continues until one of:

- ✅ **Clean pass** — Zero findings (or only accepted 🟡/🔵 notes)
- 🛑 **User stops** — "Good enough, let's proceed" (agent notes this in the report)
- ⚠️ **Diminishing returns** — Agent observes only 🔵 observations remain and suggests concluding

---

## **Report Persistence**

The Preflight Report is saved as a permanent file alongside the artifact:

| Artifact Type | Report Location |
|---|---|
| Requirements | `requirements/00-preflight-report.md` |
| Implementation Plan | `plans/[feature-name]/00-preflight-report.md` |
| Ad-hoc | `[artifact-directory]/preflight-report.md` |

**Relationship to the Ambiguity Register:**

The Preflight Report and the Ambiguity Register are **separate documents** that serve different purposes:

| Document | Created By | Purpose | Contains |
|----------|-----------|---------|----------|
| **Ambiguity Register** (`00-ambiguity-register.md`) | `make_plan` / `make_requirements` | Track decisions made DURING creation | User decisions on design choices |
| **Preflight Report** (`00-preflight-report.md`) | `preflight` | Track issues found DURING review | Post-creation defects, gaps, and their resolutions |

When a preflight finding relates to an existing Ambiguity Register entry, cross-reference it:

```markdown
**Related:** AR #7 decided on JWT auth, but this finding identifies a gap
in the token refresh flow that AR #7 didn't cover.
```

---

## **Session Management**

### Progress Persistence

If context window approaches 90% during a preflight session:

1. **Save all progress** to a `_preflight_notes.md` file in the artifact directory
2. Include: completed dimensions, findings so far, pending dimensions, user decisions collected
3. Note which dimension/finding to resume from
4. Run `/compact`

### Resuming

When the user types `preflight --continue`:

1. Read `_preflight_notes.md`
2. Summarize where you left off: "Completed dimensions 1-7, found PF-001 through PF-009. Resuming from dimension 8 (Security Blind Spots)."
3. Continue from the next unscanned dimension or unresolved finding

---

## **Integration with Other Protocols**

### With `make_requirements`

Run `preflight requirements` after `make_requirements` completes:

- Catches issues that slipped through the Phase 2B Zero-Ambiguity Gate
- Provides a fresh-eyes review of the complete requirements set
- Findings may reference AR entries where decisions need revisiting

### With `make_plan`

Run `preflight [feature-name]` after `make_plan` completes:

- Catches issues that slipped through the Phase 1C Zero-Ambiguity Gate
- Reviews the plan documents as a cohesive whole (the gate reviews during authoring)
- Especially valuable for large plans where document interactions create emergent issues

### With `exec_plan`

When `exec_plan` starts and no `00-preflight-report.md` exists:

- The agent MAY note: *"No preflight report found. Consider running `preflight [feature-name]` before execution."*
- This is a **soft suggestion**, NOT a hard gate — execution proceeds normally
- The user can always run `preflight` mid-execution on specific phases

### With `grill_me`

`grill_me` and `preflight` are complementary but different:

| Protocol | Target | Direction | When |
|----------|--------|-----------|------|
| `grill_me` | The user's intent | AI interrogates the USER | Before creation |
| `preflight` | The created artifact | AI audits the DOCUMENT | After creation |

A complete workflow: `grill_me` → `make_requirements` → `preflight requirements` → `make_plan` → `preflight [feature]` → `exec_plan`

### Standalone

When `preflight` is used without a follow-up protocol:

1. Complete the full scan and resolution
2. Present the final report status
3. Ask: *"Preflight complete. What would you like to do next? I can apply fixes, create a plan (`make_plan`), start execution (`exec_plan`), or we can review specific findings in more detail."*

---

## **Agent Behavior Rules**

### Rule 1: Be Adversarial, Not Adversarial

Hunt for issues aggressively, but present them professionally. You're a code reviewer, not a critic. Every finding should feel helpful, not hostile.

### Rule 2: Specificity Over Volume

One well-described finding with a precise location and clear options is worth more than ten vague "this might be an issue" observations. Never pad the report.

### Rule 3: Don't Invent Problems

If the artifact is genuinely solid, say so. A clean pass is a valid outcome. Never fabricate findings to justify the review. The value of preflight is trust — if it says "clean," the user can trust that.

### Rule 4: Options Must Be Real

Every option in a finding must be a genuinely viable path. Don't include a strawman option just to make your recommendation look better. If there's truly only one viable option, explain why the alternatives don't work and present it as a confirmation rather than a choice.

### Rule 5: Respect Previous Decisions

If the Ambiguity Register contains a user decision on a topic, the preflight may NOT re-litigate that decision unless there is new information that invalidates it. Reference the AR entry and explain what changed.

### Rule 6: Cross-Document Awareness

Many issues only become visible when reading multiple documents together. A requirement that seems fine in isolation may contradict another requirement, or a plan phase may depend on work not scheduled until a later phase. Always think about the artifact as a connected whole.

### Rule 7: Calibrate Severity Honestly

- 🔴 CRITICAL means "if we proceed, something will definitely break or be seriously wrong"
- 🟠 MAJOR means "this will likely cause significant problems or rework"
- 🟡 MINOR means "this is a real issue but won't derail the project"
- 🔵 OBSERVATION means "this is a suggestion, not a defect"

Do NOT inflate severity to get attention. Do NOT deflate severity to avoid conflict. Be honest.

---

## **Cross-References**

When conducting a preflight review:

- ✅ Reference **make_plan.md** for plan document structure and conventions
- ✅ Reference **requirements.md** for requirements document structure and conventions
- ✅ Reference **code.md** for coding standards that plans should target
- ✅ Reference **testing.md** for testing standards that plans/requirements should address
- ✅ Reference **agents.md** for context window management during long reviews
- ✅ Reference **grill_me.md** if pre-creation disambiguation was done
- ✅ Read **`.clinerules/project.md`** for project-specific constraints (if it exists)

---

## **Summary**

| Trigger | Action |
|---------|--------|
| `preflight requirements` | Full audit of all requirement documents |
| `preflight requirements RD-03` | Targeted audit of a specific requirement document |
| `preflight [feature-name]` | Full audit of all plan documents for a feature |
| `preflight [feature-name] 03-api-design` | Targeted audit of a specific plan document |
| `preflight [file-or-directory]` | Ad-hoc audit of any file or directory |
| `preflight --continue` | Resume an interrupted preflight session |

**Typical Session Flow:**
```
preflight [artifact] → load & understand → 12-dimension scan → compile report →
  present findings with options → collect user decisions → determine pass/fail →
  (optional) apply fixes → (optional) re-scan → clean pass
```

**Output:** A preflight report with all findings, options analysis, recommendations, user decisions, and final pass/fail status — saved as a permanent audit trail alongside the artifact.
