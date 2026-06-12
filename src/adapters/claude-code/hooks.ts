import { readJsonFile } from "../../core/fsx.js";
import { type CapabilityItem, makeItem } from "../../core/inventory/model.js";
import type { ClaudeCodePaths } from "./paths.js";

interface HookEntry {
  type?: string;
  command?: string;
}

interface HookMatcherGroup {
  matcher?: string;
  hooks?: HookEntry[];
}

interface Settings {
  hooks?: Record<string, HookMatcherGroup[]>;
}

/** One CapabilityItem per (event, command) — each is one process spawn (docs/01 §2.3). */
export async function scanHooks(
  paths: ClaudeCodePaths,
): Promise<CapabilityItem[]> {
  const settings = (await readJsonFile<Settings>(paths.settingsFile)) ?? {};
  const items: CapabilityItem[] = [];
  for (const [event, groups] of Object.entries(settings.hooks ?? {})) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      for (const entry of group.hooks ?? []) {
        if (typeof entry.command !== "string") continue;
        items.push(
          makeItem({
            assistant: "claude-code",
            kind: "hook",
            name: entry.command,
            events: [event],
            path: paths.settingsFile,
            enabled: true,
          }),
        );
      }
    }
  }
  return items;
}
