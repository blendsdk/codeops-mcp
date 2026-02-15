/**
 * Tool: get_setup_guide — Get project setup instructions.
 *
 * Returns a step-by-step guide for setting up CodeOps rules in a project.
 * Optionally tailored to a specific project type.
 *
 * Also serves as the entry point for users who want to understand
 * the rule system and how to get started.
 *
 * @module tools/get-setup-guide
 */

import type { RuleStore } from '../store/rule-store.js';
import type { GetSetupGuideArgs } from '../types/index.js';

/**
 * Execute the get_setup_guide tool.
 *
 * Returns the project-template.md content wrapped in a setup guide
 * with instructions for getting started.
 *
 * @param store - The populated rule store
 * @param args - Tool arguments with optional project type
 * @returns Formatted markdown string with setup instructions
 */
export function getSetupGuide(
  store: RuleStore,
  args: GetSetupGuideArgs
): string {
  const { projectType } = args;

  return formatSetupGuide(store, projectType);
}

/**
 * Format the setup guide with step-by-step instructions.
 *
 * @param store - The rule store for accessing the template
 * @param projectType - Optional project type for tailored guidance
 * @returns Formatted markdown guide
 */
function formatSetupGuide(store: RuleStore, projectType?: string): string {
  const parts: string[] = [];

  parts.push('# CodeOps Setup Guide');
  parts.push('');
  parts.push('Set up universal AI coding rules for your project in 3 steps.');
  parts.push('');
  parts.push('---');
  parts.push('');

  // Step 1
  parts.push('## Step 1: Generate Project Configuration');
  parts.push('');
  parts.push('Run `analyze_project` with your project path to auto-detect your toolchain:');
  parts.push('');
  parts.push('```');
  parts.push('analyze_project("/path/to/your/project")');
  parts.push('```');
  parts.push('');
  parts.push('This scans your project for manifest files (package.json, Cargo.toml, go.mod, etc.)');
  parts.push('and generates a `.clinerules/project.md` configuration.');
  parts.push('');
  parts.push('**Alternatively**, get the blank template and fill it in manually:');
  parts.push('');
  parts.push('```');
  parts.push('get_rule("project-template")');
  parts.push('```');
  parts.push('');

  // Step 2
  parts.push('## Step 2: Save the Configuration');
  parts.push('');
  parts.push('Save the generated content to `.clinerules/project.md` in your project root:');
  parts.push('');
  parts.push('```');
  parts.push('your-project/');
  parts.push('├── .clinerules/');
  parts.push('│   └── project.md    ← Save here');
  parts.push('├── src/');
  parts.push('├── package.json');
  parts.push('└── ...');
  parts.push('```');
  parts.push('');
  parts.push('Review and adjust the detected values (build commands, test commands, etc.).');
  parts.push('');

  // Step 3
  parts.push('## Step 3: Use the Rules');
  parts.push('');
  parts.push('The AI agent will automatically read `.clinerules/project.md` and apply');
  parts.push('the universal rules. Here are the available rule documents:');
  parts.push('');

  const ruleCount = store.size;
  if (ruleCount > 0) {
    const docs = store.getAllDocuments();
    for (const doc of docs) {
      parts.push(`- **${doc.id}** — ${doc.description}`);
    }
  } else {
    parts.push('- **code** — Coding standards');
    parts.push('- **testing** — Testing workflows');
    parts.push('- **git-commands** — Git commit protocols');
    parts.push('- **agents** — AI agent behavior rules');
    parts.push('- **plans** — Implementation plan formatting');
    parts.push('- **make_plan** — Plan creation/execution protocol');
    parts.push('- **project-template** — Project configuration template');
  }

  parts.push('');

  // Project type specific tips
  if (projectType) {
    parts.push('---');
    parts.push('');
    parts.push(`## Tips for ${projectType} Projects`);
    parts.push('');
    parts.push(getProjectTypeTips(projectType));
    parts.push('');
  }

  // Common workflows
  parts.push('---');
  parts.push('');
  parts.push('## Common Workflows');
  parts.push('');
  parts.push('| Workflow | Command |');
  parts.push('|----------|---------|');
  parts.push('| Start coding | `get_rule("code")` — Review coding standards first |');
  parts.push('| Run tests | `get_rule("testing")` — Get test commands and workflow |');
  parts.push('| Commit changes | `get_rule("git")` — Use gitcm/gitcmp protocol |');
  parts.push('| Create a plan | `get_rule("make_plan")` — Full plan creation workflow |');
  parts.push('| Search for a topic | `search_rules("context window")` — Find relevant rules |');

  return parts.join('\n');
}

/**
 * Get project-type-specific tips.
 *
 * @param projectType - The project type
 * @returns Formatted tips string
 */
function getProjectTypeTips(projectType: string): string {
  const type = projectType.toLowerCase();

  const tips: Record<string, string> = {
    'web-app': [
      '- Set up component testing (unit + integration)',
      '- Define component file naming conventions in project.md',
      '- Consider E2E testing with Playwright or Cypress',
      '- Use `code.md` Section 9 for test file organization',
    ].join('\n'),

    'api': [
      '- Define API endpoint testing strategy (unit + integration + E2E)',
      '- Set up Docker for integration tests if using databases',
      '- Document request/response validation patterns',
      '- Use `testing.md` Rule 4 for integration test workflow',
    ].join('\n'),

    'library': [
      '- Focus on high test coverage (90%+) for public APIs',
      '- Document all public exports with JSDoc/docstrings',
      '- Use `code.md` Section 6 for module boundary rules',
      '- Consider backward compatibility in your plan phases',
    ].join('\n'),

    'cli': [
      '- Test command-line argument parsing thoroughly',
      '- Add E2E tests for complete command workflows',
      '- Document help text and usage patterns',
      '- Use `code.md` Section 7 for splitting large command handlers',
    ].join('\n'),

    'infrastructure': [
      '- Use `testing.md` Rule 8 for configuration validation',
      '- Validate Docker Compose, Nginx, and shell scripts',
      '- Set up health check tests for deployed services',
      '- Use `docker compose config` as your verify command',
    ].join('\n'),

    'compiler': [
      '- Structure phases: Lexer → Parser → Analyzer → Generator',
      '- Test each phase independently with unit tests',
      '- Add E2E tests for complete compilation pipelines',
      '- Use `code.md` Section 7 for splitting large parser/generator files',
    ].join('\n'),
  };

  return tips[type] || [
    '- Review `code.md` for universal coding standards',
    '- Set up your test commands in `.clinerules/project.md`',
    '- Use `make_plan` for any non-trivial feature implementation',
    '- Follow `git-commands.md` for consistent commit messages',
  ].join('\n');
}
