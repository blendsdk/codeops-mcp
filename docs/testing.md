# Testing Standards & Rules

## **IMPORTANT**

These rules are **mandatory** and must be applied **strictly and consistently** when working on any project.

**For project-specific test commands, framework, and structure**, see `.clinerules/project.md`.

---

## **Project-Specific Configuration**

This file contains **universal testing rules** that work for any software project. All project-specific settings come from `.clinerules/project.md`, which defines:

- Test commands (build, test, verify, clean)
- Test framework and configuration
- Project structure and test file locations
- Package manager and toolchain
- Module/package test targets

**If `.clinerules/project.md` does not exist**, detect project settings from manifest files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `docker-compose.yml`, etc.) and use sensible defaults.

---

## **Rule 1: Test Commands**

### Command Reference

All test commands are defined in `.clinerules/project.md`. Common patterns:

| Situation | What to Run |
|-----------|-------------|
| Quick iteration (single module) | Project's targeted test command |
| Before task completion | Project's full verify command |
| Before git commit | Project's full verify command |
| Clean rebuild + test | Project's clean command |
| Integration tests | Project's integration test command |

### Important Notes

- **Always prefix commands with `clear &&`** for clean terminal output.
- **Use the project's designated package manager exclusively** — never mix package managers.
- **Build before testing** when you've changed source files (if the project requires a build step).
- Use the project's caching/clean mechanism for fully clean runs when needed.

### Examples by Ecosystem

> **Note:** These are examples. Always use the actual commands from `.clinerules/project.md`.

| Ecosystem | Run All Tests | Targeted Tests | Verify |
|-----------|--------------|----------------|--------|
| Node.js (Yarn) | `clear && yarn test` | `clear && yarn workspace @org/<pkg> test` | `clear && yarn build && yarn test` |
| Node.js (npm) | `clear && npm test` | `clear && npm test -- --filter=<module>` | `clear && npm run build && npm test` |
| Rust | `clear && cargo test` | `clear && cargo test -p <crate>` | `clear && cargo build && cargo test` |
| Go | `clear && go test ./...` | `clear && go test ./pkg/<module>/...` | `clear && go build ./... && go test ./...` |
| Python | `clear && pytest` | `clear && pytest tests/<module>/` | `clear && pytest` |
| Infrastructure | `clear && docker compose config` | N/A | `clear && docker compose config && docker compose build` |
| Custom script | `clear && ./run-tests` | `clear && ./run-tests <component>` | `clear && ./run-tests` |

---

## **Rule 2: When to Use Targeted vs Full Tests**

### Use Targeted Tests (single module/package) When:

- ✅ Working on a specific module or package
- ✅ Quick iteration during development
- ✅ Debugging a failing test in one area
- ✅ Time-constrained changes to one component

### Use Full Tests (all modules/packages) When:

- ✅ Before completing any task (`attempt_completion`)
- ✅ Before any git commit
- ✅ After changes that cross module/package boundaries
- ✅ After modifying shared/core modules
- ✅ Final verification of any implementation

**🚨 CRITICAL:** Always run the project's full verify command before marking a task complete!

---

## **Rule 3: Test Framework & Configuration**

The test framework, configuration, and file conventions are defined in `.clinerules/project.md`.

### Universal Test File Conventions

- Test files should be clearly identifiable by name or location.
- Follow the project's existing test file naming pattern (e.g., `*.test.ts`, `*_test.go`, `test_*.py`).
- Tests can live in a dedicated `tests/` directory or alongside source files — follow the project's convention.

### Writing Tests (Universal Pattern)

Regardless of framework, follow the **Arrange-Act-Assert** pattern:

```
// Arrange — Set up test data and preconditions
// Act — Execute the code under test
// Assert — Verify the expected outcome
```

**Example (language-neutral):**

```
describe('ComponentName') {
    test('should perform expected behavior') {
        // Arrange
        input = createTestInput()

        // Act
        result = processInput(input)

        // Assert
        assertEqual(result, expectedValue)
    }
}
```

---

## **Rule 4: Integration & External Service Tests**

Some features require external services (databases, message queues, containers, etc.) for integration testing.

### Integration Test Workflow

1. **Start required services** (using Docker, scripts, or manual setup)
2. **Run integration tests** against live services
3. **Stop services** after tests complete

