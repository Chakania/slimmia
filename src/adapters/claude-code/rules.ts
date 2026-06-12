import { join } from "node:path";
import { listFiles, readTextFile } from "../../core/fsx.js";
import { type CapabilityItem, makeItem } from "../../core/inventory/model.js";
import type { ClaudeCodePaths } from "./paths.js";

/**
 * Rules files are injected whole into context (docs/01 §2.1 — "Unbounded"),
 * so `description` carries the full file content for token estimation.
 */
export async function scanRules(
  paths: ClaudeCodePaths,
): Promise<CapabilityItem[]> {
  const items: CapabilityItem[] = [];

  const rootContent = await readTextFile(paths.rootClaudeMd);
  if (rootContent !== null) {
    items.push(
      makeItem({
        assistant: "claude-code",
        kind: "rules-file",
        name: "CLAUDE.md",
        description: rootContent,
        path: paths.rootClaudeMd,
        enabled: true,
      }),
    );
  }

  for (const fileName of await listFiles(paths.rulesDir)) {
    if (!fileName.endsWith(".md")) continue;
    const filePath = join(paths.rulesDir, fileName);
    const content = await readTextFile(filePath);
    if (content === null) continue;
    items.push(
      makeItem({
        assistant: "claude-code",
        kind: "rules-file",
        name: `rules/${fileName}`,
        description: content,
        path: filePath,
        enabled: true,
      }),
    );
  }
  return items;
}
