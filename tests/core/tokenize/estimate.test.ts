// tests/core/tokenize/estimate.test.ts
import { describe, expect, it } from "vitest";
import { makeItem } from "../../../src/core/inventory/model.js";
import {
  annotateTokenEstimates,
  estimateTokens,
} from "../../../src/core/tokenize/estimate.js";

describe("estimateTokens", () => {
  it("returns 0 for empty text and >0 for real text", () => {
    expect(estimateTokens("")).toBe(0);
    expect(estimateTokens("hello world, this is a sentence")).toBeGreaterThan(
      3,
    );
  });
});

describe("annotateTokenEstimates", () => {
  const base = {
    assistant: "claude-code",
    path: "/x",
  } as const;

  it("estimates skills from name + description (the injected index entry)", () => {
    const [item] = annotateTokenEstimates([
      makeItem({
        ...base,
        kind: "skill",
        name: "graphify",
        description: "a long description of the skill",
        enabled: true,
      }),
    ]);
    expect(item?.tokenEstimate).toBeGreaterThan(0);
  });

  it("gives disabled items 0 tokens — they inject nothing", () => {
    const [item] = annotateTokenEstimates([
      makeItem({
        ...base,
        kind: "skill",
        name: "dead",
        description: "long description here",
        enabled: false,
      }),
    ]);
    expect(item?.tokenEstimate).toBe(0);
  });

  it("gives hooks 0 tokens — their cost is latency, not context", () => {
    const [item] = annotateTokenEstimates([
      makeItem({
        ...base,
        kind: "hook",
        name: "node x.js",
        events: ["PostToolUse"],
        enabled: true,
      }),
    ]);
    expect(item?.tokenEstimate).toBe(0);
  });

  it("estimates rules files from their full content and mcp servers from their config", () => {
    const [rules, mcp] = annotateTokenEstimates([
      makeItem({
        ...base,
        kind: "rules-file",
        name: "CLAUDE.md",
        description: "# Rules\n\nLots of conventions text.",
        enabled: true,
      }),
      makeItem({
        ...base,
        kind: "mcp-server",
        name: "ctx7",
        schema: { type: "http", url: "https://x" },
        enabled: true,
      }),
    ]);
    expect(rules?.tokenEstimate).toBeGreaterThan(0);
    expect(mcp?.tokenEstimate).toBeGreaterThan(0);
  });
});
