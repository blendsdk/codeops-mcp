/**
 * Type definitions for the CodeOps MCP Server.
 *
 * These types define the core data structures used throughout the server
 * for rule document storage, searching, and tool responses.
 *
 * @module types
 */

// ============================================================================
// Rule Document Types
// ============================================================================

/**
 * Represents a single rule document loaded from the docs directory.
 * Each markdown file becomes one RuleDocument after loading.
 */
export interface RuleDocument {
  /** Unique identifier derived from filename (e.g., "code", "testing", "git-commands") */
  id: string;

  /** Display name extracted from markdown H1 title (e.g., "Coding Standards") */
  title: string;

  /** Full raw markdown content of the document */
  content: string;

  /** Absolute file path on disk */
  filePath: string;

  /** Filename without extension (e.g., "code.md" → "code") */
  filename: string;

  /** Brief description extracted from the document */
  description: string;

  /** Category classification for grouping */
  category: RuleCategory;

  /** List of cross-referenced rule document IDs */
  crossReferences: string[];
}

/**
 * Categories for organizing rule documents.
 * Used by list_rules to group rules logically.
 */
export type RuleCategory =
  | 'standards'    // code.md, testing.md
  | 'workflow'     // git-commands.md, make_plan.md
  | 'planning'     // plans.md
  | 'behavior'     // agents.md
  | 'setup';       // project-template.md

// ============================================================================
// Search Types
// ============================================================================

/**
 * A single search result returned by the search engine.
 * Includes the matching document and relevance scoring.
 */
export interface SearchResult {
  /** The matching rule document */
  document: RuleDocument;

  /** Overall relevance score (0-100, higher is more relevant) */
  relevance: number;

  /** Context excerpt showing where the query matched */
  excerpt: string;
}

/**
 * A single entry in the inverted search index.
 * Maps a token to its occurrence in a document.
 */
export interface SearchIndexEntry {
  /** Document ID that contains this token */
  documentId: string;

  /** Term frequency — how many times the token appears */
  termFrequency: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Server configuration resolved from CLI args, environment variables, and defaults.
 */
export interface ServerConfig {
  /** Absolute path to the docs directory containing rule markdown files */
  docsPath: string;

  /** Server name used in MCP registration */
  serverName: string;

  /** Server version string */
  serverVersion: string;
}

// ============================================================================
// Tool Argument Types
// ============================================================================

/** Arguments for the get_rule tool */
export interface GetRuleArgs {
  /** Rule name to look up (e.g., "code", "testing", "agents", "git-commands") */
  name: string;
}

/** Arguments for the search_rules tool */
export interface SearchRulesArgs {
  /** Search query string */
  query: string;

  /** Optional: limit results to a specific category */
  category?: RuleCategory;

  /** Optional: maximum number of results */
  limit?: number;
}

/** Arguments for the analyze_project tool */
export interface AnalyzeProjectArgs {
  /** Absolute path to the project root directory to analyze */
  projectPath: string;
}

/** Arguments for the get_setup_guide tool */
export interface GetSetupGuideArgs {
  /** Optional: project type for tailored guidance */
  projectType?: string;
}

// ============================================================================
// Project Merge Types
// ============================================================================

/**
 * A parsed section from an existing project.md file.
 * Used by the merge engine to compare and merge sections.
 */
export interface ParsedSection {
  /** The full header line, e.g., "## Toolchain" */
  header: string;

  /** The header level (2 for ##, 3 for ###, etc.). 0 for preamble. */
  level: number;

  /** The raw content below the header (until the next same-or-higher-level header) */
  content: string;
}

/**
 * Classification of how a section should be handled during merge.
 *
 * - `auto-update`: Content is auto-detectable and should be refreshed from scan
 * - `preserve`: Content is user-customized and must be kept verbatim
 * - `static`: Boilerplate content that is always regenerated from template
 */
export type SectionMergeStrategy = 'auto-update' | 'preserve' | 'static';

/**
 * A single change entry for the merge change log.
 */
export interface MergeChange {
  /** Section where the change occurred */
  section: string;

