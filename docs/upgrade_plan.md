# Plan & Requirements Upgrade Protocol

**Rule ID:** `upgrade_plan`
**Category:** Workflow
**Description:** Protocol for upgrading outdated plans and requirements to current standards (upgrade_plan, upgrade_requirements).
**Related Rules:** `make_plan`, `requirements`, `retro_requirements`, `agents`, `code`, `testing`

---

## **TRIGGER KEYWORD: `upgrade_plan [feature-name]`**

When the user types "upgrade_plan [feature-name]", execute the upgrade protocol below to bring an existing implementation plan (in `plans/[feature-name]/`) up to current CodeOps standards.

## **TRIGGER KEYWORD: `upgrade_requirements`**

When the user types "upgrade_requirements", execute the requirements upgrade protocol below to bring an existing requirements set (in `requirements/`) up to current CodeOps standards.

---

## **Purpose**

Plans and requirements are living documents. As CodeOps rules evolve — adding new sections, templates, checklists, or conventions — previously created plans and requirements may become outdated. This protocol provides a systematic way to:

1. **Detect** whether a plan or requirements set is outdated
2. **Assess** what gaps exist against current standards
3. **Upgrade** documents to current standards while preserving all user-authored content
4. **Verify** the upgrade was applied correctly

---

## **Version Detection**

Both triggers begin with version detection:

1. Read the plan's `00-index.md` (or `99-execution-plan.md`) / requirements `README.md`
2. Look for `> **CodeOps Version**: X.Y.Z` in the document header
3. Compare against the current codeops-mcp version (from `package.json` or MCP server metadata)
4. Classify:

| Condition | Classification | Action |
|-----------|---------------|--------|
| No version stamp found | Pre-versioning artifact | Full upgrade recommended — artifact predates version stamping |
| Version matches current | Plan/requirements are current | Report "No upgrade needed" — documents match current standards |
| Version differs from current | Outdated artifact | Upgrade recommended — re-evaluate against current rules |

---

## **Plan Upgrade Protocol (`upgrade_plan [feature-name]`)**

### Phase 1: Assessment

1. **Locate plan directory**: Read all documents in `plans/[feature-name]/`
2. **Detect version stamp**: Check `00-index.md` and `99-execution-plan.md` for `> **CodeOps Version**: X.Y.Z`
3. **Load current rules**: Read the current `make_plan.md` protocol via `get_rule("make_plan")`
4. **Generate gap analysis**: Compare each plan document against current templates and checklists

#### Error Conditions

| Error | Action |
|-------|--------|
| `plans/[feature-name]/` doesn't exist | **STOP** — suggest `make_plan` instead |
| Directory is empty or has no `.md` files | **STOP** — suggest `make_plan` instead |
| Plan is already at current version | Report "Plan is current, no upgrade needed" |

### Phase 2: Upgrade Report

Present findings to the user **before making any changes**:

```markdown
## Upgrade Report: [feature-name]

**Current Version:** [version stamp or "none (pre-versioning)"]
**Target Version:** [current codeops-mcp version]

### Changes Required

#### Will Be Added (missing sections/content):
- [ ] [Section/content that will be added]

#### Will Be Updated (structural changes):
- [ ] [Template/format changes]

#### Will Be Preserved (user content — no changes):
- [ ] [User-authored content that stays unchanged]

### Proceed with upgrade?
```

Use `ask_followup_question` with options:
1. **"Yes, apply all upgrades"** — Proceed to Phase 3
2. **"Show me the details first"** — Display side-by-side comparison of changes
3. **"No, keep as-is"** — Abort upgrade

### Phase 2B: Content Quality Gate — 🚨 NON-NEGOTIABLE HARD GATE 🚨

**Structural upgrades (Phase 3) are BLOCKED until this gate passes.** The purpose of this gate is to ensure upgraded plans don't just *look* current — they *are* current in quality. A plan with modern formatting but vague content is still a bad plan.

#### Why This Gate Exists

Older plans were often created without the Zero-Ambiguity Gate. They may contain vague decisions, unstated assumptions, undefined edge cases, missing error handling, and AI-guessed specifications. Upgrading the format without fixing the content produces a *polished but hollow* plan. This gate catches and resolves all content gaps.

