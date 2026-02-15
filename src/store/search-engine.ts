/**
 * TF-IDF search engine for rule documents.
 *
 * Provides full-text search across all loaded rule documents using
 * a term frequency–inverse document frequency (TF-IDF) scoring model.
 *
 * Simplified from fluentui-mcp's SearchEngine since we have a small
 * corpus (7 documents), but still provides ranked results with excerpts.
 *
 * @module store/search-engine
 */

import type {
  RuleDocument,
  SearchResult,
  SearchIndexEntry,
  RuleCategory,
} from '../types/index.js';
import { DEFAULT_SEARCH_LIMIT, MAX_SEARCH_LIMIT } from '../types/index.js';

/**
 * Common English stop words excluded from the search index.
 * These words are too common to be useful for relevance scoring.
 */
const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'for',
  'from', 'has', 'have', 'he', 'her', 'his', 'how', 'i', 'if', 'in',
  'is', 'it', 'its', 'just', 'let', 'may', 'my', 'no', 'not', 'of',
  'on', 'or', 'our', 'own', 'say', 'she', 'so', 'than', 'that', 'the',
  'their', 'them', 'then', 'there', 'these', 'they', 'this', 'to', 'too',
  'us', 'was', 'we', 'what', 'when', 'which', 'who', 'will', 'with',
  'you', 'your',
]);

/**
 * Weight multipliers for different document fields.
 * Title and description matches rank higher than content.
 */
const FIELD_WEIGHTS = {
  title: 10.0,
  description: 5.0,
  content: 1.0,
} as const;

/**
 * Internal representation of a document in the search index.
 * Stores pre-tokenized fields for fast scoring.
 */
interface IndexedDocument {
  /** Reference to the original rule document */
  entry: RuleDocument;

  /** Tokenized title words */
  titleTokens: string[];

  /** Tokenized description words */
  descriptionTokens: string[];

  /** Tokenized full content words */
  contentTokens: string[];
}

/**
 * TF-IDF search engine for rule documents.
 *
 * Usage:
 * 1. Call `buildIndex()` with all documents at startup
 * 2. Call `search()` for each query
 * 3. Call `clear()` + `buildIndex()` for reloading
 */
export class SearchEngine {
  /** Inverted index: token → list of documents containing that token */
  protected invertedIndex: Map<string, SearchIndexEntry[]> = new Map();

  /** All indexed documents, keyed by document ID */
  protected indexedDocs: Map<string, IndexedDocument> = new Map();

  /** Total number of documents in the index (for IDF calculation) */
  protected totalDocuments: number = 0;

  /**
   * Build the search index from a set of rule documents.
   *
   * Tokenizes each document and builds the inverted index.
   *
   * @param documents - Array of rule documents to index
   */
  public buildIndex(documents: RuleDocument[]): void {
    this.totalDocuments = documents.length;

    for (const entry of documents) {
      const titleTokens = this.tokenize(entry.title);
      const descriptionTokens = this.tokenize(entry.description);
      const contentTokens = this.tokenize(entry.content);

      const indexedDoc: IndexedDocument = {
        entry,
        titleTokens,
        descriptionTokens,
        contentTokens,
      };

      this.indexedDocs.set(entry.id, indexedDoc);

      // Build inverted index from all tokens
      const allTokens = [...titleTokens, ...descriptionTokens, ...contentTokens];
      const tokenCounts = this.countTokens(allTokens);

      for (const [token, count] of tokenCounts) {
        const existing = this.invertedIndex.get(token);
        const indexEntry: SearchIndexEntry = {
          documentId: entry.id,
          termFrequency: count,
        };

        if (existing) {
          existing.push(indexEntry);
        } else {
          this.invertedIndex.set(token, [indexEntry]);
        }
      }
    }
  }

