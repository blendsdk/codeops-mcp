# A.I Agent Instructions for Creating Implementation Plans

## **IMPORTANT**

These rules are **mandatory** and must be applied **strictly and consistently** when creating implementation plans.

---

## **Project-Specific Configuration**

This file contains **universal planning rules** that work for any software project. For project-specific settings, read `.clinerules/project.md` which defines build/test/verify commands, project structure, and conventions.

---

## **Rules for Implementation Plans**

### **Rule 1: Split Plans into Logical Phases**

When asked to create implementation plans, always split the plan into **logical phases** that can be implemented sequentially.

**What Makes a Good Phase:**

- ✅ Represents a complete, cohesive unit of work
- ✅ Has clear start and end points
- ✅ Can be implemented and tested independently
- ✅ Builds upon previous phases
- ✅ Typically takes 2-5 tasks to complete

**Examples:**

❌ **Bad Phase Breakdown:**

- Phase 1: "Build everything"
- Phase 2: "Test and deploy"

✅ **Good Phase Breakdown:**

- Phase 1: Define types/interfaces/models
- Phase 2: Implement core logic
- Phase 3: Add integration layer
- Phase 4: Create unit tests
- Phase 5: Add integration/E2E tests

Adapt phases to the project type — see **"Adapting to Project Type"** section below.

---

### **Rule 2: Define Phase Dependencies**

For each phase, explicitly define dependencies from the previous phase.

**How to Document Dependencies:**

```markdown
## Phase 2: Implement Core Logic

**Dependencies:**
- Phase 1 must be complete (types/interfaces defined)
- Models from Phase 1.2 must be tested
- Base abstractions from Phase 1.3 must be documented

**What This Phase Provides for Next Phase:**
- Complete service/logic infrastructure
- Data validation capabilities
- Error handling patterns
```

---

### **Rule 3: Provide Context and Reasoning**

Provide detailed context and reasoning for each phase.

**What to Include:**

- **Why this phase is needed** — Business/technical justification
- **What problem it solves** — Specific issues being addressed
- **Key decisions made** — Architecture choices and rationale
- **Potential challenges** — Known risks or complexities
- **Success criteria** — How to verify phase completion

**Example:**

```markdown
## Phase 1: Core Type Definitions

**Context:**
The type system is the foundation for all components in this feature.
Strong type definitions ensure safety throughout the implementation.

**Reasoning:**
Starting with types allows us to:
1. Define clear contracts between components
2. Enable better IDE support during development
3. Catch errors at compile-time rather than runtime

**Key Decision:**
[Document the chosen approach and why it was selected
over alternatives — adapted to your language/framework]
```

---

### **Rule 4: Define Clear Deliverables**

Each phase must have **clear, measurable deliverables**.

**Examples:**

❌ **Vague Deliverables:**

- "Backend improvements"
- "Better error handling"
- "Code cleanup"

✅ **Clear Deliverables:**

- Complete type definitions for all service layer interfaces
- Working endpoint with input validation and error responses
- Error handling middleware that returns structured error responses
- 90%+ test coverage for the validation module

---

### **Rule 5: Create Granular Tasks**

**IMPORTANT:** Create small, **granular**, and manageable tasks. More tasks are better than a few large tasks.

**Task Granularity Guidelines:**

- Each task should be completable within **2-4 hours** of work
- Each task should touch **5-15 files maximum**
- Each task should have **one clear objective**
- Each task should produce **testable output**

**Examples:**

❌ **Too Large (Bad):**

- "Implement the user management system" (too broad)
- "Add authentication and authorization" (too vague)
- "Build data service layer with caching" (too complex)

✅ **Properly Granular (Good):**

- "Create service interface with type parameters"
- "Implement password hashing utility"
- "Add token generation and validation methods"
- "Create unit tests for authentication middleware"
- "Write integration test for login → token → protected route flow"

---

### **Rule 6: Task Numbering Convention**

Tasks **must** have a sequence number in the format: `Task [Phase].[Number]`

**Format:**

```
Task 1.1, Task 1.2, Task 1.3  (Phase 1, tasks 1-3)
Task 2.1, Task 2.2, Task 2.3  (Phase 2, tasks 1-3)
```

**Example:**

