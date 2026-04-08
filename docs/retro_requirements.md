# Reverse Requirements Engineering

## **TRIGGER KEYWORD: `retro_requirements`**

When the user types "retro_requirements" (with or without a path argument), execute the comprehensive reverse-engineering protocol below. The goal is to analyze an existing codebase — any programming language, any framework — and produce a structured reconstruction brief that can be fed to `make_requirements` to generate formal requirement documents capable of rebuilding the entire application from scratch.

## **TRIGGER KEYWORD: `retro_requirements --continue`**

Resume an interrupted retro-requirements session. Reads progress from `requirements/_retro/` and continues from the next incomplete phase.

## **TRIGGER KEYWORD: `retro_requirements --scope [path]`**

Analyze only a specific subdirectory or module instead of the full codebase. Useful for monorepos or very large projects.

---

## **Relationship to Other Protocols**

This protocol is the **inverse** of `make_requirements` and **upstream** of the full forward pipeline:

```
Existing Codebase
       │
       ▼
retro_requirements        ← THIS PROTOCOL (reverse-engineer the codebase)
       │
       ▼
requirements/_retro/reconstruction-brief.md
       │
       ▼
make_requirements         ← Forward protocol (enrich, validate, formalize)
       │
       ▼
requirements/RD-XX-*.md   ← Formal requirement documents
       │
       ▼
make_plan → exec_plan     ← Implementation pipeline (rebuild)
```

| Workflow | When to Use |
|----------|-------------|
| `retro_requirements` → `make_requirements` → `make_plan` | Reverse-engineering an existing system for documentation, migration, or rebuild |
| `retro_requirements` only | Creating documentation for an undocumented codebase |
| `make_requirements` → `make_plan` | Building a new system from scratch |
| `make_plan` only | Adding a feature to an existing codebase |

---

## **Core Principle: Requirements Archaeologist**

The agent executing `retro_requirements` is a **systematic code archaeologist** that:

1. **Surveys** — Maps the entire codebase structure before reading any implementation
2. **Excavates** — Reads source code methodically, layer by layer, extracting what the system does
3. **Reconstructs** — Transforms code-level observations into requirement-level statements
4. **Catalogs** — Organizes findings into structured documents with clear categories
5. **Synthesizes** — Produces a reconstruction brief that captures the full system in a format `make_requirements` can consume

The output is NEVER a code summary or architecture diagram. It is a **requirements-level description** of what the system does — written as if the code didn't exist yet and someone needed to describe what to build.

---

## **Output Structure**

All output is written to `requirements/_retro/`:

```
requirements/
└── _retro/
    ├── 00-project-profile.md        # Tech stack, scale, project type
    ├── 01-architecture-analysis.md  # Layers, modules, entry points, patterns
    ├── 02-domain-model.md           # Entities, relationships, constraints, data model
    ├── 03-api-surface.md            # Endpoints, CLI commands, public interfaces
    ├── 04-behavior-catalog.md       # Feature inventory — what the system does
    ├── 05-business-rules.md         # Extracted domain rules, validation, authorization
    ├── 06-cross-cutting.md          # Auth, errors, logging, caching, config
    ├── 07-integrations.md           # External APIs, databases, third-party services
    ├── 08-gaps-and-debt.md          # TODOs, missing tests, incomplete features, debt
    ├── 09-reconstruction-brief.md   # THE KEY FILE — make_requirements input
    └── _progress.md                 # Session tracking (which phases are complete)
```

The `09-reconstruction-brief.md` is the crown jewel — it is written specifically as `make_requirements` Mode 3 input. All other files are intermediate analysis that feed into it.

---

## **Phase 0: Reconnaissance**

**Goal:** Establish what the project IS before reading any source code.

### 0.1 Manifest Analysis

Read all manifest/config files at the project root:

| File | Extract |
|------|---------|
| `package.json` / `Cargo.toml` / `go.mod` / `pyproject.toml` / `*.csproj` / `build.gradle` | Name, version, dependencies, scripts, language |
| `docker-compose.yml` / `Dockerfile` | Services, infrastructure, deployment model |
| `tsconfig.json` / `webpack.config.*` / `vite.config.*` / `.babelrc` | Build toolchain |
| `.env.example` / `.env.template` | Environment variables (configuration surface) |
| `README.md` / `CHANGELOG.md` | Project description, history, documentation |
| `.clinerules/project.md` | Existing project configuration (if available) |
| `Makefile` / `justfile` / `Taskfile.yml` | Build/task commands |
| `.github/workflows/*` / `.gitlab-ci.yml` | CI/CD pipeline |

