# Requirements Gathering & Documentation

## **TRIGGER KEYWORD: `make_requirements`**

When the user types "make_requirements" (with or without additional context), execute the comprehensive requirements discovery and documentation workflow below. The goal is to transform a rough project idea into a structured, complete set of formal requirement documents.

## **TRIGGER KEYWORD: `add_requirement`**

When the user types "add_requirement", add a new requirement document to an existing `requirements/` set. Reads the current `requirements/README.md`, understands the dependency graph, and slots the new RD into the correct position.

## **TRIGGER KEYWORD: `review_requirements`**

When the user types "review_requirements", perform a health check on the existing requirements set — checking for gaps, inconsistencies, missing integration points, and scope creep. Produces a diagnostic report.

---

## **Relationship to `make_plan`**

This protocol is **independent from and upstream of** `make_plan`. The two protocols work together but neither requires the other:

| Workflow | When to Use |
|----------|-------------|
| `retro_requirements` → `make_requirements` → `make_plan` | Reverse-engineering an existing system for documentation, migration, or rebuild. |
| `make_requirements` → `make_plan` → `exec_plan` | Building a new system from scratch. Requirements first, then plan per requirement. |
| `make_plan` → `exec_plan` | Adding a feature to an existing codebase. Ad-hoc information gathering is sufficient. |
| `make_requirements` only | Designing a system without implementing yet. Requirements as documentation. |

When `make_plan` detects a `requirements/` directory with RD documents, it can offer to use one as input — but this is **optional**. `make_plan` always works standalone.

---

## **Core Principle: Proactive Domain Consultant**

The agent executing `make_requirements` is NOT a passive interviewer. It is a **domain-aware consultant** that:

1. **Absorbs** — Takes whatever the user provides (brain dump, bullet points, vague idea) as seed material
2. **Expands** — Draws on knowledge of comparable systems to suggest features the user hasn't considered
3. **Challenges** — Asks "what happens when..." scenarios to expose edge cases and hidden requirements
4. **Structures** — Decomposes the expanded scope into formal, numbered requirement documents
5. **Validates** — Cross-references all documents for gaps, inconsistencies, and missing concerns

The user's input is NEVER treated as the final requirements. The protocol's value is in **making incomplete ideas complete**.

---

## **Trigger Modes**

`make_requirements` accepts three input patterns:

### Mode 1: Brain Dump (Most Common)

The user provides a rough description alongside the trigger:

```
I want to build a university lab management SaaS. Here's what I'm thinking:
- Researchers can book lab rooms
- Ethics committee approves studies
- Participants sign up on a public page
- Built with Node, TypeScript, PostgreSQL

make_requirements
```

**Agent behavior:** Takes the brain dump as seed material. Recognizes it's incomplete. Enters the full discovery protocol.

### Mode 2: Bare Trigger

```
make_requirements
```

**Agent behavior:** Starts with the broadest question: "What do you want to build? Give me as much or as little as you have — a rough idea, some bullet points, a domain you're working in, or even just a problem you want to solve."

### Mode 3: Existing Notes / Reference

```
make_requirements

I have some notes in docs/project-ideas.md
```

**Agent behavior:** Reads the referenced files, extracts the seeds, and enters discovery with richer starting material.

---

## **Phase 1: Discovery & Domain Analysis**

This phase is a **multi-turn conversation**. The agent asks questions in batches, waits for answers, and iterates. It never tries to produce all requirements in one shot.

> **🚨 ZERO-AMBIGUITY RULE — ACTIVE FROM THE FIRST QUESTION 🚨**
>
> This rule applies to **ALL decisions without exception** — feature specifications, behavioral definitions, scope boundaries, edge case handling, technical choices, data models, naming conventions, document organization, wording, AND formatting. If the AI must choose between two or more options for ANYTHING, the user decides.
>
> Every question you ask MUST yield a **concrete, specific, unambiguous answer**. Do NOT accept vague responses. Do NOT fill gaps with your own assumptions. Do NOT infer intent. Do NOT proceed with "reasonable defaults" unless the user explicitly chose them. If the user's answer is unclear, ask again with sharper options. If the user says "I'm not sure," lay out the options with trade-offs and guide them to a decision — but the DECISION must be theirs, not yours. Throughout discovery, compile an **Ambiguity Register** tracking every gap and its resolution. See **Phase 2B: Zero-Ambiguity Gate** below for the formal enforcement mechanism.

### 1.1 Project Vision Interview

Start with broad understanding:

