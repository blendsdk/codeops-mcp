# Coding Standards

## **IMPORTANT**

These rules are **mandatory** and must be applied **strictly and consistently** across the entire codebase.

**For project-specific conventions** (language, framework, naming, architecture), see `.clinerules/project.md`.

---

## 1. Code Quality & Structure

1. **DRY Principle (Don't Repeat Yourself)**
   - Eliminate duplicated logic, constants, and patterns across all file types.
   - Extract reusable logic into functions, classes, modules, or utilities.
   - If code looks similar in more than one place, refactor it.

2. **Clarity Over Cleverness**
   - Write code that is easy to read and reason about.
   - Prefer explicit, understandable logic over short or "smart" solutions.
   - Every line should be understandable by a junior developer.

3. **Single Responsibility**
   - Each function, method, class, or module must have **one clear responsibility**.
   - Avoid large functions that perform multiple unrelated tasks.

---

## 2. Testing Requirements

**📖 See `testing.md` for test commands and AI testing workflow.**

4. **All Tests Must Pass**
   - No code may be merged or delivered if **any test fails**.
   - If existing behavior changes, tests must be updated accordingly.
   - Run the project's verify command (from `.clinerules/project.md`) before completing any task.

5. **Tests Are Part of the Code**
   - Tests must be readable, meaningful, and maintained with the same care as production code.
   - Avoid flaky or unclear tests.

6. **Maximum Test Coverage**
   - Always create the maximum amount of possible tests.
   - Sophisticated and granular tests are essential.
   - Each function, method, and component should have multiple test cases covering:
     - Normal/happy path scenarios
     - Edge cases and boundary conditions
     - Error conditions and invalid inputs
     - Integration with other components

7. **End-to-End Testing**
   - Always create end-to-end tests where possible.
   - Test complete workflows from start to finish.
   - Ensure the entire system works together correctly.
   - End-to-end tests validate real-world usage scenarios.

   **Examples by project type:**

   | Project Type | E2E Workflow |
   |-------------|-------------|
   | Compiler/Parser | Source → Lexer → Parser → Code generation |
   | Web API | Request → Controller → Service → Database → Response |
   | CLI tool | Arguments → Processing → Output/File generation |
   | Infrastructure | Build → Deploy → Health check → Endpoint verification |
   | SDK/Library | Expression → Compilation → Parameterized output |

8. **Test Granularity**
   - Write granular, focused tests that test one thing at a time.
   - Each test should have a clear purpose and failure message.
   - Small, specific tests are easier to debug when they fail.
   - See also: `plans.md` Rule 8 for task-level testing requirements.

---

## 3. Documentation & Comments

9. **Mandatory Code Comments**
   - Comment _why_ something is done, not just _what_ is done.
   - Complex logic, edge cases, and non-obvious decisions must always be explained.

10. **Assume a Junior Developer as the Reader**
    - Write comments so that a junior developer can understand:
      - The intent of the code
      - The workflow
      - Any assumptions or constraints

11. **Documentation Comments Are Required**
    - Every public and protected class, method, function, and component must have documentation comments.
    - Documentation must describe:
      - Purpose
      - Parameters
      - Return values
      - Side effects (if any)

    **Format by language** (use the format specified in `.clinerules/project.md`):

    | Language | Format | Example |
    |----------|--------|---------|
    | TypeScript/JavaScript | JSDoc | `/** @param name Description */` |
    | Python | Docstrings | `"""Description of function."""` |
    | Rust | Doc comments | `/// Description of function` |
    | Go | Doc comments | `// FunctionName does something.` |
    | Java/C# | XML docs or Javadoc | `/** @param name Description */` |
    | Shell | Header comments | `# Description: What this script does` |

---

## 4. Object-Oriented Rules

> **Applicability:** These rules apply when the project uses OOP (classes, inheritance). Skip if the project uses a purely functional or procedural paradigm.

12. **No Private Class Members**
    - Do **not** use `private` methods or properties.
    - Methods and properties must be either:
      - `public`, or
      - `protected` (used instead of `private`)

13. **Encapsulation Through Convention**
    - `protected` members are considered internal and must not be accessed outside subclasses.
    - Document protected members clearly in documentation comments.

---

## 5. Maintainability First

14. **Code Must Be Easy to Maintain and Extend**
    - Optimize for long-term maintainability, not short-term speed.
    - Future changes should be easy and safe to implement.

15. **Consistency Is Non-Negotiable**
    - Follow existing patterns, naming conventions, and architecture.
    - Do not introduce new styles or patterns without a strong reason.
    - If adding new files, follow existing naming and organization patterns.

16. **Imports & Module Loading**
    - Use the project's standard import/module style (defined in `.clinerules/project.md`).
    - Keep imports at the top of the file.
    - Separate type-only imports from value imports when the language supports it.
    - Never use deprecated or legacy import styles when modern alternatives exist.

    **Common patterns by language:**

    | Language | Preferred | Avoid |
    |----------|-----------|-------|
    | TypeScript/JS | `import { x } from 'module'` | `require('module')` |
    | Python | `from module import x` | `__import__('module')` |
    | Rust | `use crate::module::x;` | — |
    | Go | `import "package/path"` | — |

---

## 6. Module & Package Boundaries

> **Applicability:** These rules apply to all projects. For monorepos, "package" means a workspace package. For single repos, "module" means a directory/namespace boundary. For multi-service projects, "service" means a deployable unit.

17. **Respect Module/Package Boundaries**
    - Import from public APIs, NOT from internal paths.
    - Each module/package has a defined public API (e.g., `index.ts`, `__init__.py`, `mod.rs`).
    - Only import what's publicly exported.

    ❌ **Wrong (reaching into internals):**
    ```
    import { helper } from '../../other-module/dist/internal/helper'
    ```

    ✅ **Correct (use public API):**
    ```
    import { helper } from '@myorg/other-module'
    ```

    > **Note:** Adjust import style to match your language and project structure (see `.clinerules/project.md`).

18. **Versioning**
    - Follow the project's versioning strategy (defined in `.clinerules/project.md`).
    - Never manually change version numbers unless the project requires it.
    - Use the project's configured version management tooling.

19. **Dependency Management**
    - Separate runtime dependencies from development/build dependencies.
    - Build tools, test frameworks, and linters are development dependencies.
    - Keep dependencies minimal — only what's needed.

    **Examples by ecosystem:**

    | Ecosystem | Runtime | Dev/Build |
    |-----------|---------|-----------|
    | Node.js | `dependencies` | `devDependencies` |
    | Python | `install_requires` | `extras_require[dev]` |
    | Rust | `[dependencies]` | `[dev-dependencies]` |
    | Go | `go.mod require` | build tags / `_test.go` |

---

## 7. Large Implementation Architecture

> **These rules prevent AI context window overflow and improve maintainability.**

20. **MUST Split When Implementation Exceeds 500 Lines**
    - When any implementation WILL exceed **500 lines** OR has multiple logical concerns
    - Each file/layer: **200–500 lines maximum**
    - Natural dependency flow (each part builds on previous)
    - Perfect for AI context window limitations

    **Splitting strategies by paradigm:**

    | Paradigm | Strategy | Pattern |
    |----------|----------|---------|
    | OOP | Inheritance chain | `Base → Layer1 → Layer2 → Concrete` |
    | Functional | Module composition | `core.ts` + `helpers.ts` + `validators.ts` → `index.ts` |
    | Procedural | File splitting | `parse.c` + `transform.c` + `output.c` |
    | Config/Infra | Modular includes | `base.conf` + `locations/*.conf` + `upstreams/*.conf` |
    | Components | Composition | `Container` + `Header` + `Body` + `Footer` |

21. **Splitting Design Principles**
    - **Foundation First**: Base/core contains shared utilities and infrastructure
    - **Logical Layers**: Each layer/module adds one primary concern
    - **Clean Dependencies**: Upper layers can use everything below them
    - **Protected/Internal Methods**: Use appropriate access modifier for layer communication
    - **Single Entry Point**: Only the final/main module should be the public interface

22. **File Naming Conventions for Split Implementations**
    - Foundation file: `base.[ext]`, `core.[ext]`
    - Feature layers: `[feature].[ext]`
    - Main/concrete file: `[main].[ext]`
    - Public API: `index.[ext]`, `mod.[ext]`, `__init__.[ext]`

    **Example inheritance chain (OOP):**
    ```
    base-service.ts → cacheable-service.ts → user-service.ts
    base-controller.ts → auth-controller.ts → admin-controller.ts
    ```

    **Example module composition (functional):**
    ```
    parsers/core.ts + parsers/expressions.ts + parsers/statements.ts → parsers/index.ts
    ```

    **Example config splitting (infrastructure):**
    ```
    nginx/includes/ssl.conf + nginx/locations/10-health.conf + nginx/upstreams/app.conf
    ```

23. **When to Split**
    - ✅ Any implementation approaching 500+ lines
    - ✅ Complex systems with natural layer dependencies
    - ✅ Systems that will grow significantly over time
    - ✅ Service layers, middleware chains, controller hierarchies, parsers, compilers
    - ❌ Simple utilities or data structures
    - ❌ Files with single, focused responsibilities under 500 lines

---

## 8. Type Safety Best Practices

> **Applicability:** These rules apply when using statically typed languages (TypeScript, Rust, Go, Java, C#, etc.). Skip for dynamically typed languages unless they use type hints (e.g., Python with mypy).

24. **No Inline or Dynamic Type Imports**
    - Always add proper import statements at the top of the file.
    - Never use inline import expressions for type references.

    ❌ **Wrong:**
    ```typescript
    function example(expr: import('../core/types').Expression): void
    ```

    ✅ **Correct:**
    ```typescript
    import type { Expression } from '../core/types';
    function example(expr: Expression): void
    ```

25. **Use Proper Type Guards / Type Narrowing**
    - Use `instanceof`, pattern matching, or custom type guard functions for type narrowing.
    - Never use unsafe casts to bypass the type system.

    ❌ **Wrong:**
    ```typescript
    if ((node as any).tableName) { ... }
    ```

    ✅ **Correct:**
    ```typescript
    function isTableNode(node: ASTNode): node is TableNode {
        return 'tableName' in node && typeof node.tableName === 'string';
    }
    if (isTableNode(node)) {
        node.tableName; // Type system knows this exists
    }
    ```

26. **No Unsafe Type Casting in Production Code**
    - Do **not** use unsafe casts (`as any`, `as unknown`, `unsafeCoerce`, etc.) to bypass type checking.
    - Use proper type guards, generics, or fix the underlying type issue.
    - Test files may use unsafe casts sparingly for test setup, but prefer proper typing.

27. **Complete Interface/Type Compliance**
    - When creating objects that implement an interface or type, provide ALL required fields with proper types.
    - Never use partial objects where full interfaces are expected without the appropriate partial type.
    - Use enums or constants — never hardcoded string literals for type discriminators.

    ❌ **Wrong (incomplete, hardcoded strings):**
    ```typescript
    user: { name: 'John', email: 'john@test.com' }
    kind: 'variable' as const
    ```

    ✅ **Correct (complete, typed):**
    ```typescript
    user: { id: 1, name: 'John', email: 'john@test.com', createdAt: new Date(), isActive: true }
    kind: SymbolKind.Variable
    ```

---

## 9. Testing Integrity

28. **Prefer Real Objects Over Mocks**
    - Use real implementations in tests when the real object exists and has been developed.
    - Helper functions that create simple test data structures are acceptable.
    - Only mock external services (databases, HTTP APIs, file systems) or when the real implementation is too complex to set up.
    - Stub implementations are acceptable only when the real implementation doesn't exist yet.

    ❌ **Wrong (mocking what exists):**
    ```typescript
    // UserService exists as a real class!
    const mockService = { getUser: () => ({}) } as any;
    ```

    ✅ **Correct (use real implementation):**
    ```typescript
    const service = new UserService(testConfig);
    const result = await service.validateEmail('test@example.com');
    expect(result).toBe(true);
    ```

29. **🚨 MUST Split Tests into Logically Grouped Files**
    - Tests MUST be organized into multiple focused test files.
    - Each test file should cover ONE logical concern or feature area.
    - Prevent test files from becoming too large (>200–300 lines).
    - This is NON-NEGOTIABLE for maintainability.

    **File Organization Pattern:**
    ```
    tests/
    ├── auth/
    │   ├── auth.login.test.[ext]        # Login flow tests only
    │   ├── auth.token.test.[ext]        # Token management tests only
    │   └── auth.permissions.test.[ext]  # Permission tests only
    ├── user/
    │   ├── user.creation.test.[ext]     # User creation tests only
    │   ├── user.validation.test.[ext]   # Validation tests only
    │   └── user.integration.test.[ext]  # Integration tests
    └── e2e/
        ├── e2e.user-journey.test.[ext]  # Complete user workflows
        └── e2e.checkout.test.[ext]      # Checkout workflow
    ```

    **When to Split Test Files:**

    | Indicator | Action |
    |-----------|--------|
    | File exceeds 200–300 lines | Split immediately |
    | Tests cover multiple features | One file per feature |
    | Multiple unrelated describe blocks | Separate files |
    | Hard to find specific tests | Reorganize by concern |

    **Naming Convention:**
    ```
    [feature].[concern].test.[ext]

    Examples:
    - user.creation.test.ts
    - auth.token.test.py
    - parser.expressions.test.rs
    - api.errors.test.go
    ```

---

## 10. Final Rule

30. **If in Doubt, Be Explicit**
    - Prefer more readable code, more comments, and clearer structure over fewer lines of code.

---

## **Cross-References**

- See **`.clinerules/project.md`** for project-specific language, toolchain, and naming conventions
- See **plans.md** for task-level testing breakdowns and implementation planning
- See **agents.md** for verification procedures and task completion criteria
- See **testing.md** for test commands and AI testing workflow
- See **git-commands.md** for git workflow instructions
- See **agents.md Rule 8** for debugging rules (NO inline debug scripts — ALWAYS create script files)