### 0.2 Directory Structure Mapping

Map the complete directory tree (top-level first, then selective recursion):

- Identify each top-level directory's purpose
- Count files and estimate lines of code per module
- Classify the project type (web app, API, library, CLI, mobile, etc.)
- Detect monorepo structure (multiple packages/services)

### 0.3 Output: `00-project-profile.md`

```markdown
# Project Profile: [Name]

> **Generated by:** `retro_requirements` — Phase 0: Reconnaissance
> **Date:** [Date]
> **Source:** [Project root path]

## Identity

- **Name:** [Project name]
- **Type:** [web-app / api / library / cli / mobile / monorepo / etc.]
- **Description:** [From README or inferred from code]
- **Version:** [Current version]

## Technology Stack

| Layer | Technology | Evidence |
|-------|-----------|----------|
| Language(s) | [e.g., TypeScript] | [e.g., tsconfig.json, .ts files] |
| Framework(s) | [e.g., Express, React] | [e.g., package.json dependency] |
| Database(s) | [e.g., PostgreSQL] | [e.g., docker-compose, migration files] |
| Build Tool | [e.g., tsc, webpack] | [e.g., build script in package.json] |
| Test Framework | [e.g., Vitest, Jest] | [e.g., test script, config file] |
| Package Manager | [e.g., yarn, npm, cargo] | [e.g., lockfile present] |

## Scale Estimate

- **Total Files:** [count]
- **Estimated LOC:** [rough count]
- **Modules/Packages:** [count]
- **Dependencies:** [production count] + [dev count]

## Directory Structure

[Annotated tree with purpose of each top-level directory]

## Key Configuration

### Environment Variables

[Extracted from .env.example or config files]

### Scripts/Commands

[Extracted from package.json scripts, Makefile, etc.]

## Existing Documentation

[List of docs found: README, CHANGELOG, wiki, docs/, etc.]
```

---

## **Phase 1: Structural Analysis**

**Goal:** Understand the architecture — how the code is organized into layers, modules, and components.

### 1.1 Entry Point Identification

Find and read all entry points:

- Main application entry (e.g., `src/index.ts`, `main.go`, `app.py`)
- Route/endpoint registrations
- CLI command registrations
- Event/message handlers
- Scheduled tasks / cron jobs

### 1.2 Layer Identification

Map the architectural layers by reading directory structures and key files:

| Pattern to Look For | Indicates |
|---------------------|-----------|
| `routes/`, `controllers/`, `handlers/` | API/HTTP layer |
| `services/`, `domain/`, `core/` | Business logic layer |
| `models/`, `entities/`, `schemas/` | Data model layer |
| `repositories/`, `dal/`, `db/` | Data access layer |
| `middleware/`, `interceptors/` | Cross-cutting middleware |
| `utils/`, `helpers/`, `lib/` | Shared utilities |
| `config/`, `settings/` | Configuration management |
| `tests/`, `__tests__/`, `spec/` | Test organization |
| `types/`, `interfaces/`, `contracts/` | Type definitions |
| `views/`, `pages/`, `components/` | UI layer (if applicable) |
| `migrations/`, `seeds/` | Database lifecycle |
| `plugins/`, `extensions/`, `modules/` | Plugin architecture |

### 1.3 Module Dependency Mapping

For each identified module/layer, trace:
- What does it import?
- What imports it?
- What is the dependency direction? (Should be unidirectional: controllers → services → repositories)

### 1.4 Pattern Recognition

Identify recurring patterns in the codebase:

| Pattern | Evidence |
|---------|----------|
| MVC / MV* | Controllers + Models + Views directories |
| Layered Architecture | Clear service/repository separation |
| Domain-Driven Design | Bounded contexts, aggregates, value objects |
| Event-Driven | Event emitters, message queues, pub/sub |
| Plugin Architecture | Plugin registration, hook systems |
| Microservices | Multiple independent services with own configs |
| Monolith | Single deployable, shared database |
| CQRS | Separate read/write models |
| Repository Pattern | Abstract data access behind interfaces |

### 1.5 Output: `01-architecture-analysis.md`