- **What is this project?** What problem does it solve? Who is it for?
- **What technology decisions are already made?** (language, framework, database, hosting)
- **What's the scale?** (number of users, data volume, deployment model)
- **Is there an existing system** this replaces or improves upon?
- **What's the timeline/urgency?** (affects MVP scoping)

### 1.2 Stakeholder Mapping

Before asking about features, identify ALL user types and stakeholders:

For each identified role, explore:
- What does this person need from the system?
- What's their daily workflow?
- What frustrates them about current solutions (if any)?
- What permissions should they have vs. not have?

**Template for presenting stakeholders:**

```markdown
## Identified Stakeholders

| # | Role | Description | Key Needs |
|---|------|-------------|-----------|
| 1 | [Role Name] | [Who they are] | [What they need] |
| 2 | [Role Name] | [Who they are] | [What they need] |

Does this list look complete? Are there other user types I'm missing?
```

### 1.3 Comparable Systems Analysis (The Secret Weapon)

**This is the most important sub-phase.** The agent MUST:

1. **Identify comparable systems** in the domain — name them explicitly
2. **Extract features** from those systems that are relevant to the user's project
3. **Present features as a selection table** — the user marks each as Want / Maybe / Skip

**Template for presenting domain suggestions:**

```markdown
## Features From Similar Systems

Based on your description, this project has similarities to [System A], [System B],
and [System C]. Here are features from those systems that might be relevant:

### Category: [Category Name]

| # | Feature | Description | Your Thoughts? |
|---|---------|-------------|----------------|
| X1 | **[Feature Name]** | [What it does and why it's valuable] | ☐ Want / ☐ Maybe / ☐ Skip |
| X2 | **[Feature Name]** | [What it does and why it's valuable] | ☐ Want / ☐ Maybe / ☐ Skip |
```

**Rules for comparable analysis:**
- Always name the comparable systems so the user can research them
- Group features by domain area, not by source system
- Include features the user did NOT mention — that's the whole point
- Don't overwhelm: 5-8 features per category, max 6-8 categories
- Include the rationale for why each feature might be relevant

### 1.4 User Journey Walkthroughs

For each key user type (from 1.2), walk through their complete journey as a narrative:

```
"A [Role] wants to [goal]. They start by [action]. The system shows [what].
They then [action]. At this point, they need to [requirement]. But wait —
what if [edge case]? That means we also need [discovered requirement]."
```

This technique surfaces requirements that fall between the cracks of isolated feature discussions. Present discovered requirements to the user for confirmation.

### 1.5 "What Happens When..." Scenarios

Proactively explore failure modes and edge cases:

```markdown
## Edge Case Scenarios

| # | Scenario | Question | Impact if Not Handled |
|---|----------|----------|----------------------|
| 1 | [What if X fails?] | [Specific question] | [Consequence] |
| 2 | [What if user does Y?] | [Specific question] | [Consequence] |
| 3 | [What if data is Z?] | [Specific question] | [Consequence] |
```

Common scenarios to explore:
- What happens when a key entity is deleted but has references?
- What happens when a user's role or access changes mid-workflow?
- What happens when the system is unavailable during a critical process?
- What happens when data volumes exceed initial expectations?
- What happens when users try to abuse or game the system?
- What happens when requirements conflict between user types?

### 1.6 Scope Confirmation

After all discovery is complete, present a summary for confirmation:

```markdown
## Scope Confirmation

**Project:** [Name]
**Type:** [SaaS / Internal Tool / Library / etc.]
**Tech Stack:** [Confirmed technologies]

**What's IN scope (confirmed):**
- [Feature/capability 1]
- [Feature/capability 2]
- ...

**What's MAYBE in scope (needs decision):**
- [Feature] — [open question]
- [Feature] — [depends on X]

**What's OUT of scope (explicitly excluded):**
- [Feature/capability] — [reason]

**Key Decisions Made:**
| Decision | Chosen | Rationale |
|----------|--------|-----------|
| [Decision] | [Choice] | [Why] |

**Open Questions (to resolve during RD authoring):**
1. [Question]
2. [Question]

Please confirm or adjust before I create the requirement documents.
```

---

## **Phase 2: Structuring**

### 2.1 Domain Glossary

Before writing any requirement documents, establish shared vocabulary:

```markdown
## Domain Glossary

| Term | Definition | Notes |
|------|-----------|-------|
| [Term] | [Precise definition as used in this project] | [Disambiguation if needed] |
```

**Rules:**
- Define every domain-specific term that could be ambiguous
- Note where your project's definition differs from common usage
- This glossary goes into the `requirements/README.md` and is referenced by all RDs

### 2.2 Decomposition into Requirement Documents

Break the confirmed scope into numbered RD documents. Follow these decomposition principles:

