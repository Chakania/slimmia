// tests/core/inventory/model.test.ts
import { describe, expect, it } from "vitest";
import {
  capabilityItemSchema,
  makeItem,
  stableId,
} from "../../../src/core/inventory/model.js";

describe("stableId", () => {
  it("is deterministic for the same inputs", () => {
    const a = stableId("claude-code", "skill", "graphify", "local");
    const b = stableId("claude-code", "skill", "graphify", "local");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{12}$/);
  });

  it("changes when any component changes", () => {
    const base = stableId("claude-code", "skill", "graphify", "local");
    expect(stableId("claude-code", "plugin", "graphify", "local")).not.toBe(
      base,
    );
    expect(stableId("claude-code", "skill", "pinokio", "local")).not.toBe(base);
    expect(stableId("claude-code", "skill", "graphify", "other")).not.toBe(
      base,
    );
  });
});

describe("makeItem", () => {
  it("builds a valid CapabilityItem with derived id", () => {
    const item = makeItem({
      assistant: "claude-code",
      kind: "skill",
      name: "graphify",
      description: "knowledge graph",
      path: "/home/u/.claude/skills/graphify/SKILL.md",
      enabled: true,
    });
    expect(item.id).toBe(stableId("claude-code", "skill", "graphify", ""));
    expect(() => capabilityItemSchema.parse(item)).not.toThrow();
  });
});

describe("capabilityItemSchema", () => {
  it("rejects unknown kinds", () => {
    const bad = {
      id: "abcdefabcdef",
      assistant: "claude-code",
      kind: "gadget",
      name: "x",
      path: "/x",
      enabled: true,
    };
    expect(capabilityItemSchema.safeParse(bad).success).toBe(false);
  });
});