```markdown
# Architecture Analysis: [Name]

> **Generated by:** `retro_requirements` — Phase 1: Structural Analysis
> **Date:** [Date]

## Architecture Style

[e.g., "Layered monolith with MVC pattern" or "Event-driven microservices"]

## Layer Map

| Layer | Directory | Purpose | Key Files |
|-------|-----------|---------|-----------|
| [Layer] | [Path] | [What it does] | [Important files] |

## Entry Points

| Entry Point | File | Purpose |
|-------------|------|---------|
| [Name] | [Path] | [What it starts] |

## Module Dependency Graph

[Text-based dependency diagram]

## Patterns Identified

| Pattern | Where | Evidence |
|---------|-------|----------|
| [Pattern] | [Module] | [How you know] |

## Architecture Decisions (Inferred)

| Decision | Observed Choice | Likely Rationale |
|----------|----------------|------------------|
| [Decision] | [What was chosen] | [Why it was probably chosen] |
```

---

## **Phase 2: Data Model Extraction**

**Goal:** Reconstruct the complete domain model — entities, relationships, constraints, and lifecycle.

### 2.1 Entity Discovery

Find all data models by reading:

- ORM model definitions (Sequelize, TypeORM, Prisma, SQLAlchemy, ActiveRecord, GORM, etc.)
- Database migration files
- Schema definitions (GraphQL schemas, JSON schemas, Protobuf, etc.)
- TypeScript/Java/C# interfaces/classes that represent domain objects
- Database seed/fixture files

### 2.2 For Each Entity, Extract:

- **Fields/Properties:** Name, type, constraints (required, unique, default, max length)
- **Relationships:** Foreign keys, join tables, embedded documents
- **Lifecycle:** Creation, modification, soft-delete, archive, state transitions
- **Validation:** Server-side validation rules, custom validators
- **Indexes:** Performance-critical queries (inferred from indexes)
- **Enums/Constants:** Finite value sets (status codes, roles, types)

### 2.3 Output: `02-domain-model.md`

```markdown
# Domain Model: [Name]

> **Generated by:** `retro_requirements` — Phase 2: Data Model Extraction
> **Date:** [Date]

## Entity Inventory

| # | Entity | Description | Fields | Relationships |
|---|--------|-------------|--------|---------------|
| 1 | [Name] | [What it represents] | [Count] | [List] |

## Entity Details

### [Entity Name]

**Description:** [What this entity represents in the domain]

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| [name] | [type] | [required, unique, etc.] | [purpose] |

**Relationships:**
- Has many [Entity] (via [field])
- Belongs to [Entity] (via [field])

**Lifecycle:**
- Created when: [trigger]
- Modified when: [trigger]
- Deleted: [soft/hard], when: [trigger]

**Validation Rules:**
- [Rule 1]
- [Rule 2]

## Entity Relationship Map

[Text-based ERD showing all relationships]

## Enums & Constants

| Name | Values | Used By |
|------|--------|---------|
| [Enum] | [value1, value2, ...] | [Entity.field] |

## Data Invariants

[Business rules about data integrity extracted from validation code]
```

---

## **Phase 3: API & Interface Surface**

**Goal:** Catalog every way the outside world interacts with the system.

### 3.1 HTTP/REST Endpoints

For each endpoint, extract:
- Method + path (e.g., `POST /api/users`)
- Request body / query params / path params
- Response format and status codes
- Authentication/authorization requirements
- Rate limiting or throttling

### 3.2 CLI Commands (if applicable)

For each command:
- Command name and subcommands
- Arguments and flags
- Output format
- Exit codes

### 3.3 Public Library API (if applicable)

For each exported function/class:
- Signature with types
- Purpose and behavior
- Error conditions

### 3.4 Event Interfaces

- Published events (what triggers them, payload shape)
- Consumed events (what handles them, side effects)
- WebSocket channels/topics

### 3.5 Output: `03-api-surface.md`

```markdown
# API & Interface Surface: [Name]

> **Generated by:** `retro_requirements` — Phase 3: API & Interface Surface
> **Date:** [Date]

## HTTP Endpoints

| Method | Path | Auth | Description | Request | Response |
|--------|------|------|-------------|---------|----------|
| [GET] | [/path] | [Yes/No] | [What it does] | [Params] | [Shape] |

## Endpoint Details

### [GROUP: Resource Name]

#### [METHOD] [Path]

**Purpose:** [What this endpoint does]
**Authentication:** [Required/Optional/None]
**Authorization:** [Roles/permissions needed]

**Request:**
[Body/params description]

**Response:**
[Success and error responses]

**Business Rules:**
- [Rule extracted from handler code]

## CLI Commands (if applicable)

| Command | Description | Arguments |
|---------|-------------|-----------|
| [cmd] | [What it does] | [Args] |

## Events (if applicable)

| Event | Trigger | Payload | Consumers |
|-------|---------|---------|-----------|
| [event] | [When it fires] | [Shape] | [What handles it] |

## Public API (if library)

| Export | Type | Description |
|--------|------|-------------|
| [name] | [function/class/type] | [What it does] |
```

