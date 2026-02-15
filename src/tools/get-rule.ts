/**
 * Tool: get_rule — Look up a specific rule document by name.
 *
 * The primary tool for retrieving rule documentation. Supports fuzzy
 * name matching and aliases (e.g., "git" finds "git-commands",
 * "test" finds "testing").
 *
 * Returns the full markdown content with a metadata header.
 *
 * @module tools/get-rule
 */

import type { RuleStore } from '../store/rule-store.js';
import type { GetRuleArgs } from '../types/index.js';
import { RULE_METADATA, RULE_ALIASES, CATEGORY_INFO } from '../types/index.js';

/**
 * Execute the get_rule tool.
 *
 * Looks up a rule document by name using the RuleStore's fuzzy matching,
 * and returns the complete documentation with metadata header.
 *
 * @param store - The populated rule store
 * @param args - Tool arguments containing the rule name
 * @returns Formatted markdown string with the rule documentation
 */
export function getRule(
  store: RuleStore,
  args: GetRuleArgs
): string {
  const { name } = args;

  if (!name || name.trim().length === 0) {
    return formatError(
      'Rule name is required.\n\n' +
      'Available rules: ' + Object.keys(RULE_METADATA).join(', ') + '\n\n' +
      '*Use `list_rules` to see all available rules with descriptions.*'
    );
  }

  const doc = store.findByName(name.trim());

  if (!doc) {
    return formatNotFound(name);
  }

  return formatRuleResponse(doc.title, doc.id, doc.content, doc.category, doc.description, doc.crossReferences);
}

/**
 * Format a successful rule document response.
 *
 * Prepends a structured metadata header to the raw markdown content.
 *
 * @param title - Rule document title
 * @param id - Document ID
 * @param content - Full markdown content
 * @param category - Rule category
 * @param description - Brief description
 * @param crossRefs - Cross-referenced rule IDs
 * @returns Formatted response string
 */
function formatRuleResponse(
  title: string,
  id: string,
  content: string,
  category: string,
  description: string,
  crossRefs: string[]
): string {
  const parts: string[] = [];

  // Metadata header
  parts.push(`# ${title}`);
  parts.push('');
  parts.push(`**Rule ID:** \`${id}\``);
  parts.push(`**Category:** ${CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]?.label || category}`);
  parts.push(`**Description:** ${description}`);

  if (crossRefs.length > 0) {
    parts.push(`**Related Rules:** ${crossRefs.map((ref) => `\`${ref}\``).join(', ')}`);
  }

  parts.push('');
  parts.push('---');
  parts.push('');

  // Full content
  parts.push(content);

  return parts.join('\n');
}

/**
 * Format a "not found" error with available rules and aliases.
 *
 * @param name - The rule name that wasn't found
 * @returns Formatted error message with suggestions
 */
function formatNotFound(name: string): string {
  const parts: string[] = [];
  parts.push(`Rule "${name}" not found.`);
  parts.push('');
  parts.push('**Available rules:**');

  for (const [id, meta] of Object.entries(RULE_METADATA)) {
    // Find aliases for this rule
    const aliases = Object.entries(RULE_ALIASES)
      .filter(([, target]) => target === id)
      .map(([alias]) => alias);

    const aliasNote = aliases.length > 0
      ? ` *(aliases: ${aliases.slice(0, 3).join(', ')})*`
      : '';

    parts.push(`- **${id}** — ${meta.description}${aliasNote}`);
  }

  parts.push('');
  parts.push('*Tip: Use aliases like "git" for "git-commands", "test" for "testing"*');

  return parts.join('\n');
}

/**
 * Format a generic error message.
 *
 * @param message - The error description
 * @returns Formatted error string
 */
function formatError(message: string): string {
  return `**Error:** ${message}`;
}
