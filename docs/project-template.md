# Project Configuration Template

> **Copy this file** to your project's `.clinerules/project.md` and fill in the values.
>
> This file is read by AI coding agents (Cline, Copilot, Cursor, etc.) to understand
> your project's toolchain, structure, and conventions. The generic rule files
> (`make_plan.md`, `code.md`, `testing.md`, `agents.md`, `git-commands.md`, `plans.md`)
> reference this file for project-specific settings.

---

## 🚨 MANDATORY: Load CodeOps Rules Before Any Work

**Before ANY planning or implementation, the AI agent MUST load these rules
using the codeops-mcp tools:**

1. `get_rule("agents")` — Load agent behavior rules **(REQUIRED FIRST)**
2. `get_rule("code")` — Load coding standards
3. `get_rule("testing")` — Load testing workflows
4. `get_rule("git-commands")` — Load git commit protocols

These rules are **mandatory** and must be consulted before every task.
**Do NOT skip this step. Do NOT proceed without reading these documents.**

---

## Project Overview

- **Name:** [Project name]
- **Description:** [Brief description of what this project does]
- **Type:** [web-app | api | library | cli | mobile | compiler | microservices | infrastructure]

---

## Toolchain

- **Language(s):** [e.g., TypeScript, JavaScript, Rust, Go, Python]
- **Framework(s):** [e.g., React, Express, Next.js, FastAPI, Actix]
- **Package Manager:** [e.g., yarn, npm, pnpm, cargo, pip, go]
- **Bundler:** [e.g., Vite, Turbo, Webpack, esbuild, none]
- **Test Framework:** [e.g., Vitest, Jest, pytest, go test, cargo test]
- **Linter/Formatter:** [e.g., ESLint + Prettier, rustfmt, black + ruff]

---

## Commands

All commands assume execution from the project root. Prefix all shell commands with `clear &&`.

### Build

```bash
# Build the project
clear && [build command]

# Example: clear && yarn build
# Example: clear && cargo build
# Example: clear && go build ./...
```

### Test

```bash
# Run all tests
clear && [test command]

# Run tests for a specific module/package (if applicable)
clear && [targeted test command]

# Example (monorepo): clear && yarn workspace @myorg/<pkg> test
# Example (single repo): clear && yarn test
# Example (Rust): clear && cargo test
# Example (Go): clear && go test ./...
```

### Verify (before commit)

```bash
# Full verification — run this before any git commit
clear && [verify command]

# Example: clear && yarn build && yarn test
# Example: clear && cargo build && cargo test
# Example: clear && docker compose config && docker compose build
```

### Clean

```bash
# Clean build artifacts and rebuild from scratch
clear && [clean command]

# Example: clear && yarn clean && yarn build && yarn test
# Example: clear && cargo clean && cargo build && cargo test
```

---

## Project Structure

### Type

- [ ] **Single repository** — One package/module in one repo
- [ ] **Monorepo** — Multiple packages/modules in one repo (e.g., Yarn workspaces + Turbo)
- [ ] **Multi-service** — Multiple services (e.g., Docker Compose)

### Directory Layout

```
[Describe or paste your project's directory layout]

# Example — Monorepo:
packages/
├── core/          # Core business logic
├── utils/         # Shared utilities
├── api/           # API/backend layer
├── ui/            # UI components
└── app/           # Main application

# Example — Single repo:
src/
├── components/    # React components
├── hooks/         # Custom hooks
├── services/      # Business logic
├── utils/         # Utilities
└── types/         # Type definitions
tests/
├── unit/
├── integration/
└── e2e/

# Example — Infrastructure:
docker-compose.yml
nginx/
├── nginx.conf
├── locations/
└── upstreams/
services/
├── app/
├── api/
└── worker/
```

### Source & Test Locations

- **Source code:** [e.g., `src/`, `packages/*/src/`]
- **Test files:** [e.g., `tests/`, `packages/*/tests/`, `src/**/*.test.ts`]
- **Test file convention:** [e.g., `*.test.ts`, `*.spec.ts`, `test_*.py`, `*_test.go`]

