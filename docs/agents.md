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
2. 📖 **LOAD RULES VIA CODEOPS-MCP** — If codeops-mcp tools are available, load rules:
   - `get_rule("agents")` — Agent behavior rules **(REQUIRED FIRST)**
   - `get_rule("code")` — Coding standards
   - `get_rule("testing")` — Testing workflows
   - `get_rule("git-commands")` — Git commit protocols
3. 📖 **READ PROJECT DOCS** — Review `.clinerules/project.md` and any project-specific documentation or specs
4. ✅ **VERIFY COMPLIANCE** — Ensure approach follows all applicable documents

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

1. **✅ Always prefix shell commands with `clear && sleep 3 &&`**
   - Every `execute_command` must start with `clear && sleep 3 &&`
   - The `clear` ensures a clean terminal; the `sleep 3` gives VS Code time to initialize the terminal before the command runs
   - The delay (default: 3 seconds) can be customized per project in `.clinerules/project.md` (e.g., `sleep 5` for slower environments, `sleep 1` for fast machines)

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

### **Rule 8: Script-First Execution — ALL Non-Trivial Commands MUST Use Script Files**

**🚨 NEVER use inline scripts, multi-line commands, or complex one-liners on the command line. ALWAYS create a script file first.**

This rule applies to ALL non-trivial command execution — not just debugging. Any command that involves code evaluation, multi-line logic, ad-hoc testing, validation scripts, or exploration MUST be written to a script file first and then executed.

#### Why This Rule Exists

Inline command-line scripts fail frequently because:
1. **Shell escaping breaks** — Quotes, backticks, special characters are corrupted
2. **Length limits** — Long inline commands are truncated or cause errors
3. **No reusability** — Inline commands can't be re-run or debugged
4. **Lost output** — Complex inline commands may break the terminal connection
5. **No error handling** — Script files support `set -e` and proper error handling

#### PROHIBITED (NEVER DO):

```bash
❌ node -e "import { ... } from './dist/...'; ..."
❌ node --input-type=module -e "..."
❌ python -c "from module import ..."
❌ echo "..." | node
❌ bash -c "complex multi-line command"
❌ Any inline code evaluation for testing or validation
❌ Any multi-line command pasted directly into the terminal
```

#### REQUIRED (ALWAYS DO):

1. **Create a script file** in the `scripts/` directory
2. **Write proper code** with imports, error handling, and comments
3. **Run the script** using the project's runner (from `.clinerules/project.md`)
4. **Clean up temporary scripts** after use (scripts prefixed with `tmp-`)

#### Script Categories and Naming Convention:

| Purpose | Prefix | Example |
|---------|--------|---------|
| Debugging | `debug-` | `scripts/debug-auth-token-refresh.ts` |
| Ad-hoc testing | `test-` | `scripts/test-api-endpoint.sh` |
| Validation/verification | `verify-` | `scripts/verify-build-output.sh` |
| Temporary exploration | `tmp-` | `scripts/tmp-check-data-format.ts` |
| Build/run utilities | `run-` | `scripts/run-build-and-analyze.sh` |

**Full naming pattern:**
```
scripts/[prefix]-[module]-[specific-purpose].[ext]
```

**Examples:**
- `scripts/debug-auth-token-refresh.ts`
- `scripts/test-api-response-format.sh`
- `scripts/verify-migration-output.py`
- `scripts/tmp-check-import-resolution.ts`
- `scripts/run-coverage-report.sh`

#### Cleanup Protocol for Temporary Scripts:

Scripts prefixed with `tmp-` are temporary and MUST be deleted after use:
```bash
# After running the temporary script and getting results:
rm scripts/tmp-check-data-format.ts
```

Temporary scripts should NOT be committed to version control. If a temporary script proves useful, rename it to use a permanent prefix (`debug-`, `test-`, `verify-`, `run-`).

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

### **Rule 11: Mandatory `gitcm`/`gitcmp` for All Git Operations — File-Based Commits ONLY**

**🚨 NEVER execute raw git staging, committing, or pushing commands. ALWAYS use `gitcm` or `gitcmp`.**

The `gitcm` and `gitcmp` protocols (defined in `git-commands.md`) are the **ONLY** permitted methods for git staging, committing, and pushing. Running loose git commands bypasses the required commit message format, verification steps, and workflow safeguards.

**🚨 CRITICAL: The `-m` flag is BANNED.** Commit messages MUST be written to `/tmp/git_commit_msg.txt` using `write_to_file` and committed with `git commit -F /tmp/git_commit_msg.txt`. This is because inline `-m` messages fail due to shell escaping, length limits, and multi-line formatting issues. See `git-commands.md` for the full explanation.

#### PROHIBITED (NEVER DO):

```bash
❌ git commit -m "some message"
❌ git commit -m 'some message'
❌ git commit -am "some message"
❌ git commit -m "feat(scope): ..." -m "- detail 1" -m "- detail 2"
❌ ANY use of the -m flag with git commit
❌ git push origin main
❌ git add . && git commit -m "message" && git push
```

#### REQUIRED (ALWAYS DO):

- **To stage and commit:** Use the `gitcm` protocol (see `git-commands.md`)
- **To stage, commit, and push:** Use the `gitcmp` protocol (see `git-commands.md`)
- **ALWAYS** write the commit message to `/tmp/git_commit_msg.txt` using `write_to_file` first
- **ALWAYS** commit using `git commit -F /tmp/git_commit_msg.txt`
- **ALWAYS** clean up with `rm /tmp/git_commit_msg.txt` after committing

