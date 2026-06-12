// tests/adapters/claude-code/hooks.test.ts
import { describe, expect, it } from "vitest";
import { scanHooks } from "../../../src/adapters/claude-code/hooks.js";
import { resolvePaths } from "../../../src/adapters/claude-code/paths.js";
import { FIXTURE_HOME } from "./detect.test.js";

describe("scanHooks", () => {
  it("emits one item per hook command with its lifecycle event", async () => {
    const items = await scanHooks(resolvePaths(FIXTURE_HOME));
    expect(items).toHaveLength(3);
    expect(items.every((i) => i.kind === "hook" && i.enabled)).toBe(true);
    const events = items.map((i) => i.events?.[0]).sort();
    expect(events).toEqual(["PostToolUse", "PostToolUse", "SessionStart"]);
    const audit = items.find((i) => i.name.includes("audit.ps1"));
    expect(audit?.events).toEqual(["PostToolUse"]);
  });

  it("returns [] when settings.json is missing", async () => {
    expect(await scanHooks(resolvePaths("/no/such/home"))).toEqual([]);
  });
});
