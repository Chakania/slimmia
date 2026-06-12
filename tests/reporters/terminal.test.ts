// tests/reporters/terminal.test.ts
import { describe, expect, it } from "vitest";
import { ClaudeCodeAdapter } from "../../src/adapters/claude-code/index.js";
import { annotateTokenEstimates } from "../../src/core/tokenize/estimate.js";
import { renderTable } from "../../src/reporters/table.js";
import { renderScanReport } from "../../src/reporters/terminal.js";
import { FIXTURE_HOME } from "../adapters/claude-code/detect.test.js";

describe("renderTable", () => {
  it("renders an aligned box-drawing table", () => {
    const out = renderTable(
      ["a", "bb"],
      [
        ["1", "2"],
        ["333", "4"],
      ],
    );
    const lines = out.split("\n");
    expect(lines[0]).toBe("┌─────┬────┐");
    expect(lines[1]).toBe("│ a   │ bb │");
    expect(lines[2]).toBe("├─────┼────┤");
    expect(lines[3]).toBe("│ 1   │ 2  │");
    expect(lines[4]).toBe("│ 333 │ 4  │");
    expect(lines[5]).toBe("└─────┴────┘");
  });
});

describe("renderScanReport", () => {
  it("shows per-assistant counts, context debt, and top offenders", async () => {
    const adapter = new ClaudeCodeAdapter({ homeDir: FIXTURE_HOME });
    const items = annotateTokenEstimates(await adapter.inventory());
    const report = renderScanReport(items);

    expect(report).toContain("ENVIRONMENT INVENTORY");
    // fixture totals: 4 skills, 2 plugins, 1 mcp, 3 hooks, 2 rules
    expect(report).toMatch(/claude-code\s*│\s*4\s*│\s*2\s*│\s*1\s*│\s*3\s*│\s*2/);
    expect(report).toContain("CONTEXT DEBT");
    expect(report).toContain("estimate, cl100k");
    expect(report).toContain("TOP OFFENDERS");
    // the heaviest enabled item in the fixture is a rules file
    expect(report).toContain("CLAUDE.md");
  });

  it("reports when no assistants are detected", () => {
    expect(renderScanReport([])).toContain("No assistants detected");
  });
});