**Decomposition Heuristics:**
- **Infrastructure/Scaffolding** is always RD-01 (project setup, toolchain, Docker, CI)
- **Data Layer** comes early (database schema, migrations) — most features depend on it
- **Core Domain Modules** get one RD each (the main business entities and their CRUD/lifecycle)
- **Cross-cutting Concerns** get their own RDs (auth, RBAC, notifications, search, audit)
- **External Integrations** get their own RDs (OIDC, payment, email, file storage)
- **User-Facing Concerns** get their own RDs (public pages, dashboards, workflows)
- **Quality & Operations** are last (testing strategy, deployment, monitoring)
- **Non-functional requirements** get a dedicated RD

**Sizing Guidance:**
| Project Size | Typical RD Count | Example |
|---|---|---|
| Small (CLI tool, library) | 3-5 | Scaffolding, Core, API, Testing |
| Medium (API, single-domain app) | 6-10 | Scaffolding, DB, Auth, Domain×3, Testing, Deployment |
| Large (SaaS, multi-domain) | 10-20 | Scaffolding, DB, Auth, Domain×6, Cross-cutting×3, Quality×2 |

### 2.3 Dependency Graph

Map dependencies between RDs. Present as text-based tree and table:

```markdown
## Dependency Graph

| # | Document | Depends On |
|---|----------|------------|
| RD-01 | [Name] | — |
| RD-02 | [Name] | RD-01 |
| RD-03 | [Name] | RD-01, RD-02 |

## Visual

    RD-01 (Foundation)
      │
      ├── RD-02 (Data Layer)
      │     │
      │     ├── RD-03 (Core Module A)
      │     └── RD-04 (Core Module B)
      │
      └── RD-05 (Cross-cutting)
```

### 2.4 MVP vs. Full Vision Phasing

For each feature group, explicitly separate MVP from full product:

```markdown
## Implementation Phases

| Phase | RD Documents | Description | Priority |
|-------|-------------|-------------|----------|
| **A: MVP** | RD-01 → RD-04 | Core functionality, minimum viable product | Must Have |
| **B: Enhanced** | RD-05 → RD-08 | Important features, post-MVP | Should Have |
| **C: Full Product** | RD-09 → RD-12 | Nice-to-have, future iterations | Could Have |
```

### 2.5 Integration Map

If external integrations exist, document them:

```markdown
## External Integrations

| Integration | Protocol | Direction | RD Document |
|------------|----------|-----------|-------------|
| [System] | [REST/OIDC/SMTP/etc.] | [Inbound/Outbound/Both] | RD-XX |
```

---

## **Phase 2B: Zero-Ambiguity Gate — 🚨 NON-NEGOTIABLE HARD GATE 🚨**

**This gate MUST be passed before ANY requirement document (RD) is written. There are NO exceptions, NO overrides, and NO "good enough" thresholds. This is the most important quality gate in the entire requirements process.**

### Why This Gate Exists

Requirements built on ambiguity produce plans built on guesswork, which produce implementations built on assumptions. When the AI guesses, the user gets requirements they didn't specify, behaviors they didn't define, and scope they didn't approve. Every single item in every RD must trace back to an **explicit, user-confirmed decision**. If the AI cannot point to a specific user answer for any feature specification, behavioral definition, scope boundary, edge case handling, or technical choice — it has failed this gate.

### The Ambiguity Register

Before proceeding to Phase 3, the agent MUST compile and present an **Ambiguity Register** — a formal, numbered inventory of every identified gap, ambiguity, unstated assumption, undefined behavior, and open question discovered during Phases 1-2.

**The agent must systematically hunt for ambiguities across ALL of these categories:**

| Category | What to Look For |
|----------|-----------------|
| **Feature gaps** | Features mentioned but not fully specified, unclear feature interactions, undefined workflows |
| **Scope ambiguities** | Features that could go either way, unclear MVP vs. future boundaries, conflicting stakeholder needs |
| **Behavioral unknowns** | Undefined "what happens when..." scenarios, missing error states, unspecified state transitions |
| **Data model questions** | Undefined entity relationships, unclear ownership, missing validation rules, unspecified cardinality |
| **Technical unknowns** | Architecture or technology choices not yet decided, unresolved integration approaches |
| **Edge cases** | Boundary conditions, failure modes, concurrent access, empty/null states, data volume limits |
| **Integration points** | Unclear external system interfaces, undefined API contracts, missing data flow specifications |
| **Security & compliance** | Unaddressed threat vectors, undefined auth models, missing data protection decisions, regulatory gaps |
| **Non-functional gaps** | Missing performance targets, undefined scalability approach, unspecified availability requirements |
| **UX & presentation** | Undefined user-facing text, missing error messages, unspecified display formats, unclear navigation flows |
| **Stakeholder conflicts** | Competing needs between user types, unresolved priority disputes, unclear permission boundaries |
| **Naming & terminology** | Domain terms used inconsistently, undefined jargon, ambiguous labels |