---

## Import & Module Conventions

### Import Style

- [ ] **ES Modules** — `import { x } from 'module'`
- [ ] **CommonJS** — `const x = require('module')`
- [ ] **Python** — `from module import x`
- [ ] **Go** — `import "package/path"`
- [ ] **Rust** — `use crate::module`
- [ ] **Other:** [specify]

### Module Resolution

```
[Describe how modules/packages are imported]

# Example — Monorepo:
# Import from package names: import { x } from '@myorg/utils'
# Never import from relative dist/ paths

# Example — Single repo:
# Use relative imports: import { x } from '../utils/helper'
# Use path aliases if configured: import { x } from '@/utils/helper'
```

### Type Imports (if applicable)

```
# Example (TypeScript):
# Use `import type { X }` for type-only imports
# Never use dynamic imports for types
```

---

## Coding Conventions

### Naming

- **Files:** [e.g., kebab-case, camelCase, snake_case]
- **Components/Classes:** [e.g., PascalCase]
- **Functions/Methods:** [e.g., camelCase, snake_case]
- **Constants:** [e.g., UPPER_SNAKE_CASE]
- **Types/Interfaces:** [e.g., PascalCase, prefixed with I or T]

### Architecture

- **Large classes (>500 lines):** [e.g., Use inheritance chains, Use composition, Split into modules]
- **Component pattern:** [e.g., Functional components with hooks, Class components, MVC]
- **State management:** [e.g., React hooks, Redux, Zustand, MobX, none]

### Documentation

- **Doc format:** [e.g., JSDoc, docstrings, Go doc comments, Rust doc comments]
- **Required for:** [e.g., All public/protected members, All exported functions]

---

## Git & Commit Conventions

### Commit Scope

The `[scope]` in commit messages should reference:

```
# Example — Monorepo:
# feat(package-name): description
# fix(utils): handle null input

# Example — Single repo:
# feat(auth): add JWT token refresh
# fix(api): handle timeout errors

# Example — Multi-service:
# feat(nginx): add rate limiting
# fix(docker): update health check
```

### Branch Strategy

- **Main branch:** [e.g., `main`, `master`, `develop`]
- **Feature branches:** [e.g., `feature/[name]`, `feat/[name]`]
- **Convention:** [e.g., Rebase before merge, Squash commits]

---

## Environment & Dependencies

### Required Tools

```
[List tools that must be installed]

# Example:
# Node.js >= 18
# Yarn >= 4
# Docker & Docker Compose (for integration tests)
# Turbo (installed via yarn)
```

### Environment Variables

```
[List any required env vars or reference .env.example]

# Example:
# DATABASE_URL — PostgreSQL connection string
# API_KEY — External API key
# See .env.example for full list
```

---

## Special Rules (Project-Specific)

```
[Add any project-specific rules that don't fit above]

# Examples:
# - Never use `private` class members — use `protected` instead
# - All React components must be functional (no class components)
# - Database queries must use the query builder, never raw SQL
# - All API endpoints must have Zod validation schemas
# - Docker services must have health checks
# - Nginx configs must use the include pattern (locations/, upstreams/)
```

---

## Agent Automation (Optional)

If this project uses `scripts/agent.sh` for VS Code settings automation:

```bash
# Start of Act Mode task:
clear && scripts/agent.sh start

# End of Act Mode task:
clear && scripts/agent.sh finished
```

If not applicable, remove this section.

---

## Cross-References

The generic rule files that read this `project.md`:

- **make_plan.md** — Uses verify command, file paths, commit scope
- **code.md** — Uses language conventions, architecture rules
- **testing.md** — Uses test commands, test locations, test framework
- **git-commands.md** — Uses commit scope, verify command
- **agents.md** — Uses shell commands, verify command
- **plans.md** — Uses task file path patterns