#### Content Scanning Protocol

The agent MUST systematically scan ALL existing plan documents for content gaps across **all 12 ambiguity categories**:

| Category | What to Scan For in Existing Plans |
|----------|-----------------------------------|
| **Feature gaps** | Features mentioned but not fully specified, incomplete component specs, undefined workflows |
| **Behavioral gaps** | Missing "what happens when..." scenarios, undefined error handling, unspecified state transitions |
| **Scope ambiguities** | Vague scope boundaries, items that could be interpreted multiple ways, undefined "out of scope" |
| **Technical unknowns** | Architecture decisions stated without rationale, unresolved implementation approaches |
| **Edge cases** | Missing boundary conditions, undefined failure modes, unaddressed concurrent access scenarios |
| **Integration points** | Unclear interfaces between components, undefined API contracts, missing data flow specs |
| **Data & state questions** | Undefined data models, missing validation rules, unspecified formats |
| **Security & compliance** | Missing security section, unaddressed threat vectors, undefined auth flows |
| **Non-functional gaps** | Missing performance targets, undefined scalability approach |
| **UX & presentation** | Undefined user-facing text, missing error messages, unspecified display formats |
| **Stakeholder conflicts** | Competing needs between user types, unresolved priority disputes |
| **Naming & terminology** | Inconsistent naming, undefined terms, ambiguous labels |

**Additionally, scan for vague language patterns — these are red flags for hidden ambiguity:**

```
Vague language to flag: "TBD", "to be determined", "something like", "we could",
"probably", "might", "maybe", "a reasonable approach", "as needed", "if applicable",
"similar to", "standard approach", "best practices", "etc.", "and so on"
```

Every instance of vague language MUST be flagged in the register and resolved with the user.

#### Ambiguity Register Handling

| Condition | Action |
|-----------|--------|
| `00-ambiguity-register.md` exists | **Append** new findings with `(upgrade)` tag in the Category column. Continue numbering from the last AR #. |
| `00-ambiguity-register.md` does NOT exist | **Create** it. This plan predates the Zero-Ambiguity Gate — all findings go into a fresh register. |

Register entries from the upgrade are tagged to distinguish them from original planning decisions:

```markdown
| 15 | Behavioral (upgrade) | Error handling for [X] was undefined in original plan | [Option A / B / C] | [User's answer] | ✅ Resolved |
```

#### Gate Enforcement Rules

**🚫 ABSOLUTELY PROHIBITED while this gate is blocked:**

- ❌ Proceed to Phase 3 (structural upgrades)
- ❌ Update version stamps
- ❌ Modify any plan document content
- ❌ Accept vague language as "good enough"
- ❌ Use phrases like "the existing approach seems reasonable"

**✅ REQUIRED — The gate opens ONLY when ALL of these conditions are met:**

1. ✅ Every content gap found has been added to the Ambiguity Register
2. ✅ Every register entry has Status = "✅ Resolved" with the user's explicit decision
3. ✅ The user has reviewed and confirmed the complete register (for >15 items, present in batches by category)
4. ✅ Zero vague language patterns remain unresolved
5. ✅ Zero deferred items — the user must decide NOW (no-deferral, no-delegation policy — see `make_plan.md` Phase 1C)

#### Content Quality Register Template

```markdown
## Content Quality Upgrade: [Feature Name]

> **Status**: ❌ GATE BLOCKED — [X] content gaps found
> *(When all resolved, change to: ✅ GATE PASSED — all [X] content gaps resolved)*
> **Last Updated**: [Date]
> **Upgrade From**: [old version or "pre-versioning"]
> **Upgrade To**: [current version]

| # | Category | Gap / Ambiguity Found | Source Document | Options Presented | User Decision | Status |
|---|----------|-----------------------|-----------------|-------------------|---------------|--------|
| 1 | Behavioral (upgrade) | [Gap found in existing plan] | `03-component.md` | [Option A / B] | [User's answer] | ✅ Resolved |
| 2 | Security (upgrade) | [Missing security consideration] | `01-requirements.md` | [Option A / B / C] | — | ❌ Open |
```

