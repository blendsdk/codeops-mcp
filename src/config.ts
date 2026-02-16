/**
 * Server configuration module.
 *
 * Resolves the server configuration from three sources (in priority order):
 * 1. Environment variable `CODEOPS_DOCS_PATH` for custom docs path
 * 2. CLI argument for custom docs path
 * 3. Default: bundled docs/ directory in the package
 *
 * @module config
 */

import { existsSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import type { ServerConfig } from './types/index.js';

/**
 * Resolve __dirname equivalent for ES modules.
 * Points to the directory containing this compiled file (dist/).
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** The package root directory (one level up from dist/) */
const PACKAGE_ROOT = join(__dirname, '..');

/** Environment variable name for custom docs path override */
const DOCS_PATH_ENV_VAR = 'CODEOPS_DOCS_PATH';

/** Package version constant */
const PACKAGE_VERSION = '1.1.0';

/** Server name constant */
const SERVER_NAME = 'codeops-rules';

/**
 * Resolves the complete server configuration.
 *
 * Resolution order:
 * 1. If `CODEOPS_DOCS_PATH` env var is set → use that path directly
 * 2. If CLI arg provided → use as custom docs path
 * 3. Default → `docs/` in the installed package
 *
 * @returns Fully resolved server configuration
 * @throws Error if the resolved docs path does not exist
 */
export function resolveConfig(): ServerConfig {
  // Resolve the docs path
  const docsPath = resolveDocsPath();

  // Validate the docs path exists
  if (!existsSync(docsPath)) {
    throw new Error(
      `Documentation path not found: ${docsPath}\n` +
      `Available options:\n` +
      `  - Set env var: ${DOCS_PATH_ENV_VAR}=/path/to/docs\n` +
      `  - Pass path as CLI arg: codeops-mcp /path/to/docs\n` +
      `  - Ensure bundled docs exist at: ${getBundledDocsPath()}`
    );
  }

  return {
    docsPath,
    serverName: SERVER_NAME,
    serverVersion: PACKAGE_VERSION,
  };
}

/**
 * Resolve the absolute path to the documentation folder.
 *
 * Priority:
 * 1. CODEOPS_DOCS_PATH environment variable
 * 2. First CLI positional argument
 * 3. Bundled docs at `{package_root}/docs/`
 *
 * @returns Absolute path to the docs folder
 */
function resolveDocsPath(): string {
  // Check for custom docs path via environment variable
  const envDocsPath = process.env[DOCS_PATH_ENV_VAR];
  if (envDocsPath) {
    return resolve(envDocsPath);
  }

  // Check for CLI argument (first positional arg that's not a flag)
  const args = process.argv.slice(2);
  if (args.length > 0 && !args[0].startsWith('-')) {
    return resolve(args[0]);
  }

  // Use bundled docs
  return getBundledDocsPath();
}

/**
 * Get the path to bundled docs in the package.
 *
 * @returns Absolute path to `{package_root}/docs/`
 */
function getBundledDocsPath(): string {
  return join(PACKAGE_ROOT, 'docs');
}
