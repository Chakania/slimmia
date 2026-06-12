// tests/core/inventory/write.test.ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { makeItem } from "../../../src/core/inventory/model.js";
import { writeInventory } from "../../../src/core/inventory/write.js";

describe("writeInventory", () => {
  it("writes a versioned, validated inventory file and returns its path", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "slimmia-cwd-"));
    const items = [
      makeItem({
        assistant: "claude-code",
        kind: "skill",
        name: "graphify",
        path: "/x/SKILL.md",
        enabled: true,
      }),
    ];
    const outPath = await writeInventory(items, cwd);
    expect(outPath).toBe(join(cwd, ".slimmia", "inventory.json"));
    const parsed = JSON.parse(await readFile(outPath, "utf8"));
    expect(parsed.version).toBe(1);
    expect(typeof parsed.generatedAt).toBe("string");
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe("graphify");
  });

  it("rejects invalid items instead of writing garbage", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "slimmia-cwd-"));
    const bad = [{ nope: true } as never];
    await expect(writeInventory(bad, cwd)).rejects.toThrow();
  });
});
