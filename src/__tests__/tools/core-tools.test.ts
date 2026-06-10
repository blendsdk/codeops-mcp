/**
 * Tests for core tools: get_rule, list_rules, search_rules.
 *
 * Uses the real docs/ directory for integration-level validation.
 *
 * @module __tests__/tools/core-tools
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { join } from 'path';
import { readFile } from 'fs/promises';
import type { RuleStore } from '../../store/rule-store.js';
import type { SearchEngine } from '../../store/search-engine.js';
import { getTestIndex } from './tools-setup.js';


import { getRule } from '../../tools/get-rule.js';
import { listRules } from '../../tools/list-rules.js';
import { searchRules } from '../../tools/search-rules.js';
import { getSetupGuide } from '../../tools/get-setup-guide.js';

let store: RuleStore;
let searchEngine: SearchEngine;

beforeAll(async () => {
  const index = await getTestIndex();
  store = index.store;
  searchEngine = index.searchEngine;
});

// ============================================================================
// getRule
// ============================================================================

describe('getRule', () => {
  it('should return full documentation for a known rule by exact ID', () => {
    const result = getRule(store, { name: 'code' });
    expect(result).toContain('# Coding Standards');
    expect(result).toContain('**Rule ID:** `code`');
    expect(result).toContain('DRY');
  });

  it('should find rules by alias', () => {
    const result = getRule(store, { name: 'git' });
    expect(result).toContain('Git Commands');
    expect(result).toContain('gitcm');
  });

  it('should find testing rules via alias', () => {
    const result = getRule(store, { name: 'test' });
    expect(result).toContain('Testing');
  });

  it('should be case-insensitive', () => {
    const result = getRule(store, { name: 'CODE' });
    expect(result).toContain('Coding Standards');
  });

  it('should return error for empty name', () => {
    const result = getRule(store, { name: '' });
    expect(result).toContain('Error');
    expect(result).toContain('required');
  });

  it('should return not-found with suggestions for unknown rule', () => {
    const result = getRule(store, { name: 'nonexistent' });
    expect(result).toContain('not found');
    expect(result).toContain('Available rules');
  });

  it('should return agents rules', () => {
    const result = getRule(store, { name: 'agents' });
    expect(result).toContain('Agent Instructions');
    expect(result).toContain('context window');
  });

  it('should return make_plan rules', () => {
    const result = getRule(store, { name: 'make_plan' });
    expect(result).toContain('Implementation Plan');
    expect(result).toContain('make_plan');
  });

  it('should return plans rules', () => {
    const result = getRule(store, { name: 'plans' });
    expect(result).toContain('Implementation Plan Creation');
  });

  it('should return project-template', () => {
    const result = getRule(store, { name: 'project-template' });
    expect(result).toContain('Project Configuration');
  });

  it('should resolve project-template via "setup" alias', () => {
    const result = getRule(store, { name: 'setup' });
    expect(result).toContain('Project Configuration');
  });

  it('should include cross-references in metadata', () => {
    const result = getRule(store, { name: 'code' });
    expect(result).toContain('Related Rules');
  });
});

// ============================================================================
// listRules
// ============================================================================

describe('listRules', () => {
  it('should list all rule documents', () => {
    const result = listRules(store);
    expect(result).toContain('CodeOps Rule Documents');
    expect(result).toContain('Total rules');
  });

  it('should show all rule documents including roadmap', () => {
    const result = listRules(store);
    expect(result).toContain('code');
    expect(result).toContain('testing');
    expect(result).toContain('git-commands');
    expect(result).toContain('make_plan');
    expect(result).toContain('agents');
    expect(result).toContain('project-template');
    expect(result).toContain('requirements');
    expect(result).toContain('roadmap');
  });


  it('should group rules by category', () => {
    const result = listRules(store);
    expect(result).toContain('Standards');
    expect(result).toContain('Workflow');
    expect(result).toContain('Agent Behavior');
    expect(result).toContain('Project Setup');
  });

  it('should include aliases for rules', () => {
    const result = listRules(store);
    expect(result).toContain('Aliases');
  });

  it('should include quick start section', () => {
    const result = listRules(store);
    expect(result).toContain('Quick Start');
    expect(result).toContain('get_rule');
  });
});

// ============================================================================
// searchRules
// ============================================================================

describe('searchRules', () => {
  it('should return ranked results for a valid query', () => {
    const result = searchRules(searchEngine, { query: 'context window management' });
    expect(result).toContain('Search Results');
    expect(result).toContain('relevant');
  });

  it('should find DRY principle in coding standards', () => {
    const result = searchRules(searchEngine, { query: 'DRY principle' });
    expect(result).toContain('Search Results');
    // The code.md rule should be in results
    expect(result).toContain('code');
  });

  it('should find git commit workflow', () => {
    const result = searchRules(searchEngine, { query: 'git commit' });
    expect(result).toContain('Search Results');
  });

  it('should filter results by category', () => {
    const result = searchRules(searchEngine, { query: 'testing', category: 'standards' });
    expect(result).toContain('Search Results');
    expect(result).toContain('Standards');
  });

  it('should respect the limit parameter', () => {
    const result = searchRules(searchEngine, { query: 'rule', limit: 2 });
    const matches = result.match(/### \d+\./g);
    expect(matches).toBeTruthy();
    expect(matches!.length).toBeLessThanOrEqual(2);
  });

  it('should return error for empty query', () => {
    const result = searchRules(searchEngine, { query: '' });
    expect(result).toContain('Error');
  });

  it('should return no-results for unmatched query', () => {
    const result = searchRules(searchEngine, { query: 'xyznonexistent123' });
    expect(result).toContain('No results');
  });
});

// ============================================================================
// getSetupGuide
// ============================================================================

describe('getSetupGuide', () => {
  it('should return setup guide without project type', () => {
    const result = getSetupGuide(store, {});
    expect(result).toContain('Setup Guide');
    expect(result).toContain('Step 1');
    expect(result).toContain('Step 2');
    expect(result).toContain('Step 3');
  });

  it('should include project type tips when specified', () => {
    const result = getSetupGuide(store, { projectType: 'web-app' });
    expect(result).toContain('web-app');
    expect(result).toContain('Tips');
  });

  it('should include common workflows table', () => {
    const result = getSetupGuide(store, {});
    expect(result).toContain('Common Workflows');
    expect(result).toContain('get_rule');
  });

  it('should list available rules', () => {
    const result = getSetupGuide(store, {});
    expect(result).toContain('code');
    expect(result).toContain('testing');
  });
});

// ============================================================================
// Specification: Roadmap Keeper — enforcement keyword presence (ST-18, ST-19)
//
// Derived from PF-008 (folded keyword-presence checks) and 03-03 Parts B & C.
// These read the on-disk docs to verify the enforcement text is present —
// the only testable nugget of the documentation-only stage hooks.
// ============================================================================

const DOCS_DIR = join(process.cwd(), 'docs');

describe('Specification: Roadmap Keeper — agents.md enforcement (ST-18)', () => {
  // Source: 07-testing-strategy.md ST-18 — PF-008, 03-03 Part B
  it('should add a roadmap rule heading and attempt_completion blocking language to agents.md (ST-18)', async () => {
    const content = await readFile(join(DOCS_DIR, 'agents.md'), 'utf-8');
    // New numbered rule references the roadmap as a source of truth
    expect(content.toLowerCase()).toContain('roadmap');
    // attempt_completion blocking language (mirrors the execution-plan mandate)
    expect(content).toContain('attempt_completion');
  });
});

describe('Specification: Roadmap Keeper — workflow doc cross-references (ST-19)', () => {
  // Source: 07-testing-strategy.md ST-19 — PF-008, 03-03 Part C
  it('should reference roadmap in requirements.md (ST-19)', async () => {
    const content = await readFile(join(DOCS_DIR, 'requirements.md'), 'utf-8');
    expect(content).toContain('roadmap');
  });

  it('should reference roadmap in make_plan.md (ST-19)', async () => {
    const content = await readFile(join(DOCS_DIR, 'make_plan.md'), 'utf-8');
    expect(content).toContain('roadmap');
  });

  it('should reference roadmap in preflight.md (ST-19)', async () => {
    const content = await readFile(join(DOCS_DIR, 'preflight.md'), 'utf-8');
    expect(content).toContain('roadmap');
  });
});

