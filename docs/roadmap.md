# Roadmap Keeper

**Rule ID:** `roadmap`
**Category:** Workflow
**Description:** Live roadmap tracking every RD/plan across a large feature-set through its lifecycle (make_roadmap, update_roadmap, review_roadmap, archive_roadmap).
**Related Rules:** `make_plan`, `requirements`, `preflight`, `agents`, `project-template`

---

# Roadmap Keeper

The **Roadmap Keeper** is a single, living document — `plans/00-roadmap.md` — that tracks an entire
large **feature-set** at a higher altitude than any individual execution plan. Where
`99-execution-plan.md` tracks the tasks *within one feature*, the roadmap tracks *every requirement
(RD) and plan* across the whole feature-set, and the lifecycle stage each one is in.

It is the user's **cross-session lifeline at the RD/plan altitude**: open it to see, at a glance, what
is done, what is in flight, what is blocked, and what is still in the backlog.

---

## **Project-Specific Configuration**

This file contains **universal rules** that work for any software project. For project-specific
settings, read `.clinerules/project.md` (build/test/verify commands, package manager, structure,
conventions). If `.clinerules/project.md` does not exist, detect settings from manifest files and use
sensible defaults.

---

## **TRIGGER KEYWORD: `make_roadmap`**

When the user types `make_roadmap`, **create** the roadmap at `plans/00-roadmap.md`.