After the gate passes, Phase 3 applies structural upgrades AND incorporates the content fixes into the plan documents. Every resolved content gap must be written into the appropriate plan document with an `AR #` back-reference.

---

### Phase 3: Apply Upgrades

For each plan document, re-evaluate against current `make_plan.md` templates:

#### Re-evaluation Checklist

**`00-index.md`:**
- [ ] Version stamp present? → Add `> **CodeOps Version**: [current]` if missing
- [ ] Follows current index template structure?
- [ ] Navigation links to all plan documents?
- [ ] Document count and overview accurate?

**`00-ambiguity-register.md`:**
- [ ] Exists? → If not, created during Phase 2B
- [ ] All entries resolved with explicit user decisions?
- [ ] Upgrade entries tagged with `(upgrade)` in Category column?
- [ ] AR # back-references added to all plan documents for resolved content gaps?

**`01-requirements.md`:**
- [ ] Security requirements section present? (per `code.md` rules 32-34)
- [ ] Acceptance criteria for each requirement?
- [ ] Requirements numbered and categorized?
- [ ] All scope decisions have AR # back-references?
- [ ] No vague language remaining?

**`02-current-state.md` (if exists):**
- [ ] Gap analysis format follows current template?

**`03-XX` technical specification documents:**
- [ ] **Preserve user-authored technical decisions**
- [ ] Add missing structural sections (e.g., error handling table, testing requirements)
- [ ] Insert AR # back-references for content gaps resolved during Phase 2B
- [ ] No vague language remaining?

**`07-testing-strategy.md` (if exists):**
- [ ] Follows current testing standards from `testing.md`?
- [ ] Coverage goals table present?
- [ ] Test categories clearly defined?

**`99-execution-plan.md`:**
- [ ] Version stamp present? → Add `> **CodeOps Version**: [current]` if missing
- [ ] Commit mode flags documented? (`--ask-commit`, `--no-commit`, `--auto-commit`)
- [ ] Session protocol section present and current?
- [ ] Success criteria includes post-completion re-analysis step?
- [ ] Success criteria includes security hardening check?
- [ ] Success criteria includes dead code check?
- [ ] Success criteria includes zero-ambiguity verification?
- [ ] Techdocs update step present in success criteria?
- [ ] Dependencies section present?

**Cross-references (all documents):**
- [ ] References to current rule documents are up to date?
- [ ] No references to deprecated or renamed rules?

#### Content Preservation Rules

**🚨 CRITICAL: The upgrade MUST NOT destroy user work.**

| Content Type | Action |
|-------------|--------|
| Technical specifications (`03-XX` docs) | **Preserve verbatim** |
| Scope decisions | **Preserve verbatim** |
| Completed task checkboxes `[x]` | **Preserve** |
| Task descriptions and deliverables | **Preserve** |
| Custom notes and comments | **Preserve** |
| Version stamps | **Update** to current version |
| Template structural sections | **Update** if format changed |
| Missing protocol sections | **Add** new sections |
| Cross-references | **Update** to current rule names |
| Session protocol | **Update** to current format |

### Phase 4: Verification

After applying upgrades:

1. ✅ Confirm all documents updated
2. ✅ Verify no user content was lost (compare document count, task count, technical specs)
3. ✅ Verify version stamps updated to current version
4. ✅ Verify Ambiguity Register is complete and all entries resolved
5. ✅ Verify zero vague language remaining in all plan documents
6. ✅ Verify AR # back-references present for all content gaps resolved during upgrade
7. ✅ Present summary of changes to user

```markdown
## Upgrade Complete: [feature-name]

**Version:** [old] → [current]

### Structural Changes Applied:
- [Change 1]
- [Change 2]

### Content Quality Gaps Resolved: [X] items
- See `00-ambiguity-register.md` for full audit trail

### Documents Updated: X of Y
### User Content Preserved: ✅ All technical specs, task states, and custom content intact
### Ambiguity Register: ✅ All entries resolved — zero vague language remaining
```

---

## **Requirements Upgrade Protocol (`upgrade_requirements`)**

### Phase 1: Assessment

