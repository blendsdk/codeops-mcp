# A.I Agent Instructions

## **IMPORTANT**

These rules are **mandatory** and must be applied **strictly and consistently** in BOTH Plan Mode and Act Mode.

---

## **Project-Specific Configuration**

This file contains **universal agent rules** that work for any software project. For project-specific settings, read `.clinerules/project.md` which defines:

- Build, test, and verify commands
- Package manager and toolchain
- Project structure and conventions
- Shell command patterns

**If `.clinerules/project.md` does not exist**, detect project settings from manifest files (`package.json`, `Cargo.toml`, `go.mod`, `pyproject.toml`, `Makefile`, `docker-compose.yml`, etc.) and use sensible defaults.

---

## **🚨 ULTRA-CRITICAL: MANDATORY COMPLIANCE WITH CODING STANDARDS 🚨**

**Before ANY planning or implementation, you MUST consult `code.md` and `testing.md`.**

### Pre-Task Protocol (BOTH MODES)

1. 🛑 **STOP** — Do not proceed without compliance check
2. 📖 **READ CODE.MD** — Review relevant coding standards
3. 📖 **READ TESTING.MD** — Review test commands and workflow
4. 📖 **READ PROJECT DOCS** — Review any project-specific documentation or specs
5. ✅ **VERIFY COMPLIANCE** — Ensure approach follows all applicable documents

### What MUST Be Checked

**📋 In code.md:**
- Testing requirements: All tests must pass, maximum coverage
- Code quality: DRY, clarity, single responsibility
- Documentation: Comments, doc comments, junior-dev readability
- Architecture: File splitting strategies for large implementations
- Language-specific rules: Follow conventions defined in code.md and project.md

**📋 In testing.md:**
- Test commands for the project (from `.clinerules/project.md`)
- Test framework configuration and conventions
- Test environment requirements (e.g., Docker for integration tests)
- Test workflow for AI agents

### Compliance in Plan Mode

**When creating ANY plan:**

1. ✅ **Reference code.md rules** — Cite specific rules in your plan
2. ✅ **Reference project documentation** — Cite relevant docs/conventions
3. ✅ **Explain testing strategy** — Based on code.md testing requirements
4. ✅ **Explain architecture strategy** — Based on code.md architecture rules if >500 lines

### Compliance in Act Mode

**When implementing ANY code:**

1. ✅ All tests must pass before completion
2. ✅ Create maximum test coverage
3. ✅ Add mandatory comments explaining WHY
4. ✅ Add doc comments to all public/protected members
5. ✅ Split tests into logically grouped files

### Violation Detection

**Signs you're violating this rule:**

- ❌ Writing code without doc comments
- ❌ Writing code without tests
- ❌ Skipping comments for complex logic
- ❌ Putting all tests in one large file
- ❌ Implementing features without checking documentation

### Emergency Stop Protocol

**If you realize you've violated this rule:**

1. 🛑 **IMMEDIATE STOP** — Halt current work
2. 📖 **READ DOCUMENTS** — Review missed sections
3. 🔄 **REVISE APPROACH** — Fix non-compliant work
4. ✅ **VERIFY COMPLIANCE** — Check against documents
5. ⚡ **PROCEED ONLY AFTER FIX** — Don't continue with violations

---

## **🚨 ULTRA-CRITICAL: CONTEXT WINDOW MANAGEMENT 🚨**

**AI context limitations are REAL. These rules prevent context overflow and ensure high-quality output.**

### Context Window Rules

- ✅ **Maximum AI output limit: 60K tokens** — Never attempt to write more in a single response
- ✅ **Maximum AI input limit: 200K tokens** — Monitor usage throughout the session
- ✅ **Continue implementing until 90%** of the 200K context window is reached
- ✅ If you reach 90%, wrap up the session, commit via `gitcmp`, then `/compact`
- ❌ Do NOT stop early at 50-70% — maximize each session's output

### File Creation Rules

- ✅ Split files into smaller, logically grouped files to prevent context limits
- ✅ If creating a large class (>500 lines), use appropriate splitting strategy (see code.md)
- ✅ No single file should require >30K tokens to write
- ✅ Break large write operations into multiple smaller writes

### Context Threshold Protocol

| Context Usage | Action |
|---------------|--------|
| 0-70% | Continue implementing tasks normally |
| 70-80% | Continue, assess if current task can be completed |
| 80-90% | Complete current task, then wrap up |
| 90%+ | STOP — wrap session, `gitcmp`, `/compact` |

---

## **CRITICAL: Task Granularity & Architecture**

**To prevent AI context window limitations, ALL tasks must be broken down into granular subtasks.**

### Requirements

- Each subtask must be completable within **50,000 tokens** of context
- Break tasks by logical boundaries: files, features, packages/modules
- Create explicit dependencies between subtasks
- Document clear completion criteria for each subtask
- **CRITICALLY IMPORTANT:** Break down tasks in tiny, small, incremental, and manageable steps

### How to Split Tasks

