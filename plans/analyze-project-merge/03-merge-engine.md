# Merge Engine: Analyze Project Merge/Augment

> **Document**: 03-merge-engine.md
> **Parent**: [Index](00-index.md)

## Overview

This document specifies the merge engine that intelligently combines an existing `project.md` with fresh scan results. It is the core of the feature — responsible for deciding what to update, what to preserve, and what to report.

## Architecture

### Current Architecture

```
analyzeProject(args)
  → scanProject(projectPath)       // Returns ProjectAnalysis
  → formatProjectMd(analysis)      // Returns fresh markdown string
```

### Proposed Architecture

```
analyzeProject(args)
  → scanProject(projectPath)                    // Returns ProjectAnalysis (unchanged)
  → readExistingProjectMd(projectPath)          // Returns string | null
  → IF existing:
      parseProjectMdSections(existingContent)   // Returns ParsedSection[]
      mergeProjectMd(sections, analysis)        // Returns merged markdown + change log
    ELSE:
      formatProjectMd(analysis)                 // Returns fresh markdown (unchanged)
```

## Implementation Details

### New Types

```typescript
/**
 * A parsed section from an existing project.md file.
 */
export interface ParsedSection {
  /** The full header line, e.g., "## Toolchain" */
  header: string;

  /** The header level (2 for ##, 3 for ###, etc.) */
  level: number;

  /** The raw content below the header (until the next same-or-higher-level header) */
  content: string;
}

/**
 * Classification of how a section should be handled during merge.
 */
export type SectionMergeStrategy = 'auto-update' | 'preserve' | 'static';

/**
 * A single change entry for the change log.
 */
export interface MergeChange {
  /** Section where the change occurred */
  section: string;

  /** Human-readable description of the change */
  description: string;
}
```

### New Functions

#### `readExistingProjectMd(projectPath: string): Promise<string | null>`

Checks if `<projectPath>/.clinerules/project.md` exists. If found, reads and returns its content. Returns `null` if not found or on read error.

```typescript
async function readExistingProjectMd(projectPath: string): Promise<string | null> {
  try {
    const filePath = join(projectPath, '.clinerules', 'project.md');
    const content = await readFile(filePath, 'utf-8');
    return content;
  } catch {
    return null; // File doesn't exist or can't be read
  }
}
```

#### `parseProjectMdSections(content: string): ParsedSection[]`

Splits an existing `project.md` into sections based on `##` headers. Handles the preamble (content before the first `##` header) as a special section with header `""`.

**Algorithm:**
1. Split content by lines
2. Walk lines, detecting `## ` and `### ` headers
3. Group lines into sections, splitting only on `## ` level-2 headers (keeping `### ` subsections within their parent `## `)
4. Return array of `ParsedSection` objects preserving order

```typescript
function parseProjectMdSections(content: string): ParsedSection[] {
  const lines = content.split('\n');
  const sections: ParsedSection[] = [];
  let currentHeader = '';
  let currentLevel = 0;
  let currentLines: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{2})\s+(.+)$/);
    if (headerMatch) {
      // Save previous section
      if (currentHeader !== '' || currentLines.length > 0) {
        sections.push({
          header: currentHeader,
          level: currentLevel,
          content: currentLines.join('\n'),
        });
      }
      currentHeader = line;
      currentLevel = headerMatch[1].length;
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  // Save last section
  if (currentHeader !== '' || currentLines.length > 0) {
    sections.push({
      header: currentHeader,
      level: currentLevel,
      content: currentLines.join('\n'),
    });
  }

  return sections;
}
```

#### `classifySection(header: string): SectionMergeStrategy`

Determines how a section should be handled during merge.

```typescript
/** Sections whose content is auto-detectable and should be refreshed */
const AUTO_UPDATE_SECTIONS = [
  '## Project Overview',
  '## Toolchain',
  '## Commands',
  '## Project Structure',
];

/** Sections that are static boilerplate and always regenerated */
const STATIC_SECTIONS = [
  '## 🚨 MANDATORY: Load CodeOps Rules Before Any Work',
  '## Cross-References',
];

function classifySection(header: string): SectionMergeStrategy {
  // Normalize: strip trailing whitespace, compare case-insensitively
  const normalized = header.trim();

  for (const auto of AUTO_UPDATE_SECTIONS) {
    if (normalized.toLowerCase().startsWith(auto.toLowerCase())) {
      return 'auto-update';
    }
  }

  for (const s of STATIC_SECTIONS) {
    if (normalized.toLowerCase().startsWith(s.toLowerCase())) {
      return 'static';
    }
  }

  return 'preserve';
}
```

