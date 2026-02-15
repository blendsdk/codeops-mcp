/**
 * Shared test setup for tool tests.
 *
 * Loads the real rule documents and builds the search index once,
 * then exposes them for all tool test files.
 *
 * @module __tests__/tools/tools-setup
 */

import { join } from 'path';
import { RuleStore } from '../../store/rule-store.js';
import { SearchEngine } from '../../store/search-engine.js';

/** Absolute path to the bundled docs directory */
const DOCS_PATH = join(process.cwd(), 'docs');

/** Cached store instance — built lazily on first access */
let cachedStore: RuleStore | null = null;

/** Cached search engine instance — built lazily on first access */
let cachedEngine: SearchEngine | null = null;

/**
 * Get the populated rule store and search engine.
 * Loads documents on first call, then returns cached instances.
 *
 * @returns Object with store and searchEngine
 */
export async function getTestIndex(): Promise<{
  store: RuleStore;
  searchEngine: SearchEngine;
}> {
  if (!cachedStore || !cachedEngine) {
    cachedStore = new RuleStore();
    await cachedStore.loadFromDirectory(DOCS_PATH);

    cachedEngine = new SearchEngine();
    cachedEngine.buildIndex(cachedStore.getAllDocuments());
  }
  return { store: cachedStore, searchEngine: cachedEngine };
}
