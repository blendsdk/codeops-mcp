/**
 * Tool: search_rules — Full-text search across all rule documents.
 *
 * Uses the TF-IDF search engine to find relevant rule documentation
 * matching a query string. Results are ranked by relevance and can
 * optionally be filtered by category.
 *
 * @module tools/search-rules
 */

import type { SearchEngine } from '../store/search-engine.js';
import type { SearchRulesArgs, RuleCategory, SearchResult } from '../types/index.js';
import { CATEGORY_INFO, DEFAULT_SEARCH_LIMIT } from '../types/index.js';

/**
 * Execute the search_rules tool.
 *
 * Runs a full-text search across all indexed rule documents and returns
 * ranked results with relevance scores and context excerpts.
 *
 * @param searchEngine - The populated search engine
 * @param args - Tool arguments containing the query, optional category filter, and limit
 * @returns Formatted markdown string with search results
 */
export function searchRules(
  searchEngine: SearchEngine,
  args: SearchRulesArgs
): string {
  const { query, category, limit } = args;

  if (!query || query.trim().length === 0) {
    return formatError(
      'Search query is required.\n\n' +
      'Examples: "context window management", "git commit", "test coverage", "DRY principle"'
    );
  }

  const effectiveLimit = limit ?? DEFAULT_SEARCH_LIMIT;
  const categoryFilter = category as RuleCategory | undefined;

  const results = searchEngine.search(query.trim(), effectiveLimit, categoryFilter);

  if (results.length === 0) {
    return formatNoResults(query, categoryFilter);
  }

  return formatSearchResults(query, results, categoryFilter);
}

/**
 * Format search results into a readable markdown response.
 *
 * @param query - The original search query
 * @param results - Array of search results
 * @param categoryFilter - Category filter applied, if any
 * @returns Formatted markdown string
 */
function formatSearchResults(
  query: string,
  results: SearchResult[],
  categoryFilter?: RuleCategory
): string {
  const parts: string[] = [];

  const filterNote = categoryFilter
    ? ` in **${CATEGORY_INFO[categoryFilter]?.label || categoryFilter}**`
    : '';

  parts.push(`## Search Results for "${query}"${filterNote}`);
  parts.push(`*Found ${results.length} result${results.length === 1 ? '' : 's'}*`);
  parts.push('');

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const doc = result.document;
    const rank = i + 1;

    parts.push(`### ${rank}. ${doc.title} (${result.relevance}% relevant)`);

    // Tags
    const categoryLabel = CATEGORY_INFO[doc.category as keyof typeof CATEGORY_INFO]?.label || doc.category;
    parts.push(`📁 ${categoryLabel} · 📄 \`${doc.id}\``);

    // Excerpt
    if (result.excerpt) {
      parts.push(`> ${result.excerpt}`);
    }

    parts.push(`*Use \`get_rule("${doc.id}")\` for full documentation*`);
    parts.push('');
  }

  return parts.join('\n');
}

/**
 * Format a "no results" message with suggestions.
 *
 * @param query - The search query that returned no results
 * @param categoryFilter - Category filter applied, if any
 * @returns Formatted message with suggestions
 */
function formatNoResults(query: string, categoryFilter?: RuleCategory): string {
  const parts: string[] = [];
  parts.push(`No results found for "${query}".`);
  parts.push('');

  if (categoryFilter) {
    parts.push(`*You searched only in **${CATEGORY_INFO[categoryFilter]?.label || categoryFilter}**. Try removing the category filter.*`);
    parts.push('');
  }

  parts.push('**Suggestions:**');
  parts.push('- Try simpler or shorter search terms');
  parts.push('- Use specific concepts: "DRY", "commit", "context window", "testing"');
  parts.push('- Use `list_rules` to see all available rule documents');
  parts.push('- Use `get_rule("name")` if you know which rule you need');

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
