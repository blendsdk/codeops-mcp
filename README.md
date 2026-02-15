# codeops-mcp

MCP (Model Context Protocol) server providing AI coding agents with universal, language-agnostic development rules.

## What It Does

**codeops-mcp** bundles 7 curated rule documents that teach AI agents how to code, test, plan, commit, and behave — across any programming language and project type. It exposes these rules via 5 MCP tools.

### Rule Documents

| Rule | Description |
|------|-------------|
| **code** | 30 coding standards: DRY, testing, documentation, architecture, type safety |
| **testing** | Test commands, workflows, coverage requirements, debugging strategies |
| **git-commands** | Git commit protocols (`gitcm`/`gitcmp`), message format, push workflow |
| **make_plan** | Complete protocol for creating and executing multi-document implementation plans |
| **plans** | 10 rules for structuring plans: phases, tasks, dependencies, architecture |
| **agents** | Mandatory AI agent behavior: compliance, context management, multi-session execution |
| **project-template** | Template for `.clinerules/project.md` — project-specific toolchain configuration |

### MCP Tools

| Tool | Description |
|------|-------------|
| `get_rule` | Get any rule document by name (supports aliases like "git", "test") |
| `list_rules` | List all available rules grouped by category |
| `search_rules` | Full-text search across all rules with TF-IDF ranking |
| `analyze_project` | **Killer feature** — Scan a project directory and auto-generate `project.md` |
| `get_setup_guide` | Step-by-step guide for setting up CodeOps in a project |

## Installation

```bash
# Global install
npm install -g codeops-mcp

# Or with yarn
yarn global add codeops-mcp
```

## MCP Configuration

Add to your MCP client configuration (e.g., Cline, Claude Desktop):

```json
{
  "mcpServers": {
    "codeops": {
      "command": "codeops-mcp"
    }
  }
}
```

### Custom docs path

```json
{
  "mcpServers": {
    "codeops": {
      "command": "codeops-mcp",
      "args": ["/path/to/custom/docs"]
    }
  }
}
```

Or via environment variable:

```json
{
  "mcpServers": {
    "codeops": {
      "command": "codeops-mcp",
      "env": {
        "CODEOPS_DOCS_PATH": "/path/to/custom/docs"
      }
    }
  }
}
```

## How It Works

The two-layer architecture:

1. **Layer 1: Universal rules** (bundled in this package) — Language-agnostic standards
2. **Layer 2: Project-specific config** (`.clinerules/project.md` in your project) — Toolchain, commands, conventions

All generic rules reference `project.md` for project-specific settings like build commands, test commands, package manager, etc.

### Quick Setup

1. Run `analyze_project("/path/to/your/project")` to auto-detect your toolchain
2. Save the output to `.clinerules/project.md` in your project
3. The AI agent automatically applies universal rules using your project's settings

## Development

```bash
# Install dependencies
yarn install

# Build
yarn build

# Run tests
yarn test

# Watch mode
yarn test:watch
```

## Architecture

```
src/
├── index.ts              # MCP server entry point
├── config.ts             # Configuration resolution
├── types/
│   └── index.ts          # Type definitions & constants
├── store/
│   ├── rule-store.ts     # In-memory document store
│   └── search-engine.ts  # TF-IDF search engine
├── tools/
│   ├── get-rule.ts       # Get rule by name
│   ├── list-rules.ts     # List all rules
│   ├── search-rules.ts   # Full-text search
│   ├── analyze-project.ts # Project analysis & project.md generation
│   └── get-setup-guide.ts # Setup instructions
└── __tests__/
    ├── store/            # Store & search engine tests
    └── tools/            # Tool integration tests
docs/                     # Bundled rule markdown files
```

## License

MIT
