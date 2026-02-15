/**
 * Tool: analyze_project — Scan a project directory and auto-generate project.md.
 *
 * The killer feature of codeops-mcp. Scans a project directory, detects
 * the toolchain (language, framework, package manager, test runner),
 * and generates a ready-to-use `.clinerules/project.md` configuration file.
 *
 * Detection is based on manifest files (package.json, Cargo.toml, go.mod,
 * pyproject.toml, etc.) and directory structure.
 *
 * @module tools/analyze-project
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join, basename } from 'path';
import type { AnalyzeProjectArgs, ProjectAnalysis } from '../types/index.js';

/**
 * Execute the analyze_project tool.
 *
 * Scans the given project directory, detects toolchain and conventions,
 * and returns a complete `.clinerules/project.md` ready for use.
 *
 * @param args - Tool arguments containing the project path
 * @returns Formatted markdown string with generated project.md content
 */
export async function analyzeProject(args: AnalyzeProjectArgs): Promise<string> {
  const { projectPath } = args;

  if (!projectPath || projectPath.trim().length === 0) {
    return '**Error:** Project path is required. Provide the absolute path to your project root.';
  }

  try {
    // Verify path exists and is a directory
    const pathStat = await stat(projectPath);
    if (!pathStat.isDirectory()) {
      return `**Error:** "${projectPath}" is not a directory.`;
    }

    // Perform analysis
    const analysis = await scanProject(projectPath);

    // Generate project.md content
    return formatProjectMd(analysis);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `**Error:** Failed to analyze project: ${message}`;
  }
}

/**
 * Scan a project directory and build a ProjectAnalysis.
 *
 * Reads manifest files, checks directory structure, and infers
 * toolchain information.
 *
 * @param projectPath - Absolute path to the project root
 * @returns Completed project analysis
 */
async function scanProject(projectPath: string): Promise<ProjectAnalysis> {
  const analysis: ProjectAnalysis = {
    name: basename(projectPath),
    type: 'unknown',
    languages: [],
    frameworks: [],
    packageManager: null,
    testFramework: null,
    buildCommand: null,
    testCommand: null,
    verifyCommand: null,
    isMonorepo: false,
    structure: [],
    manifestFiles: [],
  };

  // Read top-level directory entries
  const entries = await readdir(projectPath);

  // Detect manifest files
  await detectManifests(projectPath, entries, analysis);

  // Detect directory structure
  detectStructure(entries, analysis);

  // Infer project type from detected info
  inferProjectType(analysis);

  // Build commands
  inferCommands(analysis);

  return analysis;
}

/**
 * Detect and parse manifest files to identify toolchain.
 *
 * @param projectPath - Project root path
 * @param entries - Directory entries
 * @param analysis - Analysis object to populate (mutated)
 */
async function detectManifests(
  projectPath: string,
  entries: string[],
  analysis: ProjectAnalysis
): Promise<void> {
  // Node.js / JavaScript / TypeScript
  if (entries.includes('package.json')) {
    analysis.manifestFiles.push('package.json');
    await parsePackageJson(projectPath, analysis);
  }

  // Rust
  if (entries.includes('Cargo.toml')) {
    analysis.manifestFiles.push('Cargo.toml');
    analysis.languages.push('Rust');
    analysis.packageManager = 'cargo';
    analysis.testFramework = 'cargo test';
  }

  // Go
  if (entries.includes('go.mod')) {
    analysis.manifestFiles.push('go.mod');
    analysis.languages.push('Go');
    analysis.packageManager = 'go';
    analysis.testFramework = 'go test';
  }

  // Python
  if (entries.includes('pyproject.toml')) {
    analysis.manifestFiles.push('pyproject.toml');
    analysis.languages.push('Python');
    await parsePyproject(projectPath, analysis);
  } else if (entries.includes('setup.py') || entries.includes('requirements.txt')) {
    if (entries.includes('setup.py')) analysis.manifestFiles.push('setup.py');
    if (entries.includes('requirements.txt')) analysis.manifestFiles.push('requirements.txt');
    analysis.languages.push('Python');
    analysis.packageManager = 'pip';
    analysis.testFramework = 'pytest';
  }

  // Docker / Infrastructure
  if (entries.includes('docker-compose.yml') || entries.includes('docker-compose.yaml')) {
    const name = entries.includes('docker-compose.yml') ? 'docker-compose.yml' : 'docker-compose.yaml';
    analysis.manifestFiles.push(name);
    if (analysis.languages.length === 0) {
      analysis.languages.push('Docker');
    }
  }

  if (entries.includes('Dockerfile')) {
    analysis.manifestFiles.push('Dockerfile');
  }

  // Makefile
  if (entries.includes('Makefile')) {
    analysis.manifestFiles.push('Makefile');
  }

  // TypeScript config
  if (entries.includes('tsconfig.json')) {
    analysis.manifestFiles.push('tsconfig.json');
    if (!analysis.languages.includes('TypeScript')) {
      analysis.languages.push('TypeScript');
    }
  }
}

