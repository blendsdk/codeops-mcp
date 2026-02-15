#!/usr/bin/env node

/**
 * CodeOps MCP Server — Main entry point.
 *
 * This is the executable entry point for the MCP server. It:
 * 1. Resolves server configuration from CLI args / env vars / defaults
 * 2. Loads all rule markdown files into the in-memory store
 * 3. Builds the search index for full-text search
 * 4. Registers all 5 MCP tools with the server
 * 5. Connects via stdio transport for MCP protocol communication
 *
 * Usage:
 *   codeops-mcp                          # Serve bundled docs
 *   codeops-mcp /custom/docs/path        # Serve custom docs
 *   CODEOPS_DOCS_PATH=/path codeops-mcp  # Custom docs via env var
 *
 * MCP config example:
 *   { "command": "codeops-mcp" }
 *
 * @module index
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { resolveConfig } from './config.js';
import { RuleStore } from './store/rule-store.js';
import { SearchEngine } from './store/search-engine.js';

// Tool imports
import { getRule } from './tools/get-rule.js';
import { listRules } from './tools/list-rules.js';
import { searchRules } from './tools/search-rules.js';
import { analyzeProject } from './tools/analyze-project.js';
import { getSetupGuide } from './tools/get-setup-guide.js';

// Type imports for tool argument casting
import type {
  GetRuleArgs,
  SearchRulesArgs,
  AnalyzeProjectArgs,
  GetSetupGuideArgs,
} from './types/index.js';

// ============================================================================
// Tool Definitions
// ============================================================================

/**
 * All 5 MCP tool definitions.
 *
 * Each tool has a name, description (shown to the LLM), and an input schema
 * describing its parameters using JSON Schema format.
 */
const TOOL_DEFINITIONS = [
  {
    name: 'get_rule',
    description:
      'Get a specific CodeOps rule document by name. Returns the complete rule documentation ' +
      'including coding standards, testing workflows, git conventions, plan protocols, and agent behavior rules. ' +
      'Supports aliases (e.g., "git" for "git-commands", "test" for "testing").',
    inputSchema: {
      type: 'object' as const,
      properties: {
        name: {
          type: 'string',
          description:
            'Rule name or alias. Available: code, testing, git-commands, make_plan, plans, agents, project-template. ' +
            'Aliases: git, test, commit, agent, setup, template, etc.',
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_rules',
    description:
      'List all available CodeOps rule documents with descriptions, grouped by category. ' +
      'Use this to discover what rules are available and how they relate to each other.',
    inputSchema: {
      type: 'object' as const,
      properties: {},
    },
  },
  {
    name: 'search_rules',
    description:
      'Search across all CodeOps rule documents using full-text search. ' +
      'Returns ranked results with relevance scores and excerpts. ' +
      'Useful for finding specific topics like "context window", "DRY principle", or "commit protocol".',
    inputSchema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Search query (e.g., "context window management", "test coverage", "git commit")',
        },
        category: {
          type: 'string',
          enum: ['standards', 'workflow', 'planning', 'behavior', 'setup'],
          description: 'Optional: limit search to a specific category',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 5, max: 7)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'analyze_project',
    description:
      'Scan a project directory and auto-generate a .clinerules/project.md configuration. ' +
      'Detects language, framework, package manager, test runner, and directory structure ' +
      'from manifest files (package.json, Cargo.toml, go.mod, pyproject.toml, docker-compose.yml). ' +
      'Returns a ready-to-use project.md that pairs with the universal CodeOps rules.',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectPath: {
          type: 'string',
          description: 'Absolute path to the project root directory to analyze',
        },
      },
      required: ['projectPath'],
    },
  },
  {
    name: 'get_setup_guide',
    description:
      'Get a step-by-step guide for setting up CodeOps rules in a project. ' +
      'Explains how to generate project.md, where to save it, and how to use the rules. ' +
      'Optionally tailored to a specific project type (web-app, api, library, cli, infrastructure, compiler).',
    inputSchema: {
      type: 'object' as const,
      properties: {
        projectType: {
          type: 'string',
          description: 'Optional: project type for tailored tips (web-app, api, library, cli, infrastructure, compiler)',
        },
      },
    },
  },
];

// ============================================================================
// Tool Dispatcher
// ============================================================================

/**
 * Dispatch a tool call to the appropriate handler function.
 *
 * Routes the incoming MCP tool call to the correct tool implementation
 * based on the tool name.
 *
 * @param toolName - The name of the tool being called
 * @param args - The tool arguments (varies per tool)
 * @param store - The rule store
 * @param searchEngine - The search engine
 * @returns The tool result text
 * @throws Error if the tool name is unknown
 */
async function dispatchToolCall(
  toolName: string,
  args: Record<string, unknown>,
  store: RuleStore,
  searchEngine: SearchEngine
): Promise<string> {
  switch (toolName) {
    case 'get_rule':
      return getRule(store, args as unknown as GetRuleArgs);

    case 'list_rules':
      return listRules(store);

    case 'search_rules':
      return searchRules(searchEngine, args as unknown as SearchRulesArgs);

    case 'analyze_project':
      return analyzeProject(args as unknown as AnalyzeProjectArgs);

    case 'get_setup_guide':
      return getSetupGuide(store, args as unknown as GetSetupGuideArgs);

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

// ============================================================================
// Server Bootstrap
// ============================================================================

/**
 * Main server startup function.
 *
 * Orchestrates the full server lifecycle:
 * 1. Resolve config from CLI/env/defaults
 * 2. Load rule documents into the store
 * 3. Build the search engine index
 * 4. Create the MCP server with tool capabilities
 * 5. Register tool list and tool call handlers
 * 6. Connect via stdio transport
 */
async function main(): Promise<void> {
  // Step 1: Resolve configuration
  const config = resolveConfig();

  // Log startup info to stderr (stdout is reserved for MCP protocol)
  console.error(`[codeops-mcp] Starting server: ${config.serverName} v${config.serverVersion}`);
  console.error(`[codeops-mcp] Docs path: ${config.docsPath}`);

  // Step 2: Load rule documents
  console.error('[codeops-mcp] Loading rule documents...');
  const store = new RuleStore();
  const loadStats = await store.loadFromDirectory(config.docsPath);
  console.error(
    `[codeops-mcp] Loaded ${loadStats.loadedFiles} rules in ${loadStats.durationMs}ms ` +
    `(${loadStats.failedFiles} failed)`
  );

  // Step 3: Build search index
  const searchEngine = new SearchEngine();
  searchEngine.buildIndex(store.getAllDocuments());
  console.error(`[codeops-mcp] Search index built (${searchEngine.vocabularySize} terms)`);

  // Step 4: Create the MCP server
  const server = new Server(
    {
      name: config.serverName,
      version: config.serverVersion,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Step 5: Register the ListTools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return { tools: TOOL_DEFINITIONS };
  });

  // Step 6: Register the CallTool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: toolArgs } = request.params;

    try {
      const result = await dispatchToolCall(
        name,
        toolArgs ?? {},
        store,
        searchEngine
      );

      return {
        content: [{ type: 'text' as const, text: result }],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[codeops-mcp] Tool error (${name}): ${message}`);

      return {
        content: [{ type: 'text' as const, text: `**Error:** ${message}` }],
        isError: true,
      };
    }
  });

  // Step 7: Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[codeops-mcp] Server connected via stdio. Ready for requests.');
}

// Run the server
main().catch((error) => {
  console.error('[codeops-mcp] Fatal error:', error);
  process.exit(1);
});
