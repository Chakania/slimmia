// tests/adapters/claude-code/skills.test.ts
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scanSkillsDir } from "../../../src/adapters/claude-code/skills.js";
import { FIXTURE_HOME } from "./detect.test.js";

const SKILLS_DIR = join(FIXTURE_HOME, ".claude", "skills");

describe("scanSkillsDir", () => {
  it("finds user skills with name and description from frontmatter", async () => {
    const items = await scanSkillsDir(SKILLS_DIR, { enabled: true });
    expect(items.map((i) => i.name)).toEqual(["graphify", "pinokio"]);
    const graphify = items[0];
    expect(graphify?.kind).toBe("skill");
    expect(graphify?.assistant).toBe("claude-code");
    expect(graphify?.enabled).toBe(true);
    expect(graphify?.description).toContain("knowledge graph");
    expect(graphify?.path).toBe(join(SKILLS_DIR, "graphify", "SKILL.md"));
  });

  it("tags items with the given source and enabled flag", async () => {
    const items = await scanSkillsDir(SKILLS_DIR, {
      enabled: false,
      source: "plugin:mega-pack@acme-marketplace",
    });
    expect(items.every((i) => i.enabled === false)).toBe(true);
    expect(
      items.every((i) => i.source === "plugin:mega-pack@acme-marketplace"),
    ).toBe(true);
  });

  it("returns [] for a missing directory", async () => {
    expect(
      await scanSkillsDir(join(FIXTURE_HOME, "nope"), { enabled: true }),
    ).toEqual([]);
  });
});
