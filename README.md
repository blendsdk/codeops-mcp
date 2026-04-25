# codeops-mcp

MCP (Model Context Protocol) server providing AI coding agents with universal, language-agnostic development rules.

## What It Does

**codeops-mcp** bundles 11 curated rule documents that teach AI agents how to code, test, plan, commit, gather requirements, reverse-engineer codebases, create technical documentation, upgrade outdated artifacts, disambiguate designs, and behave — across any programming language and project type. It exposes these rules via 5 MCP tools.

### Rule Documents

| Rule                     | Description                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------ |
| **code**                 | 30 coding standards: DRY, testing, documentation, architecture, type safety          |
| **testing**              | Test commands, workflows, coverage requirements, debugging strategies                |
| **git-commands**         | Git commit protocols (`gitcm`/`gitcmp`), message format, push workflow               |
| **make_plan**            | Complete protocol for creating and executing multi-document implementation plans      |
| **requirements**         | Requirements gathering & documentation protocol (`make_requirements`)                |
| **retro_requirements**   | Reverse-engineer an existing codebase into structured requirements                   |
| **techdocs**             | Technical architecture documentation protocol (`make_techdocs`)                      |
| **upgrade_plan**         | Upgrade outdated plans and requirements to current standards                          |
| **grill_me**             | Deep disambiguation protocol — relentless interview before planning or requirements  |
| **agents**               | Mandatory AI agent behavior: compliance, context management, multi-session execution |
| **project-template**     | Template for `.clinerules/project.md` — project-specific toolchain configuration     |

### MCP Tools

| Tool              | Description                                                                  |
| ----------------- | ---------------------------------------------------------------------------- |
| `get_rule`        | Get any rule document by name (supports aliases like "git", "test", "retro") |
| `list_rules`      | List all available rules grouped by category                                 |
| `search_rules`    | Full-text search across all rules with TF-IDF ranking                        |
| `analyze_project` | **Killer feature** — Scan a project directory and auto-generate `project.md` |
| `get_setup_guide` | Step-by-step guide for setting up CodeOps in a project                       |

## Installation

```bash
# Global install
npm install -g codeops-mcp

# Or with yarn
yarn global add codeops-mcp
```

## MCP Configuration

Add to your MCP client configuration (e.g., Cline, Claude Desktop):

```json
{
    "mcpServers": {
        "codeops": {
            "command": "codeops-mcp"
        }
    }
}
```

### Custom docs path

```json
{
    "mcpServers": {
        "codeops": {
            "command": "codeops-mcp",
            "args": ["/path/to/custom/docs"]
        }
    }
}
```

Or via environment variable:

```json
{
    "mcpServers": {
        "codeops": {
            "command": "codeops-mcp",
            "env": {
                "CODEOPS_DOCS_PATH": "/path/to/custom/docs"
            }
        }
    }
}
```

## How It Works

The two-layer architecture:

1. **Layer 1: Universal rules** (bundled in this package) — Language-agnostic standards for coding, testing, git, planning, and requirements
2. **Layer 2: Project-specific config** (`.clinerules/project.md` in your project) — Toolchain, commands, conventions

All generic rules reference `project.md` for project-specific settings like build commands, test commands, package manager, etc.

### Quick Setup

1. Run `analyze_project("/path/to/your/project")` to auto-detect your toolchain
2. Save the output to `.clinerules/project.md` in your project
3. The AI agent automatically applies universal rules using your project's settings

---

## Usage Guide

### Trigger Keywords

codeops-mcp defines **trigger keywords** — when you type these phrases, the AI agent executes sophisticated multi-step protocols:

| Keyword | What It Does |
|---------|-------------|
| `make_plan` | Creates a detailed multi-document implementation plan for a feature |
| `exec_plan [name]` | Executes an existing plan step by step |
| `make_requirements` | Discovers, structures, and documents project requirements |
| `add_requirement` | Adds a new requirement to an existing requirements set |
| `review_requirements` | Health-checks existing requirements for gaps and inconsistencies |
| `retro_requirements` | Reverse-engineers an existing codebase into structured requirements |
| `make_techdocs` | Creates VitePress-compatible technical architecture documentation |
| `review_techdocs` | Reviews and updates existing technical documentation |
| `upgrade_plan [name]` | Upgrades an outdated plan to current CodeOps standards |
| `upgrade_requirements` | Upgrades outdated requirements to current CodeOps standards |
| `grill_me` | Relentless interview to eliminate ambiguity before planning or requirements |
| `gitcm` | Stages all changes and commits with a detailed conventional commit message |
| `gitcmp` | Same as `gitcm` plus rebase and push |

### Workflow Overview

The protocols form a complete development pipeline:

```
┌──────────────────────────────────────────────────────────────────┐
│  REVERSE PATH (existing codebase → requirements → rebuild)       │
│                                                                  │
│  retro_requirements → make_requirements → make_plan → exec_plan  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  FORWARD PATH (new project → requirements → implementation)      │
│                                                                  │
│  make_requirements → make_plan → exec_plan                       │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  QUICK PATH (add a feature to existing codebase)                 │
│                                                                  │
│  make_plan → exec_plan                                           │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  UPGRADE PATH (bring outdated artifacts to current standards)     │
│                                                                  │
│  upgrade_plan [feature] / upgrade_requirements                    │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  DISAMBIGUATION PATH (eliminate ambiguity before any work)        │
│                                                                  │
│  grill_me → make_plan → exec_plan                                │
│  grill_me → make_requirements → make_plan → exec_plan            │
│  grill_me (standalone deep-dive)                                  │
└──────────────────────────────────────────────────────────────────┘
```

You can use any part of the pipeline independently — they're designed to work together but none requires the others.

---

### Coding Standards & Testing

The agent automatically loads coding standards and testing rules at the start of every task. These enforce:

- **30 coding rules**: DRY, single responsibility, documentation, type safety, 500-line file limit
- **Testing workflow**: Write tests first, run verification before every commit
- **Test coverage**: Unit, integration, and end-to-end tests required

You don't need to do anything — just have codeops-mcp installed and the agent follows these rules automatically.

---

### Planning & Execution (`make_plan` / `exec_plan`)

Create and execute structured implementation plans for features of any size.

**Creating a plan:**

```
User: make_plan

Agent: What feature would you like to plan?

User: Add JWT authentication to our API

Agent: [Asks clarifying questions, analyzes codebase, then creates:]
  plans/jwt-auth/
  ├── 00-index.md
  ├── 01-requirements.md
  ├── 02-current-state.md
  ├── 03-auth-middleware.md
  ├── 04-token-service.md
  ├── 07-testing-strategy.md
  └── 99-execution-plan.md
```

**Executing a plan:**

```
User: exec_plan jwt-auth

Agent: [Reads the execution plan, implements tasks one by one,
        runs verification after each task, updates progress,
        asks about commits after each verified task]
```

**Commit modes for `exec_plan`:**

| Flag | Behavior |
|------|----------|
| *(default)* | Ask before each commit |
| `--no-commit` | Never commit — you handle git yourself |
| `--auto-commit` | Automatically commit and push after each task |

---

### Requirements Engineering (`make_requirements`)

Transform a rough project idea into formal requirement documents through guided discovery.

**Example:**

```
User: I want to build a university lab management SaaS. Researchers book lab rooms,
ethics committee approves studies, participants sign up on a public page.
Built with Node, TypeScript, PostgreSQL.

make_requirements

Agent: [Conducts multi-turn discovery interview]
  - Maps stakeholders and user types
  - Analyzes comparable systems (suggests features you haven't thought of)
  - Walks through user journeys to find hidden requirements
  - Explores "what happens when..." edge cases
  - Produces formal requirement documents:

  requirements/
  ├── README.md              # Index, glossary, dependency graph
  ├── RD-01-scaffolding.md   # Project setup
  ├── RD-02-data-model.md    # Database schema
  ├── RD-03-auth.md          # Authentication & RBAC
  ├── RD-04-lab-booking.md   # Core booking functionality
  ├── ...
  └── RD-12-deployment.md    # Production deployment
```

