import { join } from "node:path";
import { parseFrontmatter } from "../../core/frontmatter.js";
import { listDirs, readTextFile } from "../../core/fsx.js";
import { type CapabilityItem, makeItem } from "../../core/inventory/model.js";

export interface ScanSkillsOptions {
  enabled: boolean;
  /** e.g. "plugin:mega-pack@acme-marketplace" for skills shipped inside a plugin. */
  source?: string;
}

/** Scan a directory of `<skill-name>/SKILL.md` entries (user or plugin skills). */
export async function scanSkillsDir(
  skillsDir: string,
  options: ScanSkillsOptions,
): Promise<CapabilityItem[]> {
  const items: CapabilityItem[] = [];
  for (const dirName of await listDirs(skillsDir)) {
    const skillFile = join(skillsDir, dirName, "SKILL.md");
    const content = await readTextFile(skillFile);
    if (content === null) continue;
    const fm = parseFrontmatter(content) ?? {};
    const name =
      typeof fm.name === "string" && fm.name.length > 0 ? fm.name : dirName;
    const description =
      typeof fm.description === "string" ? fm.description : undefined;
    items.push(
      makeItem({
        assistant: "claude-code",
        kind: "skill",
        name,
        ...(options.source !== undefined && { source: options.source }),
        ...(description !== undefined && { description }),
        path: skillFile,
        enabled: options.enabled,
      }),
    );
  }
  return items;
}