/**
 * Parse package.json to detect Node.js toolchain details.
 *
 * @param projectPath - Project root path
 * @param analysis - Analysis object to populate (mutated)
 */
async function parsePackageJson(
  projectPath: string,
  analysis: ProjectAnalysis
): Promise<void> {
  try {
    const content = await readFile(join(projectPath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(content);

    // Project name
    if (pkg.name) {
      analysis.name = pkg.name;
    }

    // Detect language
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps['typescript'] || pkg.devDependencies?.['typescript']) {
      if (!analysis.languages.includes('TypeScript')) {
        analysis.languages.push('TypeScript');
      }
    }
    if (!analysis.languages.includes('JavaScript') && !analysis.languages.includes('TypeScript')) {
      analysis.languages.push('JavaScript');
    }

    // Detect frameworks
    if (deps['react'] || deps['react-dom']) analysis.frameworks.push('React');
    if (deps['next']) analysis.frameworks.push('Next.js');
    if (deps['vue']) analysis.frameworks.push('Vue');
    if (deps['express']) analysis.frameworks.push('Express');
    if (deps['fastify']) analysis.frameworks.push('Fastify');
    if (deps['@nestjs/core']) analysis.frameworks.push('NestJS');
    if (deps['@modelcontextprotocol/sdk']) analysis.frameworks.push('MCP SDK');

    // Detect test framework
    if (deps['vitest']) analysis.testFramework = 'Vitest';
    else if (deps['jest']) analysis.testFramework = 'Jest';
    else if (deps['mocha']) analysis.testFramework = 'Mocha';

    // Detect package manager
    if (pkg.packageManager) {
      if (pkg.packageManager.startsWith('yarn')) analysis.packageManager = 'yarn';
      else if (pkg.packageManager.startsWith('pnpm')) analysis.packageManager = 'pnpm';
      else analysis.packageManager = 'npm';
    }

    // Detect monorepo
    if (pkg.workspaces) {
      analysis.isMonorepo = true;
    }

    // Detect bundler
    if (deps['turbo'] || deps['@turbo/gen']) analysis.frameworks.push('Turbo');
    if (deps['vite']) analysis.frameworks.push('Vite');
    if (deps['webpack']) analysis.frameworks.push('Webpack');
    if (deps['esbuild']) analysis.frameworks.push('esbuild');

    // Detect linter/formatter
    if (deps['eslint']) analysis.frameworks.push('ESLint');
    if (deps['prettier']) analysis.frameworks.push('Prettier');
  } catch {
    // package.json exists but couldn't be parsed
  }

  // Detect package manager from lockfiles if not already detected
  if (!analysis.packageManager) {
    const entries = await readdir(projectPath);
    if (entries.includes('yarn.lock')) analysis.packageManager = 'yarn';
    else if (entries.includes('pnpm-lock.yaml')) analysis.packageManager = 'pnpm';
    else if (entries.includes('package-lock.json')) analysis.packageManager = 'npm';
    else analysis.packageManager = 'npm';
  }
}

/**
 * Parse pyproject.toml to detect Python toolchain details.
 *
 * @param projectPath - Project root path
 * @param analysis - Analysis object to populate (mutated)
 */
async function parsePyproject(
  projectPath: string,
  analysis: ProjectAnalysis
): Promise<void> {
  try {
    const content = await readFile(join(projectPath, 'pyproject.toml'), 'utf-8');

    // Basic TOML parsing for common fields
    if (content.includes('pytest')) analysis.testFramework = 'pytest';
    if (content.includes('poetry')) analysis.packageManager = 'poetry';
    else if (content.includes('pdm')) analysis.packageManager = 'pdm';
    else analysis.packageManager = 'pip';

    // Detect frameworks
    if (content.includes('fastapi')) analysis.frameworks.push('FastAPI');
    if (content.includes('django')) analysis.frameworks.push('Django');
    if (content.includes('flask')) analysis.frameworks.push('Flask');
  } catch {
    // pyproject.toml exists but couldn't be parsed
    analysis.packageManager = 'pip';
    analysis.testFramework = 'pytest';
  }
}

/**
 * Detect directory structure patterns.
 *
 * @param entries - Top-level directory entries
 * @param analysis - Analysis object to populate (mutated)
 */
function detectStructure(entries: string[], analysis: ProjectAnalysis): void {
  const dirs = entries.filter((e) => !e.startsWith('.') && !e.includes('.'));
  analysis.structure = dirs.slice(0, 15); // Cap at 15 entries

  // Detect monorepo from directory structure
  if (entries.includes('packages') || entries.includes('apps') || entries.includes('libs')) {
    analysis.isMonorepo = true;
  }
}

/**
 * Infer the project type from detected languages and frameworks.
 *
 * @param analysis - Analysis object to update (mutated)
 */
function inferProjectType(analysis: ProjectAnalysis): void {
  const { languages, frameworks, manifestFiles, structure } = analysis;

  // Infrastructure project
  if (languages.includes('Docker') && !languages.includes('TypeScript') && !languages.includes('JavaScript')) {
    analysis.type = 'infrastructure';
    return;
  }

  // MCP server
  if (frameworks.includes('MCP SDK')) {
    analysis.type = 'library';
    return;
  }

  // Web app
  if (frameworks.includes('React') || frameworks.includes('Vue') || frameworks.includes('Next.js')) {
    analysis.type = analysis.isMonorepo ? 'web-app' : 'web-app';
    return;
  }

  // API
  if (frameworks.includes('Express') || frameworks.includes('Fastify') || frameworks.includes('NestJS') ||
      frameworks.includes('FastAPI') || frameworks.includes('Django')) {
    analysis.type = 'api';
    return;
  }

  // CLI
  if (structure.includes('commands') || structure.includes('cmd')) {
    analysis.type = 'cli';
    return;
  }

  // Compiler
  if (structure.includes('lexer') || structure.includes('parser') || structure.includes('codegen')) {
    analysis.type = 'compiler';
    return;
  }

  // Library
  if (manifestFiles.length > 0 && (languages.includes('TypeScript') || languages.includes('Rust') || languages.includes('Go'))) {
    analysis.type = 'library';
    return;
  }

  // Python project
  if (languages.includes('Python')) {
    analysis.type = 'library';
    return;
  }

  analysis.type = 'unknown';
}

/**
 * Infer build, test, and verify commands from the detected toolchain.
 *
 * @param analysis - Analysis object to update (mutated)
 */
function inferCommands(analysis: ProjectAnalysis): void {
  const pm = analysis.packageManager;

  // Node.js projects
  if (pm === 'yarn' || pm === 'npm' || pm === 'pnpm') {
    const run = pm === 'npm' ? 'npm run' : pm;
    analysis.buildCommand = `clear && ${pm === 'npm' ? 'npm run' : pm} build`;
    analysis.testCommand = `clear && ${pm} test`;

    if (analysis.languages.includes('TypeScript')) {
      analysis.verifyCommand = `clear && ${run} build && ${pm} test`;
    } else {
      analysis.verifyCommand = `clear && ${pm} test`;
    }
    return;
  }

  // Rust
  if (pm === 'cargo') {
    analysis.buildCommand = 'clear && cargo build';
    analysis.testCommand = 'clear && cargo test';
    analysis.verifyCommand = 'clear && cargo build && cargo test';
    return;
  }

  // Go
  if (pm === 'go') {
    analysis.buildCommand = 'clear && go build ./...';
    analysis.testCommand = 'clear && go test ./...';
    analysis.verifyCommand = 'clear && go build ./... && go test ./...';
    return;
  }

  // Python
  if (pm === 'pip' || pm === 'poetry' || pm === 'pdm') {
    analysis.testCommand = 'clear && pytest';
    analysis.verifyCommand = 'clear && pytest';
    return;
  }

  // Infrastructure/Docker
  if (analysis.manifestFiles.includes('docker-compose.yml') || analysis.manifestFiles.includes('docker-compose.yaml')) {
    analysis.buildCommand = 'clear && docker compose build';
    analysis.testCommand = 'clear && docker compose config';
    analysis.verifyCommand = 'clear && docker compose config && docker compose build';
    return;
  }
}

/**
 * Format the analysis results as a complete project.md file.
 *
 * @param analysis - The completed project analysis
 * @returns Formatted project.md markdown content
 */
function formatProjectMd(analysis: ProjectAnalysis): string {
  const parts: string[] = [];

  parts.push('# Generated Project Configuration');
  parts.push('');
  parts.push('> **Auto-generated by `analyze_project`**');
  parts.push(`> **Project:** ${analysis.name}`);
  parts.push(`> **Type:** ${analysis.type}`);
  parts.push('');
  parts.push('Save this content to `.clinerules/project.md` in your project root,');
  parts.push('then review and adjust the values as needed.');
  parts.push('');
  parts.push('---');
  parts.push('');

  // Bootstrap section — forces the AI agent to load rules
  parts.push('## 🚨 MANDATORY: Load CodeOps Rules Before Any Work');
  parts.push('');
  parts.push('**Before ANY planning or implementation, the AI agent MUST load these rules');
  parts.push('using the codeops-mcp tools:**');
  parts.push('');
  parts.push('1. `get_rule("agents")` — Load agent behavior rules **(REQUIRED FIRST)**');
  parts.push('2. `get_rule("code")` — Load coding standards');
  parts.push('3. `get_rule("testing")` — Load testing workflows');
  parts.push('4. `get_rule("git-commands")` — Load git commit protocols');
  parts.push('');
  parts.push('These rules are **mandatory** and must be consulted before every task.');
  parts.push('**Do NOT skip this step. Do NOT proceed without reading these documents.**');
  parts.push('');
  parts.push('---');
  parts.push('');

  // Project Overview
  parts.push('## Project Overview');
  parts.push('');
  parts.push(`- **Name:** ${analysis.name}`);
  parts.push(`- **Description:** [TODO: Add project description]`);
  parts.push(`- **Type:** ${analysis.type}`);
  parts.push('');

  // Toolchain
  parts.push('## Toolchain');
  parts.push('');
  parts.push(`- **Language(s):** ${analysis.languages.join(', ') || '[Not detected]'}`);
  parts.push(`- **Framework(s):** ${analysis.frameworks.join(', ') || '[None detected]'}`);
  parts.push(`- **Package Manager:** ${analysis.packageManager || '[Not detected]'}`);
  parts.push(`- **Test Framework:** ${analysis.testFramework || '[Not detected]'}`);
  if (analysis.isMonorepo) {
    parts.push('- **Structure:** Monorepo');
  }
  parts.push('');

  // Manifest files detected
  parts.push(`**Manifest files found:** ${analysis.manifestFiles.join(', ')}`);
  parts.push('');

  // Commands
  parts.push('## Commands');
  parts.push('');
  parts.push('All commands assume execution from the project root. Prefix all shell commands with `clear &&`.');
  parts.push('');

  parts.push('### Build');
  parts.push('');
  parts.push('```bash');
  parts.push(analysis.buildCommand || '# [TODO: Add build command]');
  parts.push('```');
  parts.push('');

  parts.push('### Test');
  parts.push('');
  parts.push('```bash');
  parts.push('# Run all tests');
  parts.push(analysis.testCommand || '# [TODO: Add test command]');
  parts.push('```');
  parts.push('');

  parts.push('### Verify (before commit)');
  parts.push('');
  parts.push('```bash');
  parts.push('# Full verification — run this before any git commit');
  parts.push(analysis.verifyCommand || '# [TODO: Add verify command]');
  parts.push('```');
  parts.push('');

  // Project Structure
  parts.push('## Project Structure');
  parts.push('');
  parts.push(`### Type: ${analysis.isMonorepo ? 'Monorepo' : 'Single repository'}`);
  parts.push('');
  parts.push('### Directory Layout');
  parts.push('');
  parts.push('```');
  if (analysis.structure.length > 0) {
    for (const dir of analysis.structure) {
      parts.push(`${dir}/`);
    }
  } else {
    parts.push('[TODO: Add directory layout]');
  }
  parts.push('```');
  parts.push('');

  // Coding Conventions
  parts.push('## Coding Conventions');
  parts.push('');
  parts.push('### Naming');
  parts.push('');
  parts.push('- **Files:** [TODO: e.g., kebab-case, camelCase, snake_case]');
  parts.push('- **Components/Classes:** [TODO: e.g., PascalCase]');
  parts.push('- **Functions/Methods:** [TODO: e.g., camelCase, snake_case]');
  parts.push('- **Constants:** [TODO: e.g., UPPER_SNAKE_CASE]');
  parts.push('');

  // Git conventions
  parts.push('## Git & Commit Conventions');
  parts.push('');
  parts.push('### Commit Scope');
  parts.push('');
  parts.push('```');
  if (analysis.isMonorepo) {
    parts.push('# Monorepo — use package name as scope:');
    parts.push('# feat(package-name): description');
  } else {
    parts.push('# Use module/feature as scope:');
    parts.push('# feat(module): description');
  }
  parts.push('```');
  parts.push('');

  parts.push('### Branch Strategy');
  parts.push('');
  parts.push('- **Main branch:** `main`');
  parts.push('- **Feature branches:** `feature/[name]`');
  parts.push('');

  // Special rules
  parts.push('## Special Rules (Project-Specific)');
  parts.push('');
  parts.push('```');
  parts.push('[TODO: Add any project-specific rules]');
  parts.push('```');
  parts.push('');

  // Cross-references
  parts.push('## Cross-References');
  parts.push('');
  parts.push('The generic rule files that read this `project.md`:');
  parts.push('');
  parts.push('- **make_plan.md** — Uses verify command, file paths, commit scope');
  parts.push('- **code.md** — Uses language conventions, architecture rules');
  parts.push('- **testing.md** — Uses test commands, test locations, test framework');
  parts.push('- **git-commands.md** — Uses commit scope, verify command');
  parts.push('- **agents.md** — Uses shell commands, verify command');
  parts.push('- **plans.md** — Uses task file path patterns');

  return parts.join('\n');
}