**Ambiguity Register Template:**

```markdown
## Ambiguity Register: [Project Name] Requirements

> **Status**: ❌ GATE BLOCKED — [X] items unresolved
> *(When all resolved, change to: ✅ GATE PASSED — all [X] items resolved)*
> **Last Updated**: [Date]

| # | Category | Ambiguity / Gap | Options Presented | User Decision | Status |
|---|----------|----------------|-------------------|---------------|--------|
| 1 | Feature | [Specific ambiguity] | [Option A / Option B / Option C] | [User's answer] | ✅ Resolved |
| 2 | Scope | [Specific ambiguity] | [Option A / Option B] | — | ❌ Open |
| 3 | Data Model | [Specific ambiguity] | [Option A / Option B / Option C] | [User's answer] | ✅ Resolved |

### Resolution Notes

**AR-1:** [Expanded context for the decision if needed]
**AR-2:** [Pending — presented to user, awaiting answer]
```

### Gate Enforcement Rules

**🚫 ABSOLUTELY PROHIBITED — The agent MUST NOT do any of the following while the gate is blocked:**

- ❌ Create any requirement document (`RD-XX-*.md`)
- ❌ Write the `requirements/README.md`
- ❌ Define any requirement specification
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

### No-Deferral Policy

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

### Register Persistence

The Ambiguity Register is saved as a permanent file alongside the requirement documents:

- **Location:** `requirements/00-ambiguity-register.md`
- **Purpose:** Audit trail — every decision in every RD is traceable to this register
- **Survives crashes:** If the session crashes mid-authoring, the register persists on disk

### Traceability Requirement

Every decision in the final RD documents MUST include a back-reference to the Ambiguity Register entry that resolved it:

```markdown
> **Decision per AR #7:** User chose Option B — JWT-based authentication with 24-hour token expiry.
```

This creates an unbroken chain: **user question → user answer → register entry → RD document**.

**The ONLY items exempt from AR # back-references are:**
- **(a)** Universally obvious facts with exactly one possible interpretation (e.g., "TypeScript files use `.ts` extension")
- **(b)** Formatting choices with zero semantic impact (markdown syntax, whitespace, line breaks)

**When in doubt, it is NOT an exception — add it to the register.** The AI must NEVER classify a decision as "obvious" to avoid the register. If the AI hesitates even briefly about whether something is obvious, it goes in the register.

### Surface-During-Authoring Rule

Even after the gate passes, if the agent discovers **NEW ambiguities** while writing RD documents in Phase 3:

1. **STOP writing immediately** — do not finish the current paragraph, sentence, or bullet point
2. **Add** the new ambiguity to the Ambiguity Register with the next sequential number
3. **Present** it to the user with options and trade-offs
4. **Wait** for the user's explicit decision
5. **Record** the resolution in the register
6. **Only then** resume writing

This is NOT optional. The agent must NEVER "make a reasonable choice and move on." Every new ambiguity, no matter how small, goes through the register.

### Interaction with `grill_me`

Phase 2B fires **regardless** of how Phase 1 was conducted — including when `grill_me` was used before `make_requirements`. The grill-me shared understanding feeds INTO the register as pre-resolved context, but does NOT replace the formal gate. The AI must still systematically scan all 12 categories and compile the register. Many items may already be resolved thanks to grill-me — those get recorded as `✅ Resolved` with a note referencing the grill-me session.

### Interaction with `upgrade_requirements`

When requirements are upgraded via `upgrade_requirements`, the Zero-Ambiguity Gate applies to any **new decisions** introduced during the upgrade. Existing resolved decisions from the original register are preserved. Only new or changed items go through the register.

---

## **Phase 3: Authoring Requirement Documents**

### 3.1 Output Structure

Create all documents in the `requirements/` directory:

```
requirements/
├── 00-ambiguity-register.md    # Zero-Ambiguity Gate register (audit trail)
├── README.md                    # Index, glossary, dependency graph, implementation order
├── RD-01-[feature-name].md     # First requirement document
├── RD-02-[feature-name].md     # Second requirement document
├── ...
└── RD-XX-[feature-name].md     # Last requirement document
```

### 3.2 README.md Template