```markdown
### Phase 1: Core Types

- Task 1.1: Create base type definitions
- Task 1.2: Define domain model types
- Task 1.3: Define data transfer types
- Task 1.4: Add type guards and validation

### Phase 2: Service Layer

- Task 2.1: Implement base service
- Task 2.2: Add domain-specific methods
- Task 2.3: Add error handling
```

---

### **Rule 7: Task Presentation Format**

**IMPORTANT:** Place all tasks in a **table format** at the end of each plan with completion checkboxes.

**Required Format:**

```markdown
## Task Implementation Checklist

| Task | Description                          | Dependencies     | Status |
| ---- | ------------------------------------ | ---------------- | ------ |
| 1.1  | Create base type definitions         | None             | [ ]    |
| 1.2  | Define domain model types            | 1.1              | [ ]    |
| 1.3  | Define data transfer types           | 1.1              | [ ]    |
| 1.4  | Add type guards and validation       | 1.1, 1.2, 1.3   | [ ]    |
| 2.1  | Implement base service               | Phase 1 complete | [ ]    |
| 2.2  | Add domain-specific methods          | 2.1              | [ ]    |

**Legend:**
- [ ] Not started
- [x] Complete
```

**Why This Format:**

- ✅ Clear visual overview of all tasks
- ✅ Easy to track progress
- ✅ Dependencies are explicit
- ✅ Can be updated incrementally

---

### **Rule 8: Granular Testing & Validation Requirements**

**IMPORTANT:** It is critical to have **granular tests and validation** for each task.

**Testing Guidelines:**

1. **Each task must specify its testing/validation requirements**

   ```markdown
   Task 1.2: Define domain model types
   Tests: Unit tests for type creation, property access, type guards
   Coverage: 100% for public APIs
   ```

2. **Test/validation types per task:**
   - **Unit tests** — Test individual functions/classes in isolation
   - **Integration tests** — Test cross-module/cross-service interactions
   - **End-to-end tests** — Test complete workflows
   - **Config validation** — Validate configurations (e.g., `docker compose config`, `nginx -t`, `shellcheck`)

3. **Test granularity:**
   - Each task should add 5-20 test cases
   - Tests should be specific to that task's functionality
   - Tests should be automated and reproducible with the project's test command (see `.clinerules/project.md`)

4. **Test file organization:**
   - Tests MUST be split into logically grouped files
   - Each test file should focus on one concern or component
   - See **code.md** for detailed test file organization requirements

---

### **Rule 9: Pre-Implementation Re-evaluation**

**IMPORTANT:** Always re-evaluate the implementation plan before implementing, to be absolutely sure nothing was missed and to identify inconsistencies.

**Re-evaluation Checklist:**

1. **✅ Completeness**
   - Are all requirements from original request covered?
   - Are there any missing features or edge cases?
   - Is each phase fully specified?

2. **✅ Task Granularity**
   - Are tasks small enough (2-4 hours each)?
   - Can each task be tested independently?
   - Are there any tasks that should be split further?

3. **✅ Dependencies**
   - Are all task dependencies documented?
   - Is the dependency order logical?
   - Are there any circular dependencies?

4. **✅ Testing Coverage**
   - Does every task have testing/validation requirements?
   - Are test types appropriate for each task?
   - Is coverage realistic and measurable?
   - Are tests split into logically grouped files?

5. **✅ Consistency**
   - Do task numbers follow the convention?
   - Are naming patterns consistent?
   - Is the table format correct?

6. **✅ Feasibility**
   - Can this plan actually be implemented?
   - Are time estimates reasonable?
   - Are there any blocking technical issues?

7. **✅ Scope Boundaries**
   - Are changes properly scoped (right packages, modules, services)?
   - Do new files follow existing directory patterns?
   - Are module/package boundaries respected?

8. **✅ Architecture Assessment**
   - Will any implementation exceed 500 lines?
   - Is file splitting or inheritance chain architecture planned for large components?
   - Are layer dependencies clearly defined?

**When to Re-evaluate:**

- ✅ Before starting Phase 1
- ✅ After completing each phase (before starting next)
- ✅ When requirements change
- ✅ When discovering new technical constraints

---

### **Rule 10: File Creation & Large Implementation Architecture**

**IMPORTANT:** When planning implementations, always consider AI context limitations.

**File Creation Rules:**

