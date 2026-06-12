import { join } from "node:path";
import { isFile, listDirs, readJsonFile } from "../../core/fsx.js";
import { type CapabilityItem, makeItem } from "../../core/inventory/model.js";
import type { ClaudeCodePaths } from "./paths.js";
import { scanSkillsDir } from "./skills.js";

interface PluginManifest {
  name?: string;
  version?: string;
  description?: string;
}

interface Settings {
  enabledPlugins?: Record<string, boolean>;
}

/** A plugin may be cached at `<marketplace>/<plugin>/` or `<marketplace>/<plugin>/<version>/`. */
async function findPluginRoot(pluginDir: string): Promise<string | null> {
  if (await isFile(join(pluginDir, ".claude-plugin", "plugin.json")))
    return pluginDir;
  for (const sub of await listDirs(pluginDir)) {
    const candidate = join(pluginDir, sub);
    if (await isFile(join(candidate, ".claude-plugin", "plugin.json")))
      return candidate;
  }
  return null;
}

export async function scanPlugins(
  paths: ClaudeCodePaths,
): Promise<CapabilityItem[]> {
  const settings = (await readJsonFile<Settings>(paths.settingsFile)) ?? {};
  const enabledPlugins = settings.enabledPlugins ?? {};
  const items: CapabilityItem[] = [];

  for (const marketplace of await listDirs(paths.pluginsCacheDir)) {
    const marketplaceDir = join(paths.pluginsCacheDir, marketplace);
    for (const pluginDirName of await listDirs(marketplaceDir)) {
      const root = await findPluginRoot(join(marketplaceDir, pluginDirName));
      if (root === null) continue;
      const manifestPath = join(root, ".claude-plugin", "plugin.json");
      const manifest = (await readJsonFile<PluginManifest>(manifestPath)) ?? {};
      const name = manifest.name ?? pluginDirName;
      const key = `${name}@${marketplace}`;
      const enabled = enabledPlugins[key] === true;
      items.push(
        makeItem({
          assistant: "claude-code",
          kind: "plugin",
          name,
          source: marketplace,
          ...(manifest.description !== undefined && {
            description: manifest.description,
          }),
          path: root,
          enabled,
        }),
      );
      items.push(
        ...(await scanSkillsDir(join(root, "skills"), {
          enabled,
          source: `plugin:${key}`,
        })),
      );
    }
  }
  return items;
}
