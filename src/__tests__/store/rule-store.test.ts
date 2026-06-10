/**
 * Tests for the RuleStore.
 *
 * Tests loading, lookup, fuzzy matching, and category filtering.
 *
 * @module __tests__/store/rule-store
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { join } from 'path';
import { RuleStore } from '../../store/rule-store.js';

const DOCS_PATH = join(process.cwd(), 'docs');

let store: RuleStore;

beforeAll(async () => {
  store = new RuleStore();
  await store.loadFromDirectory(DOCS_PATH);
});

describe('RuleStore loading', () => {
  it('should load all 13 rule documents', () => {
    expect(store.size).toBe(13);
  });


  it('should load code.md', () => {
    const doc = store.getById('code');
    expect(doc).toBeDefined();
    expect(doc!.title).toContain('Coding Standards');
  });

  it('should load testing.md', () => {
    const doc = store.getById('testing');
    expect(doc).toBeDefined();
    expect(doc!.title).toContain('Testing');
  });

  it('should load git-commands.md', () => {
    const doc = store.getById('git-commands');
    expect(doc).toBeDefined();
    expect(doc!.title).toContain('Git');
  });

  it('should load agents.md', () => {
    const doc = store.getById('agents');
    expect(doc).toBeDefined();
    expect(doc!.title).toContain('Agent');
  });

  it('should resolve "plans" alias to make_plan', () => {
    const doc = store.findByName('plans');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('make_plan');
  });

  it('should load make_plan.md', () => {
    const doc = store.getById('make_plan');
    expect(doc).toBeDefined();
  });

  it('should load project-template.md', () => {
    const doc = store.getById('project-template');
    expect(doc).toBeDefined();
  });

  it('should load requirements.md', () => {
    const doc = store.getById('requirements');
    expect(doc).toBeDefined();
    expect(doc!.title).toContain('Requirements');
  });
});

describe('RuleStore findByName', () => {
  it('should find by exact ID', () => {
    const doc = store.findByName('code');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('code');
  });

  it('should find by alias "git"', () => {
    const doc = store.findByName('git');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('git-commands');
  });

  it('should find by alias "test"', () => {
    const doc = store.findByName('test');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('testing');
  });

  it('should find by alias "agent"', () => {
    const doc = store.findByName('agent');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('agents');
  });

  it('should find by alias "setup"', () => {
    const doc = store.findByName('setup');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('project-template');
  });

  it('should be case-insensitive', () => {
    const doc = store.findByName('CODE');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('code');
  });

  it('should return undefined for unknown name', () => {
    const doc = store.findByName('nonexistent');
    expect(doc).toBeUndefined();
  });
});

describe('RuleStore getByCategory', () => {
  it('should return standards category documents', () => {
    const docs = store.getByCategory('standards');
    expect(docs.length).toBeGreaterThanOrEqual(2);
    const ids = docs.map((d) => d.id);
    expect(ids).toContain('code');
    expect(ids).toContain('testing');
  });

  it('should return workflow category documents', () => {
    const docs = store.getByCategory('workflow');
    expect(docs.length).toBeGreaterThanOrEqual(2);
    const ids = docs.map((d) => d.id);
    expect(ids).toContain('git-commands');
    expect(ids).toContain('make_plan');
  });

  it('should return empty array for unknown category', () => {
    const docs = store.getByCategory('nonexistent' as any);
    expect(docs).toEqual([]);
  });
});

describe('RuleStore metadata extraction', () => {
  it('should extract cross-references from code.md', () => {
    const doc = store.getById('code');
    expect(doc).toBeDefined();
    expect(doc!.crossReferences.length).toBeGreaterThan(0);
  });

  it('should assign correct categories', () => {
    expect(store.getById('code')!.category).toBe('standards');
    expect(store.getById('testing')!.category).toBe('standards');
    expect(store.getById('git-commands')!.category).toBe('workflow');
    expect(store.getById('make_plan')!.category).toBe('workflow');
    expect(store.getById('agents')!.category).toBe('behavior');
    expect(store.getById('project-template')!.category).toBe('setup');
    expect(store.getById('requirements')!.category).toBe('workflow');
  });

  it('should have descriptions for all documents', () => {
    const docs = store.getAllDocuments();
    for (const doc of docs) {
      expect(doc.description).toBeTruthy();
      expect(doc.description.length).toBeGreaterThan(10);
    }
  });
});

// ============================================================================
// Specification: Roadmap Keeper (ST-1 → ST-12, ST-17)
//
// These spec tests are derived from the plan documents — NOT from the
// implementation. Sources are cited per test.
//   - 07-testing-strategy.md (ST-cases)
//   - 03-01-roadmap-doc.md (document content)
//   - 03-02-rule-registration.md (metadata + aliases)
//   - 00-ambiguity-register.md (AR decisions)
// ============================================================================

describe('Specification: Roadmap Keeper — store & registration', () => {
  // Source: 07-testing-strategy.md ST-1 — Req MustHave (doc count), AR #3
  it('should load 13 documents including roadmap (ST-1)', () => {
    expect(store.size).toBe(13);
  });

  // Source: 07-testing-strategy.md ST-2 — 03-02, AR #3
  it('should register roadmap with title "Roadmap Keeper" (ST-2)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    expect(doc!.title).toBe('Roadmap Keeper');
  });

  // Source: 07-testing-strategy.md ST-3 — 03-02, AR #13
  it('should classify roadmap under the workflow category (ST-3)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    expect(doc!.category).toBe('workflow');
  });

  // Source: 07-testing-strategy.md ST-4 — 03-02, AR #1
  it('should resolve "make_roadmap" alias to roadmap (ST-4)', () => {
    const doc = store.findByName('make_roadmap');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('roadmap');
  });

  // Source: 07-testing-strategy.md ST-5 — 03-02, AR #1
  it('should resolve "update_roadmap" alias to roadmap (ST-5)', () => {
    const doc = store.findByName('update_roadmap');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('roadmap');
  });

  // Source: 07-testing-strategy.md ST-6 — 03-02, AR #1
  it('should resolve "review_roadmap" alias to roadmap (ST-6)', () => {
    const doc = store.findByName('review_roadmap');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('roadmap');
  });

  // Source: 07-testing-strategy.md ST-7 — 03-02, AR #11
  it('should resolve "archive_roadmap" alias to roadmap (ST-7)', () => {
    const doc = store.findByName('archive_roadmap');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('roadmap');
  });

  // Source: 07-testing-strategy.md ST-8 — 03-02, AR #1
  it('should resolve "track" alias to roadmap (ST-8)', () => {
    const doc = store.findByName('track');
    expect(doc).toBeDefined();
    expect(doc!.id).toBe('roadmap');
  });

  // Source: 07-testing-strategy.md ST-9 — 03-02
  it('should include roadmap in the workflow category listing (ST-9)', () => {
    const docs = store.getByCategory('workflow');
    const ids = docs.map((d) => d.id);
    expect(ids).toContain('roadmap');
  });
});

describe('Specification: Roadmap Keeper — document content', () => {
  // Source: 07-testing-strategy.md ST-10 — 03-01, AR #1, #11
  it('should document all four trigger keywords (ST-10)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    const content = doc!.content;
    expect(content).toContain('make_roadmap');
    expect(content).toContain('update_roadmap');
    expect(content).toContain('review_roadmap');
    expect(content).toContain('archive_roadmap');
  });

  // Source: 07-testing-strategy.md ST-11 — 03-01, AR #5
  it('should document all nine lifecycle stage names (ST-11)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    const content = doc!.content;
    const stages = [
      'Backlog',
      'RD Drafted',
      'RD Preflighted',
      'Plan Created',
      'Plan Preflighted',
      'Executing',
      'Done',
      'Blocked',
      'Deferred',
    ];
    for (const stage of stages) {
      expect(content).toContain(stage);
    }
  });

  // Source: 07-testing-strategy.md ST-12 — 03-01, AR #2
  it('should reference the canonical roadmap path token (ST-12)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    expect(doc!.content).toContain('plans/00-roadmap.md');
  });

  // Source: 07-testing-strategy.md ST-17 — PF-002, PF-004
  it('should specify RD↔plan linking and explicit membership rules (ST-17)', () => {
    const doc = store.getById('roadmap');
    expect(doc).toBeDefined();
    const content = doc!.content;
    // RD↔plan linking rule (deterministic via declared RD-NN in 00-index.md)
    expect(content).toContain('Implements');
    expect(content).toContain('00-index.md');
    // Explicit-membership / suggest-don't-sweep wording (PF-004)
    expect(content).toContain('suggest');
  });
});