---

## **Phase 4: Behavior Catalog — Feature Extraction**

**Goal:** Translate code-level implementation into requirement-level feature descriptions. This is the most important and most difficult phase.

### 4.1 Approach

For each module/service identified in Phase 1:

1. **Read the implementation code** (services, handlers, controllers)
2. **Extract WHAT it does** — not HOW (no implementation details)
3. **Write as a requirement statement:** "The system allows [actor] to [action] resulting in [outcome]"
4. **Identify edge cases** handled in the code (error branches, validation failures)
5. **Note workflows** — multi-step processes that span multiple endpoints or services

### 4.2 Feature Statement Format

Every extracted feature must be written in this format:

```
[CATEGORY]-[NUMBER]: [Actor] can [action] [conditions/constraints]
  - Triggers: [What initiates this]
  - Result: [What changes in the system]
  - Edge cases: [What the code handles]
  - Related: [Other features this connects to]
```

### 4.3 Feature Categories

Organize features by domain area, not by code module:

- **User Management** — Registration, authentication, profile, roles
- **Core Domain** — The main business functionality (project-specific)
- **Data Management** — CRUD operations, import/export, bulk operations
- **Workflow** — Multi-step processes, approvals, state machines
- **Notifications** — Email, push, in-app notifications
- **Administration** — System config, user management, monitoring
- **Reporting** — Dashboards, analytics, data export

### 4.4 Output: `04-behavior-catalog.md`

```markdown
# Behavior Catalog: [Name]

> **Generated by:** `retro_requirements` — Phase 4: Feature Extraction
> **Date:** [Date]

## Feature Summary

| # | Category | Features | Complexity |
|---|----------|----------|------------|
| 1 | [Category] | [Count] | [S/M/L/XL] |

## [Category 1]: [Name]

### [CAT]-01: [Feature Title]

**Statement:** [Actor] can [action] [conditions]

**Triggers:** [What initiates this]
**Result:** [What changes]
**Edge Cases:**
- [Edge case 1 — extracted from error handling code]
- [Edge case 2]

**Evidence:** [Source file(s) where this behavior lives]

### [CAT]-02: [Feature Title]

...

## [Category 2]: [Name]

...

## Workflows (Multi-Step Processes)

### Workflow: [Name]

**Steps:**
1. [Step 1] → triggers [Step 2]
2. [Step 2] → if [condition] then [Step 3a] else [Step 3b]
3. ...

**Actors Involved:** [Roles]
**State Transitions:** [States the entity moves through]
```

---

## **Phase 5: Business Rules & Validation Logic**

**Goal:** Extract the domain rules that are encoded in the code but often never documented.

### 5.1 Where to Find Business Rules

| Location | Type of Rule |
|----------|-------------|
| Validation middleware/decorators | Input constraints (format, range, required) |
| Service layer if/else branches | Domain logic (eligibility, permissions, limits) |
| Database constraints | Data integrity (unique, foreign key, check) |
| Authorization checks | Access control (who can do what) |
| State machine transitions | Lifecycle rules (what transitions are valid) |
| Scheduled jobs / cron | Time-based rules (expiry, cleanup, reminders) |
| Configuration / feature flags | Conditional behavior |

### 5.2 Rule Classification

For each extracted rule:

| Property | Description |
|----------|-------------|
| **Rule ID** | `BR-[category]-[number]` |
| **Statement** | Plain English: "A user cannot X unless Y" |
| **Type** | Validation / Authorization / Domain / Lifecycle / Temporal |
| **Enforcement** | Where in the code it's enforced |
| **Consequence** | What happens when the rule is violated |

### 5.3 Output: `05-business-rules.md`