1. **Locate requirements directory**: Read all documents in `requirements/`
2. **Detect version stamps**: Check `README.md` and individual RD documents for `> **CodeOps Version**: X.Y.Z`
3. **Load current rules**: Read the current `requirements.md` protocol via `get_rule("requirements")`
4. **Generate gap analysis**: Compare each requirement document against current templates

#### Error Conditions

| Error | Action |
|-------|--------|
| `requirements/` doesn't exist | **STOP** — suggest `make_requirements` instead |
| Directory is empty or has no `.md` files | **STOP** — suggest `make_requirements` instead |
| Requirements are already at current version | Report "Requirements are current, no upgrade needed" |

### Phase 2: Upgrade Report

Same pattern as plan upgrade — present findings before making changes. Use `ask_followup_question` with the same three options.

### Phase 2B: Content Quality Gate — 🚨 NON-NEGOTIABLE HARD GATE 🚨

**Structural upgrades (Phase 3) are BLOCKED until this gate passes.** Same principle as the plan upgrade gate: requirements that look modern but contain vague content are still bad requirements.

#### Why This Gate Exists

Older requirements were often created without the Zero-Ambiguity Gate. They may contain vague feature descriptions, undefined edge cases, missing stakeholder considerations, ambiguous acceptance criteria, and AI-assumed specifications. Upgrading the format without fixing the content produces a *polished but hollow* requirements set.

#### Content Scanning Protocol

The agent MUST systematically scan ALL existing RD documents for content gaps across **all 12 ambiguity categories**:

| Category | What to Scan For in Existing Requirements |
|----------|------------------------------------------|
| **Feature gaps** | Features mentioned but not fully specified, unclear feature interactions, undefined workflows |
| **Scope ambiguities** | Vague MVP vs. future boundaries, conflicting stakeholder needs, unclear "out of scope" items |
| **Behavioral unknowns** | Undefined "what happens when..." scenarios, missing error states, unspecified state transitions |
| **Data model questions** | Undefined entity relationships, unclear ownership, missing validation rules, unspecified cardinality |
| **Technical unknowns** | Architecture decisions stated without rationale, unresolved integration approaches |
| **Edge cases** | Missing boundary conditions, undefined failure modes, unaddressed concurrent access scenarios |
| **Integration points** | Unclear external system interfaces, undefined API contracts, missing data flow specs |
| **Security & compliance** | Missing security section, unaddressed threat vectors, undefined auth models, regulatory gaps |
| **Non-functional gaps** | Missing performance targets, undefined scalability approach, unspecified availability |
| **UX & presentation** | Undefined user-facing text, missing error messages, unspecified display formats |
| **Stakeholder conflicts** | Competing needs between user types, unresolved priority disputes, unclear permission boundaries |
| **Naming & terminology** | Domain terms used inconsistently, undefined jargon, ambiguous labels |

**Additionally, scan for vague language patterns — same red flags as plan upgrade:**

```
Vague language to flag: "TBD", "to be determined", "something like", "we could",
"probably", "might", "maybe", "a reasonable approach", "as needed", "if applicable",
"similar to", "standard approach", "best practices", "etc.", "and so on"
```

#### Ambiguity Register Handling

| Condition | Action |
|-----------|--------|
| `requirements/00-ambiguity-register.md` exists | **Append** new findings with `(upgrade)` tag. Continue numbering from last AR #. |
| `requirements/00-ambiguity-register.md` does NOT exist | **Create** it. These requirements predate the Zero-Ambiguity Gate. |

#### Gate Enforcement Rules

Same enforcement as plan upgrade gate:

- 🚫 Phase 3 is BLOCKED until all content gaps resolved
- ✅ Every gap added to register, every entry resolved with user's explicit decision
- ✅ User reviewed and confirmed complete register
- ✅ Zero vague language patterns remain
- ✅ Zero deferred items (no-deferral, no-delegation — see `requirements.md` Phase 2B)

After the gate passes, Phase 3 applies structural upgrades AND incorporates content fixes. Every resolved gap is written into the appropriate RD with an `AR #` back-reference.

---

### Phase 3: Apply Upgrades

For each requirements document, re-evaluate against current `requirements.md` templates:

#### Re-evaluation Checklist

