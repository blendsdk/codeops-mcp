# Git Commands & Workflow

## **IMPORTANT**

These rules are **mandatory** and must be applied **strictly and consistently**.

**For project-specific commit scope and verify commands**, see `.clinerules/project.md`.

---

## **🚨 CRITICAL PROHIBITION: No Loose Git Commands 🚨**

**NEVER execute raw git staging, committing, or pushing commands directly.**

The AI agent **MUST ALWAYS** use the `gitcm` or `gitcmp` protocols defined below. Running loose git commands bypasses the required commit message format, verification steps, and workflow safeguards.

### PROHIBITED (NEVER DO):

```bash
❌ git add .
❌ git add -A
❌ git commit -m "some message"
❌ git commit -am "some message"
❌ git push
❌ git push origin main
❌ git add . && git commit -m "message" && git push
```

### REQUIRED (ALWAYS DO):

```bash
✅ Use `gitcm`  — for staging and committing (follows the full protocol below)
✅ Use `gitcmp` — for staging, committing, rebasing, and pushing (follows the full protocol below)
```

**There are NO exceptions.** Even for "quick" or "small" commits, the agent MUST use `gitcm` or `gitcmp`.

---

## **Cline Git Commands**

When the user provides these keywords, Cline should perform the following actions:

---

### `gitcm` — Git Commit with Message

**Steps:**

1. Stage all changes (`git add .`)
2. Create a detailed, descriptive commit message
3. Write commit message to temporary file (`/tmp/git_commit_msg.txt`)
4. Commit using the file (`git commit -F /tmp/git_commit_msg.txt`)
5. Clean up temporary file (`rm /tmp/git_commit_msg.txt`)

**Implementation:**

```bash
# Stage changes
clear && git add .

# Create commit message file
# (write the message using write_to_file tool to /tmp/git_commit_msg.txt)

# Commit using the file
git commit -F /tmp/git_commit_msg.txt

# Clean up
rm /tmp/git_commit_msg.txt
```

**Commit Message Format:**

```
feat(scope): brief description of change

- Specific change 1
- Specific change 2
- Tests added/updated
```

**Commit Prefixes:**

| Prefix | Usage |
|--------|-------|
| `feat(scope)` | New feature |
| `fix(scope)` | Bug fix |
| `refactor(scope)` | Code refactoring |
| `test(scope)` | Adding/updating tests |
| `docs(scope)` | Documentation changes |
| `chore(scope)` | Build, config, tooling |

**Determining Commit Scope:**

Use the module name, package name, service name, or directory as the scope. Check `.clinerules/project.md` for the project's scope convention.

| Context | Scope Example |
|---------|---------------|
| Single module/package | `feat(auth)`, `fix(utils)`, `refactor(api)` |
| UI component | `feat(user-profile)`, `fix(nav-bar)` |
| Shared library | `feat(shared)`, `fix(common)` |
| Infrastructure/config | `feat(docker)`, `fix(nginx)`, `chore(ci)` |
| Root/multiple modules | `chore(project)`, `refactor(monorepo)` |
| Documentation only | `docs(readme)`, `docs(api)` |

---

### `gitcmp` — Git Commit, Rebase, and Push

**Steps:**

1. Perform full `gitcm` workflow (stage + commit with detailed message)
2. Pull and rebase if needed (`git pull --rebase`)
3. If no conflicts, push to remote (`git push`)
4. Report any conflicts for manual resolution

**Implementation:**

```bash
# Stage changes
clear && git add .

# Create commit message file
# (write the message using write_to_file tool to /tmp/git_commit_msg.txt)

# Commit using the file
git commit -F /tmp/git_commit_msg.txt

# Clean up
rm /tmp/git_commit_msg.txt

# Rebase and push
git pull --rebase
git push
```

---

## **Important Notes**

1. **Always perform `gitcmp` or `gitcm` in a new Cline task with context** when possible — this creates a clean task boundary for git operations while maintaining previous context.

2. **Always run the project's verify command before committing:**
   ```bash
   # Use the verify command from .clinerules/project.md
   # Examples:
   #   clear && yarn build && yarn test
   #   clear && cargo build && cargo test
   #   clear && docker compose config && docker compose build
   #   clear && pytest
   ```
   Only commit if verification passes.

3. **Never force-push** unless explicitly asked by the user.

4. **Multi-module/package changes** — When a commit spans multiple areas, use a broader scope:
   ```
   refactor(project): update build configuration across all modules
   feat(infra): add monitoring to all services
   ```

---

## **Cross-References**

- See **`.clinerules/project.md`** for project-specific commit scope and verify commands
- See **testing.md** for test/validation commands to run before committing
- See **agents.md** for task completion and verification rules
- See **make_plan.md** for auto-commit rules during plan execution