```markdown
# [Project Name] — Requirements Documents

> **Project**: [Project Name] — [Brief Description]
> **Status**: [Draft | Review | Complete]
> **Created**: [Date]
> **Architecture**: [Tech stack summary]
> **CodeOps Version**: [Current codeops-mcp version from package.json]

---

## Overview

[2-3 paragraph description of the project]

## Domain Glossary

| Term | Definition |
|------|-----------|
| [Term] | [Definition] |

## Document Index

| # | Document | Description | Depends On |
|---|----------|-------------|------------|
| **AR** | [Ambiguity Register](00-ambiguity-register.md) | Zero-Ambiguity Gate decisions (audit trail) | — |
| **RD-01** | [Link to doc] | [Description] | — |
| **RD-02** | [Link to doc] | [Description] | RD-01 |

## Dependency Graph

[Text-based dependency tree]

## Suggested Implementation Order

| Phase | Documents | Description |
|-------|-----------|-------------|
| **A: MVP** | RD-01 → RD-XX | [Description] |
| **B: Enhanced** | RD-XX → RD-XX | [Description] |

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Decision] | [Choice] | [Why] |

## How to Use These Documents

Each requirements document is designed to be used with the `make_plan` protocol:

1. Pick a requirements document (e.g., RD-01)
2. Run: `make_plan`
3. The plan system will use the RD as input to create implementation plans
4. Run: `exec_plan [feature-name]`
5. Implement iteratively
```

### 3.3 Universal RD Template

Every requirement document follows this structure:

````markdown
# RD-XX: [Feature Name]

> **Document**: RD-XX-[feature-name].md
> **Status**: Draft
> **Created**: [Date]
> **Project**: [Project Name]
> **Depends On**: [List of RD dependencies, or "—" if none]
> **CodeOps Version**: [Current codeops-mcp version from package.json]

---

## Feature Overview

[1-2 paragraphs: What this feature does and why it's needed. Written so someone
unfamiliar with the project can understand the purpose.]

---

## Functional Requirements

### Must Have

- [ ] [Requirement — specific, testable, implementable]
- [ ] [Requirement]

### Should Have

- [ ] [Requirement]

### Won't Have (Out of Scope)

- [Explicitly excluded item] — [reason or which RD covers it]

---

## Technical Requirements

### [Sub-section per major technical concern]

[Architecture details, data structures, interfaces, algorithms, protocols.
Include pseudocode or real code examples where clarity demands it.
Include tables for structured information (env vars, config keys, API endpoints).]

---

## Integration Points

### With RD-XX ([Name])
- [How this requirement connects to that one]

### With RD-XX ([Name])
- [How this requirement connects to that one]

---

## Scope Decisions

| Decision | Options Considered | Chosen | Rationale | AR Ref |
|----------|-------------------|--------|-----------|--------|
| [Decision] | [Option A, B, C] | [Chosen] | [Why] | AR #X |

