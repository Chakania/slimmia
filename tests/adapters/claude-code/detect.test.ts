// tests/adapters/claude-code/detect.test.ts
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter } from "../../../src/adapters/claude-code/index.js";

// biome-ignore lint/suspicious/noExportsInTest: FIXTURE_HOME is a shared test constant imported by sibling test files
export const FIXTURE_HOME = fileURLToPath(
  new URL("../../fixtures/claude-code/basic-home", import.meta.url),
);

describe("ClaudeCodeAdapter.detect", () => {
  it("detects when ~/.claude exists", async () => {
    const adapter = new ClaudeCodeAdapter({ homeDir: FIXTURE_HOME });
    expect(adapter.id).toBe("claude-code");
    expect(await adapter.detect()).toBe(true);
  });

  it("does not detect on an empty home", async () => {
    const emptyHome = await mkdtemp(join(tmpdir(), "slimmia-home-"));
    const adapter = new ClaudeCodeAdapter({ homeDir: emptyHome });
    expect(await adapter.detect()).toBe(false);
  });
});