#### `mergeProjectMd(existingSections: ParsedSection[], analysis: ProjectAnalysis): string`

The core merge function. Walks existing sections, applies the appropriate strategy, and builds the merged output with a change log.

**Algorithm:**
1. Generate the "fresh" version of each auto-update section from `analysis`
2. For each existing section:
   - **`auto-update`**: Compare existing content with freshly generated content
     - If different → use fresh content, record change
     - Special handling: preserve user-filled `[TODO]` → detected value replacements; preserve user overrides of auto-fields
   - **`preserve`**: Keep existing content verbatim
   - **`static`**: Regenerate from template (these are boilerplate)
3. Check if fresh analysis has sections not present in existing file → append them
4. Prepend change log header
5. Return merged markdown

**Detailed merge logic for auto-update sections:**

For `## Project Overview`:
- Update `- **Name:**` and `- **Type:**` lines with fresh values
- Preserve `- **Description:**` if user filled it in (not `[TODO]`)

For `## Toolchain`:
- Update `- **Language(s):**`, `- **Framework(s):**`, `- **Package Manager:**`, `- **Test Framework:**` with fresh values
- Update `**Manifest files found:**` line
- Preserve `- **Structure:** Monorepo` if applicable

For `## Commands`:
- Compare each command block against what would be freshly generated
- If user changed a command (doesn't match fresh AND doesn't match old auto-pattern), preserve user's version and note in change log
- If command still matches auto-pattern, update with fresh value

For `## Project Structure`:
- Update directory layout with fresh scan
- Update monorepo/single-repo classification

#### `formatChangeLog(changes: MergeChange[]): string`

Formats the change log header for the merged output.

```typescript
function formatChangeLog(changes: MergeChange[]): string {
  if (changes.length === 0) {
    return [
      '> **✅ Re-analyzed by `analyze_project`** (no changes detected)',
      `> **Scanned:** ${new Date().toISOString().split('T')[0]}`,
      '',
    ].join('\n');
  }

  const lines = [
    '> **🔄 Updated by `analyze_project`** (incremental update)',
    `> **Scanned:** ${new Date().toISOString().split('T')[0]}`,
    '> **Changes detected:**',
  ];

  for (const change of changes) {
    lines.push(`> - ${change.section}: ${change.description}`);
  }

  lines.push('');
  return lines.join('\n');
}
```

### Modified Function: `analyzeProject(args)`

```typescript
export async function analyzeProject(args: AnalyzeProjectArgs): Promise<string> {
  const { projectPath } = args;

  if (!projectPath || projectPath.trim().length === 0) {
    return '**Error:** Project path is required.';
  }

  try {
    const pathStat = await stat(projectPath);
    if (!pathStat.isDirectory()) {
      return `**Error:** "${projectPath}" is not a directory.`;
    }

    // Perform fresh analysis
    const analysis = await scanProject(projectPath);

    // Check for existing project.md
    const existingContent = await readExistingProjectMd(projectPath);

    if (existingContent) {
      // Merge path: parse existing, merge with fresh analysis
      const existingSections = parseProjectMdSections(existingContent);
      return mergeProjectMd(existingSections, analysis);
    }

    // Fresh generation path (unchanged)
    return formatProjectMd(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `**Error:** Failed to analyze project: ${message}`;
  }
}
```

### Integration Points

- **`scanProject()`** — Unchanged. Always performs a full scan.
- **`formatProjectMd()`** — Unchanged. Used as fallback for fresh generation AND internally by merge to generate auto-update section content for comparison.
- **MCP tool dispatch** — Unchanged. `analyzeProject` signature is the same.

## Error Handling

| Error Case                              | Handling Strategy                                            |
| --------------------------------------- | ------------------------------------------------------------ |
| Existing `project.md` can't be read     | Return `null` from `readExistingProjectMd`, fall through to fresh generation |
| Existing `project.md` is empty          | Treat as "no existing file" — fresh generation               |
| Existing file has no `##` sections      | Return single section with all content preserved, append fresh auto-detect sections |
| Section header doesn't match any known  | Classify as `preserve` — always safe default                 |
| Fresh scan fails                        | Error propagates as before (no change to error handling)     |

## Testing Requirements

- Unit tests for `parseProjectMdSections` — various section structures
- Unit tests for `classifySection` — all section types
- Unit tests for `mergeProjectMd` — merge scenarios (see 07-testing-strategy.md)
- Integration test for `analyzeProject` with existing file
- Integration test for `analyzeProject` without existing file (regression)