1. **Identify the main goal** — What is the overall objective?
2. **Break into logical phases** — What are the major steps?
3. **Further subdivide each phase** — Can this step be smaller?
4. **Consider architecture** — Will implementation exceed 500 lines?
5. **Plan splitting strategy** — If large, design layer/module hierarchy
6. **Verify granularity** — Can this be completed in one focused session?

### Objective Task Size Criteria — A Task is "LARGE" When It Meets ANY:

- **Files:** Touches 6 or more files
- **Lines:** Adds/modifies 200+ lines of code
- **Concerns:** Involves 3 or more logical concerns/features
- **Complexity:** Contains complex algorithms or intricate logic
- **Integration:** Requires integration across multiple packages/modules/services
- **Uncertainty:** Any significant uncertainty about scope or approach

### Act Mode Step Size Guidelines

- Each step should touch **1-3 files**
- Each step should add **50-150 lines** of code
- Each step must be **immediately testable**
- Each step must have **clear success criteria**

---

## **🚨 ULTRA-CRITICAL: MULTI-SESSION TASK EXECUTION 🚨**

**Medium to large tasks MUST be executed across MULTIPLE SESSIONS.**

### Session Rules

| Criteria | Threshold | Sessions Needed |
|----------|-----------|-----------------|
| Files | >3 files | 1 session per 2-3 files |
| Lines of code | >200 lines | 1 session per 100-200 lines |
| Complexity | High | Split by logical concern |
| Test count | >30 tests | 1 session per 15-30 tests |

### Session Deliverable Guidelines

| Task Type | Max Per Session | Session Deliverable |
|-----------|-----------------|---------------------|
| Unit Tests | 15-30 tests | One describe() block or test group |
| Implementation | 100-200 lines | One method/function/component |
| Refactoring | 2-3 files | One concern |
| Documentation | 1-2 sections | One topic |
| Bug Fixes | 1-2 bugs | One fix with tests |

### Multi-Session Workflow

**Each session:**

1. Review task_progress from previous session
2. Execute ONLY the current session's deliverable
3. Run project's verify command (from `.clinerules/project.md`)
4. Call `attempt_completion` with session results
5. List remaining work for future sessions

### Multi-Session Progress Tracking

**At the START of each session, include:**

```markdown
## Multi-Session Progress

**Overall Task:** [Task name]
**Total Sessions Planned:** [N]
**Current Session:** [X of N]
**Previous Sessions Completed:**
- Session 1: ✅ [Deliverable 1]
- Session 2: ✅ [Deliverable 2]
- Session 3: ⏳ [Current deliverable]

**This Session's Goal:** [Specific deliverable]
```

**At the END of each session, include:**

```markdown
## Session Complete

**Completed:** [What was done]
**Tests Added:** [Count]
**Tests Passing:** [Status]
**Remaining Sessions:**
- Session N+1: [Deliverable]
- Session N+2: [Deliverable]

**User Action:** Start new task for next session
```

---

## **IMPORTANT RULES**

---

### **Rule 1: Shell Commands & Package Management**

1. **✅ Always prefix shell commands with `clear &&`**
   - Every `execute_command` must start with `clear &&`
   - This ensures a clean terminal for each command

