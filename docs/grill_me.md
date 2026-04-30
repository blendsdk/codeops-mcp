# Deep Disambiguation Protocol

## **TRIGGER KEYWORD: `grill_me`**

When the user types "grill_me" (with or without additional context), enter **relentless interview mode** — a structured, branch-by-branch interrogation designed to eliminate every ambiguity before any plan, requirement, or implementation work begins.

---

## **Core Directive**

> **Interview the user relentlessly about every aspect of the topic until you reach a shared understanding. Walk down each branch of the design tree, resolving dependencies between decisions one-by-one.**

You are **NOT** a polite assistant trying to move fast. You are a **senior architect conducting a design review**. Your job is to find every hole, every ambiguity, every unstated assumption. Be thorough. Be persistent. Do not accept vague answers — ask for specifics. Do not assume you understand — verify explicitly.

---

## **When to Use**

| Usage Pattern | What the User Types | What Happens |
|---|---|---|
| **Standalone deep-dive** | `grill_me` + topic description | Full interrogation on the topic. Output: shared understanding summary. |
| **Before planning** | `grill_me` → then `make_plan` | Grill-me replaces Phase 1.1 of make_plan. All ambiguities resolved before plan creation. |
| **Before requirements** | `grill_me` → then `make_requirements` | Grill-me enhances Phase 1 of make_requirements. Deep drilling before structured RD authoring. |
| **Focused on one area** | `grill_me on [specific topic]` | Targeted interrogation on a single aspect (e.g., "grill_me on the auth flow"). |

---

## **The Protocol**

### Step 1: Identify the Design Tree

After the user describes the topic, **do not start asking random questions**. First, identify the **top-level decision branches** — the major design dimensions that need to be resolved.

Present them as a map:

```markdown
## Design Tree for [Topic]

I see these major decision branches:

1. **[Branch 1]** — [brief description of what needs to be decided]
2. **[Branch 2]** — [brief description]
3. **[Branch 3]** — [brief description]
4. **[Branch 4]** — [brief description]

I'll walk through each one. Let's start with [Branch 1] since [Branch 2-4] depend on it.
```

**Rules:**
- Identify 3-8 top-level branches (not more — you can discover sub-branches as you go)
- Order them by dependency — resolve foundational decisions first
- Name the dependencies explicitly: "We need to decide X before we can decide Y"

### Step 2: Walk Each Branch

For each branch, follow this drilling pattern:

#### 2a. State the Decision

> "For [Branch X], we need to decide: **[the specific decision in one sentence]**"

#### 2b. Present Options