- ✅ Split files into smaller, logically grouped files to prevent AI context limits
- ✅ If creating a large class (>500 lines), use splitting strategies (inheritance chains, composition, modular includes)
- ✅ Each logical unit: 200-500 lines maximum
- ✅ Maximum AI output limit: **60K tokens**. Maximum AI input limit: **200K tokens**

**Splitting Strategy — Choose Based on Project Type:**

| Project Type | Strategy | Example |
|--------------|----------|---------|
| **OOP / Class-based** | Inheritance chains | `BaseService → DataService → ValidationService → ApiService` |
| **Functional / Modules** | Modular composition | `core.ts`, `validators.ts`, `transformers.ts`, `index.ts` |
| **Configuration** | Include files | `nginx/includes/`, `nginx/locations/`, `nginx/upstreams/` |
| **Components** | Composition + hooks | `Component.tsx`, `useComponentState.ts`, `ComponentStyles.ts` |

**When to Apply:**

- ✅ Any implementation approaching 500+ lines
- ✅ Complex systems with multiple concerns
- ✅ Systems that will grow significantly over time
- ❌ Simple utilities or data structures
- ❌ Classes/modules with single, focused responsibilities

**Inheritance Chain Example (OOP projects):**

```markdown
Phase 1: BaseService (core utilities, 200-300 lines)
Phase 2: DataService extends BaseService (data access, 200-300 lines)
Phase 3: ValidationService extends DataService (validation, 200-300 lines)
Phase 4: BusinessService extends ValidationService (business logic, 200-300 lines)
```

---

## **Adapting to Project Type**

The AI should adapt plan structure, examples, and validation based on the project type:

| Project Type       | Typical Components                                | Typical Validation                     |
| ------------------ | ------------------------------------------------- | -------------------------------------- |
| **Web App**        | Frontend, Backend, API, Database, Auth            | Build + test + lint                    |
| **API / Backend**  | Endpoints, Services, Data Models, Validation      | Build + test + API testing             |
| **Library / SDK**  | Core, Utils, Types, Public API                    | Build + test + type checking           |
| **CLI Tool**       | Commands, Arguments, Output, Config               | Build + test + help output             |
| **UI Components**  | Component, Styles, Hooks, Stories, Tests          | Build + test + visual review           |
| **Mobile App**     | UI, State, Services, Navigation                   | Build + test + device testing          |
| **Compiler**       | Lexer, Parser, Analyzer, Generator                | Build + test + spec compliance         |
| **Microservices**  | Services, Events, Data, Integration               | Build + test + health checks           |
| **Infrastructure** | Docker, Nginx, CI/CD, Deployment Scripts          | Config validate + build + curl testing |
| **Database**       | Schema/Migration, Repository, Service, Tests      | Build + test + migration verification  |
| **Bug Fix**        | Root cause analysis, Fix, Regression test         | Build + test + regression suite        |
| **Refactoring**    | Current state, New structure, Migration, Tests    | Build + test + behavioral equivalence  |

---

## **Summary: Creating Effective Plans**

**Every implementation plan must include:**

1. 📋 **Logical phases** — Sequential, buildable units of work
2. 🔗 **Dependencies** — Clear phase and task dependencies
3. 💡 **Context & reasoning** — Why this approach, key decisions
4. ✅ **Clear deliverables** — Measurable outcomes for each phase
5. 🔨 **Granular tasks** — Small, focused, testable tasks (2-4 hours each)
6. 🔢 **Numbered tasks** — Format: Task [Phase].[Number]
7. 📊 **Table format** — All tasks in a table with checkboxes
8. 🧪 **Testing/validation requirements** — Specific tests for each task (split into files)
9. 🔍 **Pre-implementation review** — Verify completeness and consistency
10. 📦 **File size limits** — Split large files, use appropriate architecture patterns

**Remember:** A good plan prevents wasted effort, reduces rework, and ensures nothing is forgotten. Take time to plan thoroughly before implementing.

---

## **Cross-References**

- See **agents.md** for task granularity requirements and verification rules
- See **code.md** for coding standards, testing requirements, and quality guidelines
- See **testing.md** for test commands and workflow
- See **make_plan.md** for plan creation trigger and execution protocol
- See **git-commands.md** for commit workflow during plan execution
- See **`.clinerules/project.md`** for project-specific commands and conventions