```markdown
# Business Rules: [Name]

> **Generated by:** `retro_requirements` — Phase 5: Business Rules Extraction
> **Date:** [Date]

## Rule Summary

| Type | Count | Examples |
|------|-------|---------|
| Validation | [N] | [Brief examples] |
| Authorization | [N] | [Brief examples] |
| Domain Logic | [N] | [Brief examples] |
| Lifecycle | [N] | [Brief examples] |
| Temporal | [N] | [Brief examples] |

## Validation Rules

### BR-VAL-01: [Rule Title]

**Statement:** [Plain English rule]
**Enforcement:** [File:line or function name]
**Violation Response:** [Error message or HTTP status]

## Authorization Rules

### BR-AUTH-01: [Rule Title]

**Statement:** [Who can do what under which conditions]
**Enforcement:** [Middleware, decorator, or inline check]
**Roles Involved:** [List of roles]

## Domain Logic Rules

### BR-DOM-01: [Rule Title]

**Statement:** [Business rule]
**Enforcement:** [Service function]
**Edge Cases:** [What happens at boundaries]

## Lifecycle Rules

### BR-LIFE-01: [Rule Title]

**Statement:** [State transition rule]
**Valid Transitions:** [From → To, conditions]
**Invalid Transitions:** [What's blocked and why]

## Temporal Rules

### BR-TIME-01: [Rule Title]

**Statement:** [Time-based rule]
**Schedule:** [When it runs]
**Effect:** [What it does]
```

---

## **Phase 6: Cross-Cutting Concerns**

**Goal:** Document the system-wide patterns that span all modules.

### 6.1 Concerns to Analyze

| Concern | What to Look For |
|---------|-----------------|
| **Authentication** | Login flow, token management, session handling, OAuth/OIDC |
| **Authorization** | RBAC, ABAC, permission checks, role hierarchies |
| **Error Handling** | Global error handler, error codes, error response format |
| **Logging** | Logger setup, log levels, structured logging, audit trail |
| **Caching** | Cache strategy (Redis, in-memory), cache invalidation, TTLs |
| **Configuration** | Config loading, environment-specific settings, feature flags |
| **Validation** | Input validation framework, sanitization, schema validation |
| **Internationalization** | i18n setup, translation files, locale handling |
| **Security** | CORS, CSP, rate limiting, input sanitization, encryption |
| **Observability** | Metrics, tracing, health checks, monitoring |

### 6.2 Output: `06-cross-cutting.md`

```markdown
# Cross-Cutting Concerns: [Name]

> **Generated by:** `retro_requirements` — Phase 6: Cross-Cutting Concerns
> **Date:** [Date]

## Authentication

**Strategy:** [e.g., JWT with refresh tokens, session-based, OAuth2 + OIDC]
**Implementation:**
- [How login works]
- [How tokens are managed]
- [How sessions expire]

## Authorization

**Model:** [RBAC / ABAC / Custom]
**Roles:** [List of roles with permissions]
**Enforcement:** [Middleware, decorators, inline checks]

## Error Handling

**Strategy:** [Global error handler, error classes, error format]
**Error Response Format:**
[Example error response shape]

## Logging & Audit

**Framework:** [Logger used]
**Audit Trail:** [What actions are logged, where]

## Caching

**Strategy:** [What is cached, TTLs, invalidation]
**Technology:** [Redis, in-memory, CDN]

## Configuration Management

**Sources:** [Env vars, config files, remote config]
**Environment Handling:** [How dev/staging/prod differ]

## Security Measures

**Implemented:**
- [CORS configuration]
- [Rate limiting]
- [Input sanitization]
- [Encryption at rest/in transit]

## Testing Strategy (Observed)

**Framework:** [Test framework]
**Structure:** [How tests are organized]
**Coverage:** [Estimated coverage areas]
**Patterns:** [Test patterns used — mocks, fixtures, factories]
```

---

## **Phase 7: Integrations & External Dependencies**

**Goal:** Map every external system the code communicates with.

### 7.1 Integration Discovery

Look for:
- HTTP client calls (`fetch`, `axios`, `reqwest`, `http.Client`)
- Database connections and queries
- Message queue producers/consumers (RabbitMQ, Kafka, SQS)
- Email sending (SMTP, SendGrid, SES)
- File storage (S3, GCS, local filesystem)
- Payment providers (Stripe, PayPal)
- Authentication providers (Auth0, Keycloak, Google OAuth)
- Monitoring/analytics services
- Third-party APIs

### 7.2 Output: `07-integrations.md`

