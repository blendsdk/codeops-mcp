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

- **Always prefix commands with `clear && sleep 3 &&`** for clean terminal output (the `sleep 3` gives VS Code time to initialize the terminal; the delay is configurable in `.clinerules/project.md`).
- **Use the project's designated package manager exclusively** — never mix package managers.
- **Build before testing** when you've changed source files (if the project requires a build step).
- Use the project's caching/clean mechanism for fully clean runs when needed.

### Examples by Ecosystem

> **Note:** These are examples. Always use the actual commands from `.clinerules/project.md`.

| Ecosystem | Run All Tests | Targeted Tests | Verify |
|-----------|--------------|----------------|--------|
| Node.js (Yarn) | `clear && sleep 3 && yarn test` | `clear && sleep 3 && yarn workspace @org/<pkg> test` | `clear && sleep 3 && yarn build && yarn test` |
| Node.js (npm) | `clear && sleep 3 && npm test` | `clear && sleep 3 && npm test -- --filter=<module>` | `clear && sleep 3 && npm run build && npm test` |
| Rust | `clear && sleep 3 && cargo test` | `clear && sleep 3 && cargo test -p <crate>` | `clear && sleep 3 && cargo build && cargo test` |
| Go | `clear && sleep 3 && go test ./...` | `clear && sleep 3 && go test ./pkg/<module>/...` | `clear && sleep 3 && go build ./... && go test ./...` |
| Python | `clear && sleep 3 && pytest` | `clear && sleep 3 && pytest tests/<module>/` | `clear && sleep 3 && pytest` |
| Infrastructure | `clear && sleep 3 && docker compose config` | N/A | `clear && sleep 3 && docker compose config && docker compose build` |
| Custom script | `clear && sleep 3 && ./run-tests` | `clear && sleep 3 && ./run-tests <component>` | `clear && sleep 3 && ./run-tests` |

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

### Test Description Naming Convention

Write test descriptions that clearly state the expected behavior and condition:

```
Pattern: "should [expected behavior] when [condition]"

Examples:
  ✅ "should return empty array when input is null"
  ✅ "should throw ValidationError when email is invalid"
  ✅ "should cache result when called multiple times"
  ❌ "test null input"          (too vague)
  ❌ "works correctly"          (meaningless)
  ❌ "handles edge case"        (which edge case?)
```

Group related tests in `describe()` blocks named after the unit under test (function, method, class, or feature).

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

Refer to `code.md` — Section 2 (Testing Requirements) for detailed testing standards.

---

## **Rule 6: Test-Driven Development Workflow (🚨 NON-NEGOTIABLE)**

**Required workflow for AI agents** — following this order ensures tests validate behavior before implementation, catching design issues early:

1. **Understand** the change needed
2. **Write specification tests first** — derive expectations from requirements, acceptance criteria, API contracts, or specification documents. See **Rule 10: Specification-First Testing Protocol** for the full mandatory protocol.
3. **Verify specification tests FAIL** (red phase) — confirms tests are meaningful, not vacuous. Document any that pass pre-implementation with justification.
4. **Implement the change**
5. **Verify specification tests pass** (green phase) — the implementation now satisfies the specification
6. **Write implementation tests** — edge cases, internals, error paths, boundary conditions
7. **Build the project** (if applicable)
8. **Run full test suite** (project's verify command)
9. **Only then** call `attempt_completion`

> **🚨 CRITICAL:** "Write tests first" means "write SPECIFICATION tests first, from spec documents" — NOT "write tests that confirm what you plan to build." See Rule 10 for the full protocol.

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

## **Rule 9: Security Testing (🚨 NON-NEGOTIABLE)**

When building any system — especially public-facing applications — security test cases are **mandatory**. These tests verify that the application is hardened against common attack vectors. See `code.md` rules 32-34 for the full security coding standard.

### Mandatory Security Tests

Every project that accepts user input, exposes endpoints, or handles sensitive data MUST include tests for:

| Category | What to Test | Example |
|----------|-------------|---------|
| **Input validation** | Reject malformed, oversized, and malicious input | Send SQL payloads, XSS strings, oversized bodies — expect rejection |
| **SQL injection** | Parameterized queries block injection | `' OR 1=1 --`, `'; DROP TABLE users; --` in all input fields |
| **XSS prevention** | User-provided data is escaped in HTML output | `<script>alert('xss')</script>` in text fields — expect escaped output |
| **Command injection** | User input never reaches shell/exec | `; rm -rf /`, `$(whoami)` in inputs — expect rejection or safe handling |
| **Path traversal** | File paths are validated and canonicalized | `../../etc/passwd`, `%2e%2e%2f` in file params — expect rejection |
| **Authentication** | Auth bypass attempts are blocked | Access protected endpoints without token, with expired token, with forged token |
| **Authorization** | Users cannot access other users' data | User A tries to access User B's resources — expect 403 |
| **Privilege escalation** | Role boundaries are enforced | Regular user tries admin endpoints — expect 403 |
| **Rate limiting** | Brute force is blocked | Rapid-fire login attempts — expect 429 after threshold |
| **Error exposure** | No internal details leak in errors | Trigger errors — expect generic messages, no stack traces or DB schemas |
| **Secrets in code** | No hardcoded credentials | Scan source files for API keys, passwords, tokens — expect none |
| **Dependency vulnerabilities** | No known CVEs in dependencies | Run `npm audit` / `cargo audit` / `pip-audit` — expect clean or documented exceptions |

### Infrastructure Security Tests

For projects with Docker, CI/CD, or deployment configurations:

| Category | What to Test | Example |
|----------|-------------|---------|
| **Container user** | Containers run as non-root | Inspect container user — expect non-root UID |
| **Base image** | Minimal base image used | Check Dockerfile — expect Alpine, distroless, or scratch |
| **Secrets in images** | No secrets embedded in layers | Scan image layers — expect no credentials, tokens, or keys |
| **Open ports** | Only necessary ports exposed | Inspect container network config — expect only required ports |
| **CI/CD secrets** | Secrets not logged in CI output | Review CI pipeline logs — expect no credential exposure |

### Security Test Organization

Security tests should be organized in dedicated test files:

```
tests/
├── security/
│   ├── security.injection.test.[ext]       # SQL, XSS, command injection tests
│   ├── security.auth.test.[ext]            # Authentication & authorization tests
│   ├── security.rate-limit.test.[ext]      # Rate limiting tests
│   ├── security.input-validation.test.[ext] # Input validation tests
│   └── security.infrastructure.test.[ext]  # Docker & deployment security tests
```

### When Security Tests Are Not Applicable

- ✅ **Libraries/SDKs** with no network endpoints — focus on input validation tests only
- ✅ **CLI tools** with no network exposure — focus on input validation and path traversal tests
- ✅ **Pure compute/algorithm projects** — security tests may be N/A, but document the decision

> **📖 See `code.md` Section 10 (Security-First Development)** for the full security coding standard that these tests verify.

---

## **Rule 10: Specification-First Testing Protocol (🚨 NON-NEGOTIABLE)**

> **🚨 This rule exists to prevent tautological testing — where tests are written to match the implementation instead of the specification, causing bugs to ship to production undetected.**

### Why This Rule Exists

When an AI agent writes both code and tests in the same session, a dangerous failure mode emerges: **the tests mirror the implementation instead of independently verifying it.** The agent unconsciously derives test expectations from the code it just wrote (or plans to write), creating tests that prove "the code does what the code does" rather than "the code does what the specification requires."

**The result:** All tests pass ✅, but the feature is broken ❌. Bugs are enshrined in tests as "expected behavior" and only discovered in production.

**Real-world pattern of this failure:**

```
1. Specification says: "issuer field MUST include the org path segment" (per RFC 8414 §2)
2. Agent implements: issuer = baseUrl (bug — missing org path segment)
3. Agent writes test: expect(doc.issuer).toBe(baseUrl) — test matches the bug ❌
4. Agent adds comment: "issuer is the base URL for all orgs" — rationalizes the bug
5. All tests pass ✅, bug ships to production, discovered when clients reject the response
```

**What specification-first testing would have caught:**

```
1. During PLANNING: spec test case ST-1 defined: expect(doc.issuer).toBe(`${baseUrl}/org-slug`) (from RFC)
2. Agent writes spec test BEFORE code: expect(doc.issuer).toBe(`${baseUrl}/org-slug`)
3. Agent implements: issuer = baseUrl → spec test FAILS ❌
4. Agent sees failure, fixes implementation to include org slug
5. Spec test passes ✅, bug caught BEFORE production
```

### Two Mandatory Test Categories

Every feature MUST have both categories of tests. Neither is optional.

| Category | Source of Truth | When Written | Purpose | File Convention |
|----------|----------------|--------------|---------|-----------------|
| **Specification Tests** | Requirements, acceptance criteria, API contracts, RFCs, spec documents | DURING PLANNING or BEFORE implementation | Verify the code does what the **specification** says | `[feature].spec.test.[ext]` |
| **Implementation Tests** | The code itself | AFTER implementation | Verify internals, edge cases, error paths, boundary conditions | `[feature].impl.test.[ext]` |

### Specification Test Rules — 🚨 ALL NON-NEGOTIABLE

**1. Expectations MUST come from specification documents, NEVER from implementation code.**

The agent MUST derive spec test expectations from:
- ✅ Requirements documents (`01-requirements.md`, RD documents)
- ✅ Component specifications (`03-XX-component.md`)
- ✅ Testing strategy spec test cases (`07-testing-strategy.md`)
- ✅ API contracts, RFCs, protocol specifications
- ✅ Acceptance criteria
- ✅ Ambiguity Register decisions (`00-ambiguity-register.md`)

The agent MUST NOT derive spec test expectations from:
- ❌ Reading the implementation source code logic
- ❌ Running the code and observing what it produces
- ❌ Copying return values from the implementation
- ❌ "What the code currently does"

**2. Implementation logic is OFF-LIMITS when writing specification tests.**

When writing spec tests, the agent:
- ✅ MAY read type definitions, interfaces, function signatures, and public API surface (needed to write compilable tests)
- ❌ MUST NOT read implementation logic (function bodies, private methods, internal algorithms)
- ❌ MUST NOT reference implementation source files for deriving expected values

The agent must reference ONLY specification documents when determining what the correct output should be.

**3. Specification tests are IMMUTABLE ORACLES.**

Once spec test expectations are defined (in `07-testing-strategy.md` during planning, or in spec test files during execution):
- ✅ The implementation MUST satisfy the spec tests — not the other way around
- ❌ The agent MUST NOT modify spec test expectations to make them match the implementation
- ❌ The agent MUST NOT weaken assertions to avoid failures
- ❌ The agent MUST NOT add conditional logic to spec tests to accommodate implementation quirks

**If a spec test expectation needs to change**, the agent MUST:
1. **STOP** implementation immediately
2. **Report** to the user: *"Specification test ST-X defines [expected behavior], but the implementation produces [actual behavior]. The spec and implementation disagree."*
3. **Present options:** (a) Fix the implementation to match the spec, or (b) Update the specification (requires explicit user approval + AR entry)
4. **Wait** for the user's explicit decision
5. **Record** the decision in the Ambiguity Register if the spec changes

**4. Red phase verification — spec tests SHOULD fail before implementation.**

After writing spec tests and before implementing:
- The agent MUST run the spec tests to verify they fail (red phase)
- If ALL spec tests fail → proceed to implementation (expected — confirms tests are meaningful)
- If SOME spec tests pass before implementation → the agent MUST document WHY each passing test is legitimate (e.g., "ST-3 passes because the default empty-array behavior already exists in the base class") and include this justification in the execution plan
- If the agent CANNOT justify why a spec test passes pre-implementation → the test is likely vacuous (testing nothing meaningful) and MUST be rewritten with stronger assertions

**5. Spec test failure after implementation = implementation bug, NOT test bug.**

This is the cardinal rule. When a spec test fails after implementation:
- ✅ The implementation is wrong — fix the implementation
- ❌ Do NOT modify the spec test to match the broken implementation
- ❌ Do NOT skip or disable the spec test
- ❌ Do NOT rationalize the failure as "the spec was wrong"

The ONLY exception: the user explicitly decides to change the specification (see rule 3 above).

### Test File Organization

Specification tests and implementation tests MUST be in separate files:

```
tests/
├── auth/
│   ├── auth.login.spec.test.[ext]       # Specification tests — from requirements
│   ├── auth.login.impl.test.[ext]       # Implementation tests — edge cases, internals
│   ├── auth.token.spec.test.[ext]       # Specification tests
│   └── auth.token.impl.test.[ext]       # Implementation tests
├── user/
│   ├── user.creation.spec.test.[ext]    # Specification tests
│   └── user.creation.impl.test.[ext]    # Implementation tests
└── e2e/
    ├── e2e.user-journey.spec.test.[ext] # E2E specification tests
    └── e2e.user-journey.impl.test.[ext] # E2E implementation tests
```

**Why separate files:** The physical file boundary creates a hard enforcement mechanism. When the agent is writing `auth.login.spec.test.ts`, there is a clear, auditable separation from implementation-derived tests. Code reviewers can instantly verify: "Do spec tests exist? Are they derived from requirements?"

**Describe block labeling:** Within spec test files, use `describe('Specification: [Feature]', ...)` to make the test category unmistakable in test output.

### Specification Test Traceability

Every spec test MUST include a traceability comment linking it to its source requirement:

```typescript
// Source: 01-requirements.md — Req 1.3 (email validation)
// AR: #5 — User chose: reject emails without TLD
test('should throw ValidationError when email has no TLD', () => {
    expect(() => createUser({ email: 'user@localhost' })).toThrow(ValidationError);
});
```

```python
# Source: RFC 8414 §2 — issuer MUST match the discovery URL
# ST: ST-1 from 07-testing-strategy.md
def test_issuer_includes_org_slug():
    doc = discover(f"{base_url}/{org_slug}")
    assert doc["issuer"] == f"{base_url}/{org_slug}"
```

### Interaction with `make_plan`

During plan creation (`make_plan`):
- The `07-testing-strategy.md` document MUST include a **Specification Test Cases** section with concrete input → expected output pairs (see `make_plan.md` for the template)
- These spec test cases become the immutable oracles that the implementation must satisfy
- Every spec test case must trace to a requirement or Ambiguity Register entry

During plan execution (`exec_plan`):
- Every feature phase MUST follow the three-phase task ordering (see `make_plan.md`):
  1. Write specification tests (from `07-testing-strategy.md`)
  2. Implement the feature (spec tests should start passing)
  3. Write implementation tests (edge cases, internals)
- This ordering is enforced in the execution plan template

> **📖 See `code.md` Rule 31 (Specification-Implementation Test Separation)** for the coding standard that enforces this protocol at the code level.
> **📖 See `make_plan.md`** for the testing strategy template with mandatory specification test cases and the three-phase task ordering rule.

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

**Remember:** Always use the project's designated package manager. Always prefix commands with `clear && sleep 3 &&` (see `agents.md` — Shell Commands rule for configurable delay). Check `.clinerules/project.md` for all specific commands.

---

## **Cross-References**

- See **`.clinerules/project.md`** for project-specific test commands, framework, and structure
- See **code.md** — Section 2 (Testing Requirements) and Section 9 (Testing Integrity) for testing standards
- See **requirements.md** for how acceptance criteria in requirement documents map to test strategies
- See **agents.md** for shell command rules and task completion criteria
- See **git-commands.md** for git workflow instructions
- See **make_plan.md** for testing strategy templates and pre-implementation testing re-evaluation