1. **Ask once for the feature-set name** (used in the header and as the archive folder name — AR #16).
2. **Auto-populate from disk** (suggest, don't sweep — see "Auto-Population & RD↔Plan Linking"):
   - Seed one row per `requirements/RD-*.md` found.
   - For each `plans/*/99-execution-plan.md`, *suggest* a link + inferred stage, but only write the
     plan into the roadmap after the user confirms it belongs to this feature-set.
3. **If the roadmap already exists:** do NOT ask — sync it from disk state instead (ask-if-missing /
   sync-if-exists, AR #8).

---

## **TRIGGER KEYWORD: `update_roadmap`**

When the user types `update_roadmap`, **advance stages and sync** the roadmap to current disk state.

- Walk each row, re-infer its stage from disk (RD present, plan present, checklist completion), and
  update `Stage`, `Status`, and `Last Updated`.
- **If the roadmap is missing:** fall back to `make_roadmap` behavior — ask whether to create it, then
  create it (AR #17).

---

## **TRIGGER KEYWORD: `review_roadmap`**

When the user types `review_roadmap`, run a **health check** on the roadmap (read-only).

- Verify every RD row points at an existing `requirements/RD-*.md`.
- Verify every plan link points at an existing `plans/*/` folder.
- Flag rows whose on-disk stage disagrees with the recorded stage (drift).
- Flag `Blocked` rows whose blocking `DEF-n` sub-row is already `Done` (should be unblocked).
- **If the roadmap is missing:** return
  `**Error:** No roadmap found at plans/00-roadmap.md. Run make_roadmap first.` (AR #17).

---

## **TRIGGER KEYWORD: `archive_roadmap`**

When the user types `archive_roadmap`, **archive** the completed feature-set.

- Move the roadmap plus **only the RDs/plans actually listed as rows** into
  `plans/_archive/<feature-set>/` (the feature-set slug from the header — AR #11, #16).
- Never sweep every folder under `plans/` — membership is explicit (see PF-004 below).
- **If the roadmap is missing:** return
  `**Error:** No roadmap found at plans/00-roadmap.md. Run make_roadmap first.` (AR #17).

---

## **Relationship to Other Protocols**

The roadmap sits **above** the per-feature execution plan and is fed by the other workflow protocols:

| Altitude | Document | Tracks | Produced/updated by |
|----------|----------|--------|---------------------|
| Feature-set (high) | `plans/00-roadmap.md` | Every RD/plan + its lifecycle stage | `make_roadmap` / `update_roadmap` + stage hooks |
| Single feature (low) | `plans/[feature]/99-execution-plan.md` | Tasks within one feature | `make_plan` / `exec_plan` |

- **`make_requirements`** drafts RDs → roadmap rows move to `RD Drafted`.
- **`preflight`** passes → an RD row moves to `RD Preflighted`; a plan row to `Plan Preflighted`.
- **`make_plan`** produces a plan → the RD's row moves to `Plan Created` and the plan is linked.
- **`exec_plan`** runs → `Executing`; completes → `Done`.

The roadmap never replaces the execution plan; it indexes and summarizes across many of them.

---

## **The Lifecycle State Machine** (AR #5, #18)

```
⬜  Backlog          — RD identified but not yet drafted
✏️  RD Drafted       — RD document written
🔎  RD Preflighted   — RD passed preflight
📋  Plan Created     — make_plan produced a plan
🔬  Plan Preflighted — plan passed preflight
🔄  Executing        — exec_plan in progress
✅  Done             — plan fully executed
⛔  Blocked          — cannot proceed (waiting on a Deferred dependency)
⏸️  Deferred         — a discovered dependency pulled out as its own tracked item
```

**Linear happy path:**
`Backlog → RD Drafted → RD Preflighted → Plan Created → Plan Preflighted → Executing → Done`.

`Blocked` and `Deferred` are **orthogonal overlays** on top of the linear path — a row in any stage can
become `Blocked`, and any discovered dependency can be pulled out as a `Deferred` sub-row.

---

## **Stage Transition Map** (AR #15)

| Lifecycle event | Roadmap effect |
|-----------------|----------------|
| RD created (`make_requirements` / `add_requirement`) | Row → `RD Drafted` (ask-if-missing / sync-if-exists) |
| `preflight` pass on an RD | Row → `RD Preflighted` |
| `make_plan` produces a plan | Row → `Plan Created`, link the plan |
| `preflight` pass on a plan | Row → `Plan Preflighted` |
| `exec_plan` running | Row → `Executing` |
| `exec_plan` complete | Row → `Done` |
| Dependency discovered mid-preflight / mid-exec | Add `↳ DEF-n` sub-row; parent → `Blocked` |
| `DEF-n` reaches `Done` | Parent leaves `Blocked`, resumes its prior stage |

---

## **The `plans/00-roadmap.md` Template**

````markdown
# Roadmap: [Feature-Set Name]

> **Feature-Set**: [Feature-Set Name]
> **Status**: In Progress
> **Created**: [YYYY-MM-DD]
> **Last Updated**: [YYYY-MM-DD HH:MM]
> **Progress**: [Done RDs] / [Total RDs] ([Z]%)
> **CodeOps Version**: [Current codeops-mcp version from package.json]

## Legend

⬜ Backlog · ✏️ RD Drafted · 🔎 RD Preflighted · 📋 Plan Created · 🔬 Plan Preflighted · 🔄 Executing · ✅ Done · ⛔ Blocked · ⏸️ Deferred

## Tracker

| ID | Title | RD | Plan | Stage | Status | Last Updated | Notes / Blocker |
|----|-------|----|------|-------|--------|--------------|-----------------|
| RD-01 | [Title] | [link] | [link] | Done | ✅ | [date] | — |
| RD-02 | [Title] | [link] | [link] | Executing | 🔄 | [date] | — |
| RD-03 | [Title] | [link] | — | Blocked | ⛔ | [date] | waiting on DEF-1 |
| ↳ DEF-1 | [Discovered dependency] | — | [link] | Plan Created | 📋 | [date] | blocks RD-03 |
| RD-04 | [Title] | — | — | Backlog | ⬜ | [date] | — |

## Notes

[Free-form running log of significant transitions, detours, and decisions.]
````

---

## **Deferred & Blocked Handling** (AR #7)

When a blocking dependency is discovered mid-preflight or mid-execution:

1. Add a **nested `↳ DEF-n` sub-row** directly beneath the affected parent row, visually tied to it.
2. Set the **parent row to `Blocked`** with a `Notes / Blocker` entry naming the `DEF-n` it waits on.
3. Track the `DEF-n` sub-row through its own lifecycle stages like any other item.
4. When `DEF-n` reaches `Done`, the parent **leaves `Blocked`** and resumes its prior stage.

`Deferred` work is never hidden in a separate section — it stays nested under the item it blocks so the
dependency relationship is obvious at a glance.

---

## **Real-Time Update Mandate**

The roadmap mirrors the execution-plan mandate from `make_plan.md`:

- The roadmap is updated **immediately** on each stage transition — **BEFORE** verification, commit, or
  the next action.
- **Update order:** `complete the stage transition → update plans/00-roadmap.md → proceed`.
- On each transition, update the row's `Stage`, `Status`, and `Last Updated`, and the header
  `Progress` counter and `Last Updated`.
- **Rationale — crash resilience:** AI sessions can crash or hit context limits at any moment. If the
  roadmap is stale, the user has no cross-session view of what was accomplished at the RD/plan altitude.
  The roadmap must always reflect reality.

---

## **Ask-if-Missing / Sync-if-Exists Rule** (AR #8, #17)

The roadmap is **never auto-created silently**:

- **When it is MISSING:** ask the user whether to create it (`make_roadmap`). Never fabricate one
  without consent.
- **When it EXISTS:** always sync it from disk state automatically — never ask, never prompt. Stage
  hooks fire silently.

This keeps the roadmap opt-in to create, but always-fresh once it exists.

---

## **`make_roadmap` Auto-Population & RD↔Plan Linking** (AR #19, PF-002, PF-004)

`plans/00-roadmap.md` must define **how rows are populated and linked**, because plan folders are named
by feature (e.g., `plans/roadmap-keeper/`) and carry **no encoded RD id**. The repository can also hold
multiple unrelated plans at once (e.g., `docs-quality-fixes/`, `upgrade-protocol/`), so "everything
under `plans/`" is **NOT** a valid membership rule.

**Deterministic linking rule:**

- Every plan declares the requirement it implements as an `> **Implements**: RD-NN` line in its
  `00-index.md`. The `make_plan` `Plan Created` hook reads this line and links the plan to the matching
  RD row in the roadmap.
- A plan with **no declared RD** is linked only when the user explicitly states which RD (or `DEF-n`)
  it belongs to.

**Auto-population (suggest, don't sweep):**

- `make_roadmap` seeds one row per `requirements/RD-*.md` it finds.
- For each `plans/*/99-execution-plan.md`, it **suggests** a link plus an inferred stage (from
  checklist completion) but only writes the plan into the roadmap **after the user confirms** the plan
  belongs to this feature-set. Unrelated plans are never silently swept in.

**Membership drives archiving:** `archive_roadmap` moves only the RDs/plans that are actually listed as
rows in the roadmap (plus the roadmap itself) into `plans/_archive/<feature-set>/` — never every folder
under `plans/`.

---

## **`review_roadmap` Checks**

The health check verifies:

- Every RD row references an existing `requirements/RD-*.md` file.
- Every plan link references an existing `plans/*/` folder.
- The recorded `Stage` matches the on-disk reality (no drift between the table and the files).
- Every `Blocked` row has a live `DEF-n` sub-row; if the `DEF-n` is already `Done`, flag the parent as
  ready to unblock.
- The header `Progress` counter matches the number of `Done` rows.

---

## **`archive_roadmap` Procedure** (AR #11, #16)

1. Read the feature-set slug from the roadmap header.
2. Create `plans/_archive/<feature-set>/`.
3. Move into it: the roadmap itself, plus **only** the RD documents and plan folders that appear as
   rows in the roadmap.
4. Leave all other `requirements/` and `plans/` content untouched.
5. A fresh roadmap can then be created for the next feature-set.

---

## **Worked Example**

```markdown
# Roadmap: Billing Platform

> **Feature-Set**: Billing Platform
> **Status**: In Progress
> **Created**: 2026-05-01
> **Last Updated**: 2026-05-14 16:20
> **Progress**: 1 / 4 (25%)
> **CodeOps Version**: 1.12.0

## Legend

⬜ Backlog · ✏️ RD Drafted · 🔎 RD Preflighted · 📋 Plan Created · 🔬 Plan Preflighted · 🔄 Executing · ✅ Done · ⛔ Blocked · ⏸️ Deferred

## Tracker

| ID | Title | RD | Plan | Stage | Status | Last Updated | Notes / Blocker |
|----|-------|----|------|-------|--------|--------------|-----------------|
| RD-01 | Invoicing core | [RD-01](../requirements/RD-01-invoicing.md) | [invoicing](invoicing/00-index.md) | Done | ✅ | 2026-05-10 | — |
| RD-02 | Payment gateway | [RD-02](../requirements/RD-02-payments.md) | — | Blocked | ⛔ | 2026-05-14 | waiting on DEF-1 |
| ↳ DEF-1 | Secrets vault integration | — | [vault](vault/00-index.md) | Executing | 🔄 | 2026-05-14 | blocks RD-02 |
| RD-03 | Dunning emails | [RD-03](../requirements/RD-03-dunning.md) | — | RD Preflighted | 🔎 | 2026-05-12 | — |
| RD-04 | Usage metering | — | — | Backlog | ⬜ | 2026-05-01 | — |

## Notes

- 2026-05-14: RD-02 blocked when payment gateway work hit a hard dependency on a secrets vault;
  pulled the vault work out as DEF-1 and set RD-02 to Blocked until DEF-1 reaches Done.
```

Here RD-02 is `Blocked` by the nested `DEF-1` sub-row; once DEF-1 reaches `Done`, RD-02 resumes from
its prior stage.

---

## **Error Handling**

| Error Case | Handling Strategy |
|------------|-------------------|
| `review_roadmap` / `archive_roadmap` when roadmap missing | Return `**Error:** No roadmap found at plans/00-roadmap.md. Run make_roadmap first.` |
| `update_roadmap` when roadmap missing | Fall back to `make_roadmap` (ask-if-missing, then create) |
| `make_roadmap` when roadmap already exists | Do NOT ask; sync from disk state |

---

## **Cross-References**

- See **agents.md** for the Roadmap source-of-truth rule (read-if-exists, update-first, blocks
  `attempt_completion`).
- See **make_plan.md** for the `Plan Created` / `Executing` / `Done` / `Blocked` + `DEF` stage hooks.
- See **requirements.md** for the `RD Drafted` stage hook on RD creation.
- See **preflight.md** for the `RD Preflighted` / `Plan Preflighted` stage hooks.
- See **`.clinerules/project.md`** for project-specific commands and conventions.