```markdown
# Integrations: [Name]

> **Generated by:** `retro_requirements` — Phase 7: Integrations
> **Date:** [Date]

## Integration Map

| # | System | Protocol | Direction | Purpose | Config |
|---|--------|----------|-----------|---------|--------|
| 1 | [Name] | [REST/gRPC/SMTP/etc.] | [In/Out/Both] | [Why] | [Env vars] |

## Integration Details

### [System Name]

**Type:** [Database / API / Message Queue / File Storage / etc.]
**Protocol:** [How it communicates]
**Purpose:** [Why the system needs this]
**Configuration:** [Environment variables, connection strings]
**Error Handling:** [Retry logic, circuit breaker, fallback]
**Data Flow:**
- Outbound: [What data is sent]
- Inbound: [What data is received]
```

---

## **Phase 8: Gaps, Debt & Observations**

**Goal:** Document what's missing, broken, or incomplete. This is critical for honest requirements.

### 8.1 What to Look For

| Signal | Indicates |
|--------|-----------|
| `TODO`, `FIXME`, `HACK`, `XXX` comments | Known incomplete work |
| Empty catch blocks | Missing error handling |
| Commented-out code | Abandoned features or workarounds |
| Missing tests for modules | Untested functionality |
| Hardcoded values | Missing configuration |
| Console.log / print statements | Debugging artifacts |
| Disabled lint rules | Workarounds for code quality |
| Unused imports / dead code | Refactoring debt |
| Missing input validation | Security gaps |
| No retry/circuit-breaker on external calls | Reliability gaps |

### 8.2 Output: `08-gaps-and-debt.md`

```markdown
# Gaps & Technical Debt: [Name]

> **Generated by:** `retro_requirements` — Phase 8: Gaps & Debt
> **Date:** [Date]

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Missing Features | [N] | [High/Med/Low] |
| Technical Debt | [N] | [High/Med/Low] |
| Security Gaps | [N] | [High/Med/Low] |
| Test Coverage Gaps | [N] | [High/Med/Low] |

## Missing Features (Should Exist But Don't)

| # | Gap | Expected Behavior | Impact |
|---|-----|-------------------|--------|
| 1 | [What's missing] | [What should exist] | [Consequence] |

## Technical Debt

| # | Issue | Location | Recommended Fix |
|---|-------|----------|-----------------|
| 1 | [Issue] | [File/module] | [What to do] |

## Security Gaps

| # | Gap | Risk | Recommendation |
|---|-----|------|----------------|
| 1 | [Gap] | [Risk level] | [Fix] |

## Test Coverage Gaps

| # | Module/Feature | Current Coverage | Needed |
|---|---------------|-----------------|--------|
| 1 | [Module] | [None/Partial/Good] | [What tests are missing] |

## TODO/FIXME Inventory

| # | Comment | File | Line | Context |
|---|---------|------|------|---------|
| 1 | [Comment text] | [Path] | [Line] | [What it's about] |
```

---

## **Phase 9: Synthesis — The Reconstruction Brief**

**Goal:** Combine all phase outputs into a single document that `make_requirements` can consume.

### 9.1 Process

1. Review all phase outputs (`00` through `08`)
2. Translate code-level observations into requirement-level statements
3. Organize by domain area (not by code structure)
4. Identify implicit requirements that were never documented but the code satisfies
5. Flag areas where the code's behavior might be unintentional (bugs masquerading as features)
6. Write the reconstruction brief in `make_requirements` Mode 3 format

### 9.2 Output: `09-reconstruction-brief.md`