Each RD document can then be fed into `make_plan` for implementation:

```
User: make_plan
Agent: I found requirement documents. Which RD would you like to implement?
User: RD-04-lab-booking.md
Agent: [Creates implementation plan based on the requirement document]
```

**Additional keywords:**
- `add_requirement` — Add a new RD to an existing set
- `review_requirements` — Run a health check on all requirements (gaps, inconsistencies, scope creep)

---

### Reverse Requirements Engineering (`retro_requirements`)

Analyze an existing codebase and produce a reconstruction brief — detailed enough to rebuild the entire application.

**Example:**

```
User: retro_requirements

Agent: [Systematically analyzes the codebase in 10 phases:]
  Phase 0: Reconnaissance — manifests, directory structure, tech stack
  Phase 1: Structural Analysis — layers, modules, entry points, patterns
  Phase 2: Data Model — entities, relationships, constraints
  Phase 3: API Surface — endpoints, CLI commands, public interfaces
  Phase 4: Behavior Catalog — features translated to requirement statements
  Phase 5: Business Rules — validation, authorization, domain logic
  Phase 6: Cross-Cutting — auth, errors, logging, caching
  Phase 7: Integrations — external APIs, databases, services
  Phase 8: Gaps & Debt — TODOs, missing tests, security gaps
  Phase 9: Synthesis — produces the reconstruction brief

Output:
  requirements/_retro/
  ├── 00-project-profile.md
  ├── 01-architecture-analysis.md
  ├── ...
  ├── 08-gaps-and-debt.md
  └── 09-reconstruction-brief.md   ← Feed this to make_requirements
```

**Scope control for large codebases:**

```
retro_requirements --scope src/auth          # Analyze only the auth module
retro_requirements --continue                # Resume an interrupted session
```

The reconstruction brief is designed as input for `make_requirements`, completing the full reverse → forward pipeline.

---

### Version Stamping & Upgrade Protocol (`upgrade_plan` / `upgrade_requirements`)

Plans and requirements created with codeops-mcp are automatically stamped with the CodeOps version. When rules evolve, previously created plans may become outdated. The upgrade protocol brings them up to current standards.

**How it works:**

- Plans created with `make_plan` include a `> **CodeOps Version**: X.Y.Z` stamp
- When you run `exec_plan`, the agent detects outdated or pre-versioning plans and suggests upgrading
- The upgrade is non-destructive — all user-authored content (technical specs, scope decisions, task states) is preserved

**Upgrading a plan:**

```
User: upgrade_plan jwt-auth

Agent: [Reads all plan documents, compares against current templates]

  Upgrade Report: jwt-auth
  Current Version: 1.5.0 (or "none — pre-versioning")
  Target Version: 1.7.0

  Will Be Added: commit mode flags, security checklist, techdocs step
  Will Be Updated: session protocol, success criteria
  Will Be Preserved: all technical specs, task states, scope decisions

  Proceed with upgrade?
```

**Upgrading requirements:**

```
User: upgrade_requirements

Agent: [Reads all RD documents, compares against current templates,
        adds missing sections like security considerations]
```

---

### Technical Architecture Documentation (`make_techdocs`)

Generate and maintain VitePress-compatible technical architecture documentation from your codebase.

```
User: make_techdocs

Agent: [Analyzes codebase architecture and produces:]
  docs/
  ├── index.md                  # Home page with techdocs: true frontmatter
  ├── architecture/
  │   ├── overview.md           # System overview and diagrams
  │   ├── data-model.md         # Entity relationships
  │   └── api-design.md         # API surface documentation
  └── decisions/
      └── ADR-001-*.md          # Architecture Decision Records
```

