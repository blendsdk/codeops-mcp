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

### Phase 3: Apply Upgrades

For each plan document, re-evaluate against current `make_plan.md` templates:

#### Re-evaluation Checklist

**`00-index.md`:**
- [ ] Version stamp present? → Add `> **CodeOps Version**: [current]` if missing
- [ ] Follows current index template structure?
- [ ] Navigation links to all plan documents?
- [ ] Document count and overview accurate?

**`01-requirements.md`:**
- [ ] Security requirements section present? (per `code.md` rules 32-34)
- [ ] Acceptance criteria for each requirement?
- [ ] Requirements numbered and categorized?

**`02-current-state.md` (if exists):**
- [ ] Gap analysis format follows current template?

**`03-XX` technical specification documents:**
- [ ] **Preserve verbatim** — these contain user-authored technical decisions
- [ ] Only add missing structural sections (e.g., error handling table, testing requirements)

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
4. ✅ Present summary of changes to user

```markdown
## Upgrade Complete: [feature-name]

**Version:** [old] → [current]

### Changes Applied:
- [Change 1]
- [Change 2]
- ...

### Documents Updated: X of Y
### User Content Preserved: ✅ All technical specs, task states, and custom content intact
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

### Phase 3: Apply Upgrades

For each requirements document, re-evaluate against current `requirements.md` templates:

#### Re-evaluation Checklist

**`README.md`:**
- [ ] Version stamp present? → Add `> **CodeOps Version**: [current]` if missing
- [ ] Follows current README template?
- [ ] Dependency graph present and accurate?
- [ ] Domain glossary present and complete?
- [ ] Document index lists all RD documents?

**Individual RD documents (`RD-XXX-*.md`):**
- [ ] Version stamp present? → Add if missing
- [ ] Security requirements addressed? (items 26-33 per `requirements.md`)
- [ ] Acceptance criteria defined for each requirement?
- [ ] Dependencies on other RDs documented?
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

### Phase 4: Verification

Same pattern as plan upgrade — confirm changes, verify preservation, present summary.

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
upgrade_plan [feature] → Assessment → Report → User Confirmation → Apply → Verify
```

**Key Principles:**
- **Version-agnostic**: Full re-evaluation against current rules, not incremental patches
- **Non-destructive**: All user-authored content is preserved verbatim
- **Transparent**: Changes presented for approval before being applied
- **Resumable**: Partial upgrades can be detected and continued
