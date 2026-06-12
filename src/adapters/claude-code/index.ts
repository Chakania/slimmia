import { isDir } from "../../core/fsx.js";
import type { CapabilityItem } from "../../core/inventory/model.js";
import type { AssistantAdapter } from "../types.js";
import { type ClaudeCodePaths, resolvePaths } from "./paths.js";

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
    return []; // assembled in later tasks
  }
}
