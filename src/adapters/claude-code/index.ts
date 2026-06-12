import { isDir } from "../../core/fsx.js";
import type { CapabilityItem } from "../../core/inventory/model.js";
import type { AssistantAdapter } from "../types.js";
import { scanHooks } from "./hooks.js";
import { scanMcpServers } from "./mcp.js";
import { type ClaudeCodePaths, resolvePaths } from "./paths.js";
import { scanPlugins } from "./plugins.js";
import { scanRules } from "./rules.js";
import { scanSkillsDir } from "./skills.js";

export interface ClaudeCodeAdapterOptions {
  /** Override $HOME — used by tests (fixture dirs) and the CLI's --home flag. */
  homeDir?: string;
}

export class ClaudeCodeAdapter implements AssistantAdapter {
  readonly id = "claude-code" as const;
  readonly paths: ClaudeCodePaths;

  constructor(options: ClaudeCodeAdapterOptions = {}) {
    this.paths = resolvePaths(options.homeDir);
  }

  async detect(): Promise<boolean> {
    return isDir(this.paths.configDir);
  }

  async inventory(): Promise<CapabilityItem[]> {
    const [userSkills, plugins, mcpServers, hooks, rules] = await Promise.all([
      scanSkillsDir(this.paths.skillsDir, { enabled: true }),
      scanPlugins(this.paths),
      scanMcpServers(this.paths),
      scanHooks(this.paths),
      scanRules(this.paths),
    ]);
    return [...userSkills, ...plugins, ...mcpServers, ...hooks, ...rules];
  }
}
