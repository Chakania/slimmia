// tests/adapters/claude-code/rules.test.ts
import { describe, expect, it } from "vitest";
import { resolvePaths } from "../../../src/adapters/claude-code/paths.js";
import { scanRules } from "../../../src/adapters/claude-code/rules.js";
import { FIXTURE_HOME } from "./detect.test.js";

describe("scanRules", () => {
  it("finds CLAUDE.md and every file in rules/, storing full content as description", async () => {
    const items = await scanRules(resolvePaths(FIXTURE_HOME));
    expect(items.map((i) => i.name)).toEqual([
      "CLAUDE.md",
      "rules/context7.md",
    ]);
    expect(items.every((i) => i.kind === "rules-file" && i.enabled)).toBe(true);
    expect(items[0]?.description).toContain("package manager");
    expect(items[1]?.description).toContain("Context7 MCP");
  });

  it("returns [] when nothing exists", async () => {
    expect(await scanRules(resolvePaths("/no/such/home"))).toEqual([]);
  });
});
