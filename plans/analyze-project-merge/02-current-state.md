# Current State: Analyze Project Merge/Augment

> **Document**: 02-current-state.md
> **Parent**: [Index](00-index.md)

## Existing Implementation

### What Exists

The `analyze_project` tool is a single-file module (`src/tools/analyze-project.ts`) that:

1. Takes a `projectPath` argument
2. Validates the path is a directory
3. Scans the directory via `scanProject()` → builds a `ProjectAnalysis` object
4. Formats the analysis via `formatProjectMd()` → returns a complete markdown string

The tool **always generates fresh content**. It has no awareness of an existing `.clinerules/project.md` file. The output is a string returned to the MCP caller — the tool does not write files to disk.

### Relevant Files

| File                                  | Purpose                                      | Changes Needed                        |
| ------------------------------------- | -------------------------------------------- | ------------------------------------- |
| `src/tools/analyze-project.ts`        | Core tool — scan + generate project.md       | Add read/parse/merge logic            |
| `src/types/index.ts`                  | Type definitions (ProjectAnalysis, args)     | Add ParsedSection type                |
| `src/index.ts`                        | MCP server — tool registration + dispatch    | Update tool description               |
| `src/__tests__/tools/core-tools.test.ts` | Existing tests for other tools            | No changes (analyze_project not tested here) |

### Code Analysis

#### Entry Point: `analyzeProject(args)`

```typescript
export async function analyzeProject(args: AnalyzeProjectArgs): Promise<string> {
  const { projectPath } = args;
  // Validate path...
  const analysis = await scanProject(projectPath);
  return formatProjectMd(analysis);  // Always fresh generation
}
```

**Key observation**: The function does `scan → format`. The merge feature inserts a step between scan and format: `scan → read existing → merge OR format fresh`.

#### Scanner: `scanProject(projectPath)`

Returns a `ProjectAnalysis` object with all detected toolchain info. This function is **unchanged** by this feature — it always performs a full scan.

#### Formatter: `formatProjectMd(analysis)`

Builds the markdown string from scratch using `ProjectAnalysis`. This function remains useful as the "fresh generation" path, and also provides the auto-generated patterns we compare against during merge.

### Current `ProjectAnalysis` Type

```typescript
export interface ProjectAnalysis {
  name: string;
  type: string;
  languages: string[];
  frameworks: string[];
  packageManager: string | null;
  testFramework: string | null;
  buildCommand: string | null;
  testCommand: string | null;
  verifyCommand: string | null;
  isMonorepo: boolean;
  structure: string[];
  manifestFiles: string[];
}
```

This type captures everything auto-detectable. It does NOT capture user-customized fields (description, naming conventions, special rules, etc.) — those live only in the existing `project.md`.

## Gaps Identified

### Gap 1: No Existing File Detection

**Current Behavior:** Tool ignores existing `.clinerules/project.md` entirely.
**Required Behavior:** Tool checks for existing file and switches to merge path if found.
**Fix Required:** Add `readExistingProjectMd(projectPath)` function.

### Gap 2: No Section Parsing

**Current Behavior:** No ability to parse an existing project.md into sections.
**Required Behavior:** Parse existing file into a map of sections keyed by `## Header`.
**Fix Required:** Add `parseProjectMdSections(content)` function.

### Gap 3: No Merge Logic

**Current Behavior:** Only fresh generation exists.
**Required Behavior:** Merge fresh analysis into existing sections, preserving user content.
**Fix Required:** Add `mergeProjectMd(existingSections, freshAnalysis)` function.

### Gap 4: No Change Log

**Current Behavior:** Output has no indication of what changed.
**Required Behavior:** Merged output includes a change log header listing updates.
**Fix Required:** Track changes during merge and prepend change log to output.

### Gap 5: No Types for Parsed Sections

**Current Behavior:** `ProjectAnalysis` only covers auto-detected data.
**Required Behavior:** Need types for parsed sections from existing file.
**Fix Required:** Add `ParsedSection` interface to `src/types/index.ts`.

## Dependencies

### Internal Dependencies

- `fs/promises` — Already used for `readdir`, `readFile`, `stat`; will also be used for reading existing `project.md`
- `path` — Already used; will use `join` to construct `.clinerules/project.md` path

### External Dependencies

- None — no new external dependencies required

## Risks and Concerns

| Risk                                        | Likelihood | Impact | Mitigation                                                   |
| ------------------------------------------- | ---------- | ------ | ------------------------------------------------------------ |
| Existing file has unexpected format          | Medium     | Low    | Graceful fallback: if parsing fails, return fresh generation with warning |
| User-edited auto-fields not detected         | Medium     | Medium | Compare against what we would generate; if different, preserve user version |
| Section ordering differs from template       | Low        | Low    | Preserve existing file's section order                       |
| Merge introduces subtle content corruption   | Low        | High   | Comprehensive tests comparing merge output line-by-line      |
