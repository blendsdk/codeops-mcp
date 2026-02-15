/**
 * Tests for the SearchEngine.
 *
 * Tests indexing, search, scoring, and excerpt extraction.
 *
 * @module __tests__/store/search-engine
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { join } from 'path';
import { RuleStore } from '../../store/rule-store.js';
import { SearchEngine } from '../../store/search-engine.js';

const DOCS_PATH = join(process.cwd(), 'docs');

let searchEngine: SearchEngine;

beforeAll(async () => {
  const store = new RuleStore();
  await store.loadFromDirectory(DOCS_PATH);

  searchEngine = new SearchEngine();
  searchEngine.buildIndex(store.getAllDocuments());
});

describe('SearchEngine indexing', () => {
  it('should build an index with tokens', () => {
    expect(searchEngine.vocabularySize).toBeGreaterThan(100);
  });
});

describe('SearchEngine search', () => {
  it('should return results for "testing"', () => {
    const results = searchEngine.search('testing');
    expect(results.length).toBeGreaterThan(0);
    // Testing doc should be highly ranked
    expect(results[0].document.id).toContain('test');
  });

  it('should return results for "git commit"', () => {
    const results = searchEngine.search('git commit');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return results for "context window"', () => {
    const results = searchEngine.search('context window');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return results for "DRY"', () => {
    const results = searchEngine.search('DRY');
    expect(results.length).toBeGreaterThan(0);
  });

  it('should return empty array for nonsense query', () => {
    const results = searchEngine.search('xyznonexistent123');
    expect(results).toEqual([]);
  });

  it('should return empty array for empty query', () => {
    const results = searchEngine.search('');
    expect(results).toEqual([]);
  });

  it('should respect limit parameter', () => {
    const results = searchEngine.search('rule', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('should filter by category', () => {
    const results = searchEngine.search('testing', 5, 'standards');
    for (const result of results) {
      expect(result.document.category).toBe('standards');
    }
  });

  it('should have relevance scores between 0 and 100', () => {
    const results = searchEngine.search('testing');
    for (const result of results) {
      expect(result.relevance).toBeGreaterThanOrEqual(0);
      expect(result.relevance).toBeLessThanOrEqual(100);
    }
  });

  it('should include excerpts in results', () => {
    const results = searchEngine.search('testing');
    for (const result of results) {
      expect(result.excerpt).toBeTruthy();
      expect(result.excerpt.length).toBeGreaterThan(0);
    }
  });
});

describe('SearchEngine clear and rebuild', () => {
  it('should clear the index', () => {
    const engine = new SearchEngine();
    const store = new RuleStore();

    // Build, then clear
    engine.buildIndex([]);
    engine.clear();

    expect(engine.vocabularySize).toBe(0);
    expect(engine.search('anything')).toEqual([]);
  });
});