```markdown
# Reconstruction Brief: [Project Name]

> **Generated by:** `retro_requirements` — Phase 9: Synthesis
> **Date:** [Date]
> **Source Codebase:** [Path]
>
> **Usage:** Feed this document to `make_requirements` as Mode 3 input:
> ```
> make_requirements
> I have analysis notes in requirements/_retro/reconstruction-brief.md
> ```

---

## Project Identity

**Name:** [Name]
**Type:** [Type]
**Description:** [What this project does — written as if pitching it to someone who's never seen it]

**Problem Statement:** [What problem this system solves — inferred from the code's behavior]

**Target Users:** [Who uses this system — extracted from auth/roles/UI]

---

## Technology Decisions (Confirmed from Codebase)

| Decision | Choice | Confidence |
|----------|--------|------------|
| Primary Language | [Language] | Confirmed |
| Framework | [Framework] | Confirmed |
| Database | [Database] | Confirmed |
| Authentication | [Strategy] | Confirmed |
| Hosting/Deployment | [Platform] | [Confirmed/Inferred] |

---

## Stakeholders / User Types

| # | Role | Description | Key Capabilities |
|---|------|-------------|-----------------|
| 1 | [Role] | [Who they are] | [What they can do] |

---

## Domain Model

### Core Entities

| Entity | Description | Key Fields | Relationships |
|--------|-------------|------------|---------------|
| [Name] | [What it represents] | [Important fields] | [Connections] |

### Entity Relationships

[Text-based ERD or relationship descriptions]

---

## Feature Catalog

### [Domain Area 1]: [Name]

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 1 | [Feature] | [What it does] | [S/M/L/XL] |

### [Domain Area 2]: [Name]

| # | Feature | Description | Complexity |
|---|---------|-------------|------------|
| 1 | [Feature] | [What it does] | [S/M/L/XL] |

---

## Business Rules

| # | Rule | Type | Description |
|---|------|------|-------------|
| 1 | [ID] | [Validation/Auth/Domain] | [Plain English rule] |

---

## Workflows

### [Workflow Name]

**Actors:** [Roles involved]
**Steps:**
1. [Step] → [Outcome]
2. [Step] → [Outcome]
3. ...

---

## Integration Points

| # | System | Purpose | Protocol |
|---|--------|---------|----------|
| 1 | [System] | [Why] | [How] |

---

## Cross-Cutting Requirements

| Concern | Current Implementation | Requirement Level |
|---------|----------------------|-------------------|
| Authentication | [What exists] | [What to require] |
| Authorization | [What exists] | [What to require] |
| Error Handling | [What exists] | [What to require] |
| Logging | [What exists] | [What to require] |
| Caching | [What exists] | [What to require] |
| Security | [What exists] | [What to require] |

---

## Non-Functional Characteristics

| Characteristic | Observed | Requirement |
|---------------|----------|-------------|
| Performance | [What the code does for perf] | [What to require] |
| Scalability | [Current scaling approach] | [What to require] |
| Reliability | [Error handling, retries] | [What to require] |
| Accessibility | [WCAG compliance observed] | [What to require] |

---

## Known Gaps & Improvement Opportunities

| # | Gap | Description | Recommendation |
|---|-----|-------------|----------------|
| 1 | [Gap] | [What's missing or broken] | [What to do about it] |

---

## Open Questions for Discovery

These questions could not be answered from the code alone and should be explored during `make_requirements` discovery:

1. [Question — e.g., "Is feature X intentional or a bug?"]
2. [Question — e.g., "What is the expected behavior when Y?"]
3. [Question — e.g., "Are there planned features not yet implemented?"]
4. [Question — e.g., "What are the performance targets?"]
```

---

## **Execution Strategy: Piece-by-Piece Analysis**

### Context Window Management

Analyzing a full codebase WILL exceed a single context window. The protocol MUST:

1. **Persist after each phase** — Save the phase output to `requirements/_retro/` before moving on
2. **Read selectively** — Don't read every file. Read entry points, then follow imports into key modules
3. **Summarize as you go** — Extract requirements from code, don't copy code into documents
4. **Use `_progress.md`** — Track which phases and modules have been analyzed

### Progress Tracking: `_progress.md`

```markdown
# Retro Requirements Progress

> **Project:** [Name]
> **Started:** [Date]
> **Last Updated:** [Date]

## Phase Status

| Phase | Status | Files Analyzed | Notes |
|-------|--------|---------------|-------|
| 0: Reconnaissance | ✅ Complete | [N] | — |
| 1: Structural Analysis | ✅ Complete | [N] | — |
| 2: Domain Model | 🔄 In Progress | [N/M] | Completed: [modules]. Remaining: [modules] |
| 3: API Surface | ⬜ Not Started | — | — |
| 4: Behavior Catalog | ⬜ Not Started | — | — |
| 5: Business Rules | ⬜ Not Started | — | — |
| 6: Cross-Cutting | ⬜ Not Started | — | — |
| 7: Integrations | ⬜ Not Started | — | — |
| 8: Gaps & Debt | ⬜ Not Started | — | — |
| 9: Synthesis | ⬜ Not Started | — | — |

## Module Coverage

| Module | Phase 2 | Phase 4 | Phase 5 | Notes |
|--------|---------|---------|---------|-------|
| [Module 1] | ✅ | ✅ | ⬜ | — |
| [Module 2] | ✅ | 🔄 | ⬜ | Partially analyzed |
```

### Multi-Session Workflow

**Session 1:** Phases 0-1 (Reconnaissance + Structure) — always completable in one session
**Session 2+:** Phases 2-7 — one or more phases per session depending on codebase size
**Final Session:** Phases 8-9 (Gaps + Synthesis) — review all outputs and produce the brief

