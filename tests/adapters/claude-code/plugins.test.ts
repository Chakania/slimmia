// tests/adapters/claude-code/plugins.test.ts
import { describe, expect, it } from "vitest";
import { resolvePaths } from "../../../src/adapters/claude-code/paths.js";
import { scanPlugins } from "../../../src/adapters/claude-code/plugins.js";
import { FIXTURE_HOME } from "./detect.test.js";

const paths = resolvePaths(FIXTURE_HOME);

describe("scanPlugins", () => {
  it("finds both plugins with enabled state from settings.json", async () => {
    const items = await scanPlugins(paths);
    const plugins = items.filter((i) => i.kind === "plugin");
    expect(plugins.map((p) => `${p.name}:${p.enabled}`).sort()).toEqual([
      "mega-pack:false",
      "tidy-mem:true",
    ]);
    const tidy = plugins.find((p) => p.name === "tidy-mem");
    expect(tidy?.source).toBe("acme-marketplace");
    expect(tidy?.description).toContain("episodic memory");
  });

  it("supports versioned cache layout and enumerates plugin skills", async () => {
    const items = await scanPlugins(paths);
    const skills = items.filter((i) => i.kind === "skill");
    expect(skills.map((s) => s.name).sort()).toEqual([
      "react-helpers",
      "trading-signals",
    ]);
    expect(
      skills.every((s) => s.source === "plugin:mega-pack@acme-marketplace"),
    ).toBe(true);
    expect(skills.every((s) => s.enabled === false)).toBe(true);
  });

  it("returns [] when there is no plugins cache", async () => {
    const empty = resolvePaths("/definitely/not/a/home");
    expect(await scanPlugins(empty)).toEqual([]);
  });
});