### When External Services Are NOT Available

- Run only unit tests (use the project's fast/unit test command).
- Skip service-dependent test suites entirely.
- Document that integration tests were skipped.

### Common Patterns

| Service | Start Command | Health Check |
|---------|--------------|--------------|
| Docker Compose | `docker compose up -d` | `docker compose ps` |
| Database (standalone) | `docker run -d postgres:16` | `pg_isready` |
| Custom script | `./scripts/start-services.sh` | `curl http://localhost/health` |

> **Note:** Check `.clinerules/project.md` for project-specific integration test commands and Docker configurations.

---

## **Rule 5: Test Coverage Requirements**

When implementing new features:

1. **Unit Tests** — Required for all new functions/methods/components
2. **Integration Tests** — Required for module/component interactions
3. **End-to-End Tests** — Required for complete user or system workflows

### Coverage Goals

| Area | Minimum Coverage |
|------|-----------------|
| Core business logic | 90%+ |
| Shared utilities/libraries | 90%+ |
| API routes/controllers | 80%+ |
| UI components | 80%+ |
| Integration/E2E | 60%+ |

Refer to `code.md` Rules 4–8 for detailed testing standards.

---

## **Rule 6: Test-Driven Development Workflow**

**Recommended workflow for AI agents:**

1. **Understand** the change needed
2. **Write/update tests first** (if adding new functionality)
3. **Run targeted tests** during development (project's targeted test command)
4. **Implement the change**
5. **Verify targeted tests pass**
6. **Build the project** (if applicable)
7. **Run full test suite** (project's verify command)
8. **Only then** call `attempt_completion`

---

## **Rule 7: Debugging Test Failures**

When tests fail:

1. **Read the error message** — Most test frameworks provide clear output with diffs
2. **Isolate the failure** — Run the specific module's tests
3. **Check related modules** — If you changed a shared module, test dependents
4. **Fix and verify** — Run targeted tests until passing
5. **Full verification** — Run the project's full verify command before completing

### Dependency Chain Awareness

When working in any multi-module project, always test downstream modules when changing upstream/shared code:

```
Example dependency chain:
  utils → core → api → app
  utils → ui → app

If you change `utils`, test: utils, core, api, ui, app
If you change `ui`, test: ui, app
If you change `app`, test: app only
```

> **Note:** Check `.clinerules/project.md` for the project's specific dependency chain.

---

## **Rule 8: Validation for Non-Code Projects**

For infrastructure, configuration, or DevOps projects where traditional unit test frameworks don't apply, validation replaces testing:

### Configuration Validation

| What Changed | Validation Command |
|-------------|-------------------|
| Docker Compose | `docker compose config` |
| Nginx config | `docker compose exec nginx nginx -t` |
| Shell scripts | `shellcheck scripts/*.sh` |
| Kubernetes manifests | `kubectl apply --dry-run=client -f manifest.yaml` |
| Terraform | `terraform validate` |
| CloudFormation | `aws cloudformation validate-template` |

### Runtime Validation

| Check | Command |
|-------|---------|
| Service health | `curl -sf http://localhost/health` |
| Service status | `docker compose ps` |
| Container logs | `docker compose logs <service> --tail=20` |
| Network connectivity | `docker compose exec <service> curl -sf http://<target>:<port>/health` |

> **Note:** Check `.clinerules/project.md` for the project's specific validation commands and workflows.

---

## **Summary**

| Situation | Action |
|-----------|--------|
| Quick dev iteration (single module) | Run project's targeted test command |
| Before task completion | Run project's full verify command |
| Before git commit | Run project's full verify command |
| Clean rebuild + test | Run project's clean command |
| Integration tests (Docker/services) | Start services → test → stop services |
| Config/infra changes | Run appropriate validation commands |
| External services unavailable | Run unit tests only, document skipped tests |

**Remember:** Always use the project's designated package manager. Always prefix commands with `clear &&`. Check `.clinerules/project.md` for all specific commands.

---

## **Cross-References**

- See **`.clinerules/project.md`** for project-specific test commands, framework, and structure
- See **code.md** for testing standards (Rules 4–8) and test integrity (Rules 28–29)
- See **agents.md** for shell command rules and task completion criteria
- See **git-commands.md** for git workflow instructions