**`00-ambiguity-register.md`:**
- [ ] Exists? → If not, created during Phase 2B
- [ ] All entries resolved with explicit user decisions?
- [ ] Upgrade entries tagged with `(upgrade)` in Category column?
- [ ] AR # back-references added to all RD documents for resolved content gaps?

**`README.md`:**
- [ ] Version stamp present? → Add `> **CodeOps Version**: [current]` if missing
- [ ] Follows current README template?
- [ ] Dependency graph present and accurate?
- [ ] Domain glossary present and complete?
- [ ] Document index lists all RD documents?
- [ ] Ambiguity Register listed in document index?

**Individual RD documents (`RD-XXX-*.md`):**
- [ ] Version stamp present? → Add if missing
- [ ] Security considerations section present and complete? (per `code.md` rules 32-34)
- [ ] Acceptance criteria defined for each requirement?
- [ ] Dependencies on other RDs documented?
- [ ] Scope decisions have AR # back-references?
- [ ] Integration points section present?
- [ ] No vague language remaining?
- [ ] Priority and status fields present?
- [ ] Techdocs update section present?

**Cross-references:**
- [ ] References to current rule documents are up to date?

#### Content Preservation Rules

Same rules as plan upgrade:

| Content Type | Action |
|-------------|--------|
| Requirement descriptions and rationale | **Preserve verbatim** |
| Acceptance criteria (user-authored) | **Preserve verbatim** |
| Priority and status decisions | **Preserve** |
| Domain-specific notes | **Preserve** |
| Version stamps | **Update** to current version |
| Template structural sections | **Update** if format changed |
| Missing sections (security, techdocs) | **Add** new sections |
| Cross-references | **Update** to current rule names |
| Content gaps resolved in Phase 2B | **Insert** with AR # back-references |

### Phase 4: Verification

After applying upgrades:

1. ✅ Confirm all documents updated
2. ✅ Verify no user content was lost (compare document count, RD count, acceptance criteria)
3. ✅ Verify version stamps updated to current version
4. ✅ Verify Ambiguity Register is complete and all entries resolved
5. ✅ Verify zero vague language remaining in all RD documents
6. ✅ Verify AR # back-references present for all content gaps resolved during upgrade
7. ✅ Present summary of changes to user

---

## **Partial Upgrade Handling**

If a previous upgrade was interrupted or only partially applied:

1. **Detect partial state**: Some documents have current version stamp, others don't
2. **Resume from where it left off**: Only upgrade documents that still need updating
3. **Report**: Indicate which documents were already current and which were upgraded

---

## **Cross-References**

When upgrading plans and requirements:

- ✅ Follow **make_plan.md** for current plan template standards
- ✅ Follow **requirements.md** for current requirements template standards
- ✅ Follow **code.md** for coding standards referenced in plan checklists
- ✅ Follow **testing.md** for testing standards referenced in plan checklists
- ✅ Follow **techdocs.md** for technical documentation update requirements
- ✅ Follow **agents.md** for general AI agent behavior rules
- ✅ Follow **git-commands.md** for `gitcm`/`gitcmp` commit protocol
- ✅ Read **`.clinerules/project.md`** for project-specific commands and conventions

---

## **Summary**

| Trigger | Action |
|---------|--------|
| `upgrade_plan [feature-name]` | Upgrade an existing plan in `plans/[feature-name]/` to current standards |
| `upgrade_requirements` | Upgrade existing requirements in `requirements/` to current standards |

**Upgrade Flow:**
```
upgrade_plan [feature] → Assessment → Report → 🚨 Content Quality Gate → Apply → Verify
upgrade_requirements   → Assessment → Report → 🚨 Content Quality Gate → Apply → Verify
```

**Key Principles:**
- **Version-agnostic**: Full re-evaluation against current rules, not incremental patches
- **Content-first**: Content quality gate catches ambiguities, gaps, and oversights BEFORE structural upgrades
- **Non-destructive**: All user-authored content is preserved verbatim
- **Transparent**: Changes presented for approval before being applied
- **Resumable**: Partial upgrades can be detected and continued
- **Zero-ambiguity**: No vague language, no deferred decisions, no AI guesswork survives the upgrade