  /** Human-readable description of the change */
  description: string;
}

// ============================================================================
// Project Analysis Types
// ============================================================================

/**
 * Result of analyzing a project directory.
 * Used by the analyze_project tool to generate project.md content.
 */
export interface ProjectAnalysis {
  /** Detected project name */
  name: string;

  /** Detected project type */
  type: string;

  /** Detected programming language(s) */
  languages: string[];

  /** Detected frameworks */
  frameworks: string[];

  /** Detected package manager */
  packageManager: string | null;

  /** Detected test framework */
  testFramework: string | null;

  /** Detected build command */
  buildCommand: string | null;

  /** Detected test command */
  testCommand: string | null;

  /** Detected verify command */
  verifyCommand: string | null;

  /** Whether this is a monorepo */
  isMonorepo: boolean;

  /** Detected directory structure summary */
  structure: string[];

  /** Manifest files found */
  manifestFiles: string[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * All known rule document IDs mapped to their metadata.
 * Used for validation and display purposes.
 */
export const RULE_METADATA: Record<string, { title: string; category: RuleCategory; description: string }> = {
  'code': {
    title: 'Coding Standards',
    category: 'standards',
    description: 'Universal coding standards: DRY, testing, documentation, architecture, type safety.',
  },
  'testing': {
    title: 'Testing Standards & Rules',
    category: 'standards',
    description: 'Test commands, workflows, coverage requirements, and debugging strategies.',
  },
  'git-commands': {
    title: 'Git Commands & Workflow',
    category: 'workflow',
    description: 'Git commit protocols (gitcm/gitcmp), commit message format, and push workflow.',
  },
  'make_plan': {
    title: 'Implementation Plan Creation & Execution',
    category: 'workflow',
    description: 'Complete protocol for creating and executing multi-document implementation plans.',
  },
  'plans': {
    title: 'Implementation Plan Rules',
    category: 'planning',
    description: 'Rules for structuring plans: phases, tasks, dependencies, testing, architecture.',
  },
  'agents': {
    title: 'AI Agent Instructions',
    category: 'behavior',
    description: 'Mandatory AI agent behavior: compliance, context management, multi-session execution.',
  },
  'project-template': {
    title: 'Project Configuration Template',
    category: 'setup',
    description: 'Template for .clinerules/project.md — project-specific toolchain and conventions.',
  },
};

/**
 * Aliases for rule names — allows users to use shorthand names.
 */
export const RULE_ALIASES: Record<string, string> = {
  // code.md aliases
  'coding': 'code',
  'standards': 'code',
  'coding-standards': 'code',

  // testing.md aliases
  'test': 'testing',
  'tests': 'testing',

  // git-commands.md aliases
  'git': 'git-commands',
  'gitcm': 'git-commands',
  'gitcmp': 'git-commands',
  'commit': 'git-commands',

  // make_plan.md aliases
  'make-plan': 'make_plan',
  'makeplan': 'make_plan',
  'plan-creation': 'make_plan',
  'exec-plan': 'make_plan',
  'exec_plan': 'make_plan',

  // plans.md aliases
  'planning': 'plans',
  'plan-rules': 'plans',

  // agents.md aliases
  'agent': 'agents',
  'agent-rules': 'agents',
  'behavior': 'agents',

  // project-template.md aliases
  'project': 'project-template',
  'template': 'project-template',
  'setup': 'project-template',
  'project-config': 'project-template',
};

/** Default number of search results to return */
export const DEFAULT_SEARCH_LIMIT = 5;

/** Maximum number of search results allowed */
export const MAX_SEARCH_LIMIT = 7;

/** Category display names and descriptions */
export const CATEGORY_INFO: Record<RuleCategory, { label: string; description: string }> = {
  'standards': {
    label: 'Standards',
    description: 'Code quality, testing, and documentation standards',
  },
  'workflow': {
    label: 'Workflow',
    description: 'Git operations and plan creation/execution protocols',
  },
  'planning': {
    label: 'Planning',
    description: 'Implementation plan structure and formatting rules',
  },
  'behavior': {
    label: 'Agent Behavior',
    description: 'AI agent compliance, context management, and session rules',
  },
  'setup': {
    label: 'Project Setup',
    description: 'Project configuration templates and toolchain setup',
  },
};