Documentation is automatically maintained during plan execution — the agent checks for architectural changes after each phase and updates docs accordingly.

---

### Git Workflow (`gitcm` / `gitcmp`)

Safe, structured git commits with detailed conventional commit messages.

```
User: gitcm

Agent: [Stages all changes, writes a detailed commit message to a temp file,
        commits using git commit -F, cleans up]

Result:
  feat(auth): add JWT token refresh endpoint

  - Add POST /api/auth/refresh endpoint
  - Implement token rotation with refresh token family tracking
  - Add rate limiting (5 refreshes per minute per user)
  - Tests added for all edge cases
```

```
User: gitcmp

Agent: [Same as gitcm, plus rebase and push. Reports conflicts if any.]
```

**Key safety rules:**
- Commit messages are ALWAYS written to a file (never inline `-m` flag)
- Verification (build + test) runs before every commit
- Conflicts are reported to the user — never auto-resolved

---

### Deep Disambiguation (`grill_me`)

Eliminate ambiguity before planning or requirements gathering through a structured, relentless interview.

**Example — standalone:**

```
User: grill_me

I want to add a caching layer to my API

Agent: [Identifies the design tree — major decision branches:]
  1. What are you caching? (responses, queries, computed values)
  2. Cache backend? (Redis, in-memory, CDN)
  3. Invalidation strategy? (TTL, event-driven, manual)
  4. Cache key design? (naming convention, namespacing)

Agent: [Walks each branch one decision at a time:]
  "For Branch 1, we need to decide: what exactly are you caching?"
  → User answers
  "You said database queries. That implies [consequence]. Is that OK?"
  → Drills deeper into sub-decisions
  → Surfaces assumptions: "I'm now assuming X, Y, Z. Correct?"
  → Moves to next branch only when current one is fully resolved

Output: A shared understanding summary with all decisions, assumptions,
        constraints, and deferrals — ready for make_plan or make_requirements
```

**Example — as a prefix to planning:**

```
User: grill_me

I want to add webhook support to our notification system.
Once we're aligned, let's make_plan.

Agent: [Runs full grill-me protocol on webhooks — retry strategy,
        payload format, authentication, rate limiting, failure handling,
        deduplication — resolving every ambiguity]

Agent: [Transitions to make_plan with Phase 1.1 already complete]
```

**Aliases:** `grill-me`, `grill`, `disambiguate`, `deep-dive`, `interview`

---

### Project Configuration (`analyze_project`)

Auto-detect your project's toolchain and generate a configuration file:

```
User: analyze_project /path/to/my/project

Agent: [Reads package.json/Cargo.toml/go.mod/pyproject.toml, scans directory
        structure, detects language, framework, test runner, build tools]

Output: A complete .clinerules/project.md with:
  - Build, test, and verify commands
  - Directory layout
  - Coding conventions
  - Git conventions
  - Cross-references to all rule documents
```

**Incremental updates:** If `.clinerules/project.md` already exists, `analyze_project` merges the fresh scan with your existing file — auto-detectable sections are refreshed while user-customized sections (coding conventions, special rules) are preserved verbatim.

---

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests (107 tests across 4 test files)
yarn test

# Watch mode
yarn test:watch
```

## Architecture

```
src/
├── index.ts              # MCP server entry point
├── config.ts             # Configuration resolution
├── types/
│   └── index.ts          # Type definitions & constants
├── store/
│   ├── rule-store.ts     # In-memory document store
│   └── search-engine.ts  # TF-IDF search engine
├── tools/
│   ├── get-rule.ts       # Get rule by name
│   ├── list-rules.ts     # List all rules
│   ├── search-rules.ts   # Full-text search
│   ├── analyze-project.ts # Project analysis & project.md generation
│   └── get-setup-guide.ts # Setup instructions
└── __tests__/
    ├── store/            # Store & search engine tests
    └── tools/            # Tool integration tests
docs/                     # 11 bundled rule markdown files
```

## License

MIT