> **Traceability:** Every scope decision must reference the Ambiguity Register entry (AR #) that resolved it. See `00-ambiguity-register.md`.

---

## Security Considerations

> **🚨 This section is MANDATORY for every RD.** See `code.md` rules 32-34.

- **Data sensitivity**: [What sensitive data does this feature handle? PII, credentials, tokens, financial data?]
- **Input validation**: [What user inputs exist? How are they validated and sanitized?]
- **Authentication & authorization**: [Who can access this feature? What permissions are required?]
- **Injection risks**: [Are there SQL queries, HTML rendering, shell commands, or file operations involving user input?]
- **Encryption needs**: [Does data need encryption at rest or in transit?]
- **Rate limiting**: [Are there endpoints susceptible to brute force or abuse?]
- **Infrastructure**: [Container hardening, secrets management, network exposure considerations?]

---

## Acceptance Criteria

1. [ ] [Testable criterion]
2. [ ] [Testable criterion]
3. [ ] [Testable criterion]
4. [ ] Security requirements verified (input validation, injection prevention, auth, encryption)
````

### 3.4 RD Authoring Guidelines

When writing each RD:

- **Data Model Sketches**: For domain RDs, include conceptual entity relationships (not full SQL, but "A Project has many Participants. A Lab has many Equipment items.")
- **Security & Privacy Annotations**: Flag PII, encryption needs, consent tracking, GDPR relevance
- **Complexity Estimates**: Tag each requirement section with estimated complexity (S/M/L/XL) to aid planning
- **Non-Functional RD**: Always create one dedicated RD for non-functional requirements (performance targets, security, scalability, accessibility, availability, backup/recovery). Users frequently forget these.

### 3.4B 🚨 Acceptance Criteria Specificity — NON-NEGOTIABLE

**Acceptance criteria MUST be specific enough that a developer who has never spoken to the user can write a correct test from the criterion alone.** This rule prevents the acceptance criteria tautology — where the agent writes vague criteria, then later writes tests that interpret the criteria however the implementation happens to work, creating a self-validating loop.

**Every acceptance criterion MUST meet ALL of these requirements:**

1. **Measurable outcome** — States a concrete, observable result (not "works correctly" or "handles errors properly")
2. **Specific values** — Includes exact numbers, formats, status codes, or field names where applicable
3. **Standard references** — When the behavior must conform to a standard (RFC, protocol, specification), the criterion MUST cite the specific standard and section (e.g., "per RFC 8414 §2" not "follows the OIDC spec")
4. **Boundary conditions** — States what happens at the edges (empty input, maximum length, zero items, expired tokens)
5. **Negative cases** — States what should NOT happen or what should be rejected

**Examples:**

```
❌ BAD: "The API returns a valid OIDC discovery document"
✅ GOOD: "GET /.well-known/openid-configuration returns a JSON document where
   the 'issuer' field exactly matches the URL used to access the endpoint
   (per RFC 8414 §2), and includes all REQUIRED fields: issuer,
   authorization_endpoint, token_endpoint, jwks_uri,
   response_types_supported, subject_types_supported,
   id_token_signing_alg_values_supported"

❌ BAD: "Users can reset their password"
✅ GOOD: "POST /auth/reset-password with a valid email returns 202 Accepted,
   sends an email with a one-time reset link that expires after 60 minutes,
   and the link cannot be reused after the password is changed"

❌ BAD: "The system handles invalid input gracefully"
✅ GOOD: "POST /api/users with a missing 'email' field returns 400 with
   { error: 'VALIDATION_ERROR', details: [{ field: 'email', message: '...' }] }.
   POST /api/users with an email longer than 254 characters returns 400."
```

**If the user provides vague acceptance criteria** during review (Step 3.5), the agent MUST ask for specifics: *"This criterion says 'handles errors properly' — what specific error conditions should be handled, and what should the response look like for each?"*

**Traceability to tests:** When `make_plan` later derives test cases from these criteria, each spec test expectation MUST map directly to a specific acceptance criterion. If a criterion is too vague to produce a concrete test assertion, the criterion is defective — not the test.

### 3.5 Authoring Workflow

Write RDs one at a time, presenting each to the user for review:

1. Write RD-01 → present to user → collect feedback → revise
2. Write RD-02 → present to user → collect feedback → revise
3. Continue until all RDs are written
4. If context window approaches 90%, save progress to `requirements/_draft/` and note which RDs remain

---

## **Phase 4: Validation & Finalization**

### 4.1 Cross-Reference Validation

After all RDs are written, check for:

- **Missing references**: RD-05 mentions "equipment booking" but RD-07 (Lab Management) doesn't list the relationship
- **Orphaned features**: A feature is described but no RD owns it
- **Circular dependencies**: RD-03 depends on RD-05 which depends on RD-03
- **Scope leaks**: A "Won't Have" item in one RD contradicts a "Must Have" in another

### 4.2 "Did You Consider..." Checklist

Before finalizing, run through commonly forgotten requirements:

```markdown
## Commonly Forgotten Requirements — Final Check

| # | Concern | Addressed? | In Which RD? |
|---|---------|------------|--------------|
| 1 | Audit logging / activity trail | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 2 | Data export (CSV, Excel, API) | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 3 | API versioning | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 4 | Rate limiting | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 5 | Error messages & user-facing UX | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 6 | Empty states (no data yet) | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 7 | Loading states & optimistic UI | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 8 | Accessibility (WCAG) | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 9 | Mobile responsiveness | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 10 | Backup & disaster recovery | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 11 | Monitoring & alerting | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 12 | Email notifications & templates | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 13 | Search functionality | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 14 | Pagination for all list views | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 15 | File upload / document management | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 16 | Soft delete vs hard delete | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 17 | Timezone handling | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 18 | Localization / i18n | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 19 | Terms of service / privacy policy | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 20 | GDPR / data retention / right to delete | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 21 | Session management / timeout | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 22 | Graceful degradation / offline behavior | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 23 | Admin / super-admin capabilities | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 24 | User onboarding / first-time experience | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 25 | Configuration management (feature flags, settings) | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 26 | **🚨 Input validation & sanitization (server-side)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 27 | **🚨 Injection prevention (SQL, XSS, command, path traversal)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 28 | **🚨 Authentication & authorization model** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 29 | **🚨 Rate limiting (auth endpoints, public APIs)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 30 | **🚨 Secrets management (no hardcoded credentials)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 31 | **🚨 Data encryption (at rest and in transit)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 32 | **🚨 Infrastructure hardening (non-root containers, minimal images, CI secrets)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
| 33 | **🚨 Security testing (injection tests, auth bypass, privilege escalation)** | ☐ Yes / ☐ No / ☐ N/A | RD-XX |
```

> **🚨 Items 26-33 are NON-NEGOTIABLE** — they must be addressed in every project. See `code.md` rules 32-34 for the full security standard.

### 4.2B Zero-Ambiguity Final Verification — 🚨 NON-NEGOTIABLE

Before finalizing, verify the Ambiguity Register and traceability:

- [ ] Ambiguity Register (`00-ambiguity-register.md`) exists and is saved to disk
- [ ] Every register entry has Status = "✅ Resolved" with explicit user decision
- [ ] Zero deferred items — every ambiguity has a concrete answer
- [ ] All decisions in RD documents have AR # back-references (only exceptions: universally obvious facts + zero-semantic-impact formatting)
- [ ] No RD document contains AI-assumed defaults, inferred behaviors, or guessed specifications
- [ ] Surface-during-authoring rule was followed — any new ambiguities discovered during writing were added to the register and resolved with the user
- [ ] The user has reviewed and confirmed the complete register

### 4.3 Techdocs Update

After all RDs are finalized and validated, check for technical architecture documentation:

- **If `docs/index.md` exists with `techdocs: true` frontmatter:** Perform an incremental techdocs update — extract design decisions from the requirements documents, create ADRs for every technology/architecture choice that affects system behavior, performance, or maintainability, and update architecture sections if the requirements imply architectural changes (see `techdocs.md` Phase 6.3).
- **If techdocs do NOT exist:** Ask the user: *"Would you like to create technical architecture documentation for this project?"* — if yes, run `make_techdocs` using the freshly created requirements as input.

### 4.4 Roadmap Sync (RD Drafted)

After each RD is authored (and again at the end of the set), sync the roadmap if one is in play:

- **If `plans/00-roadmap.md` exists:** add or sync a row for each newly drafted RD at stage `RD Drafted`
  (✏️). Update the row's `Stage`, `Status`, and `Last Updated`, and the header `Progress` counter —
  following the update-first mandate.
- **If `plans/00-roadmap.md` does NOT exist:** ask the user whether to create a roadmap
  (`make_roadmap`). Never auto-create it silently.

See `get_rule("roadmap")` for the full Roadmap Keeper protocol and the stage-transition map.

### 4.5 Final Output Summary

After all validation, present the complete requirements set:


```markdown
## Requirements Complete: [Project Name]

**Location:** `requirements/`

**Documents Created:**
- requirements/00-ambiguity-register.md ✅ (Zero-Ambiguity Gate — all items resolved)
- requirements/README.md ✅
- requirements/RD-01-[name].md ✅
- requirements/RD-02-[name].md ✅
- ... ✅

**Summary:**
- Total RD Documents: X
- Must Have Features: X
- Should Have Features: X
- Out of Scope Items: X
- MVP Phase: RD-01 through RD-XX
- Full Product: RD-01 through RD-XX

**Next Steps:**
To start implementing, pick an RD and run `make_plan`.
Suggested starting order: RD-01 → RD-02 → ...
```

---

## **`add_requirement` Protocol**

When the user types `add_requirement`:

1. Read `requirements/README.md` to understand the current set
2. Ask: "What new capability or feature do you want to add?"
3. Run through a condensed discovery (comparable analysis, edge cases) for just this feature
4. **🚨 Run the Zero-Ambiguity Gate** for this new RD — compile an Ambiguity Register for just this feature, resolve ALL items with the user, then proceed. Add new AR entries to the existing `requirements/00-ambiguity-register.md` (create it if it doesn't exist). All gate rules apply: no deferrals, no delegation, no guesswork.
5. Determine where in the dependency graph the new RD fits
6. Assign the next available RD number
7. Write the new RD following the universal template (with AR # traceability)
8. Update `requirements/README.md`:
   - Add to document index
   - Update dependency graph
   - Update implementation phases if affected
9. Run cross-reference validation against existing RDs

---

## **`review_requirements` Protocol**

When the user types `review_requirements`:

1. Read all documents in `requirements/`
2. Run these checks:
   - **Completeness**: Every "Must Have" has acceptance criteria
   - **Consistency**: No contradictions between RDs
   - **Coverage**: "Did You Consider..." checklist
   - **Dependencies**: No circular dependencies, all references valid
   - **Scope creep**: "Should Have" items that should be "Won't Have"
   - **Orphans**: Features mentioned but not owned by any RD
3. Produce a diagnostic report:

```markdown
## Requirements Health Check: [Project Name]

**Documents Analyzed:** X RDs
**Date:** [Date]

### ✅ Passing
- [Check that passed]

### ⚠️ Warnings
- [Minor issue — recommendation]

### ❌ Issues Found
- [Serious gap or inconsistency — action required]

### Suggestions
- [Improvement opportunity]
```

---

## **Session Management**

Requirements gathering is a long, multi-turn conversation. Handle context window limits:

### Progress Persistence

If context window approaches 90% during discovery:
1. Save all progress to `requirements/_draft/discovery-notes.md`
2. Include: confirmed scope, selected features, open questions, stakeholder map
3. Note which phase/step to resume from
4. Run `/compact`

### Resuming

When the user types `make_requirements --continue`:
1. Read `requirements/_draft/discovery-notes.md`
2. Summarize where we left off
3. Continue from the next step

### Incremental RD Writing

RD documents are written to disk as they're completed — never held only in conversation memory. If context runs out mid-authoring:
1. Save completed RDs to `requirements/`
2. Save the incomplete RD to `requirements/_draft/`
3. Note which RDs remain in discovery notes
4. On resume, read existing RDs and continue

---

## **Adapting to Project Type**

The discovery questions and comparable systems analysis should adapt to the project type:

| Project Type | Comparable Systems to Explore | Key Discovery Focus |
|---|---|---|
| **SaaS / Web App** | Competing SaaS products, similar industry tools | Multi-tenancy, billing, user management, onboarding |
| **Internal Tool** | Enterprise tools in the domain (Jira, Confluence, etc.) | Workflow automation, integrations, permissions |
| **API / Backend** | Public APIs in the space, developer platforms | Versioning, rate limiting, auth, documentation |
| **Library / SDK** | Similar open-source libraries | API design, backward compatibility, bundle size |
| **CLI Tool** | Similar CLI tools (kubectl, gh, etc.) | Command structure, output formats, configuration |
| **Mobile App** | Competing mobile apps | Offline support, push notifications, device features |
| **E-commerce** | Shopify, WooCommerce, Stripe | Catalog, cart, checkout, inventory, payments |
| **CMS / Content** | WordPress, Strapi, Contentful | Content modeling, publishing workflow, media management |
| **Healthcare** | Epic, Cerner, HIPAA-compliant tools | Compliance, audit trails, consent management |
| **Education** | Canvas, Moodle, SONA | Enrollment, grading, scheduling, accessibility |
| **FinTech** | Stripe, Plaid, banking APIs | Regulatory compliance, transaction safety, reconciliation |

---

## **Cross-References**

When gathering and documenting requirements:

- ✅ Follow **code.md** for technical requirement code examples
- ✅ Reference **make_plan.md** for how RDs feed into implementation plans
- ✅ Reference **testing.md** for acceptance criteria that map to test strategies
- ✅ Follow **agents.md** for context window management during long discovery sessions
- ✅ Reference **retro_requirements.md** for reverse-engineering an existing codebase into requirements (`retro_requirements`)
- ✅ Reference **techdocs.md** for updating technical architecture documentation with design decisions from requirements
- ✅ See **upgrade_plan.md** for upgrading outdated requirements (`upgrade_requirements`)
- ✅ Reference **grill_me.md** for deep disambiguation before requirements gathering (`grill_me` → `make_requirements`)
- ✅ Reference **roadmap.md** for the Roadmap Keeper — sync each newly drafted RD to stage `RD Drafted` if a roadmap exists (`make_roadmap`)
- ✅ Read **`.clinerules/project.md`** for project-specific constraints (if it exists)


---

## **Summary**

| Trigger | Action |
|---------|--------|
| `make_requirements` | Full requirements discovery and documentation workflow |
| `make_requirements --continue` | Resume an interrupted requirements session |
| `add_requirement` | Add a new RD to an existing requirements set |
| `review_requirements` | Health check and gap analysis on existing requirements |
| `make_roadmap` | Create a roadmap to track this RD set across its lifecycle (see `roadmap.md`) |


**Typical Session Flow:**
```
make_requirements → discovery interview → comparable analysis → user journeys →
  edge cases → scope confirmation → glossary → decomposition →
  🚨 ZERO-AMBIGUITY GATE → RD authoring → validation → final output
```

**Output:** `requirements/README.md` + `requirements/RD-XX-*.md` documents ready for `make_plan`.
