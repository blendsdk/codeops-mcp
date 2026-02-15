/**
 * Tool: list_rules — List all available rule documents.
 *
 * Returns a structured overview of every rule document in the store,
 * grouped by category. Useful for discovering what rules are available
 * and understanding the rule system.
 *
 * This is a utility tool — no arguments required.
 *
 * @module tools/list-rules
 */

import type { RuleStore } from '../store/rule-store.js';
import type { RuleCategory } from '../types/index.js';
import { CATEGORY_INFO, RULE_ALIASES } from '../types/index.js';

/**
 * Execute the list_rules tool.
 *
 * Returns a formatted overview of all loaded rule documents,
 * grouped by category with descriptions and aliases.
 *
 * @param store - The populated rule store
 * @returns Formatted markdown string listing all rules
 */
export function listRules(store: RuleStore): string {
  if (store.size === 0) {
    return formatEmpty();
  }

  return formatRulesOverview(store);
}

/**
 * Format the complete rules overview grouped by category.
 *
 * @param store - The populated rule store
 * @returns Formatted markdown overview
 */
function formatRulesOverview(store: RuleStore): string {
  const parts: string[] = [];

  parts.push('# CodeOps Rule Documents');
  parts.push('');
  parts.push(`**Total rules:** ${store.size}`);
  parts.push('');
  parts.push('These are universal, language-agnostic rules for AI coding agents.');
  parts.push('Each rule document works with any software project when paired with a');
  parts.push('project-specific `.clinerules/project.md` configuration file.');
  parts.push('');
  parts.push('---');

  // Group documents by category
  const categories: RuleCategory[] = ['standards', 'workflow', 'planning', 'behavior', 'setup'];

  for (const category of categories) {
    const docs = store.getByCategory(category);
    if (docs.length === 0) continue;

    const info = CATEGORY_INFO[category];
    parts.push('');
    parts.push(`## ${info.label}`);
    parts.push(`*${info.description}*`);
    parts.push('');

    for (const doc of docs) {
      // Find aliases for this rule
      const aliases = Object.entries(RULE_ALIASES)
        .filter(([, target]) => target === doc.id)
        .map(([alias]) => alias);

      parts.push(`### ${doc.title}`);
      parts.push(`- **ID:** \`${doc.id}\``);
      parts.push(`- **Description:** ${doc.description}`);

      if (aliases.length > 0) {
        parts.push(`- **Aliases:** ${aliases.join(', ')}`);
      }

      if (doc.crossReferences.length > 0) {
        parts.push(`- **Related:** ${doc.crossReferences.map((ref) => `\`${ref}\``).join(', ')}`);
      }

      parts.push(`- *Use \`get_rule("${doc.id}")\` for full documentation*`);
      parts.push('');
    }
  }

  // Usage guide
  parts.push('---');
  parts.push('');
  parts.push('## Quick Start');
  parts.push('');
  parts.push('1. **Get coding standards:** `get_rule("code")`');
  parts.push('2. **Get testing rules:** `get_rule("testing")`');
  parts.push('3. **Get git workflow:** `get_rule("git")`');
  parts.push('4. **Create a plan:** `get_rule("make_plan")`');
  parts.push('5. **Set up a project:** `get_rule("project-template")` or `analyze_project("/path/to/project")`');
  parts.push('6. **Search rules:** `search_rules("context window management")`');

  return parts.join('\n');
}

/**
 * Format a message when no rules are loaded.
 *
 * @returns Error message with troubleshooting tips
 */
function formatEmpty(): string {
  return [
    '**No rules loaded.**',
    '',
    'The rule store is empty. This may indicate:',
    '- The docs directory was not found',
    '- No .md files were discovered in the docs directory',
    '- An error occurred during loading',
    '',
    'Check the server startup logs for error details.',
  ].join('\n');
}
