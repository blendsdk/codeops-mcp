/**
 * In-memory store for rule documents.
 *
 * Loads all markdown files from the docs directory at startup and provides
 * O(1) lookups by document ID, fuzzy name matching via aliases, and
 * category-based filtering.
 *
 * Much simpler than fluentui-mcp's DocumentStore since we have a flat
 * set of 7 known rule files rather than a complex hierarchical structure.
 *
 * @module store/rule-store
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname } from 'path';
import type { RuleDocument, RuleCategory } from '../types/index.js';
import { RULE_METADATA, RULE_ALIASES } from '../types/index.js';

/**
 * Statistics from a loading operation.
 * Useful for startup logging.
 */
export interface LoadStats {
  /** Number of files successfully loaded */
  loadedFiles: number;

  /** Number of files that failed to load */
  failedFiles: number;

  /** Time taken for loading in milliseconds */
  durationMs: number;
}

/**
 * In-memory store for all rule documents.
 *
 * Provides:
 * - O(1) lookup by document ID
 * - Fuzzy name matching via aliases
 * - Category filtering
 * - Full document listing
 */
export class RuleStore {
  /** Primary document storage: ID → RuleDocument */
  protected documents: Map<string, RuleDocument> = new Map();

  /**
   * Load all markdown files from a docs directory.
   *
   * Reads every `.md` file in the directory (non-recursive),
   * extracts metadata, and stores the document.
   *
   * @param docsPath - Absolute path to the docs directory
   * @returns Loading statistics
   */
  public async loadFromDirectory(docsPath: string): Promise<LoadStats> {
    const startTime = Date.now();
    let loadedFiles = 0;
    let failedFiles = 0;

    // Clear any existing data
    this.documents.clear();

    // Read all entries in the directory
    const entries = await readdir(docsPath);

    for (const entry of entries) {
      // Only process markdown files
      if (extname(entry) !== '.md') {
        continue;
      }

      try {
        const filePath = join(docsPath, entry);
        const content = await readFile(filePath, 'utf-8');
        const id = entry.replace(/\.md$/, '');

        const document = this.createDocument(id, content, filePath, entry);
        this.documents.set(id, document);
        loadedFiles++;
      } catch (_error) {
        console.error(`[codeops-mcp] Failed to load: ${entry}`);
        failedFiles++;
      }
    }

    return {
      loadedFiles,
      failedFiles,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Get a document by its exact ID.
   *
   * @param id - Document ID (e.g., "code", "testing", "git-commands")
   * @returns The rule document, or undefined if not found
   */
  public getById(id: string): RuleDocument | undefined {
    return this.documents.get(id);
  }

  /**
   * Find a document by name using fuzzy matching.
   *
   * Tries multiple matching strategies in order:
   * 1. Exact ID match
   * 2. Alias resolution
   * 3. Case-insensitive match
   * 4. Partial/substring match
   *
   * @param name - Rule name to search for (case-insensitive)
   * @returns The best matching document, or undefined
   */
  public findByName(name: string): RuleDocument | undefined {
    const normalized = name.toLowerCase().trim();

    // Strategy 1: Exact ID match
    const exact = this.documents.get(normalized);
    if (exact) {
      return exact;
    }

    // Strategy 2: Alias resolution
    const aliasedId = RULE_ALIASES[normalized];
    if (aliasedId) {
      return this.documents.get(aliasedId);
    }

    // Strategy 3: Case-insensitive match against IDs
    for (const [docId, doc] of this.documents) {
      if (docId.toLowerCase() === normalized) {
        return doc;
      }
    }

    // Strategy 4: Partial match — ID contains the query
    for (const [docId, doc] of this.documents) {
      if (docId.includes(normalized) || normalized.includes(docId)) {
        return doc;
      }
    }

    // Strategy 5: Match against titles
    for (const doc of this.documents.values()) {
      if (doc.title.toLowerCase().includes(normalized)) {
        return doc;
      }
    }

    return undefined;
  }

  /**
   * Get all documents in a specific category.
   *
   * @param category - Rule category to filter by
   * @returns Array of documents in the category
   */
  public getByCategory(category: RuleCategory): RuleDocument[] {
    return Array.from(this.documents.values())
      .filter((doc) => doc.category === category);
  }

  /**
   * Get all documents in the store.
   *
   * @returns Array of all rule documents
   */
  public getAllDocuments(): RuleDocument[] {
    return Array.from(this.documents.values());
  }

  /**
   * Get the total number of loaded documents.
   */
  public get size(): number {
    return this.documents.size;
  }

  /**
   * Clear all documents from the store.
   */
  public clear(): void {
    this.documents.clear();
  }

  /**
   * Create a RuleDocument from raw file content.
   *
   * Extracts the title from the first H1 heading, uses known metadata
   * from RULE_METADATA if available, and detects cross-references.
   *
   * @param id - Document ID (filename without extension)
   * @param content - Raw markdown content
   * @param filePath - Absolute file path
   * @param filename - Original filename
   * @returns A complete RuleDocument
   */
  protected createDocument(
    id: string,
    content: string,
    filePath: string,
    filename: string
  ): RuleDocument {
    const title = this.extractTitle(content);
    const knownMeta = RULE_METADATA[id];
    const description = knownMeta?.description || this.extractDescription(content);
    const category = knownMeta?.category || 'standards';
    const crossReferences = this.extractCrossReferences(content);

    return {
      id,
      title,
      content,
      filePath,
      filename,
      description,
      category,
      crossReferences,
    };
  }

  /**
   * Extract the document title from the first H1 heading.
   *
   * @param content - Raw markdown content
   * @returns The title, or "Untitled" if no heading found
   */
  protected extractTitle(content: string): string {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1].trim() : 'Untitled';
  }

  /**
   * Extract a brief description from the document content.
   *
   * Looks for the first meaningful paragraph after the title.
   *
   * @param content - Raw markdown content
   * @returns Description string
   */
  protected extractDescription(content: string): string {
    const lines = content.split('\n');
    const titleIndex = lines.findIndex((line) => /^#\s+/.test(line));

    for (let i = (titleIndex >= 0 ? titleIndex + 1 : 0); i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (
        trimmed &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('>') &&
        !trimmed.startsWith('---') &&
        !trimmed.startsWith('|') &&
        !trimmed.startsWith('```') &&
        !trimmed.startsWith('*')
      ) {
        return trimmed.length > 200
          ? trimmed.substring(0, 200) + '...'
          : trimmed;
      }
    }

    return 'Rule document';
  }

  /**
   * Extract cross-references to other rule documents.
   *
   * Detects references like "See **code.md**", "See **testing.md**", etc.
   *
   * @param content - Raw markdown content
   * @returns Array of referenced document IDs
   */
  protected extractCrossReferences(content: string): string[] {
    const refs: Set<string> = new Set();
    const knownIds = Object.keys(RULE_METADATA);

    // Match patterns like: **code.md**, **testing.md**, `code.md`
    const patterns = [
      /\*\*(\w[\w-]*)\.md\*\*/g,
      /`(\w[\w-]*)\.md`/g,
    ];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1];
        if (knownIds.includes(name)) {
          refs.add(name);
        }
      }
    }

    // Also match: **`.clinerules/project.md`** → project-template
    if (/project\.md/i.test(content)) {
      refs.add('project-template');
    }

    return Array.from(refs);
  }
}
