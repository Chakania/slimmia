// tests/adapters/claude-code/inventory.test.ts
import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter } from "../../../src/adapters/claude-code/index.js";
import { capabilityItemSchema } from "../../../src/core/inventory/model.js";
import { FIXTURE_HOME } from "./detect.test.js";

describe("ClaudeCodeAdapter.inventory", () => {
  it("aggregates all capability kinds from the fixture home", async () => {
    const adapter = new ClaudeCodeAdapter({ homeDir: FIXTURE_HOME });
    const items = await adapter.inventory();

    const byKind = (kind: string) => items.filter((i) => i.kind === kind);
    expect(byKind("skill")).toHaveLength(4); // 2 user + 2 from mega-pack
    expect(byKind("plugin")).toHaveLength(2);
    expect(byKind("mcp-server")).toHaveLength(1);
    expect(byKind("hook")).toHaveLength(3);
    expect(byKind("rules-file")).toHaveLength(2);
    expect(items).toHaveLength(12);

    for (const item of items) {
      expect(() => capabilityItemSchema.parse(item)).not.toThrow();
    }
    // ids must be unique
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  });
});