2. **✅ Use the project's designated package manager exclusively**
   - Check `.clinerules/project.md` for the correct package manager
   - Never mix package managers (e.g., don't use `npm` in a `yarn` project)

3. **✅ Use the project's standard commands**
   - Build, test, verify, and clean commands are defined in `.clinerules/project.md`
   - If no `project.md` exists, detect from manifest files and use sensible defaults

---

### **Rule 2: Internal Self-Check**

Before providing any response, perform an **internal self-check**:

1. **"Do I fully understand this request?"**
2. **"Are there any questions I need to ask the user?"**
3. **"Am I following the coding standards from code.md?"**

---

### **Rule 3: Enhance Requirements**

If you identify issues with the user's request:

- Ask clarifying questions to eliminate ambiguity
- Suggest improvements if requirements are unclear
- Propose alternative approaches if current approach has issues
- Ensure you understand full scope before implementing

---

### **Rule 4: Verify Previous Task Completion**

Before starting any new task:

1. ✅ Review the codebase against previous task requirements
2. ✅ Confirm all deliverables were implemented
3. ✅ Check that tests/validation pass
4. ✅ Verify no partial implementations or TODOs left behind

---

### **Rule 5: Update Task Plan Documents**

Track progress by updating task plan documents:

1. Locate the plan document (usually in `plans/` directory)
2. Find the relevant task
3. Update completion status: `- [x] Task ✅ (completed: YYYY-MM-DD HH:MM)`
4. Update the `task_progress` parameter in tool calls

---

### **Rule 6: Final Verification Before Completion**

Before calling `attempt_completion`, perform a **comprehensive final check**:

1. **✅ Requirements Met** — Re-read the original request, verify everything
2. **✅ Code Quality** — Follows code.md standards, no debugging code left
3. **✅ Testing** — All tests pass (project's verify command from `.clinerules/project.md`)
4. **✅ Edge Cases** — Boundary conditions, error scenarios handled
5. **✅ Documentation** — Comments, doc comments, README updates
6. **✅ Completeness** — No TODO comments for current task, no partial implementations

**If ANY item fails → Do NOT call attempt_completion. Fix first.**

---

### **Rule 7: NEVER Overcomplicate — Use Existing Infrastructure**

1. **✅ Always use existing tools and infrastructure FIRST**
   - Use existing patterns from the codebase
   - Use existing utility functions and shared libraries
   - Use existing test patterns and helpers
   - Use existing error handling conventions

2. **❌ NEVER create custom solutions when standard ones exist**
   - Don't reinvent utilities when the project already has them
   - Don't create custom test utilities when existing patterns work
   - Don't create custom abstractions when simpler solutions exist

3. **✅ Keep implementations simple and focused**
   - Follow the principle of least complexity
   - Use the most straightforward approach that works
   - Leverage existing architecture and patterns

---

### **Rule 8: NO Inline Debug Scripts — ALWAYS Create Script Files**

**🚨 NEVER use inline command-line debug scripts. ALWAYS create script files.**

#### PROHIBITED (NEVER DO):

```bash
❌ node -e "import { ... } from './dist/...'; ..."
❌ node --input-type=module -e "..."
❌ python -c "from module import ..."
❌ echo "..." | node
```

#### REQUIRED (ALWAYS DO):

1. Create a script file in `scripts/`:
   ```
   scripts/debug-[feature]-[issue].[ext]
   ```

2. Write proper code with imports:
   ```
   // scripts/debug-auth-token-refresh.[ext]
   // Import from project sources
   // Run the debugging logic
   // Print results
   ```

3. Run the script using the project's runner (from `.clinerules/project.md`)

#### Script Naming Convention:

```
scripts/debug-[module]-[specific-issue].[ext]
```

Examples:
- `scripts/debug-auth-token-refresh.ts`
- `scripts/debug-api-response-parsing.py`
- `scripts/debug-query-builder-join.ts`
- `scripts/debug-nginx-upstream.sh`

---

### **Rule 9: Compact Conversation After Task Completion**

**After successfully completing any task in Act Mode:**

1. ✅ Run final verification (Rule 6)
2. ✅ Call `attempt_completion` with results
3. ✅ After successful completion, suggest running `/compact`

**WHEN to Compact:**
- ✅ After any successfully completed Act Mode task
- ✅ Task is self-contained and complete

**WHEN NOT to Compact:**
- ❌ In the middle of a multi-phase implementation
- ❌ Before task verification is complete

---

### **Rule 10: VS Code Settings Automation (Optional)**

If the project uses `scripts/agent.sh` for VS Code settings automation:

**Act Mode Requirements:**

1. **✅ Execute `clear && scripts/agent.sh start` as THE FIRST COMMAND of any Act Mode task**
   - Switches VS Code to development mode

2. **✅ Execute `clear && scripts/agent.sh finished` as THE LAST COMMAND of any Act Mode task**
   - Switches VS Code to completion mode (full linting, formatting, cleanup)

**Workflow Pattern:**

```bash
# FIRST COMMAND - Start of any Act Mode task
clear && scripts/agent.sh start

# ... perform all task implementation work ...

# LAST COMMAND - End of any Act Mode task
clear && scripts/agent.sh finished
```

**When NOT to Apply:**

- ❌ Do not use in Plan Mode
- ❌ Do not use if `scripts/agent.sh` does not exist in the project
- ❌ Do not use if already in the middle of a task (only at start/end boundaries)

---

## **Summary: Applying These Rules**

**Every Single Time You Respond:**

0. 📖 **MANDATORY FIRST:** Consult code.md + testing.md + project docs (BOTH Plan AND Act Mode)
1. 🔧 Follow shell command rules (Rule 1 — `clear &&` and project's package manager)
2. 🧠 Perform internal self-check (Rule 2)
3. 💡 Enhance requirements if unclear (Rule 3 — Plan Mode)
4. ✅ Verify previous work is complete (Rule 4 — before new tasks)
5. 📝 Update task progress (Rule 5 — during implementation)
6. 🔍 Final verification before completion (Rule 6 — before finishing)
7. 🚫 **NEVER overcomplicate** — Use existing infrastructure (Rule 7)
8. 📦 **NO inline debug scripts** — ALWAYS create script files (Rule 8)
9. 🗜️ **After task completion:** Suggest `/compact` (Rule 9)
10. ⚙️ **Act Mode ONLY:** Execute agent.sh if available (Rule 10 — start/finish settings)
11. 📊 **Context management:** Continue until 90%, then wrap + commit + `/compact`

---

## **Cross-References**

- See **code.md** for coding standards, testing requirements, and quality guidelines
- See **testing.md** for test commands and workflow
- See **plans.md** for detailed guidance on creating implementation plans
- See **make_plan.md** for plan creation/execution triggers and session rules
- See **git-commands.md** for git workflow instructions (`gitcm`, `gitcmp`)
- See **`.clinerules/project.md`** for project-specific commands, toolchain, and conventions
