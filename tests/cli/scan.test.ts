// tests/cli/scan.test.ts
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runScan } from "../../src/cli/scan.js";
import { FIXTURE_HOME } from "../adapters/claude-code/detect.test.js";

describe("runScan", () => {
  it("scans, annotates tokens, writes inventory.json, and returns a report", async () => {
    const cwd = await mkdtemp(join(tmpdir(), "slimmia-scan-"));
    const result = await runScan({ homeDir: FIXTURE_HOME, cwd });

    expect(result.items).toHaveLength(12);
    expect(result.items.every((i) => typeof i.tokenEstimate === "number")).toBe(
      true,
    );
    expect(result.report).toContain("ENVIRONMENT INVENTORY");
    expect(result.report).toContain(result.outPath);

    const file = JSON.parse(await readFile(result.outPath ?? "", "utf8"));
    expect(file.version).toBe(1);
    expect(file.items).toHaveLength(12);
  });

  it("returns an empty result when nothing is detected", async () => {
    const emptyHome = await mkdtemp(join(tmpdir(), "slimmia-empty-"));
    const cwd = await mkdtemp(join(tmpdir(), "slimmia-scan-"));
    const result = await runScan({ homeDir: emptyHome, cwd });
    expect(result.items).toHaveLength(0);
    expect(result.report).toContain("No assistants detected");
  });
});