  /**
   * Search for documents matching a query string.
   *
   * Tokenizes the query, scores each document using TF-IDF with
   * field weighting, and returns ranked results.
   *
   * @param query - The search query string
   * @param limit - Maximum number of results (default: 5, max: 7)
   * @param categoryFilter - Optional: restrict results to a specific category
   * @returns Array of search results sorted by relevance (highest first)
   */
  public search(
    query: string,
    limit: number = DEFAULT_SEARCH_LIMIT,
    categoryFilter?: RuleCategory
  ): SearchResult[] {
    const queryTokens = this.tokenize(query);

    if (queryTokens.length === 0) {
      return [];
    }

    const effectiveLimit = Math.min(Math.max(1, limit), MAX_SEARCH_LIMIT);

    // Score each document
    const scores: Map<string, number> = new Map();

    for (const [docId, indexedDoc] of this.indexedDocs) {
      // Apply category filter if specified
      if (categoryFilter && indexedDoc.entry.category !== categoryFilter) {
        continue;
      }

      const score = this.scoreDocument(indexedDoc, queryTokens);

      if (score > 0) {
        scores.set(docId, score);
      }
    }

    // Sort by score and take top N
    const sortedResults = Array.from(scores.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, effectiveLimit);

    // Build SearchResult objects
    const maxPossibleScore = this.getMaxPossibleScore(queryTokens.length);

    return sortedResults.map(([docId, score]) => {
      const indexedDoc = this.indexedDocs.get(docId)!;

      return {
        document: indexedDoc.entry,
        relevance: Math.min(Math.round((score / maxPossibleScore) * 100), 100),
        excerpt: this.extractExcerpt(indexedDoc.entry.content, queryTokens),
      };
    });
  }

  /**
   * Clear the entire search index.
   */
  public clear(): void {
    this.invertedIndex.clear();
    this.indexedDocs.clear();
    this.totalDocuments = 0;
  }

  /**
   * Get the number of unique tokens in the index.
   */
  public get vocabularySize(): number {
    return this.invertedIndex.size;
  }

  /**
   * Score a single document against the query tokens.
   *
   * Uses TF-IDF scoring with field-specific weights.
   *
   * @param indexedDoc - The pre-indexed document
   * @param queryTokens - Tokenized query terms
   * @returns Combined score
   */
  protected scoreDocument(
    indexedDoc: IndexedDocument,
    queryTokens: string[]
  ): number {
    let totalScore = 0;

    for (const queryToken of queryTokens) {
      // Score title matches (highest weight)
      const titleScore = this.scoreField(queryToken, indexedDoc.titleTokens, FIELD_WEIGHTS.title);
      totalScore += titleScore;

      // Score description matches (medium weight)
      const descScore = this.scoreField(queryToken, indexedDoc.descriptionTokens, FIELD_WEIGHTS.description);
      totalScore += descScore;

      // Score content matches (base weight with IDF)
      const idf = this.calculateIdf(queryToken);
      const contentTf = this.calculateTf(queryToken, indexedDoc.contentTokens);
      totalScore += contentTf * idf * FIELD_WEIGHTS.content;
    }

    return totalScore;
  }

  /**
   * Score a query token against a specific document field.
   *
   * @param queryToken - Single query token
   * @param fieldTokens - Tokens from the document field
   * @param weight - Weight multiplier for this field
   * @returns Weighted score
   */
  protected scoreField(
    queryToken: string,
    fieldTokens: string[],
    weight: number
  ): number {
    const tf = this.calculateTf(queryToken, fieldTokens);
    if (tf === 0) return 0;

    const idf = this.calculateIdf(queryToken);
    return tf * idf * weight;
  }

  /**
   * Calculate term frequency (TF) for a token in a set of tokens.
   *
   * @param token - The token to count
   * @param fieldTokens - Array of tokens from the field
   * @returns Normalized term frequency (0 to 1)
   */
  protected calculateTf(token: string, fieldTokens: string[]): number {
    if (fieldTokens.length === 0) return 0;

    let count = 0;
    for (const fieldToken of fieldTokens) {
      if (fieldToken === token || fieldToken.startsWith(token)) {
        count++;
      }
    }

    return count / fieldTokens.length;
  }