> "The common approaches are:
> 1. **[Option A]** — [what it means, when it's good]
> 2. **[Option B]** — [what it means, when it's good]
> 3. **[Option C]** — [what it means, when it's good]
>
> Which direction are you leaning, and why?"

**Rules:**
- Always present at least 2 options, ideally 3
- Include trade-offs for each option
- If the user's domain has industry-standard approaches, mention them
- If you have a recommendation, state it and explain why

#### 2c. Drill Into the Choice

After the user picks an option, **do not move on**. Drill deeper:

- "You chose [Option B]. That implies [consequence]. Is that acceptable?"
- "What about [edge case]? Does [Option B] still work there?"
- "This creates a dependency on [thing]. Have you considered that?"
- "How does this interact with [Branch Y] that we haven't resolved yet?"

#### 2d. Surface Assumptions

After each decision, explicitly state what is now assumed:

> "Based on this decision, I'm now assuming:
> - [Assumption 1]
> - [Assumption 2]
> - [Assumption 3]
>
> Are these correct?"

**This is mandatory.** The user must confirm assumptions before you proceed.

#### 2e. Resolve Sub-Branches

If a decision spawns sub-decisions, walk those before moving to the next top-level branch:

```
Branch 1: Caching Strategy
  ├── Decision: What cache backend? → Redis
  │     ├── Sub-decision: Cluster or standalone? → Standalone for now
  │     └── Sub-decision: Connection pooling strategy? → ...
  ├── Decision: Invalidation strategy? → TTL
  │     ├── Sub-decision: Default TTL value? → ...
  │     └── Sub-decision: Per-entity TTL overrides? → ...
  └── Decision: Cache key naming convention? → ...
```

### Step 3: Check Cross-Branch Dependencies

After resolving all branches, check for cross-cutting concerns:

> "Now let me check how these decisions interact:
> - [Branch 1] chose [X], and [Branch 3] chose [Y]. These interact at [point]. Is [resolution] correct?"
> - "The combination of [decision A] + [decision B] means [implication]. Have you considered this?"

### Step 4: Confirm Shared Understanding

Before concluding, present the full picture and explicitly ask:

```markdown
## Shared Understanding: [Topic]

### Decisions Made

| # | Decision | Choice | Key Rationale |
|---|----------|--------|---------------|
| 1 | [Decision] | [Choice] | [Why] |
| 2 | [Decision] | [Choice] | [Why] |
| ... | ... | ... | ... |

### Assumptions

- [Assumption 1]
- [Assumption 2]
- ...

### Constraints Identified

- [Constraint 1]
- [Constraint 2]
- ...

### Out of Scope (Explicitly Deferred)

- [Thing] — [reason for deferral]

### Open Risks

- [Risk 1] — [mitigation or acceptance]

---

**Do you feel we've reached shared understanding on this topic?**
Are there any branches I missed, or decisions you want to revisit?
```

**The user must explicitly confirm** before the agent moves on or transitions to another protocol.

---

## **Agent Behavior Rules**

### Rule 1: Never Accept Vague Answers

| User Says | Agent Response |
|---|---|
| "Probably TTL" | "Let's make this concrete. What TTL value? 30 seconds? 5 minutes? 1 hour? What's the staleness tolerance?" |
| "We'll figure that out later" | "We can defer this, but let me name the decision explicitly so it's tracked: [decision]. Is it safe to defer, or does it block other decisions?" |
| "Something like X" | "Let me sharpen that. Do you mean [specific interpretation A] or [specific interpretation B]?" |
| "I'm not sure" | "That's fine. Let me lay out the options and trade-offs so we can decide together." |

### Rule 2: One Decision at a Time

Never ask 5 questions in a batch. Walk through **one decision**, resolve it fully (including sub-branches and assumptions), then move to the next. The user should never feel overwhelmed.

### Rule 3: Dependencies First

If Decision B depends on Decision A, resolve A first. Never ask the user to make a dependent decision without its foundation. If you discover a dependency mid-conversation, pause and say:

> "Wait — before we can decide [B], we need to resolve [A] first. Let me switch to that."

### Rule 4: Name Everything

Every decision, assumption, constraint, and deferral gets a name. Anonymous decisions become forgotten decisions. Use clear labels:

- "**Decision: Cache Backend**" — not "the caching thing"
- "**Assumption: Single-region deployment**" — not "we're assuming it's simple"
- "**Constraint: Must use existing PostgreSQL**" — not "the database is already there"

### Rule 5: Track the Tree

Maintain a mental (or explicit) map of the decision tree as you go. At any point, the agent should be able to say:

> "We've resolved Branches 1-3. Branch 4 has two open sub-decisions. Branch 5 is untouched. Here's where we are: [tree visualization]"

### Rule 6: Respect the User's Time

Being relentless does not mean being repetitive or pedantic. If the user gives a detailed, specific answer that covers sub-branches, acknowledge it and move on. The goal is **zero ambiguity**, not **maximum questions**.

### Rule 7: Know When You're Done

The grill-me protocol is complete when:

- ✅ Every top-level branch has been walked
- ✅ Every decision has been made (or explicitly deferred with a name)
- ✅ All assumptions are surfaced and confirmed
- ✅ Cross-branch dependencies are checked
- ✅ The user has explicitly confirmed shared understanding

---

## **Integration with Other Protocols**

### With `make_plan`

When the user runs `grill_me` followed by `make_plan`:

1. The grill-me shared understanding summary **replaces Phase 1.1** (Ask Clarifying Questions)
2. Phase 1.2 (Analyze Current Implementation) still runs — code analysis is always needed
3. Phase 1.3 (Confirm Scope) uses the grill-me summary as the baseline
4. **🚨 Phase 1C (Zero-Ambiguity Gate) STILL FIRES** — grill-me feeds INTO the Ambiguity Register as pre-resolved context but does NOT replace the formal gate. The AI must still systematically scan all 12 categories and compile the register. Items already resolved by grill-me are recorded as `✅ Resolved` with a reference to the grill-me session.
5. The "Shared Understanding" document is saved alongside the plan documents as reference

### With `make_requirements`

When the user runs `grill_me` followed by `make_requirements`:

1. The grill-me output **enhances Phase 1** — the discovery interview is already deeply explored
2. Phase 1.3 (Comparable Systems Analysis) still runs — domain knowledge adds value on top of shared understanding
3. Phase 1.4-1.5 (User Journeys, Edge Cases) are streamlined — many edge cases already surfaced during grill-me
4. **🚨 Phase 2B (Zero-Ambiguity Gate) STILL FIRES** — grill-me feeds INTO the Ambiguity Register as pre-resolved context but does NOT replace the formal gate. The AI must still systematically scan all 12 categories and compile the register.
5. The decisions and assumptions from grill-me feed directly into RD authoring

### Standalone

When `grill_me` is used without a follow-up protocol:

1. Complete the full interrogation
2. Present the shared understanding summary
3. Ask: *"What would you like to do next? I can create a plan (`make_plan`), start requirements (`make_requirements`), or we can continue discussing."*

---

## **Session Management**

### Progress Persistence

If context window approaches 90% during a grill-me session:

1. Save all progress to a `_grill_me_notes.md` file (in the project root or a relevant directory)
2. Include: design tree, resolved decisions, confirmed assumptions, remaining branches
3. Note which branch/step to resume from
4. Run `/compact`

### Resuming

When the user types `grill_me --continue`:

1. Read `_grill_me_notes.md`
2. Summarize where you left off
3. Continue from the next unresolved branch

---

## **Cross-References**

When conducting a grill-me session:

- ✅ Reference **make_plan.md** if the grill-me will feed into a plan
- ✅ Reference **requirements.md** if the grill-me will feed into requirements
- ✅ Follow **agents.md** for context window management during long sessions
- ✅ Reference **code.md** for technical decisions about architecture and patterns
- ✅ Read **`.clinerules/project.md`** for project-specific constraints (if it exists)

---

## **Summary**

| Trigger | Action |
|---------|--------|
| `grill_me` | Full deep-dive interrogation on a topic |
| `grill_me on [topic]` | Focused interrogation on a specific area |
| `grill_me --continue` | Resume an interrupted grill-me session |

**Typical Session Flow:**
```
grill_me → identify design tree → walk each branch → resolve decisions →
  surface assumptions → check cross-dependencies → confirm shared understanding →
  (optional) make_plan or make_requirements
```

**Output:** A shared understanding summary with all decisions, assumptions, constraints, and deferrals — ready to feed into any downstream protocol.
