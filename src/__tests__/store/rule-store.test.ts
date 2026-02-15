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
  it('should load all 7 rule documents', () => {
    expect(store.size).toBe(7);
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

  it('should load plans.md', () => {
    const doc = store.getById('plans');
    expect(doc).toBeDefined();
  });

  it('should load make_plan.md', () => {
    const doc = store.getById('make_plan');
    expect(doc).toBeDefined();
  });

  it('should load project-template.md', () => {
    const doc = store.getById('project-template');
    expect(doc).toBeDefined();
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
    expect(store.getById('plans')!.category).toBe('planning');
    expect(store.getById('agents')!.category).toBe('behavior');
    expect(store.getById('project-template')!.category).toBe('setup');
  });

  it('should have descriptions for all documents', () => {
    const docs = store.getAllDocuments();
    for (const doc of docs) {
      expect(doc.description).toBeTruthy();
      expect(doc.description.length).toBeGreaterThan(10);
    }
  });
});