  /**
   * Calculate inverse document frequency (IDF) for a token.
   *
   * @param token - The token to calculate IDF for
   * @returns IDF score (higher means more discriminative)
   */
  protected calculateIdf(token: string): number {
    const docsWithToken = this.invertedIndex.get(token);
    if (!docsWithToken || docsWithToken.length === 0) {
      // Try prefix matching
      let matchCount = 0;
      for (const [indexToken, entries] of this.invertedIndex) {
        if (indexToken.startsWith(token)) {
          matchCount += entries.length;
        }
      }
      if (matchCount === 0) return 0;
      return Math.log(this.totalDocuments / matchCount) + 1;
    }

    return Math.log(this.totalDocuments / docsWithToken.length) + 1;
  }

  /**
   * Get the theoretical maximum score for normalization.
   *
   * @param queryTokenCount - Number of tokens in the query
   * @returns Maximum possible score
   */
  protected getMaxPossibleScore(queryTokenCount: number): number {
    const maxIdf = Math.log(this.totalDocuments) + 1;
    return queryTokenCount * FIELD_WEIGHTS.title * maxIdf;
  }

  /**
   * Extract a relevant excerpt from document content around matching terms.
   *
   * @param content - Full document content
   * @param queryTokens - Tokenized query terms
   * @param maxLength - Maximum excerpt length (default: 200)
   * @returns Context excerpt string
   */
  protected extractExcerpt(
    content: string,
    queryTokens: string[],
    maxLength: number = 200
  ): string {
    const lines = content.split('\n');

    // Find the first meaningful line containing a query token
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const hasMatch = queryTokens.some((token) => lineLower.includes(token));

      if (hasMatch) {
        const trimmed = line.trim();
        // Skip structural markdown lines
        if (
          trimmed.startsWith('#') || trimmed.startsWith('|') ||
          trimmed.startsWith('```') || trimmed.startsWith('---') ||
          trimmed.startsWith('>') || trimmed.startsWith('- ❌') ||
          trimmed.startsWith('- ✅') || trimmed.length < 20
        ) {
          continue;
        }
        if (trimmed.length > 0) {
          return trimmed.length > maxLength
            ? trimmed.substring(0, maxLength) + '...'
            : trimmed;
        }
      }
    }

    // Fallback: return the description from the first paragraph
    for (const line of lines) {
      const trimmed = line.trim();
      if (
        trimmed &&
        !trimmed.startsWith('#') &&
        !trimmed.startsWith('>') &&
        !trimmed.startsWith('---') &&
        trimmed.length > 20
      ) {
        return trimmed.length > maxLength
          ? trimmed.substring(0, maxLength) + '...'
          : trimmed;
      }
    }

    return 'CodeOps rule document';
  }

  /**
   * Tokenize a text string into search tokens.
   *
   * @param text - Raw text to tokenize
   * @returns Array of tokens
   */
  protected tokenize(text: string): string[] {
    return text
      .toLowerCase()
      // Remove code blocks
      .replace(/```[\s\S]*?```/g, ' ')
      // Remove inline code
      .replace(/`[^`]+`/g, ' ')
      // Remove markdown links but keep text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove markdown formatting
      .replace(/[*_~#>|]/g, ' ')
      // Split on non-alphanumeric
      .split(/[^a-z0-9-]+/)
      // Filter stop words and short tokens
      .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
  }

  /**
   * Count occurrences of each token in an array.
   *
   * @param tokens - Array of tokens
   * @returns Map of token → count
   */
  protected countTokens(tokens: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const token of tokens) {
      counts.set(token, (counts.get(token) || 0) + 1);
    }
    return counts;
  }
}