**There are NO exceptions.** Even for "quick" or "small" commits, the agent MUST use `gitcm` or `gitcmp` with the file-based approach. These protocols ensure:
- Proper commit message format with scope and prefix
- Commit message written via temp file (no shell escaping issues)
- Multi-line messages with special characters work reliably
- Verification steps are followed
- Consistent workflow across all sessions

---

### **Rule 12: No Complex Command Chaining — Use Script Files**

**🚨 NEVER chain multiple commands using `&&` combined with pipes (`|`), redirects (`>`, `>>`, `2>&1`), or subshells. ALWAYS create a bash script file instead.**

Complex command chains break the terminal connection between the AI agent and the execution environment, causing session interruptions, lost output, and workflow problems.

#### PROHIBITED (NEVER DO):

```bash
❌ command1 && command2 | command3
❌ command1 && command2 > output.txt
❌ command1 | grep "pattern" && command2
❌ command1 2>&1 | tee log.txt && command2
❌ command1 && command2 | sort | uniq > result.txt
❌ docker logs container 2>&1 | grep error && echo "found"
```

#### ALLOWED — Simple `&&` Chains (No Pipes/Redirects):

```bash
✅ clear && sleep 3 && yarn build
✅ clear && sleep 3 && yarn build && yarn test
✅ clear && sleep 3 && git add .
✅ clear && sleep 3 && scripts/agent.sh start
```

Simple `&&` chains without pipes or redirects are still permitted.

#### REQUIRED — Script Files for Complex Commands:

When you need pipes, redirects, subshells, or complex logic:

1. **Create a script file** in the `scripts/` directory:
   ```
   scripts/run-[description].sh
   ```

2. **Write the commands** in the script with proper error handling:
   ```bash
   #!/bin/bash
   set -e
   
   # Description of what this script does
   command1
   command2 | command3
   result=$(command4 2>&1)
   echo "$result" > output.txt
   ```

3. **Execute the script:**
   ```bash
   clear && sleep 3 && bash scripts/run-[description].sh
   ```

#### Script Naming Convention:

```
scripts/run-[action]-[target].sh
```

Examples:
- `scripts/run-check-logs.sh`
- `scripts/run-build-and-analyze.sh`
- `scripts/run-test-coverage-report.sh`
- `scripts/run-docker-health-check.sh`

#### Why This Rule Exists:

- Complex piped/redirected command chains break the AI agent's terminal connection
- Lost terminal connections cause session interruptions and incomplete work
- Script files are debuggable, reusable, and don't have shell escaping issues
- Script files provide better error handling with `set -e`

> **See also:** Rule 8 (Script-First Execution) for the comprehensive script file policy covering all non-trivial commands, including ad-hoc tests, validation, debugging, and temporary exploration.

---

### **Rule 10: VS Code Settings Automation (Optional)**

If the project uses `scripts/agent.sh` for VS Code settings automation:

**Act Mode Requirements:**

1. **✅ Execute `clear && sleep 3 && scripts/agent.sh start` as THE FIRST COMMAND of any Act Mode task**
   - Switches VS Code to development mode

2. **✅ Execute `clear && sleep 3 && scripts/agent.sh finished` as THE LAST COMMAND of any Act Mode task**
   - Switches VS Code to completion mode (full linting, formatting, cleanup)

**Workflow Pattern:**

```bash
# FIRST COMMAND - Start of any Act Mode task
clear && sleep 3 && scripts/agent.sh start

# ... perform all task implementation work ...

# LAST COMMAND - End of any Act Mode task
clear && sleep 3 && scripts/agent.sh finished
```

**When NOT to Apply:**

- ❌ Do not use in Plan Mode
- ❌ Do not use if `scripts/agent.sh` does not exist in the project
- ❌ Do not use if already in the middle of a task (only at start/end boundaries)

---

## **Summary: Applying These Rules**

**Every Single Time You Respond:**

0. 📖 **MANDATORY FIRST:** Consult code.md + testing.md + project docs (BOTH Plan AND Act Mode)
1. 🔧 Follow shell command rules (Rule 1 — `clear && sleep 3 &&` and project's package manager)
2. 🧠 Perform internal self-check (Rule 2)
3. 💡 Enhance requirements if unclear (Rule 3 — Plan Mode)
4. ✅ Verify previous work is complete (Rule 4 — before new tasks)
5. 📝 Update task progress (Rule 5 — during implementation)
6. 🔍 Final verification before completion (Rule 6 — before finishing)
7. 🚫 **NEVER overcomplicate** — Use existing infrastructure (Rule 7)
8. 📦 **Script-First Execution** — ALWAYS create script files for non-trivial commands (Rule 8)
9. 🗜️ **After task completion:** Suggest `/compact` (Rule 9)
10. ⚙️ **Act Mode ONLY:** Execute agent.sh if available (Rule 10 — start/finish settings)
11. 🔒 **Mandatory `gitcm`/`gitcmp`** — NEVER use loose git commands (Rule 11)
12. 📜 **No complex command chaining** — Use script files for pipes/redirects (Rule 12)
13. 📊 **Context management:** Continue until 90%, then wrap + commit + `/compact`

---

## **Cross-References**

- See **code.md** for coding standards, testing requirements, and quality guidelines
- See **testing.md** for test commands and workflow
- See **plans.md** for detailed guidance on creating implementation plans
- See **make_plan.md** for plan creation/execution triggers and session rules
- See **git-commands.md** for git workflow instructions (`gitcm`, `gitcmp`)
- See **`.clinerules/project.md`** for project-specific commands, toolchain, and conventions