At the start of each session:
1. Read `requirements/_retro/_progress.md`
2. Read the latest phase outputs for context
3. Continue from the next incomplete phase

At the end of each session:
1. Save all phase outputs
2. Update `_progress.md`
3. Report what was completed and what remains

---

## **Adapting to Project Type**

The protocol adapts its analysis focus based on the detected project type:

| Project Type | Phase Focus | Extra Attention |
|---|---|---|
| **Web App (Full-Stack)** | All phases equally | UI components, routing, state management, SSR |
| **API / Backend** | Phases 2-5 heavy | Endpoint contracts, auth, data validation |
| **Library / SDK** | Phase 3 heavy | Public API surface, backward compatibility, docs |
| **CLI Tool** | Phase 3 heavy | Command structure, output format, exit codes, config |
| **Mobile App** | Phase 4 heavy | Navigation, offline support, push notifications |
| **Microservices** | Phase 7 heavy | Service boundaries, inter-service communication, data ownership |
| **Monorepo** | Run per-package | Shared packages, cross-package dependencies |
| **Data Pipeline** | Phases 5, 7 heavy | Data flow, transformation rules, scheduling |
| **Infrastructure** | Phases 0, 7 heavy | Service definitions, networking, secrets management |

---

## **Scope Control: `--scope [path]`**

For large codebases, analyze a specific module:

```
retro_requirements --scope src/auth
retro_requirements --scope packages/api
retro_requirements --scope services/payment-service
```

When scoped:
- Phase 0 still reads the root manifests (for global context)
- Phase 1 focuses on the scoped directory's structure
- Phases 2-8 analyze only the scoped code
- Phase 9 produces a scoped reconstruction brief
- Cross-references to other modules are noted but not analyzed

---

## **Quality Criteria for Extraction**

### Good Requirement Extraction

```
✅ "Registered users can reset their password by providing their email address.
    The system sends a time-limited reset link (expires in 1 hour).
    The link can only be used once."
```

### Bad Requirement Extraction (Too Code-Level)

```
❌ "The resetPassword function in auth.service.ts calls sendEmail with
    a JWT token that has a 3600s expiry encoded using HS256."
```

The reconstruction brief must be **implementation-agnostic**. A developer reading it should be able to implement the same behavior in a completely different tech stack.

---

## **Session Management**

### Starting a Session

```
retro_requirements                          # Fresh start — full codebase
retro_requirements --scope src/api          # Fresh start — scoped
retro_requirements --continue               # Resume from _progress.md
```

### Progress Persistence

If context window approaches 90% during any phase:
1. Save current phase output (even if incomplete) to `requirements/_retro/`
2. Update `_progress.md` with current status
3. Note which module/file analysis was interrupted
4. `/compact`

### Commit Behavior

The `_retro/` analysis files should be committed after each completed phase to prevent data loss across sessions. Use `gitcm` with scope `retro`:
```
docs(retro): complete Phase X — [phase name]
```

### Resuming

When the user types `retro_requirements --continue`:
1. Read `requirements/_retro/_progress.md`
2. Read completed phase outputs for context
3. Continue from the next incomplete phase or module
4. Summarize where we left off before proceeding

---

## **Cross-References**

When performing reverse requirements engineering:

- ✅ Follow **agents.md** for context window management during long analysis sessions
- ✅ Reference **requirements.md** for the format that the reconstruction brief must target
- ✅ Reference **code.md** for understanding code quality patterns during analysis
- ✅ Reference **testing.md** for understanding test patterns during analysis
- ✅ Read **`.clinerules/project.md`** for project-specific configuration (if it exists)

---

## **Summary**

| Trigger | Action |
|---------|--------|
| `retro_requirements` | Full reverse-engineering analysis of the codebase |
| `retro_requirements --continue` | Resume an interrupted retro session |
| `retro_requirements --scope [path]` | Analyze only a specific part of the codebase |

**Typical Session Flow:**
```
retro_requirements → reconnaissance → structural analysis → domain model →
  api surface → behavior catalog → business rules → cross-cutting →
  integrations → gaps & debt → synthesis → reconstruction brief
```

**Output:** `requirements/_retro/` directory with 10 analysis documents, culminating in `09-reconstruction-brief.md` — ready to feed to `make_requirements`.

**Next Step After Completion:**
```
make_requirements
I have analysis notes in requirements/_retro/reconstruction-brief.md
```
