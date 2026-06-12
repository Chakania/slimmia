import { readJsonFile } from "../../core/fsx.js";
import { type CapabilityItem, makeItem } from "../../core/inventory/model.js";
import type { ClaudeCodePaths } from "./paths.js";

interface ClaudeJson {
  mcpServers?: Record<string, Record<string, unknown>>;
}

/**
 * Global MCP servers from `~/.claude.json`. Tool schemas require running the
 * server — out of scope for v0.1; we record the server config as `schema`.
 */
export async function scanMcpServers(
  paths: ClaudeCodePaths,
): Promise<CapabilityItem[]> {
  const claudeJson =
    (await readJsonFile<ClaudeJson>(paths.claudeJsonFile)) ?? {};
  const servers = claudeJson.mcpServers ?? {};
  return Object.entries(servers).map(([name, config]) =>
    makeItem({
      assistant: "claude-code",
      kind: "mcp-server",
      name,
      schema: config,
      path: paths.claudeJsonFile,
      enabled: true,
    }),
  );
}
